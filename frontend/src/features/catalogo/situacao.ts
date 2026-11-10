import type { Equipamento } from "@/api/schemas";
import { formatarData } from "@/lib/datas";

export function rotuloSituacao(equipamento: Equipamento): string {
  if (equipamento.situacao === "em_manutencao") return "Em manutenção";
  if (equipamento.situacao === "emprestado" || equipamento.comPessoa) {
    return "Emprestado";
  }
  return "Disponível";
}

export function detalheEquipamento(equipamento: Equipamento): string {
  if (equipamento.situacao === "em_manutencao") {
    return equipamento.observacao ?? "Em manutenção";
  }
  if (equipamento.situacao === "emprestado" || equipamento.comPessoa) {
    return `Com ${equipamento.comPessoa ?? "outra pessoa"} · devolver até ${formatarData(equipamento.prazo)}`;
  }
  return "Pronto para retirada no balcão";
}
