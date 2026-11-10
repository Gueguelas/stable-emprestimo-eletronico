// Somente operador humano. A skill de imagens não importa nem chama este arquivo.
const { createRequire } = require("node:module");
const path = require("node:path");
const { createInterface } = require("node:readline/promises");
const { createHash } = require("node:crypto");
const raiz = path.resolve(__dirname, "..");
const backendRequire = createRequire(path.join(raiz, "backend/package.json"));
backendRequire("ts-node").register({
  project: path.join(raiz, "backend/tsconfig.json"),
});
const { PrismaClient } = backendRequire("@prisma/client");
const { popular } = require("../backend/prisma/seed.ts");
const {
  validarManifesto,
} = require("../.agents/skills/imagens-equipamentos/scripts/preparar.cjs");
const dados = require("../backend/prisma/equipamentos.json");

async function main() {
  if (!process.stdin.isTTY)
    throw new Error("Operação humana exige terminal interativo");
  const args = process.argv.slice(2);
  const manifestoPath = args[args.indexOf("--manifesto") + 1];
  const publica = args[args.indexOf("--base-publica") + 1];
  if (
    !args.includes("--manifesto") ||
    !args.includes("--base-publica") ||
    !manifestoPath ||
    !publica
  )
    throw new Error(
      "Informe --manifesto arquivo --base-publica URL-do-bucket/",
    );
  const base = new URL(publica.replace(/\/?$/, "/"));
  if (
    base.protocol !== "https:" ||
    !base.hostname.endsWith(".supabase.co") ||
    !base.pathname.startsWith("/storage/v1/object/public/")
  )
    throw new Error("Base deve ser o bucket público do Supabase");
  const banco = new URL(process.env.DATABASE_URL ?? "");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const resposta = await rl.question(
    `Banco ${banco.hostname}; Storage ${base.hostname}. Confirme que pertencem ao MESMO projeto e digite PUBLICAR DADOS: `,
  );
  rl.close();
  if (resposta !== "PUBLICAR DADOS") throw new Error("Cancelado pelo operador");
  const manifesto = await validarManifesto(path.resolve(manifestoPath));
  const imagens = {};
  for (const foto of manifesto.itens) {
    const url = new URL(foto.arquivo, base);
    const r = await fetch(url, {
      signal: AbortSignal.timeout(30000),
      redirect: "error",
    });
    if (!r.ok) throw new Error(`Foto pública indisponível: ${foto.patrimonio}`);
    const hash = createHash("sha256")
      .update(Buffer.from(await r.arrayBuffer()))
      .digest("hex");
    if (hash !== foto.sha256)
      throw new Error(`Objeto público difere do aprovado: ${foto.patrimonio}`);
    imagens[foto.patrimonio] = url.href;
  }
  const prisma = new PrismaClient();
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: "suporte_ti" },
    });
    if (tenant) {
      const legados = await prisma.equipamento.count({
        where: {
          tenantId: tenant.id,
          patrimonio: { notIn: dados.map((i) => i.patrimonio) },
        },
      });
      if (legados)
        throw new Error(
          "Tenant contém itens fora da prática; não apagar automaticamente. Resolver legado antes de publicar dados.",
        );
    }
    await popular(prisma, imagens);
    console.log(
      "Dados iniciais atualizados sem criar empréstimos. Repetição preserva IDs e empréstimos.",
    );
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
