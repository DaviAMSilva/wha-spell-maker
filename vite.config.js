import Sitemap from "vite-plugin-sitemap";

export default {
  plugins: [
    Sitemap({
      hostname: "https://wha-spell-maker.daviamsilva.dev/",
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
