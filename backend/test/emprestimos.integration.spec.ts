import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { execFileSync } from "node:child_process";
import { createServer, Server } from "node:http";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { Relogio } from "../src/emprestimos/regras";
import { popular, TENANT_ID } from "../prisma/seed";

jest.setTimeout(180000);
const A = TENANT_ID;
const B = "00000000-0000-4000-8000-00000000b001";
const U1 = "00000000-0000-4000-8000-00000000a002";
const U2 = "00000000-0000-4000-8000-00000000a003";
const U3 = "00000000-0000-4000-8000-00000000b002";
const SEM_MEMBRO = "00000000-0000-4000-8000-00000000a099";
const hoje = "2026-11-10";

describe("prática 002/003 — Postgres real e JWT verificado via JWKS local", () => {
  let container: StartedPostgreSqlContainer;
  let app: INestApplication;
  let db: PrismaService;
  let servidor: Server;
  let issuer: string;
  let chave: Awaited<ReturnType<typeof generateKeyPair>>;
  let token1: string, token2: string;
  let ids: string[];
  let manutencao: string;

  async function token(
    userId = U1,
    claims: Record<string, unknown> = { app_metadata: { tenant_id: A } },
  ) {
    return new SignJWT(claims)
      .setProtectedHeader({ alg: "ES256", kid: "teste" })
      .setSubject(userId)
      .setIssuer(issuer)
      .setAudience("authenticated")
      .setExpirationTime("5m")
      .sign(chave.privateKey);
  }
  function get(url: string, t = token1) {
    return request(app.getHttpServer()).get(url).auth(t, { type: "bearer" });
  }
  function post(id: string, t = token1) {
    return request(app.getHttpServer())
      .post("/v1/emprestimos")
      .auth(t, { type: "bearer" })
      .send({ equipamentoId: id });
  }
  async function aberto(
    userId: string,
    equipamentoId: string,
    prazo = "2026-11-24",
  ) {
    return db.emprestimo.create({
      data: {
        tenantId: A,
        userId,
        equipamentoId,
        retiradaEm: new Date(hoje),
        prazoEm: new Date(prazo),
      },
    });
  }
  beforeAll(async () => {
    container = await new PostgreSqlContainer("postgres:16-alpine").start();
    const uri = container.getConnectionUri();
    process.env.DATABASE_URL = uri;
    process.env.DIRECT_URL = uri;
    process.env.NODE_ENV = "test";
    chave = await generateKeyPair("ES256");
    const jwk = {
      ...(await exportJWK(chave.publicKey)),
      kid: "teste",
      alg: "ES256",
    };
    servidor = createServer((_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ keys: [jwk] }));
    });
    await new Promise<void>((resolve) =>
      servidor.listen(0, "127.0.0.1", resolve),
    );
    const address = servidor.address();
    if (!address || typeof address === "string")
      throw new Error("JWKS não iniciou");
    process.env.SUPABASE_URL = `http://127.0.0.1:${address.port}`;
    issuer = `${process.env.SUPABASE_URL}/auth/v1`;
    // Reset real: aplica todas as migrations e executa seed do zero.
    execFileSync(
      "node",
      ["node_modules/prisma/build/index.js", "migrate", "reset", "--force"],
      { env: process.env, stdio: "pipe" },
    );
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(Relogio)
      .useValue({ agora: () => new Date("2026-11-10T12:00:00Z") })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix("v1");
    await app.init();
    db = app.get(PrismaService);
    await db.tenant.create({ data: { id: B, slug: "tenant-b", nome: "B" } });
    for (const [userId, tenantId] of [
      [U1, A],
      [U2, A],
      [U3, B],
    ]) {
      const email = `${userId}@example.test`;
      await db.$executeRaw`insert into auth.users(id,email) values (${userId}::uuid,${email})`;
      await db.user.create({
        data: { id: userId!, email, nome: "Mesmo nome" },
      });
      await db.membership.create({
        data: { tenantId: tenantId!, userId: userId! },
      });
    }
    ids = (
      await db.equipamento.findMany({
        where: { tenantId: A, situacao: "disponivel" },
        orderBy: { patrimonio: "asc" },
      })
    ).map((i) => i.id);
    manutencao = (
      await db.equipamento.findFirstOrThrow({
        where: { tenantId: A, situacao: "em_manutencao" },
      })
    ).id;
    token1 = await token();
    token2 = await token(U2);
  });
  beforeEach(async () => {
    await db.emprestimo.deleteMany();
  });
  afterAll(async () => {
    await app?.close();
    if (servidor)
      await new Promise<void>((resolve, reject) =>
        servidor.close((e) => (e ? reject(e) : resolve())),
      );
    await container?.stop();
  });

  it("test_ca_002_01_02_seed_exato_idempotente_preserva_emprestimo", async () => {
    const itens = await db.equipamento.findMany({ where: { tenantId: A } });
    expect(itens).toHaveLength(12);
    expect(
      itens
        .filter((i) => i.situacao === "em_manutencao")
        .map((i) => i.patrimonio)
        .sort(),
    ).toEqual(["TI-0004", "TI-0007"]);
    for (const [categoria, n] of [
      ["notebook", 4],
      ["monitor", 3],
      ["cabo", 3],
      ["camera", 2],
    ])
      expect(itens.filter((i) => i.categoria === categoria)).toHaveLength(
        n as number,
      );
    expect(await db.emprestimo.count()).toBe(0);
    const loan = await aberto(U1, ids[0]!);
    await popular(db);
    await popular(db);
    expect(
      (await db.equipamento.findMany({ where: { tenantId: A } }))
        .map((i) => i.id)
        .sort(),
    ).toEqual(itens.map((i) => i.id).sort());
    expect(
      await db.emprestimo.findUnique({ where: { id: loan.id } }),
    ).not.toBeNull();
  });
  it("test_ca_003_01_jwt_assinado_claims_membership_e_body", async () => {
    const semToken = await request(app.getHttpServer()).get("/v1/sessao");
    expect(semToken.status).toBe(401);
    expect(semToken.body.title).toBe("Não autenticado");
    for (const t of [
      "falso",
      await token(U1, { tenant_id: A, app_metadata: { tenant_id: B } }),
      await token(U1, { tenant_id: "nao-uuid" }),
      await token(U1, { user_metadata: { tenant_id: A } }),
    ]) {
      const r = await get("/v1/sessao", t);
      expect(r.status).toBe(401);
      expect(r.body.status).toBe(401);
    }
    const semMembro = await get("/v1/sessao", await token(SEM_MEMBRO));
    expect(semMembro.status).toBe(403);
    expect(semMembro.body.detail).toContain("vínculo");
    const top = await get("/v1/sessao", await token(U1, { tenant_id: A }));
    expect(top.status).toBe(200);
    expect(top.body).toMatchObject({
      userId: U1,
      tenantId: A,
      hoje,
      limite: 3,
      prazoPrevisto: "2026-11-24",
    });
    const extra = await request(app.getHttpServer())
      .post("/v1/emprestimos")
      .auth(token1, { type: "bearer" })
      .send({ equipamentoId: ids[0], tenantId: B });
    expect(extra.status).toBe(400);
    expect(extra.body.status).toBe(400);
  });
  it("test_ca_003_02_persistencia_prazo_e_catalogo_derivado", async () => {
    const r = await post(ids[0]!);
    expect(r.status).toBe(201);
    expect(r.body).toMatchObject({
      equipamentoId: ids[0],
      retirada: hoje,
      prazo: "2026-11-24",
    });
    const lista = await get("/v1/emprestimos?status=abertos");
    expect(lista.status).toBe(200);
    expect(lista.body.itens.map((i: { id: string }) => i.id)).toEqual([
      r.body.id,
    ]);
    const novamente = await get("/v1/emprestimos?status=abertos");
    expect(novamente.status).toBe(200);
    expect(novamente.body).toEqual(lista.body);
    const catalogo = await get("/v1/equipamentos");
    expect(catalogo.status).toBe(200);
    expect(
      catalogo.body.itens.find((i: { id: string }) => i.id === ids[0]).situacao,
    ).toBe("emprestado");
  });
  it("test_ca_003_03_manutencao_e_ocupado", async () => {
    const m = await post(manutencao);
    expect(m.status).toBe(409);
    expect(m.body.detail).toContain("manutenção");
    await aberto(U2, ids[0]!);
    const o = await post(ids[0]!);
    expect(o.status).toBe(409);
    expect(o.body.detail).toContain("emprestado");
    expect(await db.emprestimo.count()).toBe(1);
  });
  it("test_ca_003_04_limite_atraso_e_vencimento_hoje", async () => {
    for (const id of ids.slice(0, 3)) await aberto(U1, id);
    const limite = await post(ids[3]!);
    expect(limite.status).toBe(422);
    expect(limite.body.detail).toContain("Limite de 3");
    await db.emprestimo.updateMany({
      data: {
        retiradaEm: new Date("2026-10-26"),
        prazoEm: new Date("2026-11-09"),
      },
    });
    const atraso = await post(ids[3]!);
    expect(atraso.status).toBe(422);
    expect(atraso.body.detail).toContain("atraso");
    await db.emprestimo.deleteMany();
    await aberto(U1, ids[0]!, hoje);
    const vencendo = await post(ids[1]!);
    expect(vencendo.status).toBe(201);
    expect(vencendo.body.prazo).toBe("2026-11-24");
  });
  it("test_ca_003_05_concorrencia_mesmo_equipamento", async () => {
    const r = await Promise.all([post(ids[0]!, token1), post(ids[0]!, token2)]);
    expect(r.map((i) => i.status).sort()).toEqual([201, 409]);
    expect(r.find((i) => i.status === 409)?.body.detail).toContain(
      "emprestado",
    );
    expect(await db.emprestimo.count()).toBe(1);
  });
  it("test_ca_003_05_concorrencia_mesmo_usuario_limite", async () => {
    await aberto(U1, ids[0]!);
    await aberto(U1, ids[1]!);
    const r = await Promise.all(ids.slice(2, 7).map((id) => post(id)));
    expect(r.filter((i) => i.status === 201)).toHaveLength(1);
    expect(r.filter((i) => i.status === 422)).toHaveLength(4);
    expect(
      r
        .filter((i) => i.status === 422)
        .every((i) => i.body.detail.includes("Limite de 3")),
    ).toBe(true);
    expect(
      await db.emprestimo.count({ where: { userId: U1, devolvidoEm: null } }),
    ).toBe(3);
  });
  it("test_ca_003_06_isolamento_mesmo_tenant_outro_tenant_e_rls_sem_bypass", async () => {
    const meu = await aberto(U1, ids[0]!);
    await aberto(U2, ids[1]!);
    const lista = await get("/v1/emprestimos");
    expect(lista.status).toBe(200);
    expect(lista.body.itens.map((i: { id: string }) => i.id)).toEqual([meu.id]);
    const outro = await token(U3, { tenant_id: B });
    const catalogo = await get("/v1/equipamentos", outro);
    expect(catalogo.status).toBe(200);
    expect(catalogo.body.itens).toEqual([]);
    const solicitar = await post(ids[0]!, outro);
    expect(solicitar.status).toBe(404);
    expect(solicitar.body.detail).toContain("não encontrado");
    await db.$executeRawUnsafe(
      "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='stable_reader') THEN CREATE ROLE stable_reader NOLOGIN NOBYPASSRLS; END IF; END $$",
    );
    await db.$executeRawUnsafe(
      "GRANT USAGE ON SCHEMA public, auth TO stable_reader",
    );
    await db.$executeRawUnsafe(
      "GRANT SELECT ON ALL TABLES IN SCHEMA public TO stable_reader",
    );
    async function como(userId: string) {
      return db.$transaction(async (tx) => {
        await tx.$executeRawUnsafe("SET LOCAL ROLE stable_reader");
        await tx.$queryRaw`select set_config('request.jwt.claim.sub', ${userId}, true)`;
        return {
          loans: await tx.emprestimo.findMany(),
          itens: await tx.equipamento.count(),
          membros: await tx.membership.count(),
        };
      });
    }
    const a = await como(U1);
    expect(a.loans.map((i) => i.id)).toEqual([meu.id]);
    expect(a.itens).toBe(12);
    expect(a.membros).toBe(1);
    const b = await como(U3);
    expect(b.loans).toEqual([]);
    expect(b.itens).toBe(0);
  });
});
