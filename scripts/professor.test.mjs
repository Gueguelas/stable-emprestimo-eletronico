import { test } from "node:test";
import assert from "node:assert/strict";
import { provisionarProfessor } from "./provisionar-professor.mjs";

const tenant = "00000000-0000-4000-8000-000000000001";
const userId = "00000000-0000-4000-8000-000000000002";
const ambiente = {
  SUPABASE_URL: "https://fixture.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-sintetica-nao-real",
  PROFESSOR_PASSWORD: "senha-sintetica-de-teste",
};
function fixture() {
  const chamadas = [],
    mensagens = [];
  const estado = {
    usuario: null,
    emprestimos: [],
    login: true,
    espelhos: new Map(),
    membros: new Map(),
  };
  const opcoes = {
    entrada: { isTTY: true },
    ambiente,
    confirmar: async () => "PROVISIONAR",
    log: (mensagem) => mensagens.push(mensagem),
    fetchImpl: async (endereco, opts = {}) => {
      const url = new URL(endereco);
      assert.equal(url.origin, ambiente.SUPABASE_URL);
      const method = opts.method ?? "GET";
      const body = opts.body ? JSON.parse(opts.body) : undefined;
      chamadas.push({ caminho: url.pathname, method, body });
      assert.equal(opts.headers.apikey, ambiente.SUPABASE_SERVICE_ROLE_KEY);
      if (url.pathname === "/rest/v1/tenants")
        return Response.json([{ id: tenant }]);
      if (url.pathname === "/auth/v1/admin/users" && method === "GET")
        return Response.json({ users: estado.usuario ? [estado.usuario] : [] });
      if (url.pathname === "/auth/v1/admin/users" && method === "POST") {
        assert.equal(body.password, ambiente.PROFESSOR_PASSWORD);
        estado.usuario = {
          id: userId,
          email: body.email,
          app_metadata: body.app_metadata,
        };
        return Response.json(estado.usuario);
      }
      if (
        url.pathname === `/auth/v1/admin/users/${userId}` &&
        method === "PUT"
      ) {
        assert.equal(
          "password" in body,
          false,
          "Repetição não pode redefinir senha",
        );
        estado.usuario.app_metadata = body.app_metadata;
        return Response.json({ user: estado.usuario });
      }
      if (url.pathname === "/rest/v1/emprestimos")
        return Response.json(estado.emprestimos);
      if (
        url.pathname === "/rest/v1/users" ||
        url.pathname === "/rest/v1/memberships"
      ) {
        assert.equal(method, "POST");
        assert.equal(opts.headers.Prefer, "resolution=merge-duplicates");
        if (url.pathname.endsWith("memberships")) {
          assert.equal(
            url.searchParams.get("on_conflict"),
            "tenant_id,user_id",
          );
          estado.membros.set(`${body.tenant_id}/${body.user_id}`, body);
        } else estado.espelhos.set(body.id, body);
        return new Response(null, { status: 201 });
      }
      if (url.pathname === "/auth/v1/token") {
        assert.equal(body.password, ambiente.PROFESSOR_PASSWORD);
        return estado.login
          ? Response.json({ access_token: "token-sintetico-nao-registrar" })
          : new Response(null, { status: 400 });
      }
      throw new Error(`Endpoint não esperado no teste: ${url.pathname}`);
    },
  };
  return { estado, chamadas, mensagens, opcoes };
}

test("test_ca_002_05_professor_idempotente_cria_uma_conta_sem_resetar_senha", async () => {
  const f = fixture();
  await provisionarProfessor(f.opcoes);
  await provisionarProfessor(f.opcoes);
  assert.equal(
    f.chamadas.filter(
      (c) => c.caminho === "/auth/v1/admin/users" && c.method === "POST",
    ).length,
    1,
  );
  assert.equal(f.estado.espelhos.size, 1);
  assert.equal(f.estado.membros.size, 1);
  assert.equal([...f.estado.membros.values()][0].papel, "colaborador");
  assert.equal(f.estado.usuario.app_metadata.tenant_id, tenant);
  assert.equal(f.estado.emprestimos.length, 0);
  assert.equal(
    f.chamadas.filter(
      (c) => c.caminho === "/rest/v1/emprestimos" && c.method !== "GET",
    ).length,
    0,
  );
  assert.equal(f.mensagens.length, 2);
  for (const segredo of [
    ambiente.SUPABASE_SERVICE_ROLE_KEY,
    ambiente.PROFESSOR_PASSWORD,
    "token-sintetico-nao-registrar",
  ])
    assert.equal(f.mensagens.join("\n").includes(segredo), false);
});

test("test_ca_002_05_professor_recusa_conta_com_emprestimo_e_tenant_conflitante", async () => {
  for (const motivo of ["emprestimo", "tenant"]) {
    const f = fixture();
    f.estado.usuario = {
      id: userId,
      email: "marcelo.grilo@institutojef.org.br",
      app_metadata: {
        tenant_id: motivo === "tenant" ? "outro-tenant" : tenant,
      },
    };
    if (motivo === "emprestimo")
      f.estado.emprestimos = [{ id: "emprestimo-existente-sintetico" }];
    await assert.rejects(
      provisionarProfessor(f.opcoes),
      motivo === "tenant" ? /outro tenant/ : /tem empréstimos/,
    );
    assert.equal(
      f.chamadas.some((c) => c.method !== "GET"),
      false,
    );
    assert.equal(f.mensagens.length, 0);
  }
});

test("test_ca_002_05_professor_nao_declara_sucesso_se_login_falha", async () => {
  const f = fixture();
  f.estado.login = false;
  await assert.rejects(provisionarProfessor(f.opcoes), /login.*falhou/);
  assert.equal(f.mensagens.length, 0);
});

test("test_ca_002_05_professor_exige_tty_secrets_e_confirmacao_antes_da_api", async () => {
  const f = fixture();
  await assert.rejects(
    provisionarProfessor({ ...f.opcoes, entrada: { isTTY: false } }),
    /terminal interativo/,
  );
  await assert.rejects(
    provisionarProfessor({
      ...f.opcoes,
      ambiente: { SUPABASE_URL: ambiente.SUPABASE_URL },
    }),
    /fornecer service role/,
  );
  await assert.rejects(
    provisionarProfessor({ ...f.opcoes, confirmar: async () => "CANCELAR" }),
    /Cancelado/,
  );
  assert.equal(f.chamadas.length, 0);
});
