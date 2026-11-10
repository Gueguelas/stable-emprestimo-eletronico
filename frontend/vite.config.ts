import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

const raiz = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
<<<<<<< HEAD
=======
    preserveSymlinks: true,
>>>>>>> a52456606c59e2feef60eb067f786b93e23ae2a1
    alias: {
      "@": path.resolve(raiz, "src")
    }
  },
<<<<<<< HEAD
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test-setup.ts"]
=======
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"]
>>>>>>> a52456606c59e2feef60eb067f786b93e23ae2a1
  }
});
