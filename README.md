# Numis home page

Static institutional site for Numis, a worker cooperative that designs and
implements payments with free software. Built with [Astro](https://astro.build),
no UI framework. Pages:

- `/`: Home (hero with the printing ticket, published projects band, why, how a payment works, who we work with, what we do, team, contact doors)
- `/contacto`: Contact (hero with contact ticket and the email button, contact doors). The contact form is off for now (`FORMULARIO_ACTIVO` in `src/data/sitio.ts`).
- `/nosotros`: About (hero with the institutional ticket, mission and vision, full team, contact doors)
- `/privacidad`: Privacy policy (draft pending legal review)
- `/proyectos/<slug>`: one page per **published** project: hero with the project sheet, project text, contact doors. None is published yet, so none is built.
- `/blog`: published notes, newest first. With none published it says so in one sentence.
- `/blog/<slug>`: one page per **published** note. `/blog/rss.xml`: RSS feed of the published notes.
- `/404`: not found page ("Esta página no existe."), built as `dist/404.html`. The hosting must serve it for unknown URLs.

The canonical origin is `https://www.numis.ar` (`site` in `astro.config.mjs`;
`numis.ar` 301-redirects there). `@astrojs/sitemap` writes
`sitemap-index.xml`, and `public/robots.txt` points to it.

The header, `<main>` and footer live in `src/layouts/Base.astro`, along with
the metadata: canonical, Open Graph (`public/og.png`, 1200×630), Twitter card
and the Organization JSON-LD. The header links and default button come from
`src/data/sitio.ts` (a page can override the button with Base's `accion`
prop). The header shows at most three links plus that button. "Proyectos"
and "Blog" only compete for a place while their collection has a published
entry; the first three that apply win, in this priority: Proyectos, Blog,
Nosotros, Qué hacemos, Cómo funciona (`PRIORIDAD_NAV` in `src/data/sitio.ts`).
While a note is published, the footer also links to `/blog` and the head
advertises the RSS feed. Confirmed institutional data (legal name, city, email,
mission, vision) also lives in `src/data/sitio.ts`, so every page reads it
from one place.

### Content collections

Defined in `src/content.config.ts`, one Markdown file per entry; the file name
is the slug.

- `src/content/proyectos/`: `nombre`, `tipo`, `orden`, `publicado` (default
  `false`), and optional `logo`, `descripcion`, `desde`, `estado`; the body is
  the project text. Only entries with `publicado: true` get a card in the home
  band, a page and the header link. With none published, the band is not
  rendered. Helpers in `src/data/proyectos.ts`.
- `src/content/equipo/`: `nombre`, `especialidad`, `orden`, and optional `bio`,
  `foto`, `enlaces` (`{ texto, href }[]`). The home team ticket and the
  `/nosotros` listing read it; `/nosotros` shows bio, photo and links only when
  present. Helper `equipoOrdenado()` in `src/data/equipo.ts`.
- `src/content/blog/`: `titulo`, `fecha` (YYYY-MM-DD), `bajada`, `autores`
  (file names of `equipo` entries, at least one), `publicado` (default
  `false`), optional `actualizado`; the body is the note. Only published
  notes get a page, a listing item, a feed item and the header and footer
  links. Bylines link to `/nosotros#<member-slug>`. Helpers in
  `src/data/blog.ts`. `nota-de-ejemplo-para-editores.md` is an unpublished
  example that uses every Markdown element the site styles; keep it
  unpublished.

Empty optional fields may be written as `campo:` or `campo: ""`; the schemas
read both as missing.

## Editing content

There is no CMS: content is Markdown files in this repository.

1. Add or edit a file in `src/content/blog/`, `src/content/equipo/` or
   `src/content/proyectos/` (copy an existing one to get the front matter
   right; `nota-de-ejemplo-para-editores.md` shows every element a note can use).
2. `npm run dev`: drafts (`publicado: false`) are visible in dev, marked
   "Borrador", so you can review a note before publishing it.
3. Set `publicado: true`, run `npm run build` (it fails with a clear message if
   a field is missing or an author doesn't exist), commit and deploy.

**The `publicado` rule**: notes and projects stay off the built site until
`publicado: true`. Turn it on only when the content is complete and confirmed.

## Getting started

Requires Node.js 22.12 or later.

```sh
npm install
npm run dev      # dev server at http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve the built site
npm run check    # astro check (type and template diagnostics)
```

## Deploy (cPanel / Apache)

The build is plain static files.

1. `npm run build`.
2. Zip the **contents** of `dist/` (not the folder): `cd dist && zip -r ../sitio.zip .`
3. In cPanel's File Manager, upload the zip to `public_html` (or the domain's
   document root), extract it there and delete the zip.

`public/.htaccess` ships inside `dist/`: it serves `404.html` for unknown URLs,
redirects `http://` and `numis.ar` to `https://www.numis.ar`, and sets cache
headers (hashed `/_astro/` files forever, everything else revalidated). Enable
AutoSSL in cPanel for the certificate. If the host is nginx-only (no Apache
behind it), `.htaccess` is ignored and the same rules must be set in the panel.

## Design system

Everything visual comes from the Numis design system in
`.claude/skills/numis-design/` (start with its `readme.md`). The site does not
load anything from there at runtime. Instead:

- `src/styles/` is a copy of the system's CSS (`tokens/`, `base/`, `components/`)
  with one entry file, `src/styles/numis.css`. The only changes are the font URL
  and marked "Local additions" blocks at the end of some files (project cards,
  full-height hero, justified text, two-column publics, team members, privacy
  page headings, footer links, blog listing, note header and the `.prosa`
  long-form styles for Markdown bodies). Markdown code blocks are not syntax
  highlighted (`markdown.syntaxHighlight: false`), so they keep the site
  colors.
- `src/components/` ports the system's JSX components to `.astro`, keeping the
  Spanish names (`Boton`, `Ticket`, `Puerta`...) so they map 1:1 to the system.
- `public/` holds the Archivo variable font (with its OFL license), the logos,
  the favicon, `og.png`, `robots.txt` and `.htaccess`. Images for notes, team
  members and projects go in `public/blog/`, `public/equipo/` and
  `public/proyectos/`. `og.png` was rendered once with
  headless Chrome from a throwaway HTML page using the system fonts, colors and
  logo; re-render it the same way if the headline changes.

Page structure follows `templates/pagina-institucional/` (`PaginaInstitucional.dc.html`
and `Contacto.dc.html`). The copy started from those templates and from
`ui_kits/sitio-institucional/`, and was then revised with Numis in a copy
review. Public copy says "software libre" and does not name a specific
payment system. The footer lists legal name, city and email, with the slogan
under the logo.

## Pending

- **Legal address** on `/privacidad` (shown as a pending mark), and a lawyer's
  review of the page, including the AAIP notice (Disposición DNPDP 10/2008).
- **Contact form.** Off until there is a backend (`FORMULARIO_ACTIVO` and
  `ENDPOINT_FORMULARIO` in `src/data/sitio.ts`); a plain `mailto:` form fails
  silently for people without a mail app. When it comes back, rewrite the
  form section of `/privacidad`.
- **Contact doors.** While the form is off, each door is a `mailto:` with a
  subject per case, but the card doesn't say it opens an email, and without a
  mail app the click does nothing visible. Idea: a short line such as
  "Escribir a hola@numis.ar" at the foot of each door.
- **Projects.** UNQ, Babel and Ferias need logo, description, sheet data and
  text; set `publicado: true` once they are complete.
- **Team bios, photos and links** in `src/content/equipo/` (real photos only).
- **A first blog note.**
- Inherited from the design system: a terms page.
