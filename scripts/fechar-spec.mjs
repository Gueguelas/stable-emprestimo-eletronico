import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { raiz, estado, hash } from "./estado.mjs";
import { validarFechamento } from "./gate.mjs";
const spec = process.argv[2];
if (!["002-dados-iniciais", "003-solicitar-emprestimo"].includes(spec))
  throw new Error("Informe o identificador da spec");
if (!process.argv.includes("--somente-gate")) {
  for (const args of [
    ["run", "checks"],
    ["run", "verificar-spec", "--", spec],
  ]) {
    const r = spawnSync("npm", args, { cwd: raiz, stdio: "inherit" });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }
}
try {
  const relatorio = JSON.parse(
    await readFile(`${raiz}docs/verificacoes/${spec}/atual.json`, "utf8"),
  );
  const checks = JSON.parse(
    await readFile(`${raiz}docs/verificacoes/checks.json`, "utf8"),
  );
  for (const p of checks.passos)
    if (hash(await readFile(`${raiz}${p.arquivo}`)) !== p.sha256)
      throw new Error("Log de check alterado");
  if (relatorio.checksSha256 !== hash(JSON.stringify(checks)))
    throw new Error("Relatório não cobre estes checks");
  const conteudo = await readFile(`${raiz}docs/specs/${spec}/spec.md`, "utf8");
  const cas = [...conteudo.matchAll(/^- (CA-\d+):/gm)].map((m) => m[1]);
  validarFechamento(relatorio, checks, await estado(), spec, cas);
  await writeFile(
    `${raiz}docs/verificacoes/${spec}/fechamento.json`,
    JSON.stringify(
      {
        spec,
        estado: relatorio.estado,
        em: new Date().toISOString(),
        resultado: "PRONTA",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`Spec ${spec}: PRONTA, checks e verificador atuais.`);
} catch (e) {
  console.error(`FECHAMENTO RECUSADO: ${e.message}`);
  process.exitCode = 1;
}
