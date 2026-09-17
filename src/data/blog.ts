// Helpers over the `blog` content collection (src/content.config.ts).
import { getCollection, getEntries, type CollectionEntry } from "astro:content";
import type { IntegranteEntrada } from "./equipo";

export type NotaEntrada = CollectionEntry<"blog">;

/**
 * Notes the site shows, newest first: published notes only in the build; in
 * `astro dev` drafts too (marked "Borrador"), so a note can be reviewed
 * without flipping `publicado`.
 */
export const notasVisibles = async (): Promise<NotaEntrada[]> =>
  (await getCollection("blog", (n) => n.data.publicado || import.meta.env.DEV)).sort(
    (a, b) => b.data.fecha.getTime() - a.data.fecha.getTime(),
  );

/** URL of a note's own page. */
export const rutaNota = (nota: NotaEntrada): string => `/blog/${nota.id}`;

/** The members who sign a note, in the order the note lists them. */
export const autoresDe = (nota: NotaEntrada): Promise<IntegranteEntrada[]> => getEntries(nota.data.autores);

// Dates come from YYYY-MM-DD front matter, parsed as UTC midnight: format in
// UTC so the day never shifts with the build machine's time zone.
const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "11 de septiembre de 2026". */
export const fechaLarga = (fecha: Date): string => formatoFecha.format(fecha);

/** "2026-09-11", for <time datetime>. */
export const fechaISO = (fecha: Date): string => fecha.toISOString().slice(0, 10);

/** Blog name and lead: /blog hero, feed title and description, <link rel="alternate">. */
export const BLOG_TITULO = "Blog de Numis";
export const BLOG_BAJADA = "Notas escritas por quienes hacemos la cooperativa.";
/** Meta description of /blog: the lead alone is too short to say what the blog is about. */
export const BLOG_DESCRIPCION =
  "Notas escritas por quienes hacemos Numis, una cooperativa de trabajo que diseña e implementa pagos con software libre.";

/** Feed URL, advertised in Base's head while a note is published. */
export const RUTA_RSS = "/blog/rss.xml";
