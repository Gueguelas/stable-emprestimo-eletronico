import { spawn, spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { raiz, estado, hash } from "./estado.mjs";

const spec = process.argv[2];
if (!["002-dados-iniciais", "003-solicitar-emprestimo"].includes(spec))
  throw new Error("Informe 002-dados-iniciais ou 003-solicitar-emprestimo");
const atual = await estado();
const preflight = spawnSync(
  process.execPath,
  [`${raiz}scripts/testar-sandbox.mjs`],
  { cwd: raiz, stdio: "inherit" },
);
if (preflight.status !== 0)
  throw new Error("Verificador não pode iniciar sem isolamento comprovado");
const checks = JSON.parse(
  await readFile(`${raiz}docs/verificacoes/checks.json`, "utf8"),
);
if (checks.estado !== atual)
  throw new Error("Checks desatualizados; executar npm run checks");
for (const p of checks.passos) {
  if (hash(await readFile(`${raiz}${p.arquivo}`)) !== p.sha256)
    throw new Error("Log de check alterado");
}
const destino = `${raiz}docs/verificacoes/${spec}`;
const temporario = `${raiz}artifacts/verificador/${spec}`;
await mkdir(destino, { recursive: true });
await mkdir(temporario, { recursive: true });
const args = [
  "--no-daemon",
  "exec",
  "--ignore-user-config",
  "--ephemeral",
  "--sandbox",
  "read-only",
  "-c",
  'approval_policy="never"',
  "-c",
  "mcp_servers={}",
  "-c",
  'web_search="disabled"',
  "-c",
  'shell_environment_policy.inherit="none"',
  "-c",
  'shell_environment_policy.include_only=["PATH","TMPDIR"]',
  ...[
    "apps",
    "plugins",
    "hooks",
    "browser_use",
    "browser_use_external",
    "computer_use",
    "in_app_browser",
    "multi_agent",
    "image_generation",
  ].flatMap((f) => ["--disable", f]),
  "--cd",
  raiz,
  "--output-schema",
  `${raiz}scripts/verificador.schema.json`,
  "--output-last-message",
  `${temporario}/resultado.json`,
  "-",
];
const prompt = `${await readFile(`${raiz}agents/verificador-spec.md`, "utf8")}\n\nTarefa independente: confira docs/specs/${spec}/spec.md. spec no JSON deve ser "${spec}"; estado deve ser "${atual}". Leia docs/verificacoes/checks.json e os logs referenciados, os testes e a implementação. Não há resumo do implementador. Não altere nenhum arquivo. Não execute integração/Postgres: consuma os logs atuais e inspecione a cobertura real. Ausência de teste executado ou teste skip/todo é SEM_TESTE. Operação externa não comprovada é PENDENTE. Não tente corrigir nada.`;
console.log(`Iniciando verificador independente readonly: ${spec}`);
let saida = "";
const exitCode = await new Promise((resolve) => {
  const child = spawn("codex", args, {
    cwd: raiz,
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      TMPDIR: process.env.TMPDIR,
      ...(process.env.CODEX_HOME ? { CODEX_HOME: process.env.CODEX_HOME } : {}),
    },
  });
  const timer = setTimeout(
    () => {
      child.kill("SIGTERM");
    },
    10 * 60 * 1000,
  );
  child.stdout.on("data", (b) => {
    saida += b;
  });
  child.stderr.on("data", (b) => {
    saida += b;
  });
  child.on("error", (e) => {
    clearTimeout(timer);
    saida += e.message;
    resolve(1);
  });
  child.on("close", (code) => {
    clearTimeout(timer);
    resolve(code ?? 1);
  });
  child.stdin.end(prompt);
});
const em = new Date().toISOString();
const rodada = em.replace(/[:.]/g, "-");
await writeFile(`${destino}/${rodada}.txt`, saida);
if (exitCode !== 0)
  throw new Error(
    `Verificador falhou (${exitCode}); veja ${destino}/${rodada}.txt`,
  );
if ((await estado()) !== atual)
  throw new Error(
    "Código mudou durante a revisão; repetir checks e verificação",
  );
const relatorio = JSON.parse(
  await readFile(`${temporario}/resultado.json`, "utf8"),
);
const conteudoSpec = await readFile(
  `${raiz}docs/specs/${spec}/spec.md`,
  "utf8",
);
const cas = [...conteudoSpec.matchAll(/^- (CA-\d+):/gm)].map((m) => m[1]);
if (
  relatorio.estado !== atual ||
  relatorio.spec !== spec ||
  relatorio.criterios.length !== cas.length ||
  cas.some((ca, n) => relatorio.criterios[n].ca !== ca)
)
  throw new Error("Resposta do verificador não corresponde à spec/estado");
const registro = {
  ...relatorio,
  em,
  harness: {
    sandbox: "read-only",
    mcp: false,
    apps: false,
    plugins: false,
    shellSecrets: false,
    args,
  },
  checksSha256: hash(JSON.stringify(checks)),
};
await writeFile(
  `${destino}/${rodada}.json`,
  JSON.stringify(registro, null, 2) + "\n",
);
await writeFile(
  `${destino}/atual.json`,
  JSON.stringify(registro, null, 2) + "\n",
);
const tabela = [
  "| CA | Resultado | Evidência | Motivo |",
  "|---|---|---|---|",
  ...relatorio.criterios.map(
    (c) =>
      `| ${c.ca} | ${c.resultado} | ${c.evidencia.replaceAll("|", "/").replaceAll("\n", " ")} | ${c.motivo.replaceAll("|", "/").replaceAll("\n", " ")} |`,
  ),
];
await writeFile(
  `${destino}/atual.md`,
  `# Verificação ${spec}\n\nEstado: ${atual}\n\n${tabela.join("\n")}\n\nVeredito: ${relatorio.conclusao}\n`,
);
console.log(tabela.join("\n"));
console.log(relatorio.conclusao);
