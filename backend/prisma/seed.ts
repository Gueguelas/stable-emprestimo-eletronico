import { PrismaClient, Categoria, SituacaoItem } from "@prisma/client";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import dados from "./equipamentos.json";

export const TENANT_ID = "00000000-0000-4000-8000-000000000001";

export async function popular(
  prisma: PrismaClient,
  imagens: Record<string, string> = {},
) {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "suporte_ti" },
    update: {},
    create: { id: TENANT_ID, slug: "suporte_ti", nome: "Suporte de TI" },
  });
  for (const item of dados) {
    const imagemUrl = imagens[item.patrimonio];
    const valores = {
      nome: item.nome,
      categoria: item.categoria as Categoria,
      situacao: item.situacao as SituacaoItem,
      ...(imagemUrl ? { imagemUrl } : {}),
    };
    await prisma.equipamento.upsert({
      where: {
        tenantId_patrimonio: {
          tenantId: tenant.id,
          patrimonio: item.patrimonio,
        },
      },
      update: valores,
      create: { ...valores, tenantId: tenant.id, patrimonio: item.patrimonio },
    });
  }
  return tenant;
}

async function main() {
  // Impede que o agente execute este seed contra Supabase/produção.
  for (const nome of ["DATABASE_URL", "DIRECT_URL"]) {
    const url = new URL(process.env[nome] ?? "");
    if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
      throw new Error("Seed automático permitido somente em banco local");
    }
  }
  const prisma = new PrismaClient();
  try {
    const args = process.argv.slice(2);
    let imagens: Record<string, string> = {};
    if (args.includes("--manifesto")) {
      const caminho = args[args.indexOf("--manifesto") + 1];
      if (!caminho) throw new Error("Informe o manifesto");
      const script = require(
        resolve(
          __dirname,
          "../../.agents/skills/imagens-equipamentos/scripts/preparar.cjs",
        ),
      );
      await script.validarManifesto(resolve(caminho));
      const manifesto = JSON.parse(readFileSync(caminho, "utf8"));
      const base = args[args.indexOf("--base-publica") + 1];
      if (
        !args.includes("--base-publica") ||
        !base ||
        new URL(base).protocol !== "https:"
      ) {
        throw new Error(
          "Informe --base-publica https://.../storage/v1/object/public/equipamentos/",
        );
      }
      imagens = Object.fromEntries(
        manifesto.itens.map((i: { patrimonio: string; arquivo: string }) => [
          i.patrimonio,
          new URL(i.arquivo, base.replace(/\/?$/, "/")).href,
        ]),
      );
    }
    await popular(prisma, imagens);
    console.log(
      "Seed idempotente concluído: 12 equipamentos; nenhum empréstimo criado.",
    );
  } finally {
    await prisma.$disconnect();
  }
}
if (require.main === module)
  main().catch(() => {
    console.error(
      "Seed não concluído: confira banco local e manifesto aprovado.",
    );
    process.exitCode = 1;
  });
