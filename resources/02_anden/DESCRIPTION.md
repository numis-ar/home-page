# anden — project description

A living description of what anden is for and how the Android app and the
backend solve it.  Kept in sync with the code in `anden-android` and
`anden-backend`; where the code and the design documents in `anden-docs`
disagree, this file follows the code and says so.

Last synced: 2026-09-27 (backend protocol v8).

## 1. The problem

"Andén" is Spanish for a bus platform or gate.  anden serves long-distance
bus riders in Argentina, who today get almost no real-time information:

- **No live data.**  About 143 carriers (`company.csv`) and 4 ticket
  aggregators (Plataforma10, Central de Pasajes, Omnilíneas, Unibus) sell
  tickets.  None has a public API or a GPS feed.  A rider cannot tell
  whether the bus is late, or where it is before it reaches their stop.
- **No arrival warning.**  On a 10–20 hour overnight trip, nothing tells a
  sleeping passenger that their stop is coming up.
- **Missing or vague departure boards.**  Many terminals and roadside stops
  have no board.  Where there is one, the gate is often a range; sample
  tickets print "Andén 10 a 28".
- **Scattered timetables.**  They exist only as search forms on dozens of
  carrier and aggregator websites, one origin/destination/date query at a
  time.

The rider manual sums the app up as three questions: *Is my bus late?
When do I arrive?  Wake me up before we get there.*

## 2. Context in Argentina

The full press list, grouped by topic with URLs, is in `NEWS.md`; the
CNRT ridership figures per terminal city and per year are in
`TERMINALS.md`.

- **Deregulation (Decree 883/2024, published October 2024; the registry
  took effect about 60 days later).**  Long- and
  medium-distance bus service stopped being a regulated public service.
  Companies set their own routes, schedules, prices and stops, and **no
  longer have to use a terminal**: they may pick up and drop off at any
  point local authorities don't prohibit, such as their own depots.
  Services are to be listed in a new national online registry.  Critics
  note that terminals were where the CNRT inspected buses and drivers
  before departure.
  - For riders, "where and when does my bus leave?" gets harder.  Stops
    multiply and move, and a fixed terminal board no longer covers every
    service.  Crowd-sourced positions and per-stop boards fit this better
    than any per-terminal system.
  - Safety controls weaken with it: terminals were where pre-departure
    checks happened, and in 2026 luggage tagging was deregulated and
    vehicle age limits extended.
- **Retiro**, Buenos Aires' main terminal, has 75 gates on 3 levels and up
  to ~100,000 people a day in peak season.  It is the only terminal under
  federal control.  TEBA (Néstor Otero) ran it from 1993, with the
  concession expired since 2015; Decree 273/2026 put it out to tender for
  a 30-year, USD 79 M private concession.  Córdoba, described as the
  largest terminal, handles ~80,000 people a day and began a staged
  renovation in September 2026.
- **A shrinking, stressed sector.**  Long-distance ridership fell from
  about 50 million passengers (2016) to about 22 million.
  - CNRT data (national services; details in `TERMINALS.md`): 29.3 M
    passengers in 2019, 23.7 M in 2023, and Jan–Nov 2024 20 % below
    Jan–Nov 2023.  Services to or from Buenos Aires carry 39 % of
    passengers, then Córdoba, Mendoza, La Plata, Rosario, Salta and
    Tucumán.
  - Aug 2024–Aug 2025: for the first time, more people flew domestically
    (26.4 M) than took long-distance buses (22.7 M).  Flybondi's collapse
    in 2026 reversed part of that: the bus is now up to 81 % cheaper than
    flying (e.g. Buenos Aires–Córdoba round trip ~$70,000 by bus).
  - The market is concentrated in six to eight family groups (Flecha Bus,
    Vía Bariloche/Vía TAC, Andesmar, Chevallier, Crucero del Norte,
    Plusmar…).  In September 2026 Crucero del Norte, 77 years old,
    suspended all its services with unpaid wages.
  - Drivers report pay up to 30 % below the agreed wage; UTA held a 72-hour
    long-distance strike in July 2026.
  - April 2026: a ~20 % diesel price jump and a subsidy gap made AMBA bus
    companies cut services; intercity operators warned of cuts on routes
    such as Mar del Plata and Córdoba.
  - May 2026: Resolution 28/2026 ended state compensation for free tickets
    for people with disabilities and certain patients (companies must still
    issue them); the operators claim a $27,000 M state debt.

Fewer, less predictable services with fewer controls make independent,
rider-side information more valuable, and mean anden cannot wait for
operators or the state to publish data.

## 3. The approach

anden builds the timetable from what is already public (the scraper), and
**the passengers become the real-time feed**.  Every phone on a bus
anonymously reports where the bus is.  The server combines these reports
into delays, typical speeds per km and gate history.  That data serves
riders who have not boarded yet and the stop boards, and is exported as
GTFS-RT for third parties.

On board, the phone does not need the server: its own GPS, the cached
route, the speed profile and offline map tiles give the arrival time and
the wake-up alarm.

Privacy is built in: the ticket stays on the phone, report tokens are
random and single-trip, and the server keeps only the point snapped onto
the route.  Abuse resistance is limited to plausibility checks; pseudonyms,
trusted riders and operator feeds are on the roadmap.

## 4. The Android app (`anden-android`)

Kotlin with Jetpack Compose, fully free software, no Google Play services.
Targets reproducible F-Droid builds, Android 7 (API 24) and newer, Spanish
and English.  Single `app` module with packages `api`, `core`, `data`,
`service`, `ui`, wired by `AppGraph.kt`.

### Finding the trip

- **Scan the ticket.**  CameraX + ZXing read QR, PDF417, Code128, Aztec and
  DataMatrix codes.  Where there is no code, Tesseract reads the printed
  text in Spanish (language data bundled).  A photo of the ticket can be
  imported; PDF import is not implemented yet.
- **Parse with downloadable rules.**  Rules from `GET /ticket-formats`
  (cached with ETag, bundled fallback) turn the scan into agency, origin,
  destination, date and time.  They cover the Plataforma10 long and short
  QR codes, Andesmar PDF417, betterez and Recorrido.cl.
- **Match to a trip.**  Only those five fields go to `GET /search`; the
  passenger's name never leaves the phone.  One match scoring above 0.9 is
  selected automatically; otherwise the rider picks from a list or falls
  back to the manual pick.
- **Manual pick.**  Choose a terminal, then a bus from its departures board
  (`GET /stops/{id}/board`).

### The trip screen

- Map with the route, the stops ahead and the bus.
- "Arrives in…" before boarding, then "time to destination" while riding.
- Stop list, alerts sheet, share link, *End trip*.
- Several trips can be saved but may not overlap; only the followed trip
  gets GPS, the service and the alarms.

### The ETA

- **Before boarding:** the server's trip status (delay fed by other
  riders).  With no reporters, the bus is drawn where the timetable puts it.
- **While riding:** the phone's own GPS.  Each fix is projected onto the
  route; fixes too far from it, jumping backwards or faster than 60 m/s are
  rejected.  Remaining time is summed km by km from the route's typical
  speeds (`GET /shapes/{id}/speeds`), with 18 m/s where there are no
  statistics.  Works without mobile data.
- Not yet implemented from DD 004: smoothing over several fixes, the
  stopped-bus rule, scheduled dwell times.

### Alarms

Exact alarms at configurable lead times before arrival, with a full-screen
alert that works on a locked phone.

### Background tracking and reports

- A foreground location service runs from 30 minutes before departure to
  30 minutes after arrival (shifted by the known delay), and lowers the GPS
  rate when the bus is stopped.
- Positions are queued in Room and sent to `POST /reports` in batches every
  ~5 minutes; the queue survives having no signal.
- Each ride uses a random 256-bit token, so reports are anonymous and
  cannot be linked across trips.

### Map

- MapLibre Native, rendering a road-only OpenStreetMap map.
- The app keeps its own tile store (`files/map/tiles.mbtiles`).  Tiles
  along each saved trip's route are pinned so they are available offline;
  other tiles are kept up to 50 MB.
- It asks for the tile list along the route (a cheap 304 when unchanged),
  then fetches only missing tiles in batches (DD 015).  This replaced the
  one-file-per-trip download of DD 005 on the app side.

### Sharing

A share link `/t/<trip>/<date>` is built on the phone and carries no rider
data.  It opens a web page with the bus position and the expected arrival
(DD 012).

### Endpoints the app calls

`/config`, `/gtfs`, `/stops`, `/stops/{id}/board`, `/search`,
`/trips/{id}`, `/trips/{id}/status`, `/shapes/{id}/speeds`,
`/corridors/{shape}/tiles`, `POST /map/tiles`, `/map/style.json`,
`/ticket-formats`, `POST /reports`, `/trips/{id}/nearby`.

### Testing

JVM and Robolectric unit tests, plus 12 GUI journeys (DD 011) that run
against an in-process fake backend or a real one (`make test-integration`).
Coverage floor: 85 % of lines.

## 5. The backend (`anden-backend`)

### Two implementations, one contract

- The backend exists twice, in Go and in Rust.
- Both use the same PostGIS schema and must pass the same black-box pytest
  suite (~229 tests).  If a test passes on one and fails on the other, the
  failing implementation has the bug.
- Logic whose results must match lives once in SQL functions
  (`sql/procedures.sql`).  Go and Rust handle configuration, HTTP/JSON,
  GTFS parsing, long polling and map file handling (`CONTRACT.md`).

### Programs

`anden-httpd` (REST server), `anden-dbinit`, `anden-gtfs-import`,
`anden-aggregator`, `anden-corridors`, `anden-config`, `anden-testkey`,
plus Python tools in `contrib/`: `anden-build-region`, `anden-gps`
(synthetic passengers, DD 014), `anden-load-places`, `anden-dbconfig`.

### Where the data comes from

- **Timetables.**  The scraper queries every curated terminal pair daily on
  carrier and aggregator sites, builds a GTFS feed and uploads it with
  `PUT /admin/gtfs`.  The backend imports it in the background as a new
  version, precomputes absolute stop times per day and 1 km route segments,
  and switches the live version in one step.
- **Live data.**  Rider reports.
- **Gates.**  Scraper uploads via `PUT /admin/gate-observations`.

### Database

- **Timetable (versioned):** `feed`, `agency`, `route`, `stop`, `trip`,
  `stop_time`, `shape`, plus derived `trip_day`, `stop_event`, `shape_km`.
- **Real time:**
  - `trip_instance`: status, delay, last position.
  - `report_token`, `report_sample`: only the point snapped onto the route
    is stored, never the raw GPS position; samples are deleted after 24 h.
  - These key on the timetable's text IDs, so live state survives the
    daily re-import.
- **Statistics:** `speed_stats` (typical speed per 1 km segment, per hour
  and for all hours: median, p10, p90); `gate`, `gate_observation`,
  `gate_stats`.
- **Other:** `corridor`, `import_job`, `share_link`, `nearby_place`,
  `testing_key`.

### What happens to a report

1. Each sample is snapped onto the route.
2. It is checked in order: time order, not in the future, not stale,
   accuracy under 250 m, within max(500 m, 3 × accuracy) of the route,
   speed under 45 m/s.
3. A token counts as "riding" only after moving at least 300 m along the
   route at 3 m/s or more, so someone waiting at a stop does not pull the
   bus position back.
4. The delay is the median of the last 10 minutes of riding samples.
5. Predictions for the stops ahead scale the timetable by how fast the
   route usually is (factor clamped to 0.5–2).
6. Clients waiting on the trip are notified at once (long polling via
   Postgres `LISTEN/NOTIFY`).
7. The aggregator job later turns samples into typical speeds.

### Gates on boards

The gate comes from what a terminal's own board reported for that bus, if
anything.  Otherwise it falls back to history in five steps, from agency +
route + hour down to the stop alone.  If neither exists, it is unknown.

### Map

- `anden-build-region` turns the Geofabrik OpenStreetMap extract into a
  road-only PMTiles file per country (Python tiler; the same extract gives
  a byte-identical file).
- `anden-corridors` runs nightly and cuts a buffered corridor per route.
- `/corridors/{id}/tiles` and `POST /map/tiles` serve tiles incrementally.
- `/map/style.json` and the fonts are served by the backend itself, so no
  third party is contacted.

### Endpoints

| Group | Endpoints |
|---|---|
| Public read | `/config`, `/gtfs`, `/agencies`, `/routes`, `/stops`, `/search`, `/ticket-formats`, `/trips/{id}`, `/trips/{id}/status`, `/stops/{id}/board`, `/shapes/{id}`, `/shapes/{id}/speeds`, `/trips/{id}/nearby` |
| Rider write | `POST /reports`, `POST`/`DELETE /trips/{id}/share` (DD 007, no longer used by the app) |
| Sharing | `/t/{trip}/{date}`, `/trips/{id}/position`, `/v/{id}`, `/v/{id}/position` |
| Map | `/map/style.json`, `/map/{region}.pmtiles`, `/map/fonts/…`, `POST /map/tiles`, `/corridors/{id}`, `/corridors/{id}/info`, `/corridors/{id}/tiles` |
| Third parties | `/gtfs-rt/trip-updates.pb`, `/gtfs-rt/vehicle-positions.pb`, `/gtfs-rt/alerts.pb` (empty) |
| Admin (bearer token) | `PUT /admin/gtfs`, `GET /admin/imports`, `GET /admin/imports/{id}`, `PUT /admin/gate-observations` |

Protocol versions: v1 base; v2 sharing and places; v3 share trip links;
v4 rider gate reports removed, riding inference added; v5 incremental
tiles; v6 testing keys; v7/v8 app releases per channel.

### Testing and packaging

- pytest conformance suite against either binary, on a podman PostGIS
  container; also checks identical diagnostic codes and log fields.
- `make deb` builds `anden-common` plus conflicting `anden-go` and
  `anden-rust` packages; nothing is enabled by default.

## 6. Current limits and open work

- **Untested on a real phone:** camera OCR, MapLibre rendering, GPS and
  battery behaviour, alarms on a sleeping phone.
- **Gates are only historical or unknown:** no terminal-board adapter yet.
- **Cars count as riders:** a car driving along the route is accepted as a
  passenger (strict xfail in `tests/test_gps.py`).
- **Places along the route** have only fixture data, so the feature is in
  developer mode.
- **Roadmap:** pseudonymous or signed reports, trusted riders, operator
  feeds, service alerts, per-OSM-way speed bins, iOS app.
- **Doc drift:** `developer/android.rst` still describes the per-trip
  PMTiles download and the old flavours; `developer/architecture.rst` and
  `database.rst` still mention rider gate reports; all DDs except 001 are
  still marked "Proposed".

## Sources

Main sources below; the complete list is in `NEWS.md`.

- [En los últimos 12 meses viajaron más personas en avión que en micros – Infobae](https://www.infobae.com/economia/2025/09/13/en-los-ultimos-doce-meses-viajaron-mas-personas-en-avion-que-en-micros-de-larga-distancia-dentro-de-la-argentina/)
- [La crisis de Flybondi reavivó a los micros de larga distancia – La Nación](https://www.lanacion.com.ar/economia/la-crisis-de-flybondi-reavivo-a-los-micros-de-larga-distancia-nid03092026/)
- [Licitación privada para remodelar Retiro – La Nación](https://www.lanacion.com.ar/economia/el-gobierno-convoca-una-licitacion-privada-para-remodelar-la-terminal-de-retiro-nid24042026/)
- [Crucero del Norte suspendió todos sus servicios – BAE Negocios](https://www.baenegocios.com/negocios/la-empresa-de-micros-crucero-del-norte-suspendio-todos-los-servicios-y-adeuda-sueldos/)
- [Resolución 28/2026 – Boletín Oficial](https://www.boletinoficial.gob.ar/detalleAviso/primera/342349/20260526)
- [Se desregula el transporte automotor de larga y media distancia – Argentina.gob.ar](https://www.argentina.gob.ar/noticias/se-desregula-el-transporte-automotor-de-larga-y-media-distancia-0)
- [Micros de larga distancia: riesgos de la desregulación – El Cronista](https://www.cronista.com/economia-politica/micros-de-larga-distancia-cuales-son-los-riesgos-de-la-desregulacion-y-las-oportunidades/)
- [Larga distancia: Milei analiza desregular las terminales – La Política Online](https://www.lapoliticaonline.com/politica/larga-distancia-milei-analiza-desregular-los-micros-y-que-las-empresas-salgan-de-donde-quieran/)
- [Paro de colectivos, abril 2026 – Infobae](https://www.infobae.com/economia/2026/04/09/paro-de-colectivos-por-que-reclaman-las-empresas-que-paso-con-los-subsidios-y-como-sigue-el-conflicto/)
- [Empresas de larga distancia contra el gobierno nacional – Diario 13 San Juan](https://www.canal13sanjuan.com/el-pais/las-empresas-de-larga-distancia-emitieron-un-duro-comunicado-contra-el-gobierno-nacional_a6a15fdb2a79bacc032808669)
- [Retiro bus station – Wikipedia](https://en.wikipedia.org/wiki/Retiro_bus_station)
- [Reapertura de Retiro – Argentina.gob.ar](https://www.argentina.gob.ar/noticias/reapertura-de-retiro-como-funcionara-la-terminal-de-omnibus-tras-las-obras)
