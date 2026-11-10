import { EquipamentosService } from "../src/equipamentos/equipamentos.service";
import type { LinhaEquipamento } from "../src/equipamentos/equipamentos.repository";

// Teste unitário do service: a regra crítica aqui é a DERIVAÇÃO da situação
// — o banco nunca guarda "emprestado" (regra de estado derivado, AGENTS.md).
function linha(parcial: Partial<LinhaEquipamento>): LinhaEquipamento {
  return {
    id: "00000000-0000-4000-8000-000000000101",
    nome: "Item",
    categoria: "notebook",
    patrimonio: "TI-0000",
    situacao: "disponivel",
    observacao: null,
    cadastradoEm: new Date("2026-08-20T12:00:00Z"),
    emprestimos: [],
    ...parcial
  };
}

const service = new EquipamentosService({
  listar: jest.fn()
} as never);

describe("EquipamentosService — derivação de situação", () => {
  it("equipamento sem empréstimo em aberto e intrinsecamente disponível → disponivel", async () => {
    (service["repository"].listar as jest.Mock).mockResolvedValue([linha({})]);
    const { itens } = await service.listar(50);
    expect(itens[0]?.situacao).toBe("disponivel");
    expect(itens[0]?.comPessoa).toBeNull();
    expect(itens[0]?.prazo).toBeNull();
  });

  it("equipamento com empréstimo em aberto → emprestado, com pessoa e prazo", async () => {
    (service["repository"].listar as jest.Mock).mockResolvedValue([
      linha({
        emprestimos: [{ prazoEm: new Date("2026-09-07"), user: { nome: "Marcos Lemos" } }]
      })
    ]);
    const { itens } = await service.listar(50);
    expect(itens[0]?.situacao).toBe("emprestado");
    expect(itens[0]?.comPessoa).toBe("Marcos Lemos");
    expect(itens[0]?.prazo).toBe("2026-09-07");
  });

  it("em manutenção nunca vira emprestado, mesmo com empréstimo em aberto no join", async () => {
    (service["repository"].listar as jest.Mock).mockResolvedValue([
      linha({
        situacao: "em_manutencao",
        observacao: "Trava do centro quebrada",
        emprestimos: [{ prazoEm: new Date("2026-09-07"), user: { nome: "Alguém" } }]
      })
    ]);
    const { itens } = await service.listar(50);
    expect(itens[0]?.situacao).toBe("em_manutencao");
    expect(itens[0]?.observacao).toBe("Trava do centro quebrada");
  });

  it("paginação: quando vem limite + 1, o cursor existe e sobram só 'limite' itens", async () => {
    const paginados = Array.from({ length: 3 }, (_, i) =>
      linha({ id: `00000000-0000-4000-8000-00000000010${i}`, cadastradoEm: new Date(2026, 7, 20 + i) })
    );
    (service["repository"].listar as jest.Mock).mockResolvedValue(paginados);
    const { itens, proximoCursor } = await service.listar(2);
    expect(itens).toHaveLength(2);
    expect(proximoCursor).not.toBeNull();
  });

  it("última página: não existe próximo cursor", async () => {
    (service["repository"].listar as jest.Mock).mockResolvedValue([linha({})]);
    const { proximoCursor } = await service.listar(50);
    expect(proximoCursor).toBeNull();
  });
});
