/**
 * RSS feed of the published notes, newest first (/blog/rss.xml). Always
 * built, even when empty; Base only advertises it while a note is published.
 * Each item carries the note's lead as its description, not the full text.
 */
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { BLOG_BAJADA, BLOG_TITULO, notasVisibles, rutaNota } from "../../data/blog";

export async function GET(context: APIContext) {
  const notas = await notasVisibles();
  return rss({
    title: BLOG_TITULO,
    description: BLOG_BAJADA,
    // Channel link: the listing. `site` is always set in astro.config.mjs.
    site: new URL("/blog/", context.site).href,
    items: notas.map((nota) => ({
      title: nota.data.titulo,
      pubDate: nota.data.fecha,
      description: nota.data.bajada,
      link: rutaNota(nota),
    })),
    customData: "<language>es-AR</language>",
  });
}
