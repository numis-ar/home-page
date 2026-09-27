# anden — high-level plan (draft 2, 2026-09-14, decisions folded in)

"anden" (Spanish: platform/gate) is the working name for the system that tells
long-distance bus riders in Argentina whether their bus is late, alerts them
before arrival, and replaces missing station departure boards. Hosted on
git.taler.net, copyright Taler Systems SA. Server code AGPLv3+, apps GPLv3+,
every source file carries the license header.

## 0. Decisions taken (2026-09-14)

| # | Topic | Decision |
|---|-------|----------|
| 1 | Backend language | **Both Go and Rust**, in parallel, same SQL schema, same black-box test suite. Not C, not Python. |
| 1b | Scraper language | Python. |
| 2 | Trip identification | Manual pick (company/origin/destination/date/time from GTFS) always available; scanning (QR, barcode, OCR) fills it in when it can. |
| 2b | Ticket samples | `~/bus/resources/tickets/` (9 PDFs, Retiro to Chivilcoy via Chile). Used to build parsers, **never committed to git**. |
| 3 | OCR | Tesseract with Spanish data bundled in the APK. |
| 4 | Scraping sources | All sources supported; enabled sources configurable; default order carrier sites first, aggregators last. No feed requests, no government data. |
| 5 | Cadence | Daily full scrape of everything. |
| 5b | New requirement | Per-station arrival/departure board with predicted gates (range shown when uncertain). |
| 5c | Gate data | Historical stats from rider reports + live clustering of riders on/near the bus + terminal website adapters + ticket text. Riders can submit the gate number; server maps GPS positions to gates. |
| 6 | Error codes | Own GANA-style registry in anden-docs, generating Go, Rust, Kotlin enums and the docs table. |
| 7 | Speed bins | Per km of route shape now; store way ids so migration to OSM-way bins is possible later. |
| 8 | Abuse resistance | Plausibility checks only (impossible speeds, far from shape). No IP limits (shared IPs), must work with one rider. Pseudonyms / trusted riders / drivers are roadmap items documented in a roadmap chapter. |
| 9 | Map data | Roads-only PMTiles corridor download at trip start; country file optional. |
| 10 | Android build | Fully FLOSS, no Google Play libraries, must run on de-googled phones, reproducible builds for F-Droid. Kotlin DSL + version catalog with pinned versions. |
| 11 | Name / hosting | `anden`; repos `anden-scraper`, `anden-backend`, `anden-android`, `anden-docs` on git.taler.net; Taler Systems SA. |
| 12 | Backend repo layout | One repo `anden-backend` with `sql/`, `tests/` (Python + pytest black-box suite), `go/`, `rust/`. |
| 12b | iOS preparation | None. Single-module Android app; iOS re-implements from the API spec. |

## 1. What the surveys found

### company.csv (158 rows)
- 143 carriers; 11 with a verified official site, 62 with any site, 132 known
  only through the Central de Pasajes directory. No carrier or aggregator has
  a public API.
- 4 aggregators (Plataforma10, Central de Pasajes, Omnilineas, Unibus) sell
  for nearly all carriers. All sources are origin/destination/date search
  forms; timetables are reconstructed by enumerating terminal pairs.

### OneBusAway docs (resources/onebusaway-docs)
- Docs only. 26 captured JSON API responses usable as parser test vectors.
- Copy: additive real-time merge (scheduled and predicted times both present,
  `predicted` flag, `scheduleDeviation` seconds), `references` dictionary,
  `time=` parameter for deterministic queries, stops linear-referenced onto
  shapes. Nothing on prediction or crowd-sourced positions.

### OsmAnd (resources/osmand)
- Code GPLv3+; `OsmAnd/res` CC-BY-NC-ND, never copy. Renderer not
  embeddable (Qt+Skia NDK core). Reusable: `OsmAnd-shared` Kotlin OBF reader,
  router and GPS map matching; AIDL API to hand a route to installed OsmAnd.

### taler-docs
- Sphinx, `sphinx_book_theme`, vendored `httpdomain` + `typescriptdomain`,
  one `.rst` per endpoint, "Version History" per API, numbered DDs with a
  template, AGPL header comment in every `.rst`. Copied wholesale.

### GTFS libraries (verified 2026-09-14)
- Go: `transitland-lib` (GPLv3; read/write/validate GTFS, PostGIS import,
  GTFS-RT), `jamespfennell/gtfs` (MIT), Transiter (MIT reference backend).
- Rust: `gtfs-structures` (MIT, read only), `gtfs-rt` (prost), `geo`,
  `rstar`, `osmpbf`; Catenary (AGPL) as a reference.

## 2. Architecture

```
 carrier sites (62) + aggregators (4) + terminal boards
          │  daily, per-adapter, configurable source order
          ▼
 [anden-scraper] ──GTFS zip + gates──▶ [anden-backend] ◀── reports ── [anden-android]
   Python, AGPLv3+                       Go AND Rust, AGPLv3+              Kotlin, GPLv3+
                                         PostgreSQL + PostGIS               fully FLOSS
                                           │ schedule, status, speeds, gates, corridor tiles
                                           ▼
                                         riders; third parties via GTFS-RT
```

Principles:
- REST API specified in Sphinx first; it is the contract for both backends
  and for the future iOS app.
- The SQL schema and the pytest suite are the second contract: both backend
  binaries must pass the same suite against the same database.
- Privacy by default: reports carry a random per-trip token, no identity,
  raw reports purged after aggregation.
- Everything works offline once a trip is selected (corridor tiles, stops,
  shape, speed profile cached on the phone).

## 3. anden-scraper (Python, AGPLv3+)

- Python 3.12+, `uv` + `pyproject.toml`, `ruff`, `mypy --strict`, `pytest`.
- Deps: `httpx`, `selectolax`/`lxml`, `playwright` (optional extra, only for
  JS-only sites), `pydantic`, `shapely`/`pyproj`, `gtfs-kit` or own writer,
  MobilityData `gtfs-validator` in CI, `pypdf`/`pdfplumber` + `pyzbar` for
  the ticket-sample study (parsers are then ported to Kotlin).
- Layout:
  - `adapters/carriers/<slug>.py`, `adapters/aggregators/<slug>.py`,
    `adapters/terminals/<slug>.py` (gate boards). Common interface:
    `list_terminals()`, `search(origin, dest, date)`, optional
    `gates(terminal, date)`.
  - `sources.toml`: which adapters are enabled and in what precedence
    (default: carriers, then aggregators); per-host rate limits.
  - `model/`: Operator, Terminal, Departure, GateObservation.
  - `schedule/`: departures over sampled dates → GTFS trips + calendars.
  - `stops/terminals.csv`: curated terminal list with coordinates and
    aliases (seeded from OSM `amenity=bus_station`).
  - `shapes/`: terminal-to-terminal road geometry via OSRM/Valhalla on the
    roads-only extract; stores OSM way ids per shape km (decision 7).
  - Recorded HTTP fixtures replayed in tests; adapters fail loudly on
    layout changes.
- Daily run: full sweep, then `PUT /admin/gtfs` and `PUT /admin/gates` to
  the backend with provenance JSON.
- Load: daily full sweep of all terminal pairs is the budgeted default;
  per-host rate limits and off-peak scheduling in `sources.toml`.

## 4. anden-backend (Go and Rust, AGPLv3+)

Repo layout:
```
anden-backend/
  sql/            schema + migrations (anden-0001.sql ...), owned by neither impl
  tests/          pytest black-box suite: fixture GTFS, HTTP, psql assertions
  fixtures/       2-agency GTFS feed, GPS traces, gate observations
  go/             complete implementation (module anden.taler.net/backend)
  rust/           complete implementation (cargo workspace)
  contrib/tiles/  OSM roads-only pipeline (osmium + tilemaker/planetiler)
  docs → in anden-docs
```

- Go impl: `transitland-lib` for GTFS import/validation, `pgx` + `go-geom`,
  `net/http`/`chi`, official GTFS-RT protobuf bindings. Single static binary.
- Rust impl: `gtfs-structures`, `gtfs-rt`, `axum` + `sqlx` (PostGIS via
  `geozero`), `geo`/`rstar`. Single static binary.
- Both expose identical binaries/subcommands: `anden-httpd`, `anden-dbinit`,
  `anden-gtfs-import`, `anden-aggregator`, `anden-corridors`.
- Storage: PostgreSQL 15+ with PostGIS 3.
  Tables: `gtfs_*` mirror; `shape_km` (shape, km, geometry, osm_way_ids);
  `speed_stats` (shape_km, hour, dow, n, median, mean); `trip_status`;
  `reports` (short-lived); `gate_obs` (terminal, carrier, route, trip,
  gate, source, ts); `gate_stats`; `gate_geometry` (terminal, gate, point).
- REST API (`current:revision:age` versioning, Taler conventions):
  - `GET /config`, `GET /gtfs` (ETag), `GET /agencies`, `GET /routes`,
    `GET /stops?near=`, `GET /trips/$ID`, `GET /search?...` (ticket → trip).
  - `GET /trips/$ID/status` — deviation, last position, freshness, gate.
  - `GET /stops/$ID/board?time=` — arrivals/departures with predicted gate
    or gate range + confidence (the station board).
  - `GET /speeds?shape=$ID` — per-km typical speeds by hour/dow.
  - `GET /corridors/$SHAPE_ID.pmtiles` — offline map pack.
  - `POST /reports` — `{trip_token, trip_id, samples[]}`; plausibility
    checks only (decision 8).
  - `POST /gates` — rider-submitted gate `{trip_token, stop_id, gate, ts,
    lat, lon}`.
  - `GET /gtfs-rt/{trip-updates,vehicle-positions}.pb` — third parties.
  - `PUT /admin/gtfs`, `PUT /admin/gates` — scraper uploads, bearer token.
- Aggregator job: map-match reports to shape (`ST_LineLocatePoint`),
  segment speeds → `speed_stats`; per-trip deviation → `trip_status`;
  cluster reports near a terminal at departure time → gate observation;
  purge raw reports.
- Tests: `tests/` runs against `ANDEN_BACKEND_BIN` pointing at either
  binary; CI matrix {go, rust} × PostGIS container. Unit tests native to
  each language for parsers and math.

## 5. anden-android (Kotlin, GPLv3+)

- Kotlin, Jetpack Compose, minSdk 24, targetSdk 36, Java 17, Kotlin DSL +
  version catalog, all versions pinned, no dynamic dependencies, no
  Google Play Services, no Firebase, no ML Kit. Flavors: `fdroid`
  (primary, reproducible) and `nightly`.
- Reproducibility: fixed AGP/Kotlin/NDK versions, `-Pandroid.injected...`
  avoided, no build timestamps in resources, `org.gradle.caching` off in
  release, F-Droid `reproducible` metadata target from the first release.
- Single app module (decision 12b) with internal packages: `core` (ETA,
  geo, GTFS subset, ticket parsing), `api` (Ktor client + kotlinx.serialization,
  tested with `ktor-client-mock`), `ui`, `service`, `data`.
- Deps: CameraX + ZXing (QR, PDF417, Code128, Aztec); tesseract4android
  (Apache 2.0) with `spa` traineddata bundled; MapLibre Native Android (BSD)
  with PMTiles corridor files; platform `LocationManager` (GPS) in a
  foreground service (type `location`), adaptive sampling; upload every
  5 ± 1 min while online, Room queue offline; `AlarmManager`
  exact alarm as alert backup; notification channel with configurable
  sound/vibration; Room + DataStore.
- Screens: home (scan button + manual pick + station board), trip (map,
  stops with ETA, destination ETA prominent, gate), station board (stop,
  arrivals/departures, predicted gates with ranges), settings (alert
  minutes, sound, vibration, data sources, downloads).
- Tests: JVM unit tests (core, api), Robolectric for view-models, small
  instrumented suite for scan → trip with fixture ticket images generated
  from the private samples (fixtures are synthetic, samples stay out of git).

### Decisions taken for the app (2026-09-14, phase 4)

| # | Topic | Decision |
|---|-------|----------|
| A1 | Map | MapLibre Native Android (BSD, Maven Central), `pmtiles://` corridor packs and the backend's `style.json`. |
| A2 | Offline data | `/gtfs` is downloaded (ETag) and only agencies and stops are mirrored into Room for offline autocomplete and ticket-name heuristics; trips, boards and search stay online; a selected trip is persisted with stops, shape, speed profile and corridor. |
| A3 | Scanning | Full scanning in this phase: CameraX + ZXing (QR, PDF417, Code128, Aztec, DataMatrix) and Tesseract OCR with `spa` fast traineddata bundled. |
| A4 | ETA | While riding the phone's own GPS drives the ETA (projection onto the shape + cached speed profile, default speed where no statistics); the server's `TripStatus` is used before boarding and on the boards. DD 004. |
| A5 | OCR packaging | `cz.adaptech.tesseract4android:tesseract4android:4.9.0` from JitPack, pinned with dependency verification; source build is a fallback. |
| A6 | Identity | Application id `net.taler.anden` (`.fdroid` / `.nightly` suffixes); default server `https://anden.test.numis.ar/`, editable in settings. |
| A7 | Ticket formats | All formats seen in the samples ship: Plataforma10 long QR (booking, CUIT, date, time), short QR (booking only), printed text; Andesmar PDF417 and betterez URL; Recorrido.cl text and QR. Production rules live in `anden-backend/contrib/ticket-formats.json`; `fixtures/ticket-formats.json` stays the conformance fixture. |
| A8 | Languages | Spanish (default) and English string resources from the first version, terms from `~/dictionary.csv`. |
| A9 | Gates on tickets | Shown and used to prefill the gate report; not sent as a `ticket` source (samples print ranges such as "10 a 28"). |

Ticket-sample study (2026-09-14): eight of nine PDFs are page images
(iText) without a text layer; Spanish Tesseract reads every relevant line
at 150 dpi with confidence 87-93. All Argentine samples are Plataforma10
"Talón" tickets (Fono Bus, 20 de Junio, Platabus, Plusmar, Andesmar); the
printed text also gives the announced headsign ("El servicio se anuncia
a:") and the approximate arrival.

## 6. Minimal OSM data

- Geofabrik Argentina + Uruguay, Chile, Bolivia, Paraguay, Brazil south;
  `osmium tags-filter` to highway=motorway..residential + `*_link`, admin
  boundaries, place labels, water polygons. Tiled by tilemaker/planetiler
  with a custom profile into one PMTiles per country; `anden-corridors`
  cuts per-shape extracts (5 km buffer). Hand-written MapLibre style JSON,
  light/dark.

## 7. anden-docs (Sphinx)

- Copy of taler-docs conventions (`_exts/`, theme, httpdomain, `ts:def`,
  DD template, AGPL header comment).
- Index by audience: Riders (app manual), Operators (backend and scraper
  manuals: install, config, DB setup, deployment), Developers (architecture,
  `core/api-anden.rst` + one file per endpoint, DB schema, test suites,
  error-code registry), Design documents, **Roadmap** (anti-abuse:
  pseudonyms, trusted riders, driver feeds; OSM-way speed bins; iOS),
  Licensing.
- `errors/anden-error-codes.rec` + generator → Go, Rust, Kotlin, docs table.
- First DDs: 001 architecture, 002 ticket-to-trip resolution, 003 anonymous
  reporting and plausibility checks, 004 ETA model, 005 offline corridors,
  006 station boards and gate prediction.

## 8. Phasing

1. Docs skeleton, DD 001–003, API v0 spec, error-code registry, fixture feed.
2. Backend repo: schema, pytest suite, Go impl of `/config`, `/trips`,
   `/search`, `/reports`, `/stops/$ID/board`; Rust impl to parity.
3. Scraper: terminals.csv, 2 carrier adapters + 1 aggregator adapter, GTFS
   builder, validator in CI, daily job.
4. Android: manual pick, corridor download, map, foreground service,
   arrival alert, station board, ticket scanning (moved up from 5).
   Done 2026-09-14; untested on a real device.
5. Ticket parsing from the private samples (QR/barcode, then OCR), speed
   profiles, gate statistics, GTFS-RT export.
6. Remaining adapters, terminal-board adapters, roadmap items.

### Packaging (2026-09-15)

- `anden-backend/debian/`: one source package, three binary packages:
  `anden-common` (arch all: `/etc/anden` tree with `conf.d/`, `secrets/`
  and `overrides.conf`, systemd units `anden-httpd.socket/.service`,
  `anden-aggregator.service`, `anden-corridors.service/.timer`,
  `anden.target`, `anden.slice`, tmpfiles, user `anden-httpd` in group
  `www-data`, `anden-dbconfig`, SQL, ticket rules, nginx/Apache sites),
  `anden-go`, `anden-rust` (conflicting providers of `anden-backend`).
  Version 0.0.0, native source format, `make deb` puts the .debs in
  `build/`.  Nothing is enabled by default (DD 40); `systemctl enable
  --now anden.target` after `anden-dbconfig`.
- Both implementations gained `[anden-httpd] SERVE = tcp|unix|systemd`
  (`UNIXPATH`, `UNIXPATH_MODE`, systemd fd passing auto-detected as in
  the exchange), the include directives `@INLINE-MATCHING@` and
  `@INLINE-SECRET@`, and a sixth binary `anden-config` used by
  `anden-dbconfig`.  Conformance suite: 95 tests per implementation.
- Not done here: installing the packages (no root on this machine), so
  postinst/prerm/postrm ran only through shellcheck and `anden-dbconfig`
  was exercised with fake `id`/`runuser` against the test container.
