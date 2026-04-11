import { prerenderPlugin } from "./plugins/prerender";
import Sitemap from "vite-plugin-sitemap";

export default {
  plugins: [
    prerenderPlugin(),
    Sitemap({
      hostname: "https://wha-spell-maker.daviamsilva.dev/",
      exclude: ["/index-prerendered"],
      changefreq: "weekly",
    }),
  ],
  build: {
    minify: "terser",
  },
};
