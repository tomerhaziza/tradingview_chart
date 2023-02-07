import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/tw-chart": {
        target: "https://test-trade2.xtrade.com/tw-chart",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tw-chart/, ""),
      },
    },
  },
});
