---
titulo: "anden: donde están mi micro?"
fecha: 2026-09-28
bajada: Las terminales no saben a qué hora sale tu micro y ninguna empresa publica un dato en vivo. Estamos construyendo anden, una app Android y un servidor en Rust, ambos de software libre, que convierten a los propios pasajeros en el tablero de llegadas que falta.
autores:
  - sebastian-marchano
publicado: false
---
Son las nueve de la noche en Retiro: 75 andenes repartidos en tres pisos y hasta 100.000 personas por día en temporada. Tu pasaje dice "Andén 10 a 28". El tablero no existe, o no anda, o lista cuarenta servicios que salen "aproximadamente" ahora. Subís a un micro que hace Buenos Aires–Mendoza en trece horas, te dormís a la medianada y nada — nadie — te avisa que en veinte minutos bajás.

Eso es lo que resuelve anden.

## ¿Por qué ahora?

En octubre de 2024, el [Decreto 883/2024 desreguló el transporte de larga y media distancia](https://www.argentina.gob.ar/noticias/se-desregula-el-transporte-automotor-de-larga-y-media-distancia-0): las empresas fijan rutas, horarios y precios, y ya no están obligadas a usar una terminal. Los puntos de parada se multiplican y se mueven, y un tablero fijo de terminal cada vez cubre menos servicios.

Mientras tanto, el sector se achica y se tensa. Pasajeros de larga distancia: de unos 50 millones en 2016 a unos 22 millones. Entre agosto 2024 y agosto 2025, por primera vez, [viajaron más personas en avión que en micro](https://www.infobae.com/economia/2025/09/13/en-los-ultimos-doce-meses-viajaron-mas-personas-en-avion-que-en-micros-de-larga-distancia-dentro-de-la-argentina/): 26,4 millones contra 22,7 millones. Con la caída de Flybondi en 2026 el micro volvió a ser hasta un 81 % más barato que volar, y el bus vuelve a llenarse en rutas de hasta 1.100 km. Y en septiembre de este año, [Crucero del Norte, con 77 años, suspendió todos sus servicios](https://www.baenegocios.com/negocios/la-empresa-de-micros-crucero-del-norte-suspendio-todos-los-servicios-y-adeuda-sueldos/).

Menos servicios, más impredecibles, con menos controles: la información independiente, del lado del pasajero, vale más que nunca. Y no podemos esperar a que las empresas o el Estado la publiquen: entre 143 empresas y 4 vendedores de pasajes en línea, hoy no hay ni una sola API pública.

## Las tres preguntas del pasajero

El manual del pasajero resume la app en tres preguntas:

> ¿Viene tarde mi micro? ¿Cuándo llego? ¿Me despertás antes de llegar?

Todo lo que hace anden responde una de esas tres preguntas, en ese orden.

## Qué hace, en palabras llanas

- **Escaneás el pasaje.** La cámara lee el código QR o de barras; si no hay código, un OCR lee el texto impreso. Con eso la app encuentra el viaje; si prefiere, elegís a mano desde el tablero de salidas de una terminal.
- **Antes de subir, "llega en…".** La demora la calculan otros pasajeros que ya van a bordo y reportan la posición del micro.
- **En marcha, tu propio GPS.** Cada punto se proyecta sobre la ruta y el tiempo restante se suma kilómetro a kilómetro con las velocidades típicas de ese tramo. En ruta no hace falta tener señal: la ruta, el perfil de velocidades y los mapas viajan guardados en el teléfono, y las posiciones quedan en cola para mandarse cuando vuelve la conexión.
- **Una alarma a pantalla completa** te despierta antes de tu parada, con el teléfono bloqueado y en un bolsillo.
- **Un enlace para compartir:** quien te espera en la terminal ve el micro acercarse y la hora de arribo estimada.

## El pasajero como fuente de datos

La informacion la aportan los pasajeros: cada teléfono a bordo informa dónde está el micro, con un token aleatorio que dura un solo viaje y no puede vincularse con nada. El servidor guarda únicamente el punto sobre la ruta, borra las muestras a las 24 horas, y con eso calcula demoras, velocidades típicas por kilómetro e historial de andenes. Ese tiempo real también se exporta en formato GTFS-RT para que cualquier tercero lo use.

> Si nadie publica los datos, los construimos entre quienes viajamos.

## Lo estamos construyendo

Todo lo anterior no es una idea de catálogo: es lo que estamos construyendo desde Numis. Se llama **anden** y hoy son dos piezas de software libre: una app Android, escrita en Kotlin, sin servicios de Google y pensada para compilaciones reproducibles de F-Droid, y un servidor backend escrito en Rust. La app es GPLv3; el servidor, AGPLv3.

Las tres preguntas del pasajero son también la especificación. Cada decisión de diseño responde una: ¿viene tarde? la demora la devuelven quienes viajan. ¿Cuándo llego? tu propio teléfono que lo calcula durante la marcha. ¿Me despertás? una alarma exacta que suena 20 minutos antes de llegar independientemente si viene demorado o no.

## La infraestructura detrás

La app y el servidor hablan por una **API REST**, que es el contrato entre ambos. Los endpoints de uso corriente:

- `GET /search` — encuentra el viaje a partir de los cinco datos del pasaje (empresa, origen, destino, fecha y hora). El nombre del pasajero jamás sale del teléfono.
- `GET /trips/{id}/status` — demora acumulada, última posición y andén del servicio.
- `GET /stops/{id}/board` — el tablero de salidas de una terminal, con andén estimado o rango de andenes.
- `POST /reports` — el micro informa su posición, anónima y por lotes.
- `GET /gtfs-rt/...` — la exportación abierta del tiempo real para terceros.

Del lado del servidor, todo vive en **PostgreSQL con PostGIS**: el horario, versionado para poder reimportarlo todos los días; el estado en vivo de cada servicio; y las estadísticas, como la velocidad típica de cada kilómetro de ruta para cada hora del día.

El uso normal, de punta a punta, se ve así:

![Diagrama de secuencia del camino feliz: el pasajero escanea el pasaje, la app consulta al servidor, el micro reporta su posición anónima y la alarma suena antes de la parada](/blog/anden-camino-feliz.svg)

Cada muestra llega con chequeos de plausibilidad —que no sea del futuro, que no supere una velocidad imposible, que esté cerca de la ruta— y se guarda solo el punto ya proyectado sobre ella. Un viaje empieza a contar como "a bordo" cuando se movió al menos 300 metros a lo largo de la ruta, así quien espera en la parada no arrastra la posición del micro hacia atrás. A quienes están esperando ese servicio, el servidor les avisa al instante, sin que la app tenga que preguntar.

## Estado actual y próximos pasos

La app y el servidor funcionan y pasan las pruebas, pero todavía no se probaron en un teléfono real en ruta: el OCR de la cámara, el renderizado del mapa, el consumo de batería del GPS y las alarmas con el teléfono dormido son justo las cosas que hay que medir arriba de un micro. Los andenes se estiman por ahora solo con historia, porque todavía no hay adaptadores de los tableros de las terminales; Rosario, que publica sus arribos y partidas en línea, es la primera candidata.

Todo el trabajo se puede seguir en el repositorio GIT de anden: [git.taler.net/anden](https://git-www.taler.net/anden.git/)

## Subite

Si viajás en micro de larga distancia, ya sabés de qué hablamos: de esas noches en la terminal mirando un pasaje que dice "10 a 28", y de esas siestas de 300 kilómetros con un ojo abierto por si ya estamos llegando.

anden se construye para esos viajes. Cuando empiece la prueba en ruta vamos a buscar pasajeros que quieran subirse a probarlo: [escribinos](/contacto) y te sumamos al viaje.
