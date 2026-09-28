---
titulo: "Cargar la billetera: un puente entre el pago y Taler"
fecha: 2026-09-28
bajada: "Para comprar con numis primero hay que tenerlos en la billetera. Contamos cómo funciona la carga por dentro: un puente que hace de banco para Taler, cobra a través de un proveedor de pago y no ata la billetera a ninguno."
autores:
  - marcos-senatori
publicado: false
---
Para pagar con numis, primero tienen que estar en tu billetera GNU Taler. Cargarlos es, en el fondo, un intercambio: pagás pesos a alguien que sabe cobrarlos, y en la billetera aparecen numis. Un peso, un numis.

Ese "alguien que sabe cobrar" es un proveedor de pago, y ahí aparecen dos problemas. El primero es que el proveedor sabe quién sos: tiene tu tarjeta, tu cuenta, tu nombre. La billetera, en cambio, no debería saberlo, y lo que compres después con esos numis tampoco. El segundo es que no queremos que la carga dependa de un solo proveedor: si mañana conviene sumar otro, o cambiarlo, la billetera no debería enterarse.

Esto está en desarrollo y hoy funciona en un ambiente de prueba. Lo que sigue es cómo lo armamos.

## Un banco que no es un banco

En Taler, cargar una billetera se llama *retiro*. El protocolo lo piensa así: un banco le avisa al exchange que llegaron fondos para una reserva, que es una clave que genera tu billetera, y la billetera después retira de esa reserva monedas firmadas por el exchange.

Nosotros no tenemos un banco. Tenemos un proveedor de pago que cobra en pesos. Así que escribimos la pieza que falta, el **bridge**: para la billetera es un banco que atiende retiros; para el exchange es una cuenta que informa qué fondos entraron; para el proveedor es un comercio que cobra. Cada uno habla con el bridge en su propio idioma y ninguno sabe cómo está hecho el otro lado.

## Cómo funciona por dentro

Son seis piezas. Del lado de quien carga, el navegador y la billetera. Del lado de la cooperativa, funding, el sitio donde elegís cuánto cargar, y el bridge. Afuera, el proveedor de pago, que cobra, y el exchange de Taler, que emite los numis.

<figure class="diagrama">
<svg viewBox="0 30 680 438" role="img" aria-labelledby="diag-titulo diag-desc" xmlns="http://www.w3.org/2000/svg">
<title id="diag-titulo">Cómo se cargan numis en la billetera</title>
<desc id="diag-desc">Elegís el monto en funding, que le pide la operación al bridge (1). El navegador le pasa la dirección de retiro a la billetera (2), que le indica al bridge a qué reserva van los fondos (3). Elegís el proveedor en funding, que se lo pasa al bridge (4), y funding te lleva al cobro del proveedor (5). El proveedor le confirma el pago al bridge (6), el bridge acredita la reserva y el exchange la lee (7), y la billetera retira las monedas del exchange (8).</desc>
<defs><marker id="diag-flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1L9 5L0 9z" class="diag-punta"/></marker></defs>
<rect x="0" y="40" width="213" height="380" rx="10" class="diag-zona diag-zona--compra"/>
<text x="16" y="66" class="diag-zona-nombre">Quien carga</text>
<rect x="233" y="40" width="213" height="380" rx="10" class="diag-zona diag-zona--coop"/>
<text x="249" y="66" class="diag-zona-nombre">Cooperativa</text>
<rect x="466" y="40" width="214" height="180" rx="10" class="diag-zona diag-zona--proveedor"/>
<text x="482" y="66" class="diag-zona-nombre">Proveedor de pago</text>
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
<text x="106" y="137" text-anchor="middle" class="diag-nombre">navegador</text>
<rect x="264" y="100" width="150" height="64" rx="6" class="diag-caja"/>
<text x="339" y="137" text-anchor="middle" class="diag-nombre">funding</text>
<rect x="497" y="100" width="150" height="64" rx="6" class="diag-caja"/>
<text x="572" y="137" text-anchor="middle" class="diag-nombre">proveedor</text>
<rect x="31" y="300" width="150" height="64" rx="6" class="diag-caja"/>
<text x="106" y="337" text-anchor="middle" class="diag-nombre">billetera</text>
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

1. **Elegís cuánto cargar.** Funding le pide al bridge una operación de retiro por ese monto. El bridge genera un identificador aleatorio de 128 bits y devuelve una dirección `taler://withdraw/…` que lo nombra a él como banco. Todavía no se cobró nada.
2. **La billetera recibe la dirección.** La página la muestra como código QR y la escaneás con la billetera.
3. **La billetera elige a dónde van los fondos.** Le dice al bridge cuál es su reserva y en qué exchange está. El bridge rechaza cualquier otro monto u otro exchange, y a cambio le devuelve un link para confirmar la transferencia. Ese link es parte del protocolo: en un retiro común lleva a la página de tu banco. Acá lleva a la página donde elegís cómo pagar.
4. **Elegís el proveedor.** Funding se lo pasa al bridge, que crea el cobro en el proveedor por el monto en pesos, con el identificador de la operación como referencia. Si tocás dos veces, el cobro se crea una sola vez.
5. **Pagás en el proveedor.** Funding te lleva a su página de cobro y pagás con lo que el proveedor ofrezca.
6. **El proveedor le avisa al bridge.** Hay dos caminos: una notificación que el proveedor manda por su cuenta, y tu vuelta desde su página. La notificación tiene que venir firmada, y aun así el bridge no le cree a ninguno de los dos: consulta el pago en el proveedor y sigue solo si figura aprobado. Los dos caminos terminan en la misma acreditación, que no se puede hacer dos veces para la misma reserva.
7. **El bridge acredita la reserva.** Anota el ingreso en su libro de movimientos, que es de solo agregar. El exchange lee ese libro como leería el de un banco y deja fondeada la reserva.
8. **La billetera retira las monedas.** Del exchange, como en cualquier retiro de Taler. Desde acá el bridge ya no participa.

## Un proveedor hoy, lugar para otros

Hoy hay un solo proveedor conectado, y dentro de su propia página ya ofrece varias formas de pago: tarjeta, dinero en cuenta o efectivo. Pero la separación del bridge está pensada para que no sea el único.

La parte que habla con la billetera no sabe qué proveedor existe: cuando la billetera elige su reserva, el bridge solo contesta con un link. Y la acreditación del paso 7 es la misma para cualquier proveedor: recibe una operación y un monto, y no le importa quién cobró. Sumar un proveedor es escribir dos cosas: cómo se le pide un cobro y cómo se verifica que se pagó. Todo lo demás, incluida la billetera, queda igual.

Hay un detalle del orden que hace posible esto. El QR aparece antes del pago, no después. Taler solo deja confirmar un retiro cuando la billetera ya eligió su reserva, así que primero la billetera dice a dónde van los fondos, y recién después elegís con qué pagar. El proveedor entra en el medio, en el lugar donde el protocolo esperaba un banco.

## Qué sabe cada uno

- **El proveedor** sabe quién pagó y cuánto, y conoce el identificador de la operación. No sabe nada de la billetera.
- **El bridge** une ese identificador con la reserva de la billetera. No guarda nombre, correo ni ningún dato de quien pagó.
- **El exchange** ve una reserva, un monto y una cuenta de origen genérica, la misma para todas las cargas de ese proveedor. No ve a la persona.
- **La billetera** sabe todo lo suyo y no le cuenta a nadie en qué gasta.

Lo decimos completo: quien tuviera a la vez los datos del proveedor y la base del bridge podría unir un pago con una reserva. Lo que nadie puede unir es esa carga con lo que compres después. Las monedas que retira la billetera están firmadas a ciegas: el exchange las firma sin verlas, así que cuando las gastás no hay forma de saber de qué carga salieron.
