import { create } from "zustand";

export interface Emprestimo {
  id: string;
  equipamento: string;
  patrimonio: string;
  pessoa: string;
  retirada: string;
  prazo: string;
  devolvido: boolean;
  categoria: "notebook" | "monitor" | "cabo" | "camera" | "acessorio";
}

interface EstadoEmprestimos {
  emprestimos: Emprestimo[];
  devolver: (id: string) => void;
  cadastrar: (emprestimo: Emprestimo) => void;
}

const iniciais: Emprestimo[] = [
  { id: "loan-ana-sony", equipamento: "Câmera Sony ZV-1", patrimonio: "TI-0301", pessoa: "Ana Ribeiro", retirada: "2026-08-29", prazo: "2026-09-12", devolvido: false, categoria: "camera" },
  { id: "loan-ana-dock", equipamento: "Dock Thunderbolt 4", patrimonio: "TI-0512", pessoa: "Ana Ribeiro", retirada: "2026-08-22", prazo: "2026-09-05", devolvido: false, categoria: "acessorio" },
  { id: "loan-marcos-mac", equipamento: "MacBook Pro 14 M3", patrimonio: "TI-0088", pessoa: "Marcos Lemos", retirada: "2026-08-24", prazo: "2026-09-07", devolvido: false, categoria: "notebook" },
  { id: "loan-julia-lenovo", equipamento: "Lenovo T14", patrimonio: "TI-0119", pessoa: "Júlia Prado", retirada: "2026-08-26", prazo: "2026-09-09", devolvido: false, categoria: "notebook" },
  { id: "loan-rafael-aoc", equipamento: "Monitor AOC 24”", patrimonio: "TI-0244", pessoa: "Rafael Souza", retirada: "2026-08-18", prazo: "2026-09-01", devolvido: false, categoria: "monitor" },
  { id: "loan-camila-gopro", equipamento: "Câmera GoPro Hero 12", patrimonio: "TI-0307", pessoa: "Camila Nunes", retirada: "2026-08-05", prazo: "2026-08-19", devolvido: false, categoria: "camera" }
];

export const useEmprestimosMock = create<EstadoEmprestimos>((set) => ({
  emprestimos: iniciais,
  devolver: (id) =>
    set((estado) => ({
      emprestimos: estado.emprestimos.map((item) =>
        item.id === id ? { ...item, devolvido: true } : item
      )
    })),
  cadastrar: (emprestimo) =>
    set((estado) => ({
      emprestimos: [emprestimo, ...estado.emprestimos]
    }))
}));
