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
    target: "es2022",
    minify: "terser",
    terserOptions: {
      ecma: 2022,
      module: true,
      compress: {
        passes: 2,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          p5: ["p5"],
        },
      },
    },
  },
};
