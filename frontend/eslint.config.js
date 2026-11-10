import tseslint from "typescript-eslint";

// Config espelhada da API (ADR-001 §11): ESLint + Prettier nos dois
// repositórios; divergência resolvida na revisão.
export default tseslint.config(
  {
    ignores: ["node_modules/", "dist/", "src/api/generated/"]
  },
  ...tseslint.configs.recommended
);
