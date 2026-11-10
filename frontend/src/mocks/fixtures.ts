import type { Equipamento } from "@/api/schemas";

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const equipamentosMock: Equipamento[] = [
  { id: uuid(1), nome: "Notebook Dell Latitude 5450", categoria: "notebook", patrimonio: "TI-0142", situacao: "disponivel", comPessoa: null, prazo: null, observacao: null },
  { id: uuid(2), nome: "MacBook Pro 14 M3", categoria: "notebook", patrimonio: "TI-0088", situacao: "emprestado", comPessoa: "Marcos Lemos", prazo: "2026-09-07", observacao: null },
  { id: uuid(3), nome: "Monitor LG 27” 4K", categoria: "monitor", patrimonio: "TI-0231", situacao: "disponivel", comPessoa: null, prazo: null, observacao: null },
  { id: uuid(4), nome: "Monitor Dell 24” FHD", categoria: "monitor", patrimonio: "TI-0233", situacao: "em_manutencao", comPessoa: null, prazo: null, observacao: "Painel com falha, retorna em 05/09" },
  { id: uuid(5), nome: "Câmera Sony ZV-1", categoria: "camera", patrimonio: "TI-0301", situacao: "emprestado", comPessoa: "Ana Ribeiro", prazo: "2026-09-12", observacao: null },
  { id: uuid(6), nome: "Cabo HDMI 2.1 3m", categoria: "cabo", patrimonio: "TI-0455", situacao: "disponivel", comPessoa: null, prazo: null, observacao: null },
  { id: uuid(7), nome: "Dock Thunderbolt 4", categoria: "acessorio", patrimonio: "TI-0512", situacao: "emprestado", comPessoa: "Ana Ribeiro", prazo: "2026-09-05", observacao: null },
  { id: uuid(8), nome: "Tripé Manfrotto Befree", categoria: "acessorio", patrimonio: "TI-0318", situacao: "em_manutencao", comPessoa: null, prazo: null, observacao: "Trava do centro quebrada" },
  { id: uuid(9), nome: "Headset Jabra Evolve2", categoria: "acessorio", patrimonio: "TI-0402", situacao: "disponivel", comPessoa: null, prazo: null, observacao: null }
];
