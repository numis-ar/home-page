# Babel — market.test.numis.ar

**Babel** is an online bookstore run by **Numis Coop**, a Buenos Aires book
cooperative. Its defining trait: it sells books in **numis**, the cooperative's
own currency, paid with **GNU Taler** — an anonymous, free, open-source digital
wallet. The price shown is the final price; there are no accounts, no emails
and no passwords anywhere in the store. The UI is in Spanish (rioplatense
*voseo*) and the footer reads "© 2026 · Impulsado por Numis Coop."

Tested on 2026-09-27. The site lives at https://market.test.numis.ar/ (a
staging/test environment; its companion "aportes" site for buying numis is at
https://funding.test.numis.ar/).

## Pages and how they connect

```
/                     Catalog (all books, search, category filter, cart button)
/libro/<slug>         Book detail page (×40 books)
/checkout             Cart + checkout (multi-step form, client-side state)
/checkout/<id>        Order status page (QR payment, tracking) — the "receipt"
/ayuda                Help / honest FAQ, the store's only contact channel
/ayuda#contacto       Contact section — no email/phone, physical stores only
404                   Anything unknown (including /robots.txt and /sitemap.xml)
```

## Catalog (`/`)

- Header: search by title or author, theme switcher (**Auto / Claro / Oscuro**),
  and a **Carrito** (cart) button.
- Category filter: **Todo · Narrativa argentina · Cuento · Poesía · Ciencia
  ficción · Ensayo**.
- About 40 books, mostly Argentine literature (Borges, Cortázar, Bioy Casares,
  Enríquez, Gelman, Storni, Piglia, Mitre, Aguinis…) plus classics in
  translation (Asimov, Bradbury, Vonnegut, Verne, Lowry, Robinson).
- Each card shows cover, title, author, price in numis (roughly 6–30 numis)
  and an **Agregar / Agregado** (add/added) button with little pop animations.
- Covers are pulled from Open Library by ISBN; typography is Bricolage
  Grotesque / Literata / IBM Plex Mono.

## Book page (`/libro/<slug>`)

Full bibliographic record: author, publisher, year, page count, physical
dimensions and weight, language, ISBN, price in numis, availability
("Disponible · Sale del depósito en 24 a 48 horas"), a note that shipping is
calculated at checkout and that pickup is free, plus a per-page FAQ and
cross-sell ("Más en <category>").

## Cart and checkout (`/checkout`)

The cart is entirely client-side (localStorage + `GET /api/catalog?ids=…` to
resolve items). Checkout is a guided flow:

1. **Buyer name** (required) — the store's only piece of personal data.
2. **"Elegí cómo recibirlo"** — delivery method:
   - `retiro-libreria` — free pickup at one of the cooperative's locations:
     - **Babel Chacarita** — Jorge Newbery 3550 (Wed–Sun 13:00–20:00)
     - **Babel Once** — Av. Rivadavia 2345 (Mon–Fri 10:00–19:30, Sat 10:00–14:00)
     - **Depósito Warnes** — Warnes 1200
   - `sucursal` — pickup at a **Correo Argentino** branch (branch list is
     looked up live by postcode via `/api/checkout/agencies`)
   - `domicilio` — home delivery (needs street, city, postcode, province)
3. **Shipping quote** (`POST /api/checkout/quote`) — shows delivery cost and
   ETA (2–5 days) before paying; pickup quotes 0. The draft survives reloads
   via sessionStorage.
4. **Pay** — `POST /api/sale` creates the order and returns a
   `taler://pay/…` URI; the site shows a QR code and an "Abrir en la
   billetera" button.

## Payment: numis + GNU Taler

- Prices are in **numis** (internal precision: 100 units = 1 numis, shown as
  `ℕ 12.50` / `12,50 numis`).
- Paying means scanning the QR with a **GNU Taler wallet** (apps for iOS,
  Android and Chrome are linked from the help page). Payment never touches a
card, and the wallet reveals nothing about the buyer to the store.
- Numis are obtained by **contributing to the cooperative** on the funding
  site (https://funding.test.numis.ar/): "Contribute an amount and receive the
  same value in points for your GNU Taler wallet."
- The Taler merchant backend lives at `merchant.taler.ar`.

## Order page (`/checkout/<id>`)

Acts as the receipt and tracking page: total ("NUMIS 21.00"), a QR to scan
with the Taler wallet, "Esperando pago…" while pending, plus **Abrir en la
billetera**, **Copiar enlace** and **Cancelar**. After payment it tracks
shipment: "Preparando" → shipped with Correo Argentino tracking number →
"Listo para retirar" for pickups.

The URL itself is the credential: the store has no accounts, so whoever has
the order link can see the order (name, phone, address, status) — the FAQ
explicitly warns not to share it, and says a lost link cannot be recovered
remotely (only in person at a store, by name and phone).

## API surface (discovered from the JS bundles)

| Endpoint | Purpose |
|---|---|
| `GET /api/catalog?ids=…` | Resolve cart items to product records |
| `POST /api/checkout/options` | Delivery modes + pickup points |
| `POST /api/checkout/agencies` | Correo Argentino branches by postcode |
| `POST /api/checkout/quote` | Shipping price + ETA (409 if the quote went stale) |
| `POST /api/sale` | Create order → `{orderId, checkoutId, talerPayUri, total, currency:"NUMIS"}` |

Example order IDs look like `2026.270-YFPNHYW8DV9EA` with a UUID `checkoutId`.

## Help page (`/ayuda`) — the store's philosophy in one page

Honest, no-marketing FAQ covering: how to get the Taler wallet; why there are
no accounts or emails ("sin cuenta ni correo no hay contraseña que olvidar, ni
datos que cuidar, ni spam"); how to re-find an order via the wallet; what
happens if you delete the wallet or lose the link ("hoy no hay forma de
recuperarlo a distancia, y lo decimos sin vueltas"); what numis are; how
shipping is calculated (by destination and weight, quoted before payment,
free on pickup — sometimes estimated because a book hasn't been weighed yet);
refunds (done by the store back to the paying wallet, no self-service button);
and **Contacto**: no email, no phone — the help page plus the physical stores
are the only channels.

## Technical notes

- **Next.js** (App Router, Turbopack builds) behind nginx, Spanish `lang`.
- Security headers: HSTS (2 years), `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`.
- No `robots.txt`, no `sitemap.xml`; unknown routes (including fake book
  slugs) return a rendered 404.
- All state is in the browser (localStorage cart, sessionStorage checkout
  draft); the server is nearly stateless until `/api/sale`.

## How far the exploration went

Everything above the money was exercised end-to-end against the live test
site, including a real (never-paid, will-expire) test order created through
`POST /api/sale` that surfaced the `taler://pay/merchant.taler.ar/…` URI and
the waiting-for-payment order page at `/checkout/<id>`. The final step —
actually paying with a Taler wallet — requires installing the wallet app and
holding numis, so it was not performed.
