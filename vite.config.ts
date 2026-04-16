import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  /**
   * IMPORTANT:
   * - Vercel should use "/" so assets load from /assets/...
   * - GitHub Pages (repo pages) should use "/sera-society/" so assets load from /sera-society/assets/...
   *
   * Vite uses `base` to determine the served base URL and `import.meta.env.BASE_URL`. [1](https://www.youtube.com/watch?v=n5R442Rrb5o)
   * Vercel provides `VERCEL` env var during builds, which we can use to detect Vercel. [2](https://bing.com/search?q=Vercel+environment+variables+documentation)
   */
  base: process.env.VERCEL ? "/" : "/sera-society/",

  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },

  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
