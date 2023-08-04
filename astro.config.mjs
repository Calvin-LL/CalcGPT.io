import { defineConfig } from "astro/config";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  vite: {
    plugins: [basicSsl()],
    server: {
      https: true,
    },
  },
});
