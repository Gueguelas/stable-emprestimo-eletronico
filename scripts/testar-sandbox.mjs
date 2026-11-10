import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { raiz } from "./estado.mjs";
const alvo = `${raiz}artifacts/verificador/probe-${randomUUID()}`;
await mkdir(`${raiz}artifacts/verificador`, { recursive: true });
const codigo = `
const fs = require('node:fs'), net = require('node:net');
let escritaBloqueada = false;
try { fs.writeFileSync(${JSON.stringify(alvo)}, 'probe'); }
catch(e) { escritaBloqueada = ['EPERM', 'EACCES'].includes(e.code); }
const socket = net.connect({ host: '1.1.1.1', port: 443 });
let terminou = false;
function fim(redeBloqueada) {
  if(terminou) return; terminou = true; socket.destroy();
  console.log(JSON.stringify({ escritaBloqueada, redeBloqueada }));
  process.exitCode = escritaBloqueada && redeBloqueada ? 0 : 1;
}
socket.once('connect', () => fim(false));
socket.once('error', e => fim(['EPERM', 'EACCES'].includes(e.code)));
socket.setTimeout(2000, () => fim(false));
`;
try {
  const r = spawnSync(
    "codex",
    [
      "sandbox",
      "--config",
      'sandbox_mode="read-only"',
      "--",
      process.execPath,
      "-e",
      codigo,
    ],
    {
      cwd: raiz,
      env: { PATH: process.env.PATH, HOME: process.env.HOME },
      encoding: "utf8",
      timeout: 15000,
    },
  );
  const registro = {
    em: new Date().toISOString(),
    comando:
      'codex sandbox --config sandbox_mode="read-only" -- node <probe de escrita/rede>',
    exitCode: r.status,
    saida: r.stdout,
    erro: r.stderr,
  };
  await mkdir(`${raiz}docs/verificacoes`, { recursive: true });
  await writeFile(
    `${raiz}docs/verificacoes/sandbox.json`,
    JSON.stringify(registro, null, 2) + "\n",
  );
  console.log(r.stdout?.trim());
  if (r.status !== 0)
    throw new Error(
      "Sandbox não comprovou bloqueio de escrita e rede; verificação proibida nesta configuração",
    );
} finally {
  await rm(alvo, { force: true });
}
