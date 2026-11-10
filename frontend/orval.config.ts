import { defineConfig } from "orval";

export default defineConfig({
  stable: {
    input: "./openapi.json",
    output: {
      target: "src/api/generated/stable.ts",
      schemas: "src/api/generated/model",
      client: "fetch",
      clean: false,
      baseUrl: {
        runtime: '(import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\\/+$/, "")',
      },
    },
  },
  validacao: {
    input: "./openapi.json",
    output: { target: "src/api/generated/validation.ts", client: "zod" },
  },
});
