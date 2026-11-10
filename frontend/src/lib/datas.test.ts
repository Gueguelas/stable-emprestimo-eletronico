import { describe, expect, it } from "vitest";
import { adicionarDias, diasAte, estaEmAtraso, formatarData } from "./datas";

describe("test_ca_07_prazo_padrao", () => {
  it("test_ca_07_prazo_de_quatorze_dias_e_formatacao_ptbr", () => {
    expect(adicionarDias("2026-08-31", 14)).toBe("2026-09-14");
    expect(formatarData("2026-09-14")).toBe("14/09/2026");
  });
});

describe("test_ca_08_atraso", () => {
  it("test_ca_08_considera_atrasado_somente_prazo_anterior_a_hoje", () => {
    expect(estaEmAtraso("2026-08-30")).toBe(true);
    expect(estaEmAtraso("2026-08-31")).toBe(false);
    expect(diasAte("2026-09-02")).toBe(2);
  });
});
