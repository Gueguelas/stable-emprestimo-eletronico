import { expect, test } from "@playwright/test";

test("login renderiza em modo de demonstração", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar como Operações →" })).toBeVisible();
});

test("catálogo carrega dados da API e aplica filtro", async ({ page }) => {
  await page.route("**/v1/equipamentos**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        itens: [
          {
            id: "0798ffed-4000-4a66-9073-22c5a021a201",
            nome: "Notebook de demonstração",
            categoria: "notebook",
            patrimonio: "TI-0142",
            situacao: "disponivel",
            comPessoa: null,
            prazo: null,
            observacao: null
          }
        ],
        proximoCursor: null
      })
    });
  });
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("ana@example.test");
  await page.getByLabel("Senha").fill("senha-dev");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Catálogo" })).toBeVisible();
  await page.getByRole("button", { name: "Disponíveis" }).click();
  await expect(page.getByRole("heading", { name: "Notebook de demonstração" })).toBeVisible();
  await expect(page.getByText("1 de 1 equipamentos disponíveis agora")).toBeVisible();
});

test("problema RFC 9457 aparece como mensagem de erro", async ({ page }) => {
  await page.route("**/v1/equipamentos**", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/problem+json",
      body: JSON.stringify({ title: "Não autorizado", detail: "Token de acesso inválido." })
    });
  });
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("ana@example.test");
  await page.getByLabel("Senha").fill("senha-dev");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await expect(page.getByText("Token de acesso inválido.")).toBeVisible();
});

test("rota de Operações exige sessão e preserva o destino", async ({ page }) => {
  await page.goto("/operacoes");
  await expect(page).toHaveURL(/\/login\?para=%2Foperacoes$/);
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});
