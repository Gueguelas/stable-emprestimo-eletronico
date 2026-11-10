import { HOJE_MOCK, diasAte, estaEmAtraso } from "@/lib/datas";
import type { Equipamento } from "@/api/schemas";
import type { Emprestimo } from "@/stores/emprestimosMock";

export const LIMITE_EMPRESTIMOS = 3;
export const DIAS_A_VENCER = 2;

export type AcaoCard =
  | { texto: string; habilitada: false; variante: "secondary" }
  | { texto: string; habilitada: true; variante: "primary" };

export function situacaoDoPrazo(prazo: string, hoje = HOJE_MOCK):
  | "em_atraso"
  | "a_vencer"
  | "em_dia" {
  if (estaEmAtraso(prazo, hoje)) return "em_atraso";
  if (diasAte(prazo, hoje) <= DIAS_A_VENCER) return "a_vencer";
  return "em_dia";
}

export function meusEmprestimos(
  emprestimos: Emprestimo[],
  nome: string
): Emprestimo[] {
  return emprestimos.filter((item) => item.pessoa === nome);
}

export function acaoDoCard(
  equipamento: Equipamento,
  nome: string,
  meus: Emprestimo[],
  hoje = HOJE_MOCK
): AcaoCard {
  if (equipamento.situacao === "em_manutencao") {
    return { texto: "Indisponível", habilitada: false, variante: "secondary" };
  }
  if (
    meus.some(
      (emprestimo) =>
        emprestimo.patrimonio === equipamento.patrimonio &&
        !emprestimo.devolvido
    ) ||
    equipamento.comPessoa === nome
  ) {
    return { texto: "Está com você", habilitada: false, variante: "secondary" };
  }
  if (equipamento.situacao === "emprestado") {
    return { texto: "Emprestado", habilitada: false, variante: "secondary" };
  }
  if (meus.some((emprestimo) => !emprestimo.devolvido && estaEmAtraso(emprestimo.prazo, hoje))) {
    return {
      texto: "Bloqueado por atraso",
      habilitada: false,
      variante: "secondary"
    };
  }
  if (meus.filter((emprestimo) => !emprestimo.devolvido).length >= LIMITE_EMPRESTIMOS) {
    return {
      texto: "Limite de 3 itens",
      habilitada: false,
      variante: "secondary"
    };
  }
  return {
    texto: "Solicitar empréstimo",
    habilitada: true,
    variante: "primary"
  };
}

export function resumoEmprestimos(
  emprestimos: Emprestimo[],
  equipamentos: Equipamento[],
  hoje = HOJE_MOCK
) {
  const abertos = emprestimos.filter((item) => !item.devolvido);
  return {
    emAberto: abertos.length,
    emAtraso: abertos.filter((item) => estaEmAtraso(item.prazo, hoje)).length,
    disponiveis: equipamentos.filter(
      (item) => item.situacao === "disponivel" && !item.comPessoa
    ).length,
    manutencao: equipamentos.filter(
      (item) => item.situacao === "em_manutencao"
    ).length
  };
}

export function filtrarEquipamentos(
  equipamentos: Equipamento[],
  busca: string,
  filtro: string
): Equipamento[] {
  const consulta = busca.trim().toLocaleLowerCase("pt-BR");
  return equipamentos.filter((item) => {
    const correspondeBusca =
      !consulta ||
      `${item.nome} ${item.patrimonio}`
        .toLocaleLowerCase("pt-BR")
        .includes(consulta);
    const correspondeFiltro =
      filtro === "todos" ||
      (filtro === "disponivel" && item.situacao === "disponivel" && !item.comPessoa) ||
      (filtro === "emprestado" &&
        (item.situacao === "emprestado" || Boolean(item.comPessoa))) ||
      (filtro === "em_manutencao" && item.situacao === "em_manutencao");
    return correspondeBusca && correspondeFiltro;
  });
}
