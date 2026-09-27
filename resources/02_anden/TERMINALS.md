# Terminal and ridership statistics — Argentina long-distance buses

Companion to `DESCRIPTION.md` and `NEWS.md`.  Built 2026-09-27 from primary
CNRT data.  Reproducible: `resources/cnrt-terminal-stats/per_city.py`
regenerates the CSVs from the downloaded dataset.

## Sources and what they can and cannot tell

| Source | Coverage | Granularity | Used for |
|---|---|---|---|
| **CNRT "Conectividad Terrestre Interurbana"**, published by the Tourism ministry (DNMyE) at [datos.yvera.gob.ar](https://datos.yvera.gob.ar/dataset/conectividad-terrestre-interurbana) | Jan 2019 – Nov 2024 (last update 2024-12-05) | Every day × origin city × destination city × service class: seats, passengers | Per-city tables below |
| **CNRT annual interurban reports** ([statistics page](https://www.argentina.gob.ar/transporte/cnrt/estadisticas-automotor)) | 2016, 2017, 2018, 2020–2023, plus a 2019–2023 summary | National totals per month; **province × province passenger matrix** (2016–2018); top corridors | National history |
| **Buenos Aires city statistics office**, [Retiro services in and out, 1991–2016](https://www.estadisticaciudad.gob.ar/eyc/?p=29196) | 1991–2016 | Yearly, Retiro only | **Not retrieved** — see Gaps |

Caveats that matter for reading the numbers:

1. **No data counts people through a terminal's doors.**  CNRT records
   services between two *head cities* (cabeceras).  The per-city figures
   below are the **passengers carried on services that start or end in that
   city**; each service counts at both ends.  Passengers who board at
   intermediate stops count in the total of the service ("pasajeros que
   ascendieron o descendieron a lo largo del trayecto"), so a service can
   carry more passengers than it has seats.
2. **National jurisdiction only**: interprovincial services regulated by
   CNRT.  Buses that stay within one province (e.g. Buenos Aires–Mar del
   Plata by provincial companies, Córdoba intra-provincial) are missing
   unless they are registered nationally, and so is charter tourism (DUT),
   which the Tourism ministry publishes as a separate dataset.
3. **The Yvera subset is slightly smaller than CNRT's headline totals**
   (it only keeps services with at least three passengers): 2019 26.8 M vs
   CNRT's 29.3 M, 2023 22.9 M vs 23.7 M.
4. **2019 city names are messy** (2,357 spellings against ~255 in later
   years, e.g. "san juana capital"), so 2019 per-city numbers are slightly
   low.  2020 has data for only 190 days (services were suspended by the
   pandemic).  **2024 stops at November.**

## National totals

CNRT headline figures (regular services, national jurisdiction), from the
2019–2023 summary report and the 2020 report text; 2016 and 2018 read off
the monthly charts of those years' reports (approximate):

| Year | Passengers | Services | Source |
|---|---|---|---|
| 2016 | ≈ 34 M (≈ 2.85 M/month) | ≈ 1.0 M | 2016 report, chart |
| 2018 | ≈ 30 M (≈ 2.47 M/month) | ≈ 0.84 M | 2018 report, chart |
| 2019 | 29.3 M | 838,600 | 2019–2023 report |
| 2020 | 8.1 M (8,181,701) | 233,900 (report text) / 227,400 | 2020 report / 2019–2023 report |
| 2021 | 12.5 M | 340,800 | 2019–2023 report |
| 2022 | 22.2 M | 500,900 | 2019–2023 report |
| 2023 | 23.7 M | 558,600 | 2019–2023 report |

From the Yvera dataset (same source, subset), which extends into 2024:

| Year | Services | Seats | Passengers | Passengers per service |
|---|---|---|---|---|
| 2019 | 688,966 | 34.7 M | 26.8 M | 38.9 |
| 2020 (190 days) | 170,745 | 8.8 M | 7.7 M | 45.2 |
| 2021 | 282,103 | 15.1 M | 11.4 M | 40.4 |
| 2022 | 491,367 | 25.9 M | 22.0 M | 44.8 |
| 2023 | 523,775 | 27.6 M | 22.9 M | 43.7 |
| 2024 (Jan–Nov) | 431,420 | 22.9 M | 16.8 M | 38.9 |

**Jan–Nov 2024 vs Jan–Nov 2023: 16.8 M vs 21.0 M passengers, −20 %.**  2024
is the first year of the current government; Decree 883/2024 was published
in October 2024, so this fall comes *before* deregulation took effect.
There is no public CNRT data after November 2024.  The press figure of
22.7 M for Aug 2024–Aug 2025 (Infobae, see `NEWS.md`) implies 2025 levels
about the same as 2023–24.

Monthly pattern (2023): peaks in January (2.81 M) and July (2.04 M, winter
holidays), low point September (1.45 M).  In 2024 every month was below
2023; the gap was widest in April–May (−31 % / −34 %) and narrowest in
October–November (−9 % / −5 %).

## Per head city (≈ per terminal)

Passengers on national services starting or ending in the city, in
thousands.  Top 30 by 2023.  "Δ 19→23" compares the last full year with the
pre-pandemic year.

| City | Province | 2019 | 2020 | 2021 | 2022 | 2023 | 2024* | Δ 19→23 |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Buenos Aires (Retiro, Dellepiane, Liniers) | CABA | 10,496 | 3,189 | 4,140 | 8,548 | 8,855 | 6,336 | −16 % |
| Córdoba | Córdoba | 3,026 | 832 | 1,227 | 2,498 | 2,568 | 1,864 | −15 % |
| Mendoza | Mendoza | 2,272 | 675 | 1,103 | 1,979 | 2,044 | 1,696 | −10 % |
| La Plata | Buenos Aires | 1,779 | 510 | 928 | 1,724 | 1,964 | 1,697 | +10 % |
| Rosario | Santa Fe | 2,360 | 546 | 802 | 1,818 | 1,850 | 1,173 | −22 % |
| Salta | Salta | 2,135 | 602 | 1,290 | 1,878 | 1,703 | 1,141 | −20 % |
| San Miguel de Tucumán | Tucumán | 1,931 | 532 | 1,019 | 1,835 | 1,635 | 1,112 | −15 % |
| Mar del Plata | Buenos Aires | 1,471 | 533 | 491 | 1,165 | 1,357 | 896 | −8 % |
| San Salvador de Jujuy | Jujuy | 1,213 | 403 | 773 | 1,140 | 1,192 | 861 | −2 % |
| San Carlos de Bariloche | Río Negro | 944 | 320 | 515 | 956 | 1,126 | 990 | +19 % |
| Paraná | Entre Ríos | 1,242 | 332 | 455 | 945 | 1,015 | 731 | −18 % |
| Posadas | Misiones | 883 | 251 | 341 | 794 | 944 | 600 | +7 % |
| Puerto Iguazú | Misiones | 774 | 209 | 359 | 675 | 781 | 610 | +1 % |
| San Juan | San Juan | 740 | 219 | 401 | 724 | 737 | 602 | 0 % |
| Salvador Mazza | Salta | 980 | 303 | 554 | 766 | 684 | 574 | −30 % |
| Capilla del Monte | Córdoba | 455 | 173 | 350 | 596 | 554 | 389 | +22 % |
| Clorinda | Formosa | 388 | 161 | 164 | 487 | 552 | 440 | +42 % |
| Corrientes | Corrientes | 729 | 206 | 290 | 539 | 530 | 359 | −27 % |
| San Fernando del Valle de Catamarca | Catamarca | 570 | 160 | 227 | 437 | 523 | 433 | −8 % |
| Resistencia | Chaco | 691 | 164 | 197 | 450 | 446 | 336 | −35 % |
| Florencio Varela | Buenos Aires | 418 | 124 | 246 | 415 | 440 | 343 | +5 % |
| La Quiaca | Jujuy | 382 | 118 | 256 | 388 | 408 | 285 | +7 % |
| Santiago del Estero | Santiago del Estero | 553 | 124 | 276 | 562 | 408 | 246 | −26 % |
| Bahía Blanca | Buenos Aires | 528 | 127 | 158 | 368 | 394 | 344 | −25 % |
| Comodoro Rivadavia | Chubut | 458 | 115 | 188 | 357 | 391 | 369 | −15 % |
| Villa Carlos Paz | Córdoba | 366 | 126 | 196 | 352 | 363 | 257 | −1 % |
| Ingeniero Budge | Buenos Aires | 567 | 92 | 134 | 316 | 348 | 292 | −39 % |
| Esquel | Chubut | 295 | 95 | 178 | 313 | 330 | 278 | +12 % |
| Roque Sáenz Peña | Chaco | 288 | 99 | 232 | 300 | 326 | 269 | +13 % |
| Santa Rosa | La Pampa | 384 | 88 | 149 | 299 | 325 | 249 | −15 % |

\* 2024 = January–November only.

Same-period comparison, **Jan–Nov 2024 vs Jan–Nov 2023**, largest cities:
Buenos Aires −22 %, Córdoba −21 %, Mendoza −10 %, La Plata −5 %, Rosario
−32 %, Salta −27 %, Tucumán −27 %, Mar del Plata −28 %, Jujuy −21 %,
Bariloche −4 %, Paraná −21 %, Posadas −31 %, Puerto Iguazú −14 %, San Juan
−10 %.

Services per year at the same cities (2023): Buenos Aires 209,842 (≈ 575 a
day, counting arrivals and departures), Córdoba 50,883, Tucumán 47,428,
Rosario 45,285, La Plata 40,581, Salta 40,232, Mendoza 37,510, Mar del Plata
35,307.  Full table in `per_city_year.csv`.

Reading the table:

- **Buenos Aires is involved in 39 % of all national passengers** (2023),
  then Córdoba 11 %, Mendoza 9 %, La Plata 9 %, Rosario 8 %, Salta 7 %,
  Tucumán 7 %.  The CABA figure covers every terminal in the city, not just
  Retiro.
- **Tourist and border destinations recovered best**: Bariloche +19 %,
  Capilla del Monte +22 %, Clorinda +42 % and La Quiaca +7 % (Paraguay and
  Bolivia borders), Puerto Iguazú flat.
- **The north-east and Litoral lost most**: Resistencia −35 %, Corrientes
  −27 %, Santiago del Estero −26 %, Rosario −22 % (2019→2023), then further
  falls of −21 to −32 % in 2024.
- **Press figures and CNRT figures measure different things.**  "Córdoba
  ~80,000 people a day" and "Retiro up to ~100,000 a day in peak season"
  count everyone in the building, including provincial services and
  visitors.  CNRT's national-service passengers for Córdoba average ~7,000
  a day.

## Busiest routes, 2023 (national services, one direction each)

| Route | Services | Passengers |
|---|---:|---:|
| Mar del Plata → Buenos Aires | 9,805 | 294,516 |
| Buenos Aires → Mar del Plata | 9,501 | 274,017 |
| Córdoba → Mendoza | 3,413 | 217,221 |
| Mendoza → Córdoba | 3,442 | 215,925 |
| Buenos Aires → Mendoza | 4,106 | 213,785 |
| Mendoza → Buenos Aires | 4,101 | 212,569 |
| Tucumán → Santiago del Estero | 8,668 | 196,603 |
| Santiago del Estero → Tucumán | 8,083 | 188,208 |
| Buenos Aires → Córdoba | 3,082 | 180,976 |
| Paraná → Buenos Aires | 4,537 | 176,919 |
| Buenos Aires → Mar de Ajó | 3,844 | 176,448 |
| Córdoba → Buenos Aires | 3,087 | 175,663 |
| Buenos Aires → Paraná | 4,506 | 172,331 |
| Rosario → Buenos Aires | 5,849 | 170,458 |
| Jujuy → Salta | 5,096 | 168,989 |

The CNRT 2020 report names CABA–Mar del Plata and Mendoza–Mar del Plata as
the busiest corridors for executive and public services, and Mendoza–Córdoba
for regular services.

## Earlier history (before 2019)

- **Province × province matrices, 2016–2018** (CNRT annual reports, one
  page each).  For example in 2016: CABA → Córdoba 976,103 passengers and
  Córdoba → CABA 973,961; CABA → Santa Fe 608,856 and Santa Fe → CABA
  629,104; Jujuy ↔ Salta about 537,819 and 462,601.  These are per
  province, not per terminal, and would need transcribing from the PDF
  tables.
- **The press series** "50 million passengers in 2016" (CELADI/AAAETA)
  exceeds CNRT's ~34 M for 2016, presumably because it includes provincial
  and tourism services; treat the two as different measures.

## What this means for anden

- The first terminals to cover with boards and gate data are the head
  cities at the top of the table: Buenos Aires (Retiro, Dellepiane,
  Liniers), Córdoba, Mendoza, La Plata, Rosario, Salta, Tucumán and Mar del
  Plata carry most of the national traffic.  The scraper's curated
  terminal list (`anden-scraper/data/terminals.csv`) can be checked
  against `per_city_year.csv`.
- The per-route file (`routes_year_yvera.csv`) can be used to check the
  scraper's coverage: a route with thousands of yearly services missing
  from the GTFS feed indicates an adapter gap.
- Rosario already publishes live arrivals and departures online (see
  `NEWS.md`), which makes it a candidate for the first terminal-board
  adapter.

## Gaps

- **Data after November 2024**: none published on the Yvera portal and no
  CNRT interurban report after 2023.  The "Novedades" file of the dataset
  may announce updates.
- **Retiro 1991–2016 series**: the city statistics office page lists a
  spreadsheet (`TR_A_AX03.xlsx`), but that site redirects HTTPS to plain
  HTTP, which is blocked from this machine, and the Internet Archive was
  offline.  Download it from a browser:
  <https://www.estadisticaciudad.gob.ar/eyc/?p=29196>.
- **Provincial terminals' own counts** (Córdoba's TOSA, Rosario's municipal
  company, Mar del Plata) are not published as datasets; press releases
  only.

## Files

`resources/cnrt-terminal-stats/`:

- `per_city.py` — regenerates the CSVs from `base_microdatos.csv` (460 MB,
  in `base_microdatos.zip` on the Yvera dataset page; not kept here).
- `per_city_year.csv` — city, province, year, services, seats, passengers
  (3,618 rows).
- `national_year.csv`, `national_month.csv` — national totals.
- `routes_year_yvera.csv` — per-route yearly totals as published
  (`magnitudes_por_ruta.csv`).
