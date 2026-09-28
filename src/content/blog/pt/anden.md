---
titulo: "anden: onde está o meu ônibus?"
fecha: 2026-09-28
bajada: As rodoviárias não sabem a que horas sai seu ônibus e nenhuma empresa publica um dado ao vivo. Estamos construindo o anden, um app Android e um servidor em Rust, ambos software livre, que transformam os próprios passageiros no painel de chegadas que falta.
autores:
  - sebastian-marchano
publicado: true
---
São nove da noite em Retiro: 75 plataformas espalhadas em três pisos e até 100.000 pessoas por dia na alta temporada. Sua passagem diz "Plataforma 10 a 28". O painel não existe, ou não funciona, ou lista quarenta serviços que saem "aproximadamente" agora. Você embarca em um ônibus que faz Buenos Aires–Mendoza em treze horas, dorme por volta da meia-noite e nada — ninguém — te avisa que faltam vinte minutos para a sua parada.

É isso que o anden resolve.

## Por que agora?

Em outubro de 2024, o [Decreto 883/2024 desregulou o transporte de longa e média distância](https://www.argentina.gob.ar/noticias/se-desregula-el-transporte-automotor-de-larga-y-media-distancia-0): as empresas definem rotas, horários e preços, e já não são obrigadas a usar uma rodoviária. Os pontos de parada se multiplicam e se movem, e um painel fixo de rodoviária cobre cada vez menos serviços.

Enquanto isso, o setor encolhe e se tensiona. Passageiros de longa distância: de cerca de 50 milhões em 2016 para cerca de 22 milhões. Entre agosto de 2024 e agosto de 2025, pela primeira vez, [viajaram mais pessoas de avião que de ônibus](https://www.infobae.com/economia/2025/09/13/en-los-ultimos-doce-meses-viajaron-mas-personas-en-avion-que-en-micros-de-larga-distancia-dentro-de-la-argentina/): 26,4 milhões contra 22,7 milhões. Com a queda da Flybondi em 2026, o ônibus voltou a ser até 81 % mais barato que voar, e os ônibus voltam a encher em rotas de até 1.100 km. E em setembro deste ano, [a Crucero del Norte, com 77 anos, suspendeu todos os seus serviços](https://www.baenegocios.com/negocios/la-empresa-de-micros-crucero-del-norte-suspendio-todos-los-servicios-y-adeuda-sueldos/).

Menos serviços, mais imprevisíveis, com menos controles: a informação independente, do lado do passageiro, vale mais do que nunca. E não podemos esperar que as empresas ou o Estado a publiquem: entre 143 empresas e 4 vendedores de passagens on-line, hoje não existe uma única API pública.

## As três perguntas do passageiro

O manual do passageiro resume o app em três perguntas:

> Meu ônibus está atrasado? Quando eu chego? Você me acorda antes de chegar?

Tudo o que o anden faz responde uma dessas três perguntas, nessa ordem.

## O que faz, em palavras simples

- **Escaneia o bilhete.** A câmera lê o código QR ou de barras; se não houver código, um OCR lê o texto impresso. Com isso, o app encontra a viagem; se preferir, você escolhe à mão no painel de partidas de uma rodoviária.
- **Antes de embarcar, "chega em…".** O atraso é calculado por outros passageiros que já estão a bordo e reportam a posição do ônibus.
- **Em marcha, o seu próprio GPS.** Cada ponto é projetado sobre a rota e o tempo restante é somado quilômetro a quilômetro com as velocidades típicas daquele trecho. Na estrada não é preciso ter sinal: a rota, o perfil de velocidades e os mapas ficam guardados no telefone, e as posições ficam na fila para serem enviadas quando a conexão volta.
- **Um alarme em tela cheia** te acorda antes da sua parada, com o telefone bloqueado e no bolso.
- **Um link para compartilhar:** quem está esperando na rodoviária vê o ônibus se aproximar e a hora estimada de chegada.

## O passageiro como fonte de dados

A informação vem dos passageiros: cada telefone a bordo informa onde o ônibus está, com um token aleatório que dura uma única viagem e não pode ser vinculado a nada. O servidor guarda apenas o ponto sobre a rota, apaga as amostras em 24 horas e, com isso, calcula atrasos, velocidades típicas por quilômetro e histórico de plataformas. Esse tempo real também é exportado no formato GTFS-RT para qualquer terceiro usar.

> Se ninguém publica os dados, a gente os constrói entre quem viaja.

## Estamos construindo

Tudo o que veio antes não é uma ideia de catálogo: é o que estamos construindo na Numis. Chama-se **anden** e hoje são duas peças de software livre: um app Android, escrito em Kotlin, sem serviços do Google e pensado para compilações reproduzíveis de F-Droid, e um servidor backend escrito em Rust. O app é GPLv3; o servidor, AGPLv3.

As três perguntas do passageiro são também a especificação. Cada decisão de projeto responde uma: está atrasado? o atraso vem de quem viaja. Quando eu chego? o seu próprio telefone, que calcula durante a marcha. Você me acorda? um alarme exato que toca 20 minutos antes de chegar, esteja o ônibus atrasado ou não.

## A infraestrutura por trás

O app e o servidor conversam por uma **API REST**, que é o contrato entre os dois. Os endpoints de uso corrente:

- `GET /search` — encontra a viagem a partir dos cinco dados do bilhete (empresa, origem, destino, data e hora). O nome do passageiro nunca sai do telefone.
- `GET /trips/{id}/status` — atraso acumulado, última posição e plataforma do serviço.
- `GET /stops/{id}/board` — o painel de partidas de uma rodoviária, com plataforma estimada ou faixa de plataformas.
- `POST /reports` — o ônibus informa sua posição, de forma anônima e em lotes.
- `GET /gtfs-rt/...` — a exportação aberta do tempo real para terceiros.

Do lado do servidor, tudo vive em **PostgreSQL com PostGIS**: o horário, versionado para poder ser reimportado todos os dias; o estado ao vivo de cada serviço; e as estatísticas, como a velocidade típica de cada quilômetro de rota para cada hora do dia.

O uso normal, de ponta a ponta, se vê assim:

![Diagrama de sequência do caminho feliz: o passageiro escaneia o bilhete, o app consulta o servidor, o ônibus reporta sua posição anônima e o alarme toca antes da parada](/blog/anden-camino-feliz.pt.svg)

Cada amostra chega com verificações de plausibilidade —que não seja do futuro, que não supere uma velocidade impossível, que esteja perto da rota— e guarda apenas o ponto já projetado sobre ela. Uma viagem começa a contar como "a bordo" quando se moveu pelo menos 300 metros ao longo da rota, assim quem espera na parada não arrasta a posição do ônibus para trás. Quem está esperando esse serviço é avisado na hora, sem que o app precise perguntar.

## Estado atual e próximos passos

O app e o servidor funcionam e passam nos testes, mas ainda não foram provados em um telefone real na estrada: o OCR da câmera, a renderização do mapa, o consumo de bateria do GPS e os alarmes com o telefone dormindo são exatamente as coisas que precisam ser medidas a bordo de um ônibus. As plataformas são estimadas por enquanto só com histórico, porque ainda não há adaptadores dos painéis das rodoviárias; Rosario, que publica suas chegadas e partidas on-line, é a primeira candidata.

Todo o trabalho pode ser seguido no repositório GIT do anden: [git.taler.net/anden](https://git-www.taler.net/anden.git/)

## Embarque

Se você viaja de ônibus de longa distância, já sabe do que estamos falando: daquelas noites na rodoviária olhando uma passagem que diz "10 a 28", e daquelas sonecas de 300 quilômetros com um olho aberto por se já estarmos chegando.

O anden se constrói para essas viagens. Quando começar a prova na estrada, vamos procurar passageiros que queiram embarcar para prová-lo: [escreva para nós](/pt/contato) e vamos juntos na viagem.
