// from https://stackoverflow.com/a/75501794

import type { AstroIntegration } from "astro";
import { createProxyMiddleware, type Options } from "http-proxy-middleware";

export default (context: string, options: Options) => {
  const apiProxy = createProxyMiddleware(options);

  return {
    name: "proxy",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use(context, apiProxy);
      },
    },
  } satisfies AstroIntegration;
};
