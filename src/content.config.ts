/**
 * Content collections. Leave a field out when the data is missing: the pages
 * mark it as pending (or omit it, when it is optional) instead of publishing a
 * placeholder.
 *
 * - `proyectos`: single source of truth for the projects. The home band
 *   (src/pages/index.astro), the project pages (src/pages/proyectos/[slug].astro)
 *   and the header link read it, but only entries with `publicado: true`. One
 *   Markdown file per project; the file name is the slug (/proyectos/<slug>)
 *   and the body is the project text.
 * - `equipo`: cooperative members, read by the home team ticket and /nosotros.
 *   One Markdown file per person; the file name is the slug.
 * - `blog`: notes, read by /blog, /blog/<slug> and /blog/rss.xml, but only
 *   entries with `publicado: true`. One Markdown file per note; the file name
 *   is the slug and the body is the note.
 *
 * Entries are written by hand. An optional field left empty in the front
 * matter (`descripcion:` or `descripcion: ""`) arrives as null or "", so
 * optional fields go through `opcional()`, which reads both as "missing".
 * Dates are coerced because YAML may parse YYYY-MM-DD as a Date or keep it as
 * a string.
 */
import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** "" and null (an optional field left empty in the front matter) become undefined. */
const vacioComoAusente = (valor: unknown) => (valor === "" || valor === null ? undefined : valor);

/** Optional field that tolerates empty values. */
const opcional = <T extends z.ZodType>(tipo: T) => z.preprocess(vacioComoAusente, tipo.optional());

const proyectos = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/proyectos" }),
  schema: z.object({
    /** Counterpart name, shown as the card title and the page h1. */
    nombre: z.string(),
    /** One or two words: "Investigación", "Implementación", "Territorio". */
    tipo: z.string(),
    /** Position in the home carousel, ascending. */
    orden: z.number().int(),
    /**
     * Only published projects get a card on the home, a page and the header
     * link. Set it to true once the project data is complete and confirmed.
     */
    publicado: z.boolean().default(false),
    /** Path under public/ to the counterpart's logo. */
    logo: opcional(z.string()),
    /** One line, shown on the card and as the page lead. */
    descripcion: opcional(z.string()),
    /** Project sheet: when it started. */
    desde: opcional(z.string()),
    /** Project sheet: current status. */
    estado: opcional(z.string()),
  }),
});

const equipo = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/equipo" }),
  schema: z.object({
    nombre: z.string(),
    /** Lowercase area of expertise, as it reads in the ticket: "sector bancario". */
    especialidad: z.string(),
    /** Position in the listings, ascending. */
    orden: z.number().int(),
    /** Short bio. Optional: when absent, /nosotros just omits it. */
    bio: opcional(z.string()),
    /** Path under public/ to a real photo of the person. Never stock. */
    foto: opcional(z.string()),
    /** Personal links (site, repository, profile). */
    enlaces: opcional(z.array(z.object({ texto: z.string(), href: z.string() }))),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/blog" }),
  schema: z.object({
    /** Note title: the h1 of its page and the link in the listing. */
    titulo: z.string(),
    /** Publication date (YYYY-MM-DD). The listing and the feed sort by it, newest first. */
    fecha: z.coerce.date(),
    /** One or two sentences: listing, page lead, meta description and feed. */
    bajada: z.string(),
    /** Members of `equipo` who sign the note, by file name (slug). At least one. */
    autores: z.array(reference("equipo")).min(1),
    /** Only published notes get a page, a listing item, a feed item and the nav link. */
    publicado: z.boolean().default(false),
    /** Date of the last relevant change, shown on the note page. */
    actualizado: opcional(z.coerce.date()),
  }),
});

export const collections = { proyectos, equipo, blog };
