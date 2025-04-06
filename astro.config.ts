import { defineConfig } from "astro/config";
import proxyMiddleware from "./plugins/proxy-middleware";

// https://astro.build/config
export default defineConfig({
  devToolbar: { enabled: false },
  integrations: [
    proxyMiddleware("/api/math", {
      target: "https://calcgpt.io/",
      changeOrigin: true,
    }),
  ],
});
