// Exclusivo do operador. Não importar esta ferramenta na API ou na skill.
import { createInterface } from "node:readline/promises";
import { pathToFileURL } from "node:url";
const email = "marcelo.grilo@institutojef.org.br";

export async function provisionarProfessor({
  entrada = process.stdin,
  ambiente = process.env,
  fetchImpl = globalThis.fetch,
  confirmar,
  log = console.log,
} = {}) {
  if (!entrada.isTTY)
    throw new Error("Operação humana exige terminal interativo");
  const base = new URL(ambiente.SUPABASE_URL ?? "");
  if (base.protocol !== "https:" || !base.hostname.endsWith(".supabase.co"))
    throw new Error("Informe SUPABASE_URL do projeto");
  const chave = ambiente.SUPABASE_SERVICE_ROLE_KEY;
  const senha = ambiente.PROFESSOR_PASSWORD;
  if (!chave || !senha)
    throw new Error(
      "Operador deve fornecer service role e senha ao processo; não editar arquivos de ambiente",
    );
  let resposta;
  if (confirmar) resposta = await confirmar(base.hostname);
  else {
    const rl = createInterface({ input: entrada, output: process.stdout });
    try {
      resposta = await rl.question(
        `Projeto ${base.hostname}. Digite PROVISIONAR para criar/localizar a conta do professor: `,
      );
    } finally {
      rl.close();
    }
  }
  if (resposta !== "PROVISIONAR") throw new Error("Cancelado pelo operador");
  async function api(caminho, method = "GET", body) {
    const r = await fetchImpl(new URL(caminho, base), {
      method,
      headers: {
        apikey: chave,
        Authorization: `Bearer ${chave}`,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!r.ok)
      throw new Error(`Operação administrativa recusada: HTTP ${r.status}`);
    return r.status === 204 ? null : r.json();
  }
  // PostgREST só é usado por esta ferramenta humana, nunca pelo front.
  const tenants = await api("/rest/v1/tenants?slug=eq.suporte_ti&select=id");
  const tenantId = tenants[0]?.id;
  if (!tenantId)
    throw new Error(
      "Aplicar migration e dados pelo fluxo humano antes de provisionar Auth",
    );
  let usuario;
  for (let page = 1; page <= 100; page++) {
    const lista = await api(`/auth/v1/admin/users?page=${page}&per_page=100`);
    usuario = lista.users.find((u) => u.email?.toLowerCase() === email);
    if (usuario || lista.users.length < 100) break;
    if (page === 100)
      throw new Error(
        "Paginação excedida; não criar conta sem confirmar ausência",
      );
  }
  if (usuario) {
    const abertos = await api(
      `/rest/v1/emprestimos?user_id=eq.${usuario.id}&select=id&limit=1`,
    );
    if (abertos.length)
      throw new Error(
        "Conta do professor tem empréstimos; preservar dados e investigar manualmente",
      );
    const outroTenant = usuario.app_metadata?.tenant_id;
    if (outroTenant && outroTenant !== tenantId)
      throw new Error("Conta associada a outro tenant; não sobrescrever");
    usuario = await api(`/auth/v1/admin/users/${usuario.id}`, "PUT", {
      app_metadata: {
        ...usuario.app_metadata,
        tenant_id: tenantId,
        papel: "colaborador",
      },
    });
  } else {
    usuario = await api("/auth/v1/admin/users", "POST", {
      email,
      password: senha,
      email_confirm: true,
      user_metadata: { nome: "Marcelo Grilo" },
      app_metadata: { tenant_id: tenantId, papel: "colaborador" },
    });
  }
  const u = usuario.user ?? usuario;
  // ON CONFLICT por chave natural; não cria empréstimos nem insere diretamente em auth.users.
  async function upsert(tabela, conflito, body) {
    const r = await fetchImpl(
      new URL(`/rest/v1/${tabela}?on_conflict=${conflito}`, base),
      {
        method: "POST",
        headers: {
          apikey: chave,
          Authorization: `Bearer ${chave}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(body),
      },
    );
    if (!r.ok) throw new Error(`Falha no espelho ${tabela}: HTTP ${r.status}`);
  }
  await upsert("users", "id", { id: u.id, nome: "Marcelo Grilo", email });
  await upsert("memberships", "tenant_id,user_id", {
    tenant_id: tenantId,
    user_id: u.id,
    papel: "colaborador",
  });
  // Conferência real sem registrar senha nem resposta que contém tokens.
  const login = await fetchImpl(
    new URL("/auth/v1/token?grant_type=password", base),
    {
      method: "POST",
      headers: { apikey: chave, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: senha }),
    },
  );
  if (!login.ok)
    throw new Error(
      "Conta localizada, mas login com a senha fornecida falhou; nenhuma senha existente foi redefinida",
    );
  log(
    "Conta provisionada e login conferido; teste a Vercel sem criar empréstimos nesta conta.",
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  provisionarProfessor().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
}
