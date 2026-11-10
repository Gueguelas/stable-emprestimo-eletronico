import { hojeSaoPaulo, prazoDe } from "../src/emprestimos/regras";
it("test_ca_003_02_prazo_sao_paulo_meia_noite_mes_e_ano", () => {
  expect(hojeSaoPaulo(new Date("2026-11-11T02:59:00Z"))).toBe("2026-11-10");
  expect(hojeSaoPaulo(new Date("2026-11-11T03:00:00Z"))).toBe("2026-11-11");
  expect(prazoDe("2026-12-25")).toBe("2027-01-08");
  expect(prazoDe("2028-02-20")).toBe("2028-03-05");
});
