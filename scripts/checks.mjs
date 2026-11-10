import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { raiz, estado, hash } from "./estado.mjs";
const passos = [
  ["contrato", ".", ["run", "contrato"]],
  ["api-test", "backend", ["run", "test", "--", "--runInBand"]],
  ["api-build", "backend", ["run", "build"]],
  ["front-test", "frontend", ["run", "test"]],
  ["front-build", "frontend", ["run", "build"]],
  ["front-lint", "frontend", ["run", "lint"]],
  ["front-e2e", "frontend", ["run", "e2e"]],
  ["imagens-test", ".", ["run", "test:imagens"]],
  ["imagens-reais", ".", ["run", "imagens:validar-entrega"]],
  ["professor-test", ".", ["run", "test:professor"]],
  ["harness-test", ".", ["run", "test:harness"]],
  ["sandbox-test", ".", ["run", "test:sandbox"]],
];
const pasta = `${raiz}docs/verificacoes`;
await mkdir(pasta, { recursive: true });
const relatorio = { estado: "", terminouEm: "", aprovado: false, passos: [] };
let inicio;
for (const [nome, dir, args] of passos) {
  process.stdout.write(`\n[${nome}] npm ${args.join(" ")}\n`);
  const r = await new Promise((resolve) => {
    const child = spawn("npm", args, {
      cwd: `${raiz}${dir}`,
      env: process.env,
    });
    let saida = "";
    child.stdout.on("data", (b) => {
      saida += b;
      process.stdout.write(b);
    });
    child.stderr.on("data", (b) => {
      saida += b;
      process.stderr.write(b);
    });
    child.on("error", (e) => resolve({ exitCode: 1, saida: e.message }));
    child.on("close", (code) => resolve({ exitCode: code ?? 1, saida }));
  });
  const arquivo = `docs/verificacoes/${nome}.txt`;
  await writeFile(`${raiz}${arquivo}`, r.saida);
  relatorio.passos.push({
    nome,
    comando: `npm ${args.join(" ")} (${dir})`,
    exitCode: r.exitCode,
    arquivo,
    sha256: hash(r.saida),
  });
  if (nome === "contrato") inicio = await estado();
}
relatorio.estado = await estado();
relatorio.terminouEm = new Date().toISOString();
relatorio.aprovado =
  relatorio.passos.every((p) => p.exitCode === 0) &&
  inicio === relatorio.estado;
await writeFile(
  `${pasta}/checks.json`,
  JSON.stringify(relatorio, null, 2) + "\n",
);
console.log(
  relatorio.aprovado
    ? "CHECKS APROVADOS"
    : "CHECKS REPROVADOS — consultar docs/verificacoes/checks.json",
);
if (!relatorio.aprovado) process.exitCode = 1;
