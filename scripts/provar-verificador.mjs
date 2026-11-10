import { spawnSync } from "node:child_process";
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { raiz, hash } from "./estado.mjs";
const arquivo = "backend/test/emprestimos.integration.spec.ts";
const caminho = `${raiz}${arquivo}`;
const original = await readFile(caminho, "utf8");
const alvo = 'it("test_ca_003_05_concorrencia_mesmo_usuario_limite"';
if (!original.includes(alvo))
  throw new Error(
    "Teste de concorrência não encontrado; não plantar erro diferente",
  );
const plantado = original.replace(
  alvo,
  'it.skip("test_ca_003_05_concorrencia_mesmo_usuario_limite"',
);
const pasta = `${raiz}docs/verificacoes/prova`;
await mkdir(`${pasta}/negativa`, { recursive: true });
const prova = {
  arquivo,
  ca: "CA-05",
  shaOriginal: hash(original),
  shaPlantado: hash(plantado),
  restaurado: false,
};
function rodar(args, sucesso = true) {
  const r = spawnSync("npm", args, { cwd: raiz, stdio: "inherit" });
  if (sucesso && r.status !== 0)
    throw new Error(`Comando falhou: npm ${args.join(" ")}`);
  return r.status;
}
try {
  await writeFile(caminho, plantado);
  await writeFile(
    `${pasta}/erro.patch`,
    `--- a/${arquivo}\n+++ b/${arquivo}\n@@ teste de concorrência do mesmo usuário @@\n-  ${alvo}\n+  it.skip("test_ca_003_05_concorrencia_mesmo_usuario_limite"\n`,
  );
  await writeFile(`${pasta}/negativa/teste-plantado.ts.txt`, plantado);
  rodar(["run", "checks"]);
  const checks = JSON.parse(
    await readFile(`${raiz}docs/verificacoes/checks.json`, "utf8"),
  );
  await copyFile(
    `${raiz}docs/verificacoes/checks.json`,
    `${pasta}/negativa/checks.json`,
  );
  for (const p of checks.passos)
    await copyFile(`${raiz}${p.arquivo}`, `${pasta}/negativa/${p.nome}.txt`);
  rodar(["run", "verificar-spec", "--", "003-solicitar-emprestimo"]);
  const r = JSON.parse(
    await readFile(
      `${raiz}docs/verificacoes/003-solicitar-emprestimo/atual.json`,
      "utf8",
    ),
  );
  await writeFile(
    `${pasta}/negativa/verificador.json`,
    JSON.stringify(r, null, 2) + "\n",
  );
  prova.estadoNegativo = r.estado;
  prova.resultadoNegativo = r.criterios.find(
    (c) => c.ca === "CA-05",
  )?.resultado;
  if (!["SEM_TESTE", "FALHOU"].includes(prova.resultadoNegativo))
    throw new Error(
      "Verificador não reprovou a cobertura retirada: prova falhou",
    );
  const gate = rodar(
    ["run", "fechar-spec", "--", "003-solicitar-emprestimo", "--somente-gate"],
    false,
  );
  if (gate === 0) throw new Error("Gate aceitou spec reprovada");
  prova.gateNegativoRecusou = true;
} finally {
  // Principal restaura, nunca o subagente. Mesmo uma prova malsucedida restaura.
  await writeFile(caminho, original);
  prova.restaurado =
    hash(await readFile(caminho, "utf8")) === prova.shaOriginal;
  await writeFile(`${pasta}/prova.json`, JSON.stringify(prova, null, 2) + "\n");
}
rodar(["run", "checks"]);
rodar(["run", "verificar-spec", "--", "003-solicitar-emprestimo"]);
const final = JSON.parse(
  await readFile(
    `${raiz}docs/verificacoes/003-solicitar-emprestimo/atual.json`,
    "utf8",
  ),
);
prova.estadoFinal = final.estado;
prova.resultadoFinal = final.criterios.find((c) => c.ca === "CA-05")?.resultado;
await writeFile(`${pasta}/prova.json`, JSON.stringify(prova, null, 2) + "\n");
if (prova.resultadoFinal !== "APROVADO")
  throw new Error(
    "Cobertura restaurada ainda não aprovada; consultar relatório",
  );
console.log(
  "Prova executada: teste ausente reprovado; arquivo original restaurado; CA-05 aprovado.",
);
