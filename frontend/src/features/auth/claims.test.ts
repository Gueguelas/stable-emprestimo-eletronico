import { describe, expect, it } from "vitest";
import { extrairNome, extrairPapel, iniciais } from "./claims";

describe("test_ca_01_papel_e_nome", () => {
  it("test_ca_01_le_papel_de_app_metadata", () => {
    expect(extrairPapel({ app_metadata: { papel: "operacoes" } })).toBe(
      "operacoes"
    );
  });

  it("test_ca_01_ignora_role_de_topo_authenticated", () => {
    expect(extrairPapel({ role: "authenticated" })).toBe("colaborador");
  });

  it("test_ca_01_aplica_fallback_e_prioridade_de_nome", () => {
    expect(extrairPapel({})).toBe("colaborador");
    expect(
      extrairNome({
        user_metadata: { nome: "Ana Ribeiro" },
        full_name: "Outro Nome",
        email: "ana@example.test"
      })
    ).toBe("Ana Ribeiro");
    expect(iniciais("Ana Ribeiro")).toBe("AR");
  });
});
