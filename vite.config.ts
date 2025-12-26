import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Removemos o plugin @replit/vite-plugin-runtime-error-modal
// e todos os plugins Replit condicionalmente para evitar erros no build da Vercel

export default defineConfig({
  plugins: [
    react(),
    // Plugins Replit somente em dev local
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          // Plugins Replit opcionais para dev
          // import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
          // import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
