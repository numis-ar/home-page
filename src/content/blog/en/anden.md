---
titulo: "anden: where is my bus?"
fecha: 2026-09-28
bajada: Terminals don't know when your bus leaves and no company publishes a single live data point. We're building anden — an Android app and a Rust server, both free software — that turns passengers themselves into the arrival board that's missing.
autores:
  - sebastian-marchano
publicado: false
---
It's nine at night at Retiro: 75 gates spread over three levels and up to 100,000 people a day in peak season. Your ticket says "Gate 10 to 28". The departure board doesn't exist, or it doesn't work, or it lists forty services leaving "approximately" now. You board a bus that runs Buenos Aires–Mendoza in thirteen hours, fall asleep around midnight, and nothing — no one — tells you that your stop is twenty minutes away.

That's what anden solves.

## Why now?

In October 2024, [Decree 883/2024 deregulated long- and medium-distance transport](https://www.argentina.gob.ar/noticias/se-desregula-el-transporte-automotor-de-larga-y-media-distancia-0): companies set their own routes, schedules and prices, and they are no longer required to use a terminal. Stops multiply and move around, and a fixed terminal board covers fewer and fewer services.

Meanwhile, the sector shrinks and strains. Long-distance passengers: from about 50 million in 2016 to about 22 million. Between August 2024 and August 2025, for the first time, [more people traveled by plane than by bus](https://www.infobae.com/economia/2025/09/13/en-los-ultimos-doce-meses-viajaron-mas-personas-en-avion-que-en-micros-de-larga-distancia-dentro-de-la-argentina/): 26.4 million against 22.7 million. With Flybondi's collapse in 2026, the bus became up to 81% cheaper than flying again, and buses are filling up once more on routes of up to 1,100 km. And this September, [Crucero del Norte, 77 years old, suspended all its services](https://www.baenegocios.com/negocios/la-empresa-de-micros-crucero-del-norte-suspendio-todos-los-servicios-y-adeuda-sueldos/).

Fewer services, less predictable, with fewer controls: independent, rider-side information is more valuable than ever. And we can't wait for companies or the state to publish it: among 143 carriers and 4 online ticket sellers, there isn't a single public API today.

## The rider's three questions

The rider manual sums up the app in three questions:

> Is my bus late? When do I get there? Will you wake me up before we arrive?

Everything anden does answers one of those three questions, in that order.

## What it does, in plain words

- **Scan your ticket.** The camera reads the QR or barcode; if there is no code, OCR reads the printed text. With that, the app finds your trip; or, if you prefer, you pick it by hand from a terminal's departures board.
- **Before boarding, "arrives in…".** The delay is worked out by other passengers who are already on board and reporting the bus's position.
- **On the move, your own GPS.** Each point is projected onto the route, and the remaining time is added up kilometer by kilometer using the typical speeds for that stretch. On the road you don't need signal: the route, the speed profile and the maps are stored on the phone, and the positions queue up to be sent when the connection comes back.
- **A full-screen alarm** wakes you before your stop, with the phone locked and in a pocket.
- **A link to share:** whoever is waiting at the terminal sees the bus approaching and the estimated arrival time.

## The passenger as data source

The information comes from the passengers: each phone on board reports where the bus is, using a random token that lasts a single trip and cannot be linked to anything. The server keeps only the point snapped onto the route, deletes the samples after 24 hours, and from that works out delays, typical speeds per kilometer and gate history. That real-time feed is also exported in GTFS-RT format for anyone to use.

> If nobody publishes the data, we build them among the people who ride.

## We're building it

None of the above is a catalog idea: it's what we're building at Numis. It's called **anden** and today it is two pieces of free software: an Android app, written in Kotlin, without Google services and designed for reproducible F-Droid builds, and a backend server written in Rust. The app is GPLv3; the server, AGPLv3.

The rider's three questions are also the spec. Every design decision answers one: is it late? the delay comes from the people riding. When do I get there? your own phone, which works it out while you're moving. Will you wake me? an exact alarm that rings 20 minutes before arrival whether the bus is delayed or not.

## The infrastructure behind it

The app and the server talk through a **REST API**, which is the contract between them. The endpoints in everyday use:

- `GET /search` — finds the trip from the five ticket fields (carrier, origin, destination, date and time). The passenger's name never leaves the phone.
- `GET /trips/{id}/status` — accumulated delay, last position and gate of the service.
- `GET /stops/{id}/board` — a terminal's departures board, with an estimated gate or gate range.
- `POST /reports` — the bus reports its position, anonymously and in batches.
- `GET /gtfs-rt/...` — the open real-time export for third parties.

On the server side, everything lives in **PostgreSQL with PostGIS**: the timetable, versioned so it can be re-imported every day; the live state of each service; and the statistics, like the typical speed of each kilometer of route for each hour of the day.

Normal use, end to end, looks like this:

![Sequence diagram of the happy path: the passenger scans the ticket, the app queries the server, the bus reports its position anonymously and the alarm rings before the stop](/blog/anden-camino-feliz.en.svg)

Every sample arrives with plausibility checks —that it isn't from the future, that it doesn't exceed an impossible speed, that it is close to the route— and only the point already projected onto it is stored. A trip starts counting as "on board" once it has moved at least 300 meters along the route, so someone waiting at the stop doesn't drag the bus position backwards. Everyone waiting for that service is notified instantly, without the app having to ask.

## Current state and next steps

The app and the server work and pass their tests, but they haven't been tried on a real phone on the road yet: camera OCR, map rendering, GPS battery drain and alarms on a sleeping phone are exactly the things that have to be measured on board a bus. Gates are currently estimated from history alone, because there are no adapters for terminal boards yet; Rosario, which publishes its arrivals and departures online, is the first candidate.

All the work can be followed in anden's GIT repository: [git.taler.net/anden](https://git-www.taler.net/anden.git/)

## Get on board

If you travel long-distance by bus, you know what we're talking about: those nights at the terminal staring at a ticket that says "10 to 28", and those 300-kilometer naps with one eye open in case we're arriving.

anden is built for those trips. When road testing starts, we'll be looking for passengers who want to get on and try it: [write to us](/en/contacto) and we'll take you along.
