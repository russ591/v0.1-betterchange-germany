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
  // Astro's built-in 404 exclusion only catches the bare /404 page; the
  // German 404 at /de/404 is a distinct routed page (not the special
  // 404.html file) so it needs excluding explicitly too.
  integrations: [
    sitemap({ filter: (page) => !page.includes("/admin") && !/\/404\/?$/.test(new URL(page).pathname) }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
