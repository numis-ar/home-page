// Shared site data. Copy started from the design system templates
// (.claude/skills/numis-design/templates/pagina-institucional) and was then
// revised with Numis in the site copy review.
//
// What does not translate lives here (legal names, email, switches, the
// stable `motivo` keys). Everything that renders text takes an `idioma` and
// reads it from src/data/i18n.ts, so each language is a complete site.
import type { DatoPie } from "../components/Pie.astro";
import { conLocale, t, type Idioma } from "./i18n";

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
export const FORMA: Record<Idioma, string> = {
  es: "cooperativa de trabajo",
  en: "worker cooperative",
  pt: "cooperativa de trabalho",
};
export const TECNOLOGIA: Record<Idioma, string> = {
  es: "software libre",
  en: "free software",
  pt: "software livre",
};

export const mailto = (asunto?: string): string =>
  asunto ? `mailto:${CORREO}?subject=${encodeURIComponent(asunto)}` : `mailto:${CORREO}`;

/**
 * Institutional data listed in the footer of every page. The concepts
 * translate, the values are the same facts in every language.
 */
export const datosPie = (idioma: Idioma): DatoPie[] => {
  const txt = t(idioma).pie.datos;
  return [
    { concepto: txt.razonSocial, valor: RAZON_SOCIAL },
    { concepto: txt.sede, valor: SEDE },
    { concepto: txt.contacto, valor: CORREO, href: mailto() },
  ];
};

/** Blog listing of the given language, linked from the header and the footer while it has a published note. */
export const enlaceBlog = (idioma: Idioma): Enlace => ({
  texto: t(idioma).nav.blog,
  href: conLocale(idioma, "/blog"),
});

type ClaveNav = "proyectos" | "blog" | "nosotros" | "hacemos" | "como";

export interface Enlace {
  texto: string;
  href: string;
}

/** Every candidate header link, in the given language. Root-relative anchors work from any page (on the home they just scroll). */
const enlacesNav = (idioma: Idioma): Record<ClaveNav, Enlace> => ({
  proyectos: { texto: t(idioma).nav.proyectos, href: conLocale(idioma, "/#proyectos") },
  blog: enlaceBlog(idioma),
  nosotros: { texto: t(idioma).nav.nosotros, href: conLocale(idioma, "/nosotros") },
  hacemos: { texto: t(idioma).nav.hacemos, href: conLocale(idioma, "/#hacemos") },
  como: { texto: t(idioma).nav.como, href: conLocale(idioma, "/#como") },
});

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
export const navegacion = ({ hayProyectos, hayNotas }: { hayProyectos: boolean; hayNotas: boolean }, idioma: Idioma): Enlace[] => {
  const ENLACES_NAV = enlacesNav(idioma);
  const aplica = (clave: ClaveNav) => (clave === "proyectos" ? hayProyectos : clave === "blog" ? hayNotas : true);
  const elegidas = PRIORIDAD_NAV.filter(aplica).slice(0, MAX_NAV);
  return ORDEN_NAV.filter((clave) => elegidas.includes(clave)).map((clave) => ENLACES_NAV[clave]);
};

/** Privacy page, linked from the footer (and from the contact form note, while the form is on). */
export const enlacePrivacidad = (idioma: Idioma): Enlace => ({
  texto: t(idioma).pie.privacidad,
  href: conLocale(idioma, "/privacidad"),
});

/** Default primary button of the header. A page can override it through Base's `accion` prop. */
export const accionPrincipal = (idioma: Idioma): Enlace => ({
  texto: t(idioma).accion.escribinos,
  href: conLocale(idioma, "/contacto"),
});

/**
 * Reasons of the contact form's "Motivo" select (src/components/FormularioContacto.astro).
 * The option text is also the subject of the email: "<Asunto>: <texto>".
 * The doors' `motivo` must be one of these `valor`s; only the text translates.
 */
export type Motivo = "implementacion" | "capacitacion" | "investigacion" | "prensa" | "colaborar" | "otro";

export const MOTIVOS = (idioma: Idioma): { valor: Motivo; texto: string }[] =>
  (Object.keys(t(idioma).correo.motivos) as Motivo[]).map((valor) => ({
    valor,
    texto: t(idioma).correo.motivos[valor],
  }));

/** Subject prefix of every contact email, from the form or from a door. */
export const ASUNTO_CONSULTA = (idioma: Idioma): string => t(idioma).correo.asuntoConsulta;

/** Subject for a reason: "Consulta desde numis.ar: Capacitar a mi equipo". */
export const asuntoConsulta = (motivo: Motivo, idioma: Idioma): string =>
  `${ASUNTO_CONSULTA(idioma)}: ${MOTIVOS(idioma).find((m) => m.valor === motivo)?.texto ?? ""}`;

/**
 * Contact doors, shared by the home closing section and the contact page, in
 * the given language. Each door opens an email with its reason as the subject
 * (see `enlacePuerta`).
 */
export const puertas = (idioma: Idioma): { titulo: string; texto: string; motivo: Motivo }[] =>
  t(idioma).contacto.puertas.map((p) => ({ titulo: p.titulo, texto: p.texto, motivo: p.motivo }));

/**
 * Link to the contact form with a reason preselected. Only valid while
 * FORMULARIO_ACTIVO is true (the #escribinos section exists only then).
 */
export const enlaceFormulario = (motivo: Motivo, idioma: Idioma): string =>
  conLocale(idioma, `/contacto?motivo=${encodeURIComponent(motivo)}#escribinos`);

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
export const enlacePuerta = (motivo: Motivo, idioma: Idioma): string =>
  FORMULARIO_ACTIVO ? enlaceFormulario(motivo, idioma) : mailto(asuntoConsulta(motivo, idioma));
