// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static output, no adapter, no UI framework integration.
// `site` is the canonical origin: numis.ar 301-redirects to www.numis.ar, so
// canonical URLs, og:url and the sitemap all use the www host.
//
// i18n: Spanish is the default locale and keeps its URLs at the root
// (/blog/...), English and Portuguese live under /en and /pt. The page tree
// mirrors this: src/pages/* is Spanish, src/pages/en/* and src/pages/pt/* are
// the other locales; each locale's content lives in src/content/<coleccion>/<idioma>/.
export default defineConfig({
  site: "https://www.numis.ar",
  output: "static",
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "es",
        locales: { es: "es", en: "en", pt: "pt" },
      },
    }),
  ],
  i18n: {
    locales: ["es", "en", "pt"],
    defaultLocale: "es",
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    // No syntax highlighting: Shiki would paint code blocks with a dark theme.
    // Code in notes stays tinta on papel (see `.prosa` in src/styles/base/type.css).
    syntaxHighlight: false,
  },
});
