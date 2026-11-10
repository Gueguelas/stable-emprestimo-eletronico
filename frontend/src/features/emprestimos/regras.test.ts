import { describe, expect, it } from "vitest";
import {
  acaoDoCard,
  filtrarEquipamentos,
  resumoEmprestimos,
  situacaoDoPrazo
} from "./regras";
import type { Equipamento } from "@/api/schemas";
import type { Emprestimo } from "@/stores/emprestimosMock";

const equipamento: Equipamento = {
  id: "0798ffed-4000-4a66-9073-22c5a021a201",
  nome: "Notebook de teste",
  categoria: "notebook",
  patrimonio: "TI-0142",
  situacao: "disponivel",
  comPessoa: null,
  prazo: null,
  observacao: null
};

const emprestimos: Emprestimo[] = [];

describe("test_ca_06_limite_e_atraso", () => {
  it("test_ca_06_limite_de_tres_desabilita_solicitacao", () => {
    const tres = [1, 2, 3].map((n) => ({
      id: `${n}`,
      equipamento: `Item ${n}`,
      patrimonio: `TI-${n}`,
      pessoa: "Ana Ribeiro",
      retirada: "2026-08-20",
      prazo: "2026-09-10",
      devolvido: false,
      categoria: "notebook" as const
    }));
    expect(acaoDoCard(equipamento, "Ana Ribeiro", tres).texto).toBe(
      "Limite de 3 itens"
    );
  });

  it("test_ca_08_atraso_tem_precedencia_sobre_limite", () => {
    const tresComAtraso = [1, 2, 3].map((n) => ({
      id: `${n}`,
      equipamento: `Item ${n}`,
      patrimonio: `TI-${n}`,
      pessoa: "Ana Ribeiro",
      retirada: "2026-08-01",
      prazo: n === 1 ? "2026-08-30" : "2026-09-10",
      devolvido: false,
      categoria: "notebook" as const
    }));
    expect(acaoDoCard(equipamento, "Ana Ribeiro", tresComAtraso).texto).toBe(
      "Bloqueado por atraso"
    );
  });
});

describe("test_ca_09_situacoes_de_equipamento", () => {
  it("test_ca_09_manutenção_comigo_e_emprestado_tem_rotulos_proprios", () => {
    expect(
      acaoDoCard(
        { ...equipamento, situacao: "em_manutencao" },
        "Ana Ribeiro",
        emprestimos
      ).texto
    ).toBe("Indisponível");
    expect(
      acaoDoCard(
        { ...equipamento, comPessoa: "Ana Ribeiro" },
        "Ana Ribeiro",
        emprestimos
      ).texto
    ).toBe("Está com você");
    expect(
      acaoDoCard(
        { ...equipamento, situacao: "emprestado", comPessoa: "Marcos" },
        "Ana Ribeiro",
        emprestimos
      ).texto
    ).toBe("Emprestado");
  });

  it("test_ca_09_item_ja_emprestado_para_usuario_tem_precedencia", () => {
    const meuEmprestimo = {
      id: "loan",
      equipamento: "Notebook de teste",
      patrimonio: "TI-0142",
      pessoa: "Ana Ribeiro",
      retirada: "2026-08-30",
      prazo: "2026-09-10",
      devolvido: false,
      categoria: "notebook" as const
    };
    expect(acaoDoCard(equipamento, "Ana Ribeiro", [meuEmprestimo]).texto).toBe(
      "Está com você"
    );
    expect(
      acaoDoCard(
        { ...equipamento, situacao: "em_manutencao" },
        "Ana Ribeiro",
        [meuEmprestimo]
      ).texto
    ).toBe("Indisponível");
  });

  it("test_ca_08_atraso_bloqueia_mesmo_sem_atingir_limite", () => {
    const atrasado: Emprestimo = {
      id: "late",
      equipamento: "Item vencido",
      patrimonio: "TI-0001",
      pessoa: "Ana Ribeiro",
      retirada: "2026-08-01",
      prazo: "2026-08-30",
      devolvido: false,
      categoria: "notebook"
    };
    expect(acaoDoCard(equipamento, "Ana Ribeiro", [atrasado]).texto).toBe(
      "Bloqueado por atraso"
    );
  });
});

describe("test_ca_07_prazo_a_vencer", () => {
  it("test_ca_07_define_limite_de_dois_dias_e_prazo_em_dia", () => {
    expect(situacaoDoPrazo("2026-08-30")).toBe("em_atraso");
    expect(situacaoDoPrazo("2026-09-02")).toBe("a_vencer");
    expect(situacaoDoPrazo("2026-09-03")).toBe("em_dia");
  });
});

describe("test_ca_02_busca_e_filtro", () => {
  it("test_ca_02_busca_nome_patrimonio_e_filtro_sao_combinados", () => {
    const lista = [
      equipamento,
      { ...equipamento, id: "0798ffed-4000-4a66-9073-22c5a021a202", patrimonio: "TI-1000", situacao: "em_manutencao" as const }
    ];
    expect(filtrarEquipamentos(lista, "notebook", "todos")).toHaveLength(2);
    expect(filtrarEquipamentos(lista, "ti-1000", "em_manutencao")).toHaveLength(1);
    expect(filtrarEquipamentos(lista, "", "disponivel")).toHaveLength(1);
  });

  it("test_ca_05_kpis_sao_gerados_dos_dados", () => {
    const kpis = resumoEmprestimos(
      [
        {
          id: "1",
          equipamento: "GoPro",
          patrimonio: "TI-0307",
          pessoa: "Camila Nunes",
          retirada: "2026-08-01",
          prazo: "2026-08-19",
          devolvido: false,
          categoria: "camera"
        }
      ],
      [equipamento, { ...equipamento, id: "0798ffed-4000-4a66-9073-22c5a021a205", situacao: "em_manutencao" }]
    );
    expect(kpis).toEqual({ emAberto: 1, emAtraso: 1, disponiveis: 1, manutencao: 1 });
  });
});
