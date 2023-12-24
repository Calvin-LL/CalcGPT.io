// from https://stackoverflow.com/a/75501794

import type { AstroIntegration } from "astro";
import {
  createProxyMiddleware,
  type Filter,
  type Options,
} from "http-proxy-middleware";

export default (context: Filter, options: Options) => {
  const apiProxy = createProxyMiddleware(context, options);

  return {
    name: "proxy",
    hooks: {
      "astro:server:setup": ({ server }) => {
        // @ts-ignore
        server.middlewares.use(apiProxy);
      },
    },
  } satisfies AstroIntegration;
};
