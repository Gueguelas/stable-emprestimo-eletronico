import { create } from "zustand";
import type { Equipamento } from "@/api/schemas";
import { equipamentosMock as iniciais } from "@/mocks/fixtures";

interface EstadoEquipamentos {
  equipamentos: Equipamento[];
  adicionar: (equipamento: Equipamento) => void;
  alocarPatrimonio: (patrimonio: string, pessoa: string, prazo: string) => void;
  devolverPatrimonio: (patrimonio: string) => void;
}

export const useEquipamentosMock = create<EstadoEquipamentos>((set) => ({
  equipamentos: iniciais,
  adicionar: (equipamento) =>
    set((estado) => ({
      equipamentos: [equipamento, ...estado.equipamentos]
    })),
  alocarPatrimonio: (patrimonio, pessoa, prazo) =>
    set((estado) => ({
      equipamentos: estado.equipamentos.map((equipamento) =>
        equipamento.patrimonio === patrimonio
          ? { ...equipamento, situacao: "emprestado", comPessoa: pessoa, prazo }
          : equipamento
      )
    })),
  devolverPatrimonio: (patrimonio) =>
    set((estado) => ({
      equipamentos: estado.equipamentos.map((equipamento) =>
        equipamento.patrimonio === patrimonio
          ? { ...equipamento, situacao: "disponivel", comPessoa: null, prazo: null }
          : equipamento
      )
    }))
}));
