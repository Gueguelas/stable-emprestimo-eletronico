import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
export const raiz = fileURLToPath(new URL("../", import.meta.url));
const entradas = [
  "AGENTS.md",
  "package.json",
  ".gitignore",
  "agents",
  ".agents",
  "scripts",
  "docs/PRD.md",
  "docs/adr",
  "docs/rules",
  "docs/evidencias",
  "docs/specs/002-dados-iniciais",
  "docs/specs/003-solicitar-emprestimo",
  "backend/src",
  "backend/test",
  "backend/prisma",
  "backend/scripts",
  "backend/package.json",
  "backend/package-lock.json",
  "backend/jest.config.js",
  "backend/tsconfig.json",
  "backend/openapi.json",
  "frontend/src",
  "frontend/e2e",
  "frontend/package.json",
  "frontend/package-lock.json",
  "frontend/openapi.json",
  "frontend/orval.config.ts",
  "frontend/vite.config.ts",
  "frontend/playwright.config.ts",
  "frontend/tsconfig.json",
  "frontend/eslint.config.js",
];
export async function estado() {
  const arquivos = [];
  async function percorrer(rel) {
    const p = path.join(raiz, rel),
      info = await stat(p);
    if (info.isDirectory())
      for (const nome of (await readdir(p)).sort())
        await percorrer(`${rel}/${nome}`);
    else arquivos.push(rel);
  }
  for (const p of entradas) await percorrer(p);
  const h = createHash("sha256");
  for (const p of arquivos.sort()) {
    h.update(p);
    h.update("\0");
    h.update(await readFile(path.join(raiz, p)));
    h.update("\0");
  }
  return h.digest("hex");
}
export const hash = (texto) => createHash("sha256").update(texto).digest("hex");
