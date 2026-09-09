import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://betterchange-consulting.de",
  integrations: [sitemap({ filter: (page) => !page.includes("/admin") })],
  vite: {
    plugins: [tailwindcss()],
  },
});
