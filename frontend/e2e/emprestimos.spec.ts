import { expect, test, type Page } from "@playwright/test";
import type { EmprestimoDto } from "../src/api/generated/model";

async function entrar(page: Page) {
  await page.getByLabel("E-mail").fill("colaborador@example.test");
  await page.getByLabel("Senha").fill("credencial-sintetica-de-teste");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

test.describe("spec 003 — interface com API interceptada; persistência real coberta no Postgres", () => {
  let loans: EmprestimoDto[];
  let recusa: { status: number; detail: string } | null;
  let pedidos: number;
  test.beforeEach(async ({ page }) => {
    loans = [];
    recusa = null;
    pedidos = 0;
    await page.route("**/v1/sessao", (route) =>
      route.fulfill({
        json: {
          userId: "00000000-0000-4000-8000-000000000002",
          tenantId: "00000000-0000-4000-8000-000000000001",
          nome: "Pessoa teste",
          email: "colaborador@example.test",
          papel: "colaborador",
          hoje: "2026-11-10",
          prazoPrevisto: "2026-11-24",
          limite: 3,
        },
      }),
    );
    await page.route("**/v1/equipamentos**", (route) =>
      route.fulfill({
        json: {
          itens: Array.from({ length: 12 }, (_, n) => ({
            id: `00000000-0000-4000-8000-${String(n + 1).padStart(12, "0")}`,
            nome: `Equipamento ${n + 1}`,
            patrimonio: `TI-${String(n + 1).padStart(4, "0")}`,
            categoria: "notebook",
            situacao:
              n === 3 || n === 6
                ? "em_manutencao"
                : loans.some((e) => e.equipamentoId.endsWith(String(n + 1).padStart(12, "0")))
                  ? "emprestado"
                  : "disponivel",
            comPessoa: null,
            prazo: null,
            observacao: null,
            imagemUrl: null,
          })),
          proximoCursor: null,
        },
      }),
    );
    await page.route("**/v1/emprestimos**", async (route) => {
      if (route.request().method() === "GET") return route.fulfill({ json: { itens: loans } });
      pedidos++;
      if (recusa)
        return route.fulfill({
          status: recusa.status,
          json: { title: "Requisição recusada", detail: recusa.detail, status: recusa.status },
        });
      const equipamentoId = route.request().postDataJSON().equipamentoId as string;
      const n = Number(equipamentoId.slice(-12));
      const e: EmprestimoDto = {
        id: "00000000-0000-4000-8000-000000009001",
        equipamentoId,
        equipamento: `Equipamento ${n}`,
        patrimonio: `TI-${String(n).padStart(4, "0")}`,
        categoria: "notebook",
        retirada: "2026-11-10",
        prazo: "2026-11-24",
      };
      loans.push(e);
      return route.fulfill({ status: 201, json: e });
    });
    await page.goto("/login");
    await entrar(page);
    await expect(
      page.getByRole("button", { name: "Solicitar empréstimo", exact: true }).first(),
    ).toBeEnabled();
  });

  test("test_ca_003_07_catalogo_12_busca_filtro_imagem_fallback_e_credito", async ({ page }) => {
    await expect(page.locator(".equipment-card")).toHaveCount(12);
    await expect(page.getByRole("button", { name: "Indisponível", exact: true })).toHaveCount(2);
    await expect(page.getByRole("link", { name: "Fotos: Pixabay" })).toHaveAttribute(
      "href",
      "https://pixabay.com/pt/",
    );
    const foto = page.locator(".equipment-photo").first();
    const proporcao = await foto.evaluate(
      (e) => e.getBoundingClientRect().width / e.getBoundingClientRect().height,
    );
    expect(proporcao).toBeCloseTo(4 / 3, 1);
    await expect(foto).toHaveAttribute("aria-label", /Imagem indisponível/);
    await page.getByRole("button", { name: "Em manutenção", exact: true }).click();
    await expect(page.locator(".equipment-card")).toHaveCount(2);
    await page.getByPlaceholder("Buscar por nome ou patrimônio").fill("TI-0004");
    await expect(page.locator(".equipment-card")).toHaveCount(1);
    await page.getByPlaceholder("Buscar por nome ou patrimônio").fill("inexistente");
    await expect(page.getByText("Nenhum equipamento corresponde à busca.")).toBeVisible();
  });

  test("test_ca_003_07_loading_imagem_carregada_e_falha_de_download", async ({ page }) => {
    // Fixture vetorial de teste, sem foto de equipamento ou alegação de revisão real.
    await page.route("**/fixture-imagem/**", (route) =>
      route.request().url().endsWith("ok.svg")
        ? route.fulfill({
            contentType: "image/svg+xml",
            body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#232532"/></svg>',
          })
        : route.abort(),
    );
    let liberar = () => {};
    const aguardando = new Promise<void>((resolve) => {
      liberar = resolve;
    });
    await page.route("**/v1/equipamentos**", async (route) => {
      await aguardando;
      return route.fulfill({
        json: {
          itens: ["ok", "falha"].map((tipo, n) => ({
            id: `00000000-0000-4000-8000-${String(n + 1).padStart(12, "0")}`,
            nome: `Imagem ${tipo}`,
            patrimonio: `TI-000${n + 1}`,
            categoria: "notebook",
            situacao: "disponivel",
            comPessoa: null,
            prazo: null,
            observacao: null,
            imagemUrl: `https://assets.example.test/fixture-imagem/${tipo}.svg`,
          })),
          proximoCursor: null,
        },
      });
    });
    await page.reload();
    await entrar(page);
    try {
      await expect(page.getByRole("status")).toHaveText("Carregando equipamentos…");
    } finally {
      liberar();
    }
    const imagem = page.getByRole("img", { name: "Imagem ok", exact: true });
    await expect(imagem).toBeVisible();
    await expect.poll(() => imagem.evaluate((e) => (e as HTMLImageElement).naturalWidth)).toBe(800);
    expect(await imagem.evaluate((e) => (e as HTMLImageElement).naturalHeight)).toBe(600);
    expect(
      await imagem.evaluate(
        (e) => e.getBoundingClientRect().width / e.getBoundingClientRect().height,
      ),
    ).toBeCloseTo(4 / 3, 1);
    await expect(
      page.getByRole("img", { name: "Imagem indisponível: Imagem falha", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0);
  });

  test("test_ca_003_08_solicita_atualiza_e_preserva_apos_reload_e_relogin_demo", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Solicitar empréstimo", exact: true }).first().click();
    await expect(page.getByRole("dialog")).toContainText("24/11/2026");
    await page.getByRole("button", { name: "Confirmar solicitação" }).click();
    await expect(page.getByRole("button", { name: "Está com você" })).toBeVisible();
    expect(pedidos).toBe(1);
    await page.getByRole("link", { name: "Meus empréstimos", exact: true }).click();
    await expect(page.locator(".loan-row")).toHaveCount(1);
    await expect(page.locator(".loan-row")).toContainText("24/11/2026");
    await page.reload();
    // Modo demo não persiste sessão: reautenticar; o empréstimo segue na API.
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
    await entrar(page);
    await page.getByRole("link", { name: "Meus empréstimos", exact: true }).click();
    await expect(page.locator(".loan-row")).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Devolver", exact: true })).toHaveCount(0);
  });

  for (const [status, detail] of [
    [422, "Limite de 3 itens atingido"],
    [422, "Bloqueado por empréstimo em atraso"],
    [409, "Equipamento já emprestado"],
  ] as const) {
    test(`test_ca_003_08_mostra_recusa_${detail}`, async ({ page }) => {
      recusa = { status, detail };
      await page.getByRole("button", { name: "Solicitar empréstimo", exact: true }).first().click();
      await page.getByRole("button", { name: "Confirmar solicitação" }).click();
      await expect(page.getByRole("dialog").getByRole("alert")).toHaveText(detail);
      expect(loans).toHaveLength(0);
    });
  }
  test("test_ca_003_08_falha_da_conta_bloqueia_sem_assumir_zero", async ({ page }) => {
    await page.route("**/v1/emprestimos**", (route) =>
      route.fulfill({ status: 500, json: { detail: "Falha de leitura" } }),
    );
    await page.reload();
    await entrar(page);
    await expect(
      page.getByText(
        "Não foi possível carregar os dados da sua conta. As solicitações estão bloqueadas.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Solicitar empréstimo", exact: true }),
    ).toHaveCount(0);
  });
  test("test_ca_003_08_duplo_clique_na_confirmacao_envia_uma_vez", async ({ page }) => {
    await page.route("**/v1/emprestimos", async (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      pedidos++;
      await new Promise((resolve) => setTimeout(resolve, 300));
      return route.fulfill({ status: 409, json: { detail: "Equipamento já emprestado" } });
    });
    await page.getByRole("button", { name: "Solicitar empréstimo", exact: true }).first().click();
    await page.getByRole("button", { name: "Confirmar solicitação" }).dblclick();
    await expect(page.getByRole("dialog").getByRole("alert")).toHaveText(
      "Equipamento já emprestado",
    );
    expect(pedidos).toBe(1);
  });
});
