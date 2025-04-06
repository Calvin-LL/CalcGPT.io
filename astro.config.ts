import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  devToolbar: { enabled: false },
  vite: {
    server: {
      proxy: {
        "/api": {
          target: "https://calcgpt.io/",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
});
