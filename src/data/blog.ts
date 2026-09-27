// Helpers over the trilingual `blog` content collections (src/content.config.ts):
// `blog` (es), `blogEn`, `blogPt`. Every helper takes the page's `idioma` and
// reads only that language's collection, so an untranslated note simply does
// not exist on the other languages' sites.
import rss from "@astrojs/rss";
import { getCollection, getEntries, type CollectionEntry } from "astro:content";
import type { APIContext } from "astro";
import { conLocale, etiquetaFecha, t, type Idioma } from "./i18n";
import type { IntegranteEntrada } from "./equipo";

export type NotaEntrada = CollectionEntry<"blog"> | CollectionEntry<"blogEn"> | CollectionEntry<"blogPt">;

const COLECCION: Record<Idioma, "blog" | "blogEn" | "blogPt"> = { es: "blog", en: "blogEn", pt: "blogPt" };

/**
 * Notes the site shows in the given language, newest first: published notes
 * only in the build; in `astro dev` drafts too (marked "Borrador"), so a note
 * can be reviewed without flipping `publicado`.
 */
export const notasVisibles = async (idioma: Idioma): Promise<NotaEntrada[]> =>
  (await getCollection(COLECCION[idioma], (n) => n.data.publicado || import.meta.env.DEV)).sort(
    (a, b) => b.data.fecha.getTime() - a.data.fecha.getTime(),
  );

/** Every visible note's slug in the given language (to cross-link translations by file name). */
export const slugsVisibles = async (idioma: Idioma): Promise<Set<string>> =>
  new Set((await notasVisibles(idioma)).map((n) => n.id));

/** URL of a note's own page in the given language. */
export const rutaNota = (nota: NotaEntrada, idioma: Idioma): string => conLocale(idioma, `/blog/${nota.id}`);

/** The members who sign a note, from the note's own language team collection, in the order the note lists them. */
export const autoresDe = (nota: NotaEntrada): Promise<IntegranteEntrada[]> => getEntries(nota.data.autores);

// Dates come from YYYY-MM-DD front matter, parsed as UTC midnight: format in
// UTC so the day never shifts with the build machine's time zone, and in the
// page's language.
const formatoFecha = (idioma: Idioma) =>
  new Intl.DateTimeFormat(etiquetaFecha[idioma], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

/** "11 de septiembre de 2026", in the page's language. */
export const fechaLarga = (fecha: Date, idioma: Idioma): string => formatoFecha(idioma).format(fecha);

/** "2026-09-11", for <time datetime>. */
export const fechaISO = (fecha: Date): string => fecha.toISOString().slice(0, 10);

/** RSS feed path of each language. */
export const RUTA_RSS = "/blog/rss.xml";

/**
 * RSS feed of one language's visible notes, newest first
 * (/blog/rss.xml, /en/blog/rss.xml, /pt/blog/rss.xml). Always built, even when
 * empty; Base only advertises it while that language has a published note.
 * Each item carries the note's lead as its description, not the full text.
 */
export const feedBlog = async (idioma: Idioma, context: APIContext): Promise<Response> => {
  const txt = t(idioma).blog;
  const notas = await notasVisibles(idioma);
  return rss({
    title: txt.titulo,
    description: txt.descripcion,
    // Channel link: the listing. `site` is always set in astro.config.mjs.
    site: new URL(conLocale(idioma, "/blog/"), context.site).href,
    items: notas.map((nota) => ({
      title: nota.data.titulo,
      pubDate: nota.data.fecha,
      description: nota.data.bajada,
      link: rutaNota(nota, idioma),
    })),
    customData: `<language>${etiquetaFecha[idioma]}</language>`,
  });
};
