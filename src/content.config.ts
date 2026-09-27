/**
 * Content collections. Leave a field out when the data is missing: the pages
 * mark it as pending (or omit it, when it is optional) instead of publishing a
 * placeholder.
 *
 * The site is trilingual (Spanish by default, English, Portuguese). Each
 * collection exists once per language, reading its own folder; the file name
 * is the same in all three, so an entry and its translations share the slug
 * and can be cross-linked:
 * - `proyectos`, `proyectosEn`, `proyectosPt`: single source of truth for the
 *   projects, one Markdown file per project under src/content/proyectos/<idioma>/.
 *   The home band (src/pages/index.astro and its en/pt counterparts), the
 *   project pages and the header link read the collection of the page's
 *   language, but only entries with `publicado: true`. The body is the
 *   project text, in the file's language.
 * - `equipo`, `equipoEn`, `equipoPt`: cooperative members, read by the home
 *   team ticket and /nosotros (and each language's blog bylines). One Markdown
 *   file per person under src/content/equipo/<idioma>/; the file name is the
 *   slug and stays the same across languages.
 * - `blog`, `blogEn`, `blogPt`: notes, read by /blog, /blog/<slug> and
 *   /blog/rss.xml of each language, but only entries with `publicado: true`.
 *   One Markdown file per note under src/content/blog/<idioma>/; the file name
 *   is the slug. `autores` references the team collection of the same language.
 *
 * A note (or project, or member) that exists only in Spanish simply does not
 * appear on the English or Portuguese site until its translation file is
 * added: no placeholders, no fallback to another language.
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

const esquemaProyecto = z.object({
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
});

const esquemaEquipo = z.object({
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
});

/** The note schema; `equipo` is the team collection of the note's language. */
const esquemaBlog = (equipo: "equipo" | "equipoEn" | "equipoPt") =>
  z.object({
    /** Note title: the h1 of its page and the link in the listing. */
    titulo: z.string(),
    /** Publication date (YYYY-MM-DD). The listing and the feed sort by it, newest first. */
    fecha: z.coerce.date(),
    /** One or two sentences: listing, page lead, meta description and feed. */
    bajada: z.string(),
    /** Members of the same-language `equipo` collection who sign the note, by file name (slug). At least one. */
    autores: z.array(reference(equipo)).min(1),
    /** Only published notes get a page, a listing item, a feed item and the nav link. */
    publicado: z.boolean().default(false),
    /** Date of the last relevant change, shown on the note page. */
    actualizado: opcional(z.coerce.date()),
  });

const proyectos = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/proyectos/es" }),
  schema: esquemaProyecto,
});
const proyectosEn = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/proyectos/en" }),
  schema: esquemaProyecto,
});
const proyectosPt = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/proyectos/pt" }),
  schema: esquemaProyecto,
});

const equipo = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/equipo/es" }),
  schema: esquemaEquipo,
});
const equipoEn = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/equipo/en" }),
  schema: esquemaEquipo,
});
const equipoPt = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/equipo/pt" }),
  schema: esquemaEquipo,
});

const blog = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/blog/es" }),
  schema: esquemaBlog("equipo"),
});
const blogEn = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/blog/en" }),
  schema: esquemaBlog("equipoEn"),
});
const blogPt = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/blog/pt" }),
  schema: esquemaBlog("equipoPt"),
});

export const collections = { proyectos, proyectosEn, proyectosPt, equipo, equipoEn, equipoPt, blog, blogEn, blogPt };
