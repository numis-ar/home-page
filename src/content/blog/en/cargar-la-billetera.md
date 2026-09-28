---
titulo: "Loading the wallet: a bridge between payment and Taler"
fecha: 2026-09-28
bajada: "To buy with numis, you first need them in your wallet. Here's how loading works under the hood: a bridge that acts as a bank for Taler, collects through a payment provider, and doesn't tie the wallet to any of them."
autores:
  - marcos-senatori
publicado: false
---
To pay with numis, they first have to be in your GNU Taler wallet. Loading them is, at heart, an exchange: you pay pesos to someone who knows how to collect them, and numis show up in your wallet. One peso, one numis.

That "someone who knows how to collect" is a payment provider, and that raises two problems. The first is that the provider knows who you are: it has your card, your account, your name. The wallet, on the other hand, shouldn't know, and neither should anything you later buy with those numis. The second is that we don't want loading to depend on a single provider: if tomorrow it makes sense to add another one, or switch, the wallet shouldn't notice.

This is still in development and currently runs in a test environment. What follows is how we built it.

## A bank that isn't a bank

In Taler, loading a wallet is called a *withdrawal*. The protocol sees it like this: a bank tells the exchange that funds have arrived for a reserve, which is a key your wallet generates, and the wallet then withdraws coins signed by the exchange from that reserve.

We don't have a bank. We have a payment provider that collects pesos. So we wrote the missing piece, the **bridge**: to the wallet it's a bank that handles withdrawals; to the exchange it's an account that reports incoming funds; to the provider it's a merchant getting paid. Each of them talks to the bridge in its own language, and none of them knows how the other side works.

## How it works under the hood

There are six pieces. On the side of whoever is loading, the browser and the wallet. On the cooperative's side, funding, the site where you choose how much to load, and the bridge. Outside, the payment provider, which collects the money, and the Taler exchange, which issues the numis.

<figure class="diagrama">
<svg viewBox="0 30 680 438" role="img" aria-labelledby="diag-titulo diag-desc" xmlns="http://www.w3.org/2000/svg">
<title id="diag-titulo">How numis are loaded into the wallet</title>
<desc id="diag-desc">You choose the amount on funding, which asks the bridge for the operation (1). The browser hands the withdrawal address to the wallet (2), which tells the bridge which reserve the funds go to (3). You choose the provider on funding, which passes it to the bridge (4), and funding takes you to the provider's checkout (5). The provider confirms the payment to the bridge (6), the bridge credits the reserve and the exchange reads it (7), and the wallet withdraws the coins from the exchange (8).</desc>
<defs><marker id="diag-flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1L9 5L0 9z" class="diag-punta"/></marker></defs>
<rect x="0" y="40" width="213" height="380" rx="10" class="diag-zona diag-zona--compra"/>
<text x="16" y="66" class="diag-zona-nombre">You</text>
<rect x="233" y="40" width="213" height="380" rx="10" class="diag-zona diag-zona--coop"/>
<text x="249" y="66" class="diag-zona-nombre">Cooperative</text>
<rect x="466" y="40" width="214" height="180" rx="10" class="diag-zona diag-zona--proveedor"/>
<text x="482" y="66" class="diag-zona-nombre">Payment provider</text>
<rect x="466" y="240" width="214" height="180" rx="10" class="diag-zona diag-zona--taler"/>
<text x="482" y="266" class="diag-zona-nombre">GNU Taler</text>
<line x1="181" y1="132" x2="260" y2="132" class="diag-linea" marker-end="url(#diag-flecha)"/>
<line x1="339" y1="164" x2="339" y2="296" class="diag-linea" marker-end="url(#diag-flecha)"/>
<line x1="414" y1="132" x2="493" y2="132" class="diag-linea" marker-end="url(#diag-flecha)"/>
<line x1="106" y1="164" x2="106" y2="296" class="diag-linea" marker-end="url(#diag-flecha)"/>
<line x1="181" y1="332" x2="260" y2="332" class="diag-linea" marker-end="url(#diag-flecha)"/>
<line x1="520" y1="166" x2="402" y2="298" class="diag-linea" marker-end="url(#diag-flecha)"/>
<line x1="414" y1="332" x2="493" y2="332" class="diag-linea" marker-end="url(#diag-flecha)"/>
<path d="M106 366 V440 Q106 452 118 452 H560 Q572 452 572 440 V370" class="diag-linea diag-curva" marker-end="url(#diag-flecha)"/>
<rect x="31" y="100" width="150" height="64" rx="6" class="diag-caja"/>
<text x="106" y="137" text-anchor="middle" class="diag-nombre">browser</text>
<rect x="264" y="100" width="150" height="64" rx="6" class="diag-caja"/>
<text x="339" y="137" text-anchor="middle" class="diag-nombre">funding</text>
<rect x="497" y="100" width="150" height="64" rx="6" class="diag-caja"/>
<text x="572" y="137" text-anchor="middle" class="diag-nombre">provider</text>
<rect x="31" y="300" width="150" height="64" rx="6" class="diag-caja"/>
<text x="106" y="337" text-anchor="middle" class="diag-nombre">wallet</text>
<rect x="264" y="300" width="150" height="64" rx="6" class="diag-caja"/>
<text x="339" y="337" text-anchor="middle" class="diag-nombre">bridge</text>
<rect x="497" y="300" width="150" height="64" rx="6" class="diag-caja"/>
<text x="572" y="337" text-anchor="middle" class="diag-nombre">exchange</text>
<circle cx="210" cy="132" r="10" class="diag-circulo"/><text x="210" y="136" text-anchor="middle" class="diag-num">1</text>
<circle cx="232" cy="132" r="10" class="diag-circulo"/><text x="232" y="136" text-anchor="middle" class="diag-num">4</text>
<circle cx="339" cy="219" r="10" class="diag-circulo"/><text x="339" y="223" text-anchor="middle" class="diag-num">1</text>
<circle cx="339" cy="243" r="10" class="diag-circulo"/><text x="339" y="247" text-anchor="middle" class="diag-num">4</text>
<circle cx="453" cy="132" r="10" class="diag-circulo"/><text x="453" y="136" text-anchor="middle" class="diag-num">5</text>
<circle cx="106" cy="230" r="10" class="diag-circulo"/><text x="106" y="234" text-anchor="middle" class="diag-num">2</text>
<text x="122" y="234" class="diag-etiqueta">taler://withdraw</text>
<circle cx="220" cy="332" r="10" class="diag-circulo"/><text x="220" y="336" text-anchor="middle" class="diag-num">3</text>
<circle cx="461" cy="232" r="10" class="diag-circulo"/><text x="461" y="236" text-anchor="middle" class="diag-num">6</text>
<circle cx="453" cy="332" r="10" class="diag-circulo"/><text x="453" y="336" text-anchor="middle" class="diag-num">7</text>
<circle cx="339" cy="452" r="10" class="diag-circulo"/><text x="339" y="456" text-anchor="middle" class="diag-num">8</text>
</svg>
</figure>

1. **You choose how much to load.** Funding asks the bridge for a withdrawal operation for that amount. The bridge generates a random 128-bit identifier and returns a `taler://withdraw/…` address that names it as the bank. Nothing has been charged yet.
2. **The wallet receives the address.** The page shows it as a QR code and you scan it with your wallet.
3. **The wallet chooses where the funds go.** It tells the bridge which reserve is its own and which exchange it belongs to. The bridge rejects any other amount or any other exchange, and in return gives the wallet a link to confirm the transfer. That link is part of the protocol: in a regular withdrawal it leads to your bank's page. Here it leads to the page where you choose how to pay.
4. **You choose the provider.** Funding passes your choice to the bridge, which creates the charge with the provider for the amount in pesos, using the operation's identifier as the reference. If you click twice, the charge is still created only once.
5. **You pay at the provider.** Funding takes you to its checkout page and you pay with whatever the provider offers.
6. **The provider tells the bridge.** There are two paths: a notification the provider sends on its own, and your return from its page. The notification has to be signed, and even so the bridge trusts neither path: it looks the payment up with the provider and only goes on if it shows as approved. Both paths end in the same credit, which can't happen twice for the same reserve.
7. **The bridge credits the reserve.** It records the incoming funds in its ledger, which is append-only. The exchange reads that ledger the way it would read a bank's and funds the reserve.
8. **The wallet withdraws the coins.** From the exchange, as in any Taler withdrawal. From here on, the bridge is no longer involved.

## One provider today, room for others

Today there is a single provider connected, and its own page already offers several ways to pay: card, account balance or cash. But the way the bridge is split up is meant to keep it from being the only one.

The part that talks to the wallet doesn't know which providers exist: when the wallet picks its reserve, the bridge just answers with a link. And the credit in step 7 is the same for every provider: it takes an operation and an amount, and doesn't care who collected the money. Adding a provider means writing two things: how to ask it for a charge and how to verify that it was paid. Everything else, the wallet included, stays the same.

One detail about the order makes this possible. The QR shows up before the payment, not after. Taler only lets a withdrawal be confirmed once the wallet has chosen its reserve, so first the wallet says where the funds go, and only then do you choose how to pay. The provider slots in between, in the place where the protocol expected a bank.

## Who knows what

- **The provider** knows who paid and how much, and knows the operation's identifier. It knows nothing about the wallet.
- **The bridge** links that identifier to the wallet's reserve. It doesn't store any name, email or other detail about who paid.
- **The exchange** sees a reserve, an amount and a generic source account, the same for every load through that provider. It doesn't see the person.
- **The wallet** knows everything about itself and tells no one what it spends on.

To be complete: someone holding both the provider's data and the bridge's database could link a payment to a reserve. What no one can link is that load to what you buy afterwards. The coins the wallet withdraws are blind-signed: the exchange signs them without seeing them, so when you spend them there's no way to tell which load they came from.
