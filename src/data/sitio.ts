// Shared site data. Copy started from the design system templates
// (.claude/skills/numis-design/templates/pagina-institucional) and was then
// revised with Numis in the site copy review.
import type { DatoPie } from "../components/Pie.astro";

export const CORREO = "hola@numis.ar";

/**
 * Confirmed institutional data. The registered legal name, in full: footer,
 * /privacidad and the JSON-LD `legalName`.
 */
export const RAZON_SOCIAL = "Cooperativa de Trabajo Numis Limitada";
/** Short legal name, only where space is tight: ticket lines (/contacto, /nosotros). */
export const RAZON_SOCIAL_CORTA = "Coop. de Trabajo Numis Ltda.";
export const SEDE = "CABA, Argentina";
/** Ticket values go in lowercase (receipt ink). Used on /nosotros. */
export const FORMA = "cooperativa de trabajo";
export const TECNOLOGIA = "software libre";

export const mailto = (asunto?: string): string =>
  asunto ? `mailto:${CORREO}?subject=${encodeURIComponent(asunto)}` : `mailto:${CORREO}`;

/**
 * Institutional data listed in the footer of every page. The slogan is not a
 * column: Pie shows it under the logo.
 */
export const datosPie: DatoPie[] = [
  { concepto: "Razón social", valor: RAZON_SOCIAL },
  { concepto: "Sede", valor: SEDE },
  { concepto: "Contacto", valor: CORREO, href: mailto() },
];

/** The cooperative was registered in 2025. */
export const LEGAL = "© 2025 Numis. Hecho con software libre.";

/** Mission, one sentence for the whole site: the /nosotros "Misión" card. */
export const MISION = "Que cada persona controle, con software libre, las herramientas con las que maneja su dinero.";

/** The same mission as a full sentence, for the home "Por qué" section. */
export const MISION_FRASE = `Nuestra misión es ${MISION.charAt(0).toLowerCase()}${MISION.slice(1)}`;

/** Vision. Used in the home "Por qué" section and on /nosotros. */
export const VISION =
  "Las reglas son más justas cuando las pueden conocer y discutir quienes las usan. Para eso hay que poder ver cómo funcionan y proponer cambios. Si la vida cotidiana pasa por el software, ese software tiene que respetar la libertad de las personas.";

/** Team intro. Home team section and /nosotros. */
export const EQUIPO_BAJADA = "Las personas que hacen la cooperativa, cada una desde su especialidad.";

export interface Enlace {
  texto: string;
  href: string;
}

/** Blog listing, linked from the header and the footer while a note is published. */
export const enlaceBlog: Enlace = { texto: "Blog", href: "/blog" };

type ClaveNav = "proyectos" | "blog" | "nosotros" | "hacemos" | "como";

/** Every candidate header link. Root-relative anchors work from any page (on the home they just scroll). */
const ENLACES_NAV: Record<ClaveNav, Enlace> = {
  proyectos: { texto: "Proyectos", href: "/#proyectos" },
  blog: enlaceBlog,
  nosotros: { texto: "Nosotros", href: "/nosotros" },
  hacemos: { texto: "Qué hacemos", href: "/#hacemos" },
  como: { texto: "Cómo funciona", href: "/#como" },
};

/** The header has room for three links plus the primary button, no more. */
export const MAX_NAV = 3;

/**
 * Which links win a place, highest first. "Proyectos" and "Blog" only apply
 * while their collection has a published entry; the rest always apply. The
 * first MAX_NAV that apply are shown:
 * - nothing published: Qué hacemos, Cómo funciona, Nosotros
 * - projects only:     Proyectos, Qué hacemos, Nosotros
 * - notes only:        Blog, Qué hacemos, Nosotros
 * - both:              Proyectos, Blog, Nosotros
 */
export const PRIORIDAD_NAV: ClaveNav[] = ["proyectos", "blog", "nosotros", "hacemos", "como"];

/** Left-to-right order of the chosen links. Independent of priority, so the header keeps its layout. */
const ORDEN_NAV: ClaveNav[] = ["proyectos", "blog", "hacemos", "como", "nosotros"];

/**
 * Header links, rendered by src/layouts/Base.astro on every page. Base passes
 * whether a project and a note are published, so "Proyectos" and "Blog"
 * appear and disappear with their collections.
 */
export const navegacion = ({ hayProyectos, hayNotas }: { hayProyectos: boolean; hayNotas: boolean }): Enlace[] => {
  const aplica = (clave: ClaveNav) =>
    clave === "proyectos" ? hayProyectos : clave === "blog" ? hayNotas : true;
  const elegidas = PRIORIDAD_NAV.filter(aplica).slice(0, MAX_NAV);
  return ORDEN_NAV.filter((clave) => elegidas.includes(clave)).map((clave) => ENLACES_NAV[clave]);
};

/** Privacy page, linked from the footer (and from the contact form note, while the form is on). */
export const enlacePrivacidad: Enlace = { texto: "Privacidad", href: "/privacidad" };

/** Default primary button of the header. A page can override it through Base's `accion` prop. */
export const accionPrincipal: Enlace = { texto: "Escribinos", href: "/contacto" };

/**
 * Reasons of the contact form's "Motivo" select (src/components/FormularioContacto.astro).
 * The option text is also the subject of the email: "Consulta desde numis.ar: <texto>".
 * The doors' `motivo` must be one of these `valor`s.
 */
export const MOTIVOS = [
  { valor: "implementacion", texto: "Implementar pagos en mi organización" },
  { valor: "capacitacion", texto: "Capacitar a mi equipo" },
  { valor: "investigacion", texto: "Investigar con Numis" },
  { valor: "prensa", texto: "Consulta de prensa" },
  { valor: "colaborar", texto: "Colaborar o asociarme" },
  { valor: "otro", texto: "Otra consulta" },
] as const;

export type Motivo = (typeof MOTIVOS)[number]["valor"];

/** Subject prefix of every contact email, from the form or from a door. */
export const ASUNTO_CONSULTA = "Consulta desde numis.ar";

/** Subject for a reason: "Consulta desde numis.ar: Capacitar a mi equipo". */
export const asuntoConsulta = (motivo: Motivo): string =>
  `${ASUNTO_CONSULTA}: ${MOTIVOS.find((m) => m.valor === motivo)?.texto ?? ""}`;

/**
 * Contact doors, shared by the home closing section and the contact page. Each
 * door opens an email with its reason as the subject (see `enlacePuerta`).
 */
export const puertas: { titulo: string; texto: string; motivo: Motivo }[] = [
  {
    titulo: "Represento a una organización",
    texto: "Quiero implementar pagos con software libre.",
    motivo: "implementacion",
  },
  {
    titulo: "Busco capacitación",
    texto: "Para mi equipo, organización u organismo.",
    motivo: "capacitacion",
  },
  {
    titulo: "Quiero colaborar",
    texto: "Investigo, programo o trabajo en finanzas y me interesa sumarme.",
    motivo: "colaborar",
  },
];

/**
 * Link to the contact form with a reason preselected. Only valid while
 * FORMULARIO_ACTIVO is true (the #escribinos section exists only then).
 */
export const enlaceFormulario = (motivo: Motivo): string =>
  `/contacto?motivo=${encodeURIComponent(motivo)}#escribinos`;

/**
 * Contact form switch. The form is off until there is a backend: a mailto-only
 * form fails silently for people without a mail app. While it is off,
 * /contacto shows only the email route, its form section and scripts are not
 * built, and the doors are mailto links with a subject per door. The form
 * code stays in src/components/FormularioContacto.astro for when it returns;
 * turning it back on also means rewriting the form section of /privacidad.
 */
export const FORMULARIO_ACTIVO: boolean = false;

/**
 * Contact form endpoint. There is no backend yet, so this stays undefined and
 * the form (when FORMULARIO_ACTIVO) falls back to mailto:. Set it to the real
 * URL once the backend exists; do not point it at a made-up endpoint.
 */
export const ENDPOINT_FORMULARIO: string | undefined = undefined;

/** Where a contact door leads: the form with its reason, or an email with it as the subject. */
export const enlacePuerta = (motivo: Motivo): string =>
  FORMULARIO_ACTIVO ? enlaceFormulario(motivo) : mailto(asuntoConsulta(motivo));
