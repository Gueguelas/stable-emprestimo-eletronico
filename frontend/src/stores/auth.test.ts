import { afterEach, expect, it, vi } from "vitest";
import { useAuth } from "./auth";
afterEach(() => {
  vi.unstubAllEnvs();
  useAuth.setState({ usuario: null, erro: null });
});
it("test_ca_003_01_producao_sem_auth_nao_aceita_login_demo", async () => {
  vi.stubEnv("DEV", false);
  await useAuth.getState().entrar("pessoa@example.test", "credencial-de-teste");
  expect(useAuth.getState().usuario).toBeNull();
  expect(useAuth.getState().erro).toContain("não configurada");
  useAuth.getState().entrarComoOperacoes();
  expect(useAuth.getState().usuario).toBeNull();
});
