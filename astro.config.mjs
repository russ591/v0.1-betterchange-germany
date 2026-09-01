import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://betterchange-consulting.de",
  vite: {
    plugins: [tailwindcss()],
  },
});
