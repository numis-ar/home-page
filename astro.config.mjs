// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static output, no adapter, no UI framework integration.
// `site` is the canonical origin: numis.ar 301-redirects to www.numis.ar, so
// canonical URLs, og:url and the sitemap all use the www host.
export default defineConfig({
  site: "https://www.numis.ar",
  output: "static",
  integrations: [sitemap()],
  markdown: {
    // No syntax highlighting: Shiki would paint code blocks with a dark theme.
    // Code in notes stays tinta on papel (see `.prosa` in src/styles/base/type.css).
    syntaxHighlight: false,
  },
});
