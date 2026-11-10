import { PrismaClient, Papel, Categoria, SituacaoItem } from "@prisma/client";

// Seed idempotente (ADR-001, seção 5): cria o tenant suporte_ti e os dados
// de exemplo do ADR-002 (seção 10), referência 31/08/2026.
// Rodar de novo não duplica nada — tudo por upsert com id fixo.
const prisma = new PrismaClient();

const TENANT_ID = "00000000-0000-4000-8000-000000000001";
const USER_IDS = {
  ana: "00000000-0000-4000-8000-000000000002",
  marcos: "00000000-0000-4000-8000-000000000003",
  julia: "00000000-0000-4000-8000-000000000004",
  rafael: "00000000-0000-4000-8000-000000000005",
  camila: "00000000-0000-4000-8000-000000000006"
};

const USUARIOS: Array<{ key: keyof typeof USER_IDS; nome: string; email: string }> = [
  { key: "ana", nome: "Ana Ribeiro", email: "ana.ribeiro@empresa.example" },
  { key: "marcos", nome: "Marcos Lemos", email: "marcos.lemos@empresa.example" },
  { key: "julia", nome: "Júlia Prado", email: "julia.prado@empresa.example" },
  { key: "rafael", nome: "Rafael Souza", email: "rafael.souza@empresa.example" },
  { key: "camila", nome: "Camila Nunes", email: "camila.nunes@empresa.example" }
];

interface Item {
  id: string;
  nome: string;
  categoria: Categoria;
  patrimonio: string;
  situacao: SituacaoItem;
  observacao?: string;
}
/*__CONTINUA__*/

const EQUIPAMENTOS: Item[] = [
  { id: "00000000-0000-4000-8000-000000000101", nome: "Notebook Dell Latitude 5450", categoria: "notebook", patrimonio: "TI-0142", situacao: "disponivel" },
  { id: "00000000-0000-4000-8000-000000000102", nome: "MacBook Pro 14 M3", categoria: "notebook", patrimonio: "TI-0088", situacao: "disponivel" },
  { id: "00000000-0000-4000-8000-000000000103", nome: "Monitor LG 27\u201D 4K", categoria: "monitor", patrimonio: "TI-0231", situacao: "disponivel" },
  { id: "00000000-0000-4000-8000-000000000104", nome: "Monitor Dell 24\u201D FHD", categoria: "monitor", patrimonio: "TI-0233", situacao: "em_manutencao", observacao: "Painel com falha, retorna em 05/09" },
  { id: "00000000-0000-4000-8000-000000000105", nome: "Câmera Sony ZV-1", categoria: "camera", patrimonio: "TI-0301", situacao: "disponivel" },
  { id: "00000000-0000-4000-8000-000000000106", nome: "Cabo HDMI 2.1 3m", categoria: "cabo", patrimonio: "TI-0455", situacao: "disponivel" },
  { id: "00000000-0000-4000-8000-000000000107", nome: "Dock Thunderbolt 4", categoria: "acessorio", patrimonio: "TI-0512", situacao: "disponivel" },
  { id: "00000000-0000-4000-8000-000000000108", nome: "Tripé Manfrotto Befree", categoria: "acessorio", patrimonio: "TI-0318", situacao: "em_manutencao", observacao: "Trava do centro quebrada" },
  { id: "00000000-0000-4000-8000-000000000109", nome: "Headset Jabra Evolve2", categoria: "acessorio", patrimonio: "TI-0402", situacao: "disponivel" },
  { id: "00000000-0000-4000-8000-000000000110", nome: "Notebook Lenovo ThinkPad T14", categoria: "notebook", patrimonio: "TI-0119", situacao: "disponivel" },
  { id: "00000000-0000-4000-8000-000000000111", nome: "Monitor AOC 24\u201D FHD", categoria: "monitor", patrimonio: "TI-0244", situacao: "disponivel" },
  { id: "00000000-0000-4000-8000-000000000112", nome: "Câmera GoPro Hero 12", categoria: "camera", patrimonio: "TI-0307", situacao: "disponivel" }
];
/*__CONTINUA2__*/

interface Emprestimo {
  id: string;
  userKey: keyof typeof USER_IDS;
  equipamentoId: string;
  retirada: string;
  prazo: string;
}

// Empréstimos em aberto do ADR-002 (seção 10). O de Camila está em atraso.
const EMPRESTIMOS: Emprestimo[] = [
  { id: "00000000-0000-4000-8000-000000000201", userKey: "ana", equipamentoId: "00000000-0000-4000-8000-000000000105", retirada: "2026-08-29", prazo: "2026-09-12" },
  { id: "00000000-0000-4000-8000-000000000202", userKey: "ana", equipamentoId: "00000000-0000-4000-8000-000000000107", retirada: "2026-08-22", prazo: "2026-09-05" },
  { id: "00000000-0000-4000-8000-000000000203", userKey: "marcos", equipamentoId: "00000000-0000-4000-8000-000000000102", retirada: "2026-08-24", prazo: "2026-09-07" },
  { id: "00000000-0000-4000-8000-000000000204", userKey: "julia", equipamentoId: "00000000-0000-4000-8000-000000000110", retirada: "2026-08-26", prazo: "2026-09-09" },
  { id: "00000000-0000-4000-8000-000000000205", userKey: "rafael", equipamentoId: "00000000-0000-4000-8000-000000000111", retirada: "2026-08-18", prazo: "2026-09-01" },
  { id: "00000000-0000-4000-8000-000000000206", userKey: "camila", equipamentoId: "00000000-0000-4000-8000-000000000112", retirada: "2026-08-05", prazo: "2026-08-19" }
];
/*__CONTINUA3__*/

async function main(): Promise<void> {
  await prisma.tenant.upsert({
    where: { slug: "suporte_ti" },
    update: {},
    create: { id: TENANT_ID, slug: "suporte_ti", nome: "Suporte de TI" }
  });

  for (const usuario of USUARIOS) {
    // Identidade vive no Supabase Auth; o espelho em auth.users alimenta
    // a FK de users. Em Postgres local o stub da migration recebe as linhas.
    await prisma.$executeRawUnsafe(
      `insert into auth.users (id, email, encrypted_password)
       values ($1::uuid, $2, 'seed-sem-senha')
       on conflict (id) do nothing`,
      USER_IDS[usuario.key],
      usuario.email
    );

    await prisma.user.upsert({
      where: { id: USER_IDS[usuario.key] },
      update: { nome: usuario.nome, email: usuario.email },
      create: { id: USER_IDS[usuario.key], nome: usuario.nome, email: usuario.email }
    });

    await prisma.membership.upsert({
      where: { tenantId_userId: { tenantId: TENANT_ID, userId: USER_IDS[usuario.key] } },
      update: { papel: Papel.colaborador },
      create: {
        tenantId: TENANT_ID,
        userId: USER_IDS[usuario.key],
        papel: Papel.colaborador
      }
    });
  }
/*__CONTINUA4__*/

  for (const item of EQUIPAMENTOS) {
    await prisma.equipamento.upsert({
      where: {
        tenantId_patrimonio: { tenantId: TENANT_ID, patrimonio: item.patrimonio }
      },
      update: {
        nome: item.nome,
        categoria: item.categoria,
        situacao: item.situacao,
        observacao: item.observacao ?? null
      },
      create: {
        id: item.id,
        tenantId: TENANT_ID,
        nome: item.nome,
        categoria: item.categoria,
        patrimonio: item.patrimonio,
        situacao: item.situacao,
        observacao: item.observacao ?? null,
        // cadastrado_em fixo: mantém a ordem do catálogo estável entre seeds
        cadastradoEm: new Date("2026-08-20T12:00:00Z")
      }
    });
  }

  for (const emprestimo of EMPRESTIMOS) {
    await prisma.emprestimo.upsert({
      where: { id: emprestimo.id },
      update: {
        retiradaEm: new Date(emprestimo.retirada),
        prazoEm: new Date(emprestimo.prazo),
        devolvidoEm: null
      },
      create: {
        id: emprestimo.id,
        tenantId: TENANT_ID,
        equipamentoId: emprestimo.equipamentoId,
        userId: USER_IDS[emprestimo.userKey],
        retiradaEm: new Date(emprestimo.retirada),
        prazoEm: new Date(emprestimo.prazo),
        devolvidoEm: null
      }
    });
  }

  const disponiveis = await prisma.equipamento.count({
    where: { tenantId: TENANT_ID, situacao: "disponivel" }
  });
  console.log(
    `Seed concluído: tenant suporte_ti, ${USUARIOS.length} usuários, ` +
      `${EQUIPAMENTOS.length} equipamentos (${disponiveis} intrinsecamente disponíveis), ` +
      `${EMPRESTIMOS.length} empréstimos em aberto.`
  );
}

main()
  .catch((erro) => {
    console.error("Seed falhou:", erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());




