import { describe, it, expect } from "vitest";
import { acaoReal } from "./regrasReais";
import type { Equipamento } from "@/api/schemas";
import type { EmprestimoDto } from "@/api/generated/model";
const item: Equipamento = {
  id: "i1",
  nome: "Item",
  patrimonio: "TI-0001",
  categoria: "notebook",
  situacao: "disponivel",
  observacao: null,
  prazo: null,
  comPessoa: null,
};
const loan: EmprestimoDto = {
  id: "l1",
  equipamentoId: "outro",
  equipamento: "Outro",
  patrimonio: "TI-0002",
  categoria: "notebook",
  retirada: "2026-10-27",
  prazo: "2026-11-10",
};
describe("regras reais — UI derivada da sessão e dos IDs", () => {
  it("test_ca_003_04_vencendo_hoje_permite_atraso_bloqueia", () => {
    expect(acaoReal(item, [loan], "2026-11-10", true)).toBe("Solicitar empréstimo");
    expect(acaoReal(item, [loan], "2026-11-11", true)).toBe("Bloqueado por atraso");
    expect(acaoReal(item, [loan, loan, loan], "2026-11-10", true)).toBe("Limite de 3 itens");
  });
  it("test_ca_003_06_08_nome_nao_da_posse_e_erro_de_conta_bloqueia", () => {
    expect(acaoReal({ ...item, comPessoa: "Mesmo nome" }, [], "2026-11-10", true)).toBe(
      "Solicitar empréstimo",
    );
    expect(acaoReal(item, [{ ...loan, equipamentoId: item.id }], "2026-11-10", true)).toBe(
      "Está com você",
    );
    expect(acaoReal(item, [], "2026-11-10", false)).toBe("Aguardando dados da conta");
    expect(acaoReal({ ...item, situacao: "em_manutencao" }, [], "2026-11-10", true)).toBe(
      "Indisponível",
    );
  });
});
