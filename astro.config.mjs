import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://betterchange-consulting.de",
  // German lives under /de/; English is the default and stays unprefixed
  // so today's URLs (/services, /training/...) don't change.
  i18n: {
    defaultLocale: "en",
    locales: ["en", "de"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [sitemap({ filter: (page) => !page.includes("/admin") })],
  vite: {
    plugins: [tailwindcss()],
  },
});
