import { Test } from "@nestjs/testing";
import { ExecutionContext, INestApplication, UnauthorizedException } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "node:child_process";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { JwtGuard } from "../src/auth/jwt.guard";
import { PrismaService } from "../src/prisma/prisma.service";
import { als } from "../src/request-context/contexto";

// Em teste o guard global (APP_GUARD) é substituído por um stub que injeta o
// contexto direto dos cabeçalhos — a validação criptográfica do JWT via JWKS
// é caminho de integração com Supabase e fica fora do escopo deste teste.
// O stub mantém a semântica: sem credencial → 401.
class StubJwtGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<import("express").Request>();
    const tenant = req.headers["x-test-tenant"];
    const user = req.headers["x-test-user"];
    if (typeof tenant !== "string" || typeof user !== "string") {
      throw new UnauthorizedException("StubJwtGuard: faltou x-test-tenant/x-test-user");
    }
    const store = als.getStore();
    if (store) {
      store.tenantId = tenant;
      store.userId = user;
    }
    return true;
  }
}

jest.setTimeout(180000);

const TENANT_A = "00000000-0000-4000-8000-00000000a001";
const TENANT_B = "00000000-0000-4000-8000-00000000b001";
const USER_UM = "00000000-0000-4000-8000-00000000a002";
const USER_OUTRO = "00000000-0000-4000-8000-00000000b002";

describe("GET /v1/equipamentos (Postgres real, migration + seed reais)", () => {
  let container: StartedPostgreSqlContainer;
  let app: INestApplication;
  let prisma: PrismaService;
  const idA1 = "00000000-0000-4000-8000-00000000c001";
  const idA2 = "00000000-0000-4000-8000-00000000c002";
  const idA3 = "00000000-0000-4000-8000-00000000c003";

  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
    const uri = container.getConnectionUri();

    process.env.DATABASE_URL = uri;
    process.env.DIRECT_URL = uri;
    process.env.SUPABASE_URL = "http://localhost:54321";
    process.env.NODE_ENV = "test";

    // Migration e seed REAIS — nunca Prisma mockado (docs/rules/migration.md).
    execSync("npx prisma migrate deploy", {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit"
    });
    execSync("npx prisma db seed", {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit"
    });

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(JwtGuard)
      .useClass(StubJwtGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("v1");
    await app.init();
    prisma = app.get(PrismaService);

    // Dois tenants para provar o isolamento. Users nasce no auth primeiro
    // (FK) — mesmo fluxo do seed.
    await prisma.$executeRawUnsafe(
      `insert into auth.users (id, email, encrypted_password)
       values ($1::uuid, 'um@tenant-a.example', 'teste'),
              ($2::uuid, 'outro@tenant-b.example', 'teste')
       on conflict (id) do nothing`,
      USER_UM,
      USER_OUTRO
    );
    await prisma.user.create({ data: { id: USER_UM, nome: "Usuário Um", email: "um@tenant-a.example" } });
    await prisma.user.create({ data: { id: USER_OUTRO, nome: "Usuário Outro", email: "outro@tenant-b.example" } });
    await prisma.tenant.create({ data: { id: TENANT_A, slug: "tenant-a", nome: "Tenant A" } });
    await prisma.tenant.create({ data: { id: TENANT_B, slug: "tenant-b", nome: "Tenant B" } });
    await prisma.membership.create({ data: { tenantId: TENANT_A, userId: USER_UM } });
    await prisma.membership.create({ data: { tenantId: TENANT_B, userId: USER_OUTRO } });

    await prisma.equipamento.create({ data: { id: idA1, tenantId: TENANT_A, nome: "Notebook A1", categoria: "notebook", patrimonio: "TI-A001", cadastradoEm: new Date("2026-08-01T10:00:00Z") } });
    await prisma.equipamento.create({ data: { id: idA2, tenantId: TENANT_A, nome: "Monitor A2", categoria: "monitor", patrimonio: "TI-A002", situacao: "em_manutencao", observacao: "Painel rachado", cadastradoEm: new Date("2026-08-02T10:00:00Z") } });
    await prisma.equipamento.create({ data: { id: idA3, tenantId: TENANT_A, nome: "Câmera A3", categoria: "camera", patrimonio: "TI-A003", cadastradoEm: new Date("2026-08-03T10:00:00Z") } });
    await prisma.equipamento.create({ data: { tenantId: TENANT_B, nome: "Notebook B1", categoria: "notebook", patrimonio: "TI-B001", cadastradoEm: new Date("2026-08-04T10:00:00Z") } });

    await prisma.emprestimo.create({
      data: {
        tenantId: TENANT_A,
        equipamentoId: idA3,
        userId: USER_UM,
        retiradaEm: new Date("2026-08-20"),
        prazoEm: new Date("2026-09-03")
      }
    });
  });

  afterAll(async () => {
    await app?.close();
    await container?.stop();
  });

  it("401 sem credencial", async () => {
    const resposta = await request(app.getHttpServer()).get("/v1/equipamentos");
    expect(resposta.status).toBe(401);
    expect(resposta.body.title).toBe("Não autenticado");
  });

  it("lista só os equipamentos do tenant do token", async () => {
    const resposta = await request(app.getHttpServer())
      .get("/v1/equipamentos")
      .set("x-test-tenant", TENANT_A)
      .set("x-test-user", USER_UM);

    expect(resposta.status).toBe(200);
    const nomes = resposta.body.itens.map((i: { nome: string }) => i.nome);
    expect(nomes).toHaveLength(3);
    expect(nomes).toContain("Notebook A1");
    expect(nomes).not.toContain("Notebook B1");
  });

  it("deriva a situação: disponivel, emprestado (com quem e prazo) e em_manutencao", async () => {
    const resposta = await request(app.getHttpServer())
      .get("/v1/equipamentos")
      .set("x-test-tenant", TENANT_A)
      .set("x-test-user", USER_UM);

    const itens = resposta.body.itens as Array<{
      nome: string;
      situacao: string;
      comPessoa: string | null;
      prazo: string | null;
      observacao: string | null;
    }>;
    const item = (nome: string) => {
      const encontrado = itens.find((i) => i.nome === nome);
      if (!encontrado) {
        throw new Error(`Equipamento ${nome} não veio na resposta`);
      }
      return encontrado;
    };

    const notebook = item("Notebook A1");
    expect(notebook.situacao).toBe("disponivel");
    expect(notebook.comPessoa).toBeNull();
    expect(notebook.prazo).toBeNull();

    const camera = item("Câmera A3");
    expect(camera.situacao).toBe("emprestado");
    expect(camera.comPessoa).toBe("Usuário Um");
    expect(camera.prazo).toBe("2026-09-03");

    const monitor = item("Monitor A2");
    expect(monitor.situacao).toBe("em_manutencao");
    expect(monitor.observacao).toBe("Painel rachado");
  });

  it("paginação por cursor", async () => {
    const primeira = await request(app.getHttpServer())
      .get("/v1/equipamentos?limite=2")
      .set("x-test-tenant", TENANT_A)
      .set("x-test-user", USER_UM);

    expect(primeira.status).toBe(200);
    expect(primeira.body.itens).toHaveLength(2);
    expect(primeira.body.proximoCursor).not.toBeNull();

    const segunda = await request(app.getHttpServer())
      .get(`/v1/equipamentos?limite=2&cursor=${encodeURIComponent(primeira.body.proximoCursor)}`)
      .set("x-test-tenant", TENANT_A)
      .set("x-test-user", USER_UM);

    expect(segunda.status).toBe(200);
    expect(segunda.body.itens).toHaveLength(1);
    expect(segunda.body.proximoCursor).toBeNull();

    const idsPrimeira = primeira.body.itens.map((i: { id: string }) => i.id);
    const idsSegunda = segunda.body.itens.map((i: { id: string }) => i.id);
    expect([...idsPrimeira, ...idsSegunda]).toHaveLength(3);
  });
});


