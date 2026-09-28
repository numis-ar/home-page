// Idiomas del sitio y todos los textos de interfaz.
//
// - `es` es el idioma por omisión y fuente de tipos: `en` y `pt` se chequean
//   contra su forma, así una clave que falte en una traducción es error de
//   TypeScript, no un hueco en la página.
// - Los contenidos de las colecciones (src/content/<coleccion>/<idioma>/),
//   las razones de contacto (`motivo`) y los nombres propios viven en sus
//   archivos; esto es solo la interfaz y las páginas estáticas.
// - Los textos largos con datos intercalados (correo, razón social) se armán
//   en la página con las piezas `...Antes` / `...Medio` / `...Despues`.
export const IDIOMAS = ["es", "en", "pt"] as const;
export type Idioma = (typeof IDIOMAS)[number];

/** Prefijo de ruta del idioma: "" para el idioma por omisión (es), "/en", "/pt". */
export const prefijo = (idioma: Idioma): string => (idioma === "es" ? "" : `/${idioma}`);

/** Una ruta relativa a la raíz en el idioma pedido: conLocale("en", "/blog") -> "/en/blog". */
export const conLocale = (idioma: Idioma, ruta: string): string => `${prefijo(idioma)}${ruta}`;

/** `Astro.url.pathname` de la página actual traducido a otro idioma. */
export const rutaEnIdioma = (pathname: string, idioma: Idioma): string => {
  const raiz = IDIOMAS.filter((i) => i !== "es").reduce(
    (ruta, i) => ruta.replace(new RegExp(`^/${i}(?=/|$)`), ""),
    pathname,
  );
  return conLocale(idioma, raiz === "" ? "/" : raiz);
};

/** Etiqueta de Intl para fechas, por idioma. */
export const etiquetaFecha: Record<Idioma, string> = { es: "es-AR", en: "en", pt: "pt-BR" };
/** Valor de og:locale, por idioma. */
export const etiquetaOG: Record<Idioma, string> = { es: "es_AR", en: "en_US", pt: "pt_BR" };
/** Cómo se nombra cada idioma a sí mismo, para el selector de idioma. */
export const nombreIdioma: Record<Idioma, string> = { es: "Español", en: "English", pt: "Português" };

const es = {
  cabecera: {
    navAria: "Principal",
    logoAlt: "Numis, inicio",
  },
  pie: {
    lema: "finanzas para todas las personas",
    legal: "© 2025 Numis. Hecho con software libre.",
    idiomasAria: "Idioma",
    privacidad: "Privacidad",
    datos: { razonSocial: "Razón social", sede: "Sede", contacto: "Contacto" },
  },
  nav: {
    proyectos: "Proyectos",
    blog: "Blog",
    nosotros: "Nosotros",
    hacemos: "Qué hacemos",
    como: "Cómo funciona",
  },
  accion: { escribinos: "Escribinos" },
  inicio: {
    titulo: "Numis · Pagos con software libre",
    descripcion:
      "Numis es una cooperativa de trabajo de Buenos Aires. Diseñamos e implementamos pagos con software libre: reglas a la vista y código que cualquiera puede revisar.",
    h1: "Pagos con reglas que se pueden ver.",
    ctaProyecto: "Contanos tu proyecto",
    ctaComo: "Ver cómo funciona",
    impresoraResumen:
      "Ticket del sistema de pagos actual: comisión en cada venta, compras registradas, reglas que no se ven y código cerrado. Total: lo pagás vos.",
    ticketActual: {
      encabezado: "Sistema de pagos",
      bajada: "hoy, como siempre",
      comision: "Comisión",
      enCadaVenta: "en cada venta",
      compras: "Tus compras",
      registradas: "registradas",
      reglas: "Las reglas",
      noSeVen: "no se ven",
      codigo: "El código",
      cerrado: "cerrado",
      total: "lo pagás vos",
      pie: "Conserve este ticket.<br />No va a cambiar solo.",
    },
    proyectosAria: "Proyectos en curso",
    otraCuenta: {
      encabezado: "Numis",
      bajada: "la otra cuenta",
      quienCompra: "Quien compra",
      protege: "protege sus datos",
      quienVende: "Quien vende",
      declara: "declara lo que cobra",
      software: "Software",
      libre: "libre y auditable",
      organizacion: "Organización",
      cooperativa: "cooperativa",
      total: "control propio",
    },
    porQueTitulo: "Otra forma de hacer las cuentas.",
    porQueTexto:
      "Usamos software libre. Quien compra paga como con efectivo, sin dar sus datos. Quien vende cobra de forma transparente y puede declarar cada cobro.",
    misionFrase: "Nuestra misión es que cada persona controle, con software libre, las herramientas con las que maneja su dinero.",
    vision:
      "Las reglas son más justas cuando las pueden conocer y discutir quienes las usan. Para eso hay que poder ver cómo funcionan y proponer cambios. Si la vida cotidiana pasa por el software, ese software tiene que respetar la libertad de las personas.",
    comoTitulo: "Cómo funciona un pago",
    pasos: [
      { titulo: "Quien compra carga su billetera", texto: "Pasa dinero de su cuenta a la billetera, como quien retira efectivo." },
      { titulo: "Paga en el comercio", texto: "Confirma el pago. Sus datos personales no viajan con el pago." },
      { titulo: "El comercio cobra", texto: "El dinero llega a la cuenta del comercio, listo para declarar." },
    ],
    paraQuienTitulo: "Con quién trabajamos",
    publicos: [
      {
        titulo: "Organizaciones sociales y cooperativas",
        texto: "Te acompañamos a cobrar y pagar con herramientas libres, que tu organización puede conocer y controlar.",
      },
      {
        titulo: "Sector público",
        texto: "Estudios e informes técnicos para diseñar políticas públicas de pagos con información propia.",
      },
      {
        titulo: "Bancos y empresas",
        texto: "Integramos pagos libres con los sistemas que ya usan, dentro del marco regulatorio vigente.",
      },
    ],
    hacemosTitulo: "Qué hacemos",
    obras: [
      { verbo: "Investigar.", nombre: "Investigación aplicada", texto: "Informes y estudios técnicos sobre medios de pago, políticas públicas y su impacto social." },
      { verbo: "Formar.", nombre: "Capacitación", texto: "Programas de formación técnica para organizaciones sociales, profesionales, organismos públicos y empresas." },
      { verbo: "Articular.", nombre: "Redes y diálogo", texto: "Participamos en mesas de diálogo y redes de la sociedad civil sobre medios de pago y software libre." },
      { verbo: "Implementar.", nombre: "Llave en mano", texto: "Nos ocupamos del proyecto completo, del diseño a la puesta en marcha, y seguimos su impacto social." },
      { verbo: "Integrar.", nombre: "A medida", texto: "Integramos pagos libres con los sistemas que ya existen." },
    ],
    equipoTitulo: "Equipo",
    equipoBajada: "Las personas que hacen la cooperativa, cada una desde su especialidad.",
    equipoBoton: "Conocer al equipo",
    equipoTicketEncabezado: "Equipo Numis",
    cierreTitulo: "Elegí por dónde entrar.",
    cierreTexto: "Implementar pagos, capacitar a tu equipo o sumarte a la cooperativa: contanos tu caso y te respondemos.",
  },
  nosotros: {
    titulo: "Nosotros · Numis",
    descripcion:
      "Quiénes somos, para qué existimos y quiénes hacemos Numis, la cooperativa de trabajo que diseña e implementa pagos con software libre.",
    h1: "Somos una cooperativa de trabajo.",
    lead: "Diseñamos e implementamos pagos con software libre. Trabajamos entre sectores: organizaciones sociales, sector público, bancos y empresas. Investigamos, formamos e integramos para que las reglas de los pagos se puedan ver.",
    ticket: {
      encabezado: "Numis",
      bajada: "quiénes somos",
      razonSocial: "Razón social",
      sede: "Sede",
      tecnologia: "Tecnología",
      forma: "Forma",
    },
    misionTitulo: "Para qué existimos",
    misionCardTitulo: "Misión",
    mision: "Que cada persona controle, con software libre, las herramientas con las que maneja su dinero.",
    visionTitulo: "Visión",
    equipoTitulo: "Equipo",
    fotoDe: "Foto de",
  },
  contacto: {
    titulo: "Contacto · Numis",
    lead: "Contanos qué necesitás: implementar pagos, capacitar a tu equipo, investigar con nosotros o sumarte a la cooperativa.",
    descripcionSufijo: "Te respondemos por correo.",
    h1: "Hablemos.",
    botonCorreo: "Escribir a {correo}",
    botonFormulario: "Escribir un mensaje",
    ticket: {
      encabezado: "Datos de contacto",
      bajada: "numis.ar",
      razonSocial: "Razón social",
      sede: "Sede",
      correo: "Correo",
    },
    motivosTitulo: "¿Cuál es tu caso?",
    puertas: [
      { titulo: "Represento a una organización", texto: "Quiero implementar pagos con software libre.", motivo: "implementacion" as const },
      { titulo: "Busco capacitación", texto: "Para mi equipo, organización u organismo.", motivo: "capacitacion" as const },
      { titulo: "Quiero colaborar", texto: "Investigo, programo o trabajo en finanzas y me interesa sumarme.", motivo: "colaborar" as const },
    ],
  },
  correo: {
    asuntoConsulta: "Consulta desde numis.ar",
    motivos: {
      implementacion: "Implementar pagos en mi organización",
      capacitacion: "Capacitar a mi equipo",
      investigacion: "Investigar con Numis",
      prensa: "Consulta de prensa",
      colaborar: "Colaborar o asociarme",
      otro: "Otra consulta",
    },
    datosPersonales: "Datos personales",
  },
  formulario: {
    titulo: "Escribinos",
    bajada: "Decinos quién sos y qué necesitás. Te respondemos al correo que dejes.",
    nombre: "Nombre",
    nombrePlaceholder: "Cómo te llamás",
    correo: "Correo",
    organizacion: "Organización",
    organizacionPlaceholder: "Organización, empresa u organismo",
    motivo: "Motivo",
    motivoPlaceholder: "Elegí un motivo",
    mensaje: "Mensaje",
    mensajePlaceholder: "Qué necesitás y para cuándo.",
    mensajeAyuda: "Un par de oraciones alcanzan.",
    opcional: "opcional",
    enviarCorreo: "Preparar el correo",
    enviar: "Enviar mi mensaje",
    notaCorreo: "Se abre tu programa de correo con el mensaje armado. ",
    notaDirecto: "O escribinos directo a ",
    notaPrivacidad: "Leé cómo tratamos tus datos",
    script: { nombre: "Nombre", correo: "Correo", organizacion: "Organización" },
  },
  privacidad: {
    titulo: "Privacidad · Numis",
    lead: "Qué datos recibimos cuando usás este sitio, para qué los usamos y cómo pedir que los corrijamos o borremos.",
    descripcionSufijo: "Sin cookies ni herramientas de analítica.",
    h1: "Qué hacemos con tus datos.",
    actualizado: "Última actualización: 11 de septiembre de 2026.",
    responsableTitulo: "Quién es responsable",
    responsableAntes: "El responsable de tus datos es ",
    responsablePendiente: "falta el domicilio legal",
    responsableMedio: ", Ciudad Autónoma de Buenos Aires. Para cualquier consulta sobre tus datos, escribinos a ",
    responsableDespues: ".",
    escribisTitulo: "Cuando nos escribís",
    escribisTexto1Antes: "Este sitio no tiene formulario de contacto: no guarda nada de lo que escribís. La única forma de contactarnos es por correo, a ",
    escribisTexto1Despues: ".",
    escribisTexto2:
      "Si nos escribís, usamos tu nombre, tu correo y lo que nos cuentes solo para responderte. No los compartimos ni los vendemos, y los guardamos solo mientras hagan falta para responderte.",
    cookiesTitulo: "Cookies y seguimiento",
    cookiesTexto1:
      "Este sitio no usa cookies ni herramientas de analítica ni rastreadores. La tipografía y los logos se sirven desde este mismo sitio: las páginas públicas no cargan nada de otros sitios.",
    cookiesTexto2:
      "Como cualquier sitio web, el servidor que lo aloja puede registrar datos técnicos de cada visita, como la dirección IP y la fecha. No usamos esos registros para identificarte.",
    derechosTitulo: "Tus derechos",
    derechosTexto1Antes:
      "La Ley 25.326 de Protección de Datos Personales te da derecho a acceder a tus datos, rectificarlos, actualizarlos y pedir que los borremos. Para hacerlo, escribinos a ",
    derechosTexto1Despues: ".",
    derechosTexto2: "El acceso es gratuito cada seis meses, o antes si acreditás un interés legítimo (artículo 14, inciso 3 de la ley).",
    derechosTexto3:
      "La autoridad de control es la Agencia de Acceso a la Información Pública (AAIP). Si creés que no respetamos tus derechos, podés hacer tu reclamo ante la AAIP.",
    derechosTexto4:
      "La Agencia de Acceso a la Información Pública, en su carácter de órgano de control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.",
  },
  noEncontrada: {
    titulo: "Página no encontrada · Numis",
    descripcion: "Esta página no existe. Puede que la dirección haya cambiado.",
    h1: "Esta página no existe.",
    lead: "Puede que la dirección haya cambiado.",
    volver: "Volver al inicio",
  },
  proyectos: {
    pagina: {
      tituloSeccion: "Proyectos",
      volver: "Volver a los proyectos",
      fichaEncabezado: "Ficha del proyecto",
      fichaBajada: "Numis, cooperativa de trabajo",
      contraparte: "Contraparte",
      tipo: "Tipo",
      desde: "Desde",
      estado: "Estado",
      faltaDescripcion: "falta la descripción del proyecto",
      faltaTexto: "falta el texto del proyecto",
    },
    carrusel: {
      titulo: "Proyectos en curso",
      anterior: "Anterior",
      siguiente: "Siguiente",
      ariaAnterior: "Proyecto anterior",
      ariaSiguiente: "Proyecto siguiente",
      uno: "proyecto",
      otros: "proyectos",
    },
    tarjeta: {
      faltaLogo: "falta el logo",
      faltaDescripcion: "falta la descripción",
      ver: "Ver el proyecto",
    },
  },
  blog: {
    paginaTitulo: "Blog · Numis",
    titulo: "Blog de Numis",
    bajada: "Notas escritas por quienes hacemos la cooperativa.",
    descripcion: "Notas escritas por quienes hacemos Numis, una cooperativa de trabajo que diseña e implementa pagos con software libre.",
    vacio: "Todavía no publicamos notas.",
    borrador: "Borrador",
    actualizadaEl: "Actualizada el",
    volver: "Ver todas las notas",
    por: "Por",
    unir: "y",
    leerEn: "Leer en",
    ariaLista: "Notas publicadas",
    ariaNota: "Texto de la nota {titulo}",
  },
  ticket: { total: "Total" },
  pendiente: "a completar",
};

export type Textos = typeof es;

export const ui: Record<Idioma, Textos> = {
  es,
  en: {
    cabecera: { navAria: "Main", logoAlt: "Numis, home" },
    pie: {
      lema: "finance for everyone",
      legal: "© 2025 Numis. Built with free software.",
      idiomasAria: "Language",
      privacidad: "Privacy",
      datos: { razonSocial: "Legal name", sede: "Headquarters", contacto: "Contact" },
    },
    nav: { proyectos: "Projects", blog: "Blog", nosotros: "About us", hacemos: "What we do", como: "How it works" },
    accion: { escribinos: "Write to us" },
    inicio: {
      titulo: "Numis · Payments with free software",
      descripcion:
        "Numis is a worker cooperative from Buenos Aires. We design and implement payments with free software: rules you can see and code anyone can review.",
      h1: "Payments with rules you can see.",
      ctaProyecto: "Tell us about your project",
      ctaComo: "See how it works",
      impresoraResumen:
        "Receipt from today's payment system: a fee on every sale, purchases on record, rules you cannot see and closed code. Total: you pay for it.",
      ticketActual: {
        encabezado: "Payment system",
        bajada: "today, as always",
        comision: "Fee",
        enCadaVenta: "on every sale",
        compras: "Your purchases",
        registradas: "on record",
        reglas: "The rules",
        noSeVen: "you cannot see",
        codigo: "The code",
        cerrado: "closed",
        total: "you pay for it",
        pie: "Keep this receipt.<br />It will not change on its own.",
      },
      proyectosAria: "Ongoing projects",
      otraCuenta: {
        encabezado: "Numis",
        bajada: "the other account",
        quienCompra: "Who buys",
        protege: "keeps their data private",
        quienVende: "Who sells",
        declara: "declares what they earn",
        software: "Software",
        libre: "free and auditable",
        organizacion: "Organization",
        cooperativa: "a cooperative",
        total: "control of your own",
      },
      porQueTitulo: "A different way to do the math.",
      porQueTexto:
        "We use free software. Who buys pays as with cash, without giving away their data. Who sells gets paid transparently and can declare every payment.",
      misionFrase:
        "Our mission is for every person to control, with free software, the tools they use to handle their money.",
      vision:
        "Rules are fairer when the people who use them can know them and discuss them. For that, we need to be able to see how they work and propose changes. If daily life runs through software, that software must respect people's freedom.",
      comoTitulo: "How a payment works",
      pasos: [
        { titulo: "Who buys loads their wallet", texto: "They move money from their account to the wallet, like withdrawing cash." },
        { titulo: "Pays at the shop", texto: "They confirm the payment. Their personal data does not travel with it." },
        { titulo: "The shop gets paid", texto: "The money reaches the shop's account, ready to declare." },
      ],
      paraQuienTitulo: "Who we work with",
      publicos: [
        {
          titulo: "Social organizations and cooperatives",
          texto: "We accompany you to receive and pay with free tools that your organization can know and control.",
        },
        {
          titulo: "Public sector",
          texto: "Technical studies and reports to design public payment policies with information of your own.",
        },
        {
          titulo: "Banks and companies",
          texto: "We integrate free payments with the systems you already use, within the current regulatory framework.",
        },
      ],
      hacemosTitulo: "What we do",
      obras: [
        { verbo: "Research.", nombre: "Applied research", texto: "Technical reports and studies on payment methods, public policy and their social impact." },
        { verbo: "Train.", nombre: "Training", texto: "Technical training programs for social organizations, professionals, public bodies and companies." },
        { verbo: "Connect.", nombre: "Networks and dialogue", texto: "We take part in dialogue tables and civil-society networks on payments and free software." },
        { verbo: "Implement.", nombre: "Turnkey", texto: "We take care of the whole project, from design to launch, and follow its social impact." },
        { verbo: "Integrate.", nombre: "Custom", texto: "We integrate free payments with the systems that already exist." },
      ],
      equipoTitulo: "Team",
      equipoBajada: "The people who make the cooperative, each from their own specialty.",
      equipoBoton: "Meet the team",
      equipoTicketEncabezado: "Numis team",
      cierreTitulo: "Choose where to come in.",
      cierreTexto:
        "Implementing payments, training your team or joining the cooperative: tell us your case and we will write back.",
    },
    nosotros: {
      titulo: "About us · Numis",
      descripcion:
        "Who we are, why we exist and who makes Numis, the worker cooperative that designs and implements payments with free software.",
      h1: "We are a worker cooperative.",
      lead: "We design and implement payments with free software. We work across sectors: social organizations, the public sector, banks and companies. We research, train and integrate so that the rules of payments can be seen.",
      ticket: {
        encabezado: "Numis",
        bajada: "who we are",
        razonSocial: "Legal name",
        sede: "Headquarters",
        tecnologia: "Technology",
        forma: "Form",
      },
      misionTitulo: "Why we exist",
      misionCardTitulo: "Mission",
      mision: "For every person to control, with free software, the tools they use to handle their money.",
      visionTitulo: "Vision",
      equipoTitulo: "Team",
      fotoDe: "Photo of",
    },
    contacto: {
      titulo: "Contact · Numis",
      lead: "Tell us what you need: implementing payments, training your team, researching with us or joining the cooperative.",
      descripcionSufijo: "We reply by email.",
      h1: "Let's talk.",
      botonCorreo: "Write to {correo}",
      botonFormulario: "Write a message",
      ticket: {
        encabezado: "Contact details",
        bajada: "numis.ar",
        razonSocial: "Legal name",
        sede: "Headquarters",
        correo: "Email",
      },
      motivosTitulo: "What's your case?",
      puertas: [
        { titulo: "I represent an organization", texto: "I want to implement payments with free software.", motivo: "implementacion" as const },
        { titulo: "I'm looking for training", texto: "For my team, organization or public body.", motivo: "capacitacion" as const },
        { titulo: "I want to collaborate", texto: "I research, code or work in finance and I'd like to join.", motivo: "colaborar" as const },
      ],
    },
    correo: {
      asuntoConsulta: "Message from numis.ar",
      motivos: {
        implementacion: "Implement payments in my organization",
        capacitacion: "Train my team",
        investigacion: "Research with Numis",
        prensa: "Press inquiry",
        colaborar: "Collaborate or join",
        otro: "Other inquiry",
      },
      datosPersonales: "Personal data",
    },
    formulario: {
      titulo: "Write to us",
      bajada: "Tell us who you are and what you need. We reply to the email you leave.",
      nombre: "Name",
      nombrePlaceholder: "What's your name",
      correo: "Email",
      organizacion: "Organization",
      organizacionPlaceholder: "Organization, company or public body",
      motivo: "Reason",
      motivoPlaceholder: "Choose a reason",
      mensaje: "Message",
      mensajePlaceholder: "What you need and for when.",
      mensajeAyuda: "A couple of sentences are enough.",
      opcional: "optional",
      enviarCorreo: "Prepare the email",
      enviar: "Send my message",
      notaCorreo: "Your mail app opens with the message ready. ",
      notaDirecto: "Or write to us directly at ",
      notaPrivacidad: "Read how we handle your data",
      script: { nombre: "Name", correo: "Email", organizacion: "Organization" },
    },
    privacidad: {
      titulo: "Privacy · Numis",
      lead: "What data we receive when you use this site, what we use it for and how to ask us to correct or delete it.",
      descripcionSufijo: "No cookies or analytics tools.",
      h1: "What we do with your data.",
      actualizado: "Last updated: September 11, 2026.",
      responsableTitulo: "Who is responsible",
      responsableAntes: "The controller of your data is ",
      responsablePendiente: "legal address pending",
      responsableMedio: ", Ciudad Autónoma de Buenos Aires. For any question about your data, write to us at ",
      responsableDespues: ".",
      escribisTitulo: "When you write to us",
      escribisTexto1Antes:
        "This site has no contact form: it stores nothing of what you write. The only way to reach us is by email, at ",
      escribisTexto1Despues: ".",
      escribisTexto2:
        "If you write to us, we use your name, your email and what you tell us only to reply. We do not share or sell them, and we keep them only as long as needed to reply.",
      cookiesTitulo: "Cookies and tracking",
      cookiesTexto1:
        "This site uses no cookies, analytics or trackers. Fonts and logos are served from this very site: public pages load nothing from other sites.",
      cookiesTexto2:
        "Like any website, the server that hosts it may log technical data of each visit, such as the IP address and the date. We do not use those logs to identify you.",
      derechosTitulo: "Your rights",
      derechosTexto1Antes:
        "Law 25.326 on Personal Data Protection gives you the right to access your data, correct it, update it and ask us to delete it. To do so, write to us at ",
      derechosTexto1Despues: ".",
      derechosTexto2:
        "Access is free of charge every six months, or earlier if you prove a legitimate interest (article 14, paragraph 3 of the law).",
      derechosTexto3:
        "The supervisory authority is the Agencia de Acceso a la Información Pública (AAIP). If you think we have not respected your rights, you can file a complaint with the AAIP.",
      derechosTexto4:
        "The Agencia de Acceso a la Información Pública, as the control body of Law 25.326, has the attribution of attending the complaints and claims filed by those whose rights are affected by the breach of the rules in force on personal data protection.",
    },
    noEncontrada: {
      titulo: "Page not found · Numis",
      descripcion: "This page does not exist. The address may have changed.",
      h1: "This page does not exist.",
      lead: "The address may have changed.",
      volver: "Back to home",
    },
    proyectos: {
      pagina: {
        tituloSeccion: "Projects",
        volver: "Back to projects",
        fichaEncabezado: "Project sheet",
        fichaBajada: "Numis, worker cooperative",
        contraparte: "Counterpart",
        tipo: "Type",
        desde: "Since",
        estado: "Status",
        faltaDescripcion: "project description missing",
        faltaTexto: "project text missing",
      },
      carrusel: {
        titulo: "Ongoing projects",
        anterior: "Previous",
        siguiente: "Next",
        ariaAnterior: "Previous project",
        ariaSiguiente: "Next project",
        uno: "project",
        otros: "projects",
      },
      tarjeta: {
        faltaLogo: "logo missing",
        faltaDescripcion: "description missing",
        ver: "View project",
      },
    },
    blog: {
      paginaTitulo: "Blog · Numis",
      titulo: "Numis blog",
      bajada: "Notes written by the people who make the cooperative.",
      descripcion:
        "Notes written by the people who make Numis, a worker cooperative that designs and implements payments with free software.",
      vacio: "No notes published yet.",
      borrador: "Draft",
      actualizadaEl: "Updated",
      volver: "See all notes",
      por: "By",
      unir: "and",
      leerEn: "Read in",
      ariaLista: "Published notes",
      ariaNota: "Text of the note {titulo}",
    },
    ticket: { total: "Total" },
    pendiente: "to be filled in",
  },
  pt: {
    cabecera: { navAria: "Principal", logoAlt: "Numis, início" },
    pie: {
      lema: "finanças para todas as pessoas",
      legal: "© 2025 Numis. Feito com software livre.",
      idiomasAria: "Idioma",
      privacidad: "Privacidade",
      datos: { razonSocial: "Razão social", sede: "Sede", contacto: "Contato" },
    },
    nav: { proyectos: "Projetos", blog: "Blog", nosotros: "Sobre nós", hacemos: "O que fazemos", como: "Como funciona" },
    accion: { escribinos: "Fale conosco" },
    inicio: {
      titulo: "Numis · Pagamentos com software livre",
      descripcion:
        "Numis é uma cooperativa de trabalho de Buenos Aires. Projetamos e implementamos pagamentos com software livre: regras à vista e código que todos podem revisar.",
      h1: "Pagamentos com regras que se podem ver.",
      ctaProyecto: "Conte-nos o seu projeto",
      ctaComo: "Veja como funciona",
      impresoraResumen:
        "Comprovante do sistema de pagamentos atual: taxa em cada venda, compras registradas, regras que não se veem e código fechado. Total: você paga.",
      ticketActual: {
        encabezado: "Sistema de pagamentos",
        bajada: "hoje, como sempre",
        comision: "Taxa",
        enCadaVenta: "em cada venda",
        compras: "Suas compras",
        registradas: "registradas",
        reglas: "As regras",
        noSeVen: "não se veem",
        codigo: "O código",
        cerrado: "fechado",
        total: "você paga",
        pie: "Guarde este comprovante.<br />Ele não vai mudar sozinho.",
      },
      proyectosAria: "Projetos em andamento",
      otraCuenta: {
        encabezado: "Numis",
        bajada: "a outra conta",
        quienCompra: "Quem compra",
        protege: "protege seus dados",
        quienVende: "Quem vende",
        declara: "declara o que recebe",
        software: "Software",
        libre: "livre e auditável",
        organizacion: "Organização",
        cooperativa: "cooperativa",
        total: "controle próprio",
      },
      porQueTitulo: "Outra forma de fazer as contas.",
      porQueTexto:
        "Usamos software livre. Quem compra paga como em dinheiro, sem dar seus dados. Quem vende recebe de forma transparente e pode declarar cada recebimento.",
      misionFrase:
        "Nossa missão é que cada pessoa controle, com software livre, as ferramentas com que administra seu dinheiro.",
      vision:
        "As regras são mais justas quando quem as usa pode conhecê-las e discuti-las. Para isso, é preciso poder ver como funcionam e propor mudanças. Se a vida cotidiana passa pelo software, esse software tem que respeitar a liberdade das pessoas.",
      comoTitulo: "Como funciona um pagamento",
      pasos: [
        { titulo: "Quem compra carrega a carteira", texto: "Passa dinheiro da sua conta para a carteira, como quem saca dinheiro." },
        { titulo: "Paga no comércio", texto: "Confirma o pagamento. Seus dados pessoais não viajam com o pagamento." },
        { titulo: "O comércio recebe", texto: "O dinheiro chega à conta do comércio, pronto para declarar." },
      ],
      paraQuienTitulo: "Com quem trabalhamos",
      publicos: [
        {
          titulo: "Organizações sociais e cooperativas",
          texto: "Acompanhamos você para receber e pagar com ferramentas livres, que sua organização pode conhecer e controlar.",
        },
        {
          titulo: "Setor público",
          texto: "Estudos e relatórios técnicos para desenhar políticas públicas de pagamentos com informação própria.",
        },
        {
          titulo: "Bancos e empresas",
          texto: "Integramos pagamentos livres aos sistemas que vocês já usam, dentro do marco regulatório vigente.",
        },
      ],
      hacemosTitulo: "O que fazemos",
      obras: [
        { verbo: "Pesquisar.", nombre: "Pesquisa aplicada", texto: "Relatórios e estudos técnicos sobre meios de pagamento, políticas públicas e seu impacto social." },
        { verbo: "Formar.", nombre: "Capacitação", texto: "Programas de formação técnica para organizações sociais, profissionais, organismos públicos e empresas." },
        { verbo: "Articular.", nombre: "Redes e diálogo", texto: "Participamos de mesas de diálogo e redes da sociedade civil sobre meios de pagamento e software livre." },
        { verbo: "Implementar.", nombre: "Chave na mão", texto: "Cuidamos do projeto completo, do desenho à implantação, e acompanhamos seu impacto social." },
        { verbo: "Integrar.", nombre: "Sob medida", texto: "Integramos pagamentos livres com os sistemas que já existem." },
      ],
      equipoTitulo: "Equipe",
      equipoBajada: "As pessoas que fazem a cooperativa, cada uma desde sua especialidade.",
      equipoBoton: "Conhecer a equipe",
      equipoTicketEncabezado: "Equipe Numis",
      cierreTitulo: "Escolha por onde entrar.",
      cierreTexto:
        "Implementar pagamentos, capacitar sua equipe ou somar-se à cooperativa: conte-nos o seu caso e nós respondemos.",
    },
    nosotros: {
      titulo: "Sobre nós · Numis",
      descripcion:
        "Quem somos, para que existimos e quem faz a Numis, a cooperativa de trabalho que projeta e implementa pagamentos com software livre.",
      h1: "Somos uma cooperativa de trabalho.",
      lead: "Projetamos e implementamos pagamentos com software livre. Trabalhamos entre setores: organizações sociais, setor público, bancos e empresas. Pesquisamos, formamos e integramos para que as regras dos pagamentos se possam ver.",
      ticket: {
        encabezado: "Numis",
        bajada: "quem somos",
        razonSocial: "Razão social",
        sede: "Sede",
        tecnologia: "Tecnologia",
        forma: "Forma",
      },
      misionTitulo: "Para que existimos",
      misionCardTitulo: "Missão",
      mision: "Que cada pessoa controle, com software livre, as ferramentas com que administra seu dinheiro.",
      visionTitulo: "Visão",
      equipoTitulo: "Equipe",
      fotoDe: "Foto de",
    },
    contacto: {
      titulo: "Contato · Numis",
      lead: "Conte-nos o que você precisa: implementar pagamentos, capacitar sua equipe, pesquisar conosco ou somar-se à cooperativa.",
      descripcionSufijo: "Respondemos por e-mail.",
      h1: "Vamos conversar.",
      botonCorreo: "Escrever para {correo}",
      botonFormulario: "Escrever uma mensagem",
      ticket: {
        encabezado: "Dados de contato",
        bajada: "numis.ar",
        razonSocial: "Razão social",
        sede: "Sede",
        correo: "E-mail",
      },
      motivosTitulo: "Qual é o seu caso?",
      puertas: [
        { titulo: "Represento uma organização", texto: "Quero implementar pagamentos com software livre.", motivo: "implementacion" as const },
        { titulo: "Busco capacitação", texto: "Para minha equipe, organização ou órgão público.", motivo: "capacitacion" as const },
        { titulo: "Quero colaborar", texto: "Pesquiso, programo ou trabalho em finanças e quero me juntar.", motivo: "colaborar" as const },
      ],
    },
    correo: {
      asuntoConsulta: "Mensagem de numis.ar",
      motivos: {
        implementacion: "Implementar pagamentos na minha organização",
        capacitacion: "Capacitar minha equipe",
        investigacion: "Pesquisar com a Numis",
        prensa: "Consulta de imprensa",
        colaborar: "Colaborar ou associar-me",
        otro: "Outra consulta",
      },
      datosPersonales: "Dados pessoais",
    },
    formulario: {
      titulo: "Fale conosco",
      bajada: "Diga-nos quem você é e o que precisa. Respondemos ao e-mail que você deixar.",
      nombre: "Nome",
      nombrePlaceholder: "Como você se chama",
      correo: "E-mail",
      organizacion: "Organização",
      organizacionPlaceholder: "Organização, empresa ou órgão público",
      motivo: "Motivo",
      motivoPlaceholder: "Escolha um motivo",
      mensaje: "Mensagem",
      mensajePlaceholder: "O que você precisa e para quando.",
      mensajeAyuda: "Duas frases bastam.",
      opcional: "opcional",
      enviarCorreo: "Preparar o e-mail",
      enviar: "Enviar minha mensagem",
      notaCorreo: "Seu programa de e-mail abre com a mensagem pronta. ",
      notaDirecto: "Ou escreva direto para ",
      notaPrivacidad: "Leia como tratamos seus dados",
      script: { nombre: "Nome", correo: "E-mail", organizacion: "Organização" },
    },
    privacidad: {
      titulo: "Privacidade · Numis",
      lead: "Que dados recebemos quando você usa este site, para que os usamos e como pedir que os corrijamos ou apaguemos.",
      descripcionSufijo: "Sem cookies nem ferramentas de análise.",
      h1: "O que fazemos com seus dados.",
      actualizado: "Última atualização: 11 de setembro de 2026.",
      responsableTitulo: "Quem é responsável",
      responsableAntes: "O responsável pelos seus dados é ",
      responsablePendiente: "falta o endereço legal",
      responsableMedio: ", Ciudad Autónoma de Buenos Aires. Para qualquer dúvida sobre seus dados, escreva para nós em ",
      responsableDespues: ".",
      escribisTitulo: "Quando você nos escreve",
      escribisTexto1Antes:
        "Este site não tem formulário de contato: não guarda nada do que você escreve. A única forma de contato é por e-mail, em ",
      escribisTexto1Despues: ".",
      escribisTexto2:
        "Se você nos escrever, usamos seu nome, seu e-mail e o que você nos contar apenas para responder. Não compartilhamos nem vendemos, e guardamos apenas enquanto forem necessários para responder.",
      cookiesTitulo: "Cookies e rastreamento",
      cookiesTexto1:
        "Este site não usa cookies nem ferramentas de análise nem rastreadores. A tipografia e os logos são servidos a partir deste mesmo site: as páginas públicas não carregam nada de outros sites.",
      cookiesTexto2:
        "Como qualquer site, o servidor que o hospeda pode registrar dados técnicos de cada visita, como o endereço IP e a data. Não usamos esses registros para identificá-lo.",
      derechosTitulo: "Seus direitos",
      derechosTexto1Antes:
        "A Lei 25.326 de Proteção de Dados Pessoais lhe dá o direito de acessar seus dados, retificá-los, atualizá-los e pedir que os apaguemos. Para isso, escreva para nós em ",
      derechosTexto1Despues: ".",
      derechosTexto2:
        "O acesso é gratuito a cada seis meses, ou antes se você acreditar um interesse legítimo (artigo 14, parágrafo 3 da lei).",
      derechosTexto3:
        "A autoridade de controle é a Agencia de Acceso a la Información Pública (AAIP). Se você acreditar que não respeitamos seus direitos, pode apresentar sua reclamação perante a AAIP.",
      derechosTexto4:
        "A Agencia de Acceso a la Información Pública, em seu caráter de órgão de controle da Lei 25.326, tem a atribuição de atender as denúncias e reclamações que apresentem os titulares afetados em seus direitos pelo descumprimento das normas vigentes em matéria de proteção de dados pessoais.",
    },
    noEncontrada: {
      titulo: "Página não encontrada · Numis",
      descripcion: "Esta página não existe. O endereço pode ter mudado.",
      h1: "Esta página não existe.",
      lead: "O endereço pode ter mudado.",
      volver: "Voltar ao início",
    },
    proyectos: {
      pagina: {
        tituloSeccion: "Projetos",
        volver: "Voltar aos projetos",
        fichaEncabezado: "Ficha do projeto",
        fichaBajada: "Numis, cooperativa de trabalho",
        contraparte: "Contraparte",
        tipo: "Tipo",
        desde: "Desde",
        estado: "Estado",
        faltaDescripcion: "falta a descrição do projeto",
        faltaTexto: "falta o texto do projeto",
      },
      carrusel: {
        titulo: "Projetos em andamento",
        anterior: "Anterior",
        siguiente: "Próximo",
        ariaAnterior: "Projeto anterior",
        ariaSiguiente: "Próximo projeto",
        uno: "projeto",
        otros: "projetos",
      },
      tarjeta: {
        faltaLogo: "falta o logo",
        faltaDescripcion: "falta a descrição",
        ver: "Ver o projeto",
      },
    },
    blog: {
      paginaTitulo: "Blog · Numis",
      titulo: "Blog da Numis",
      bajada: "Notas escritas por quem faz a cooperativa.",
      descripcion:
        "Notas escritas por quem faz a Numis, uma cooperativa de trabalho que projeta e implementa pagamentos com software livre.",
      vacio: "Ainda não publicamos notas.",
      borrador: "Rascunho",
      actualizadaEl: "Atualizada em",
      volver: "Ver todas as notas",
      por: "Por",
      unir: "e",
      leerEn: "Ler em",
      ariaLista: "Notas publicadas",
      ariaNota: "Texto da nota {titulo}",
    },
    ticket: { total: "Total" },
    pendiente: "a completar",
  },
};

/** Todos los textos de un idioma. */
export const t = (idioma: Idioma): Textos => ui[idioma];
