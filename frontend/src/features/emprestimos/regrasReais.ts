import type { Equipamento } from "@/api/schemas";
import type { EmprestimoDto } from "@/api/generated/model";
export function acaoReal(item: Equipamento, meus: EmprestimoDto[], hoje: string, pronto: boolean) {
  if (!pronto) return "Aguardando dados da conta";
  if (item.situacao === "em_manutencao") return "Indisponível";
  if (meus.some((e) => e.equipamentoId === item.id)) return "Está com você";
  if (item.situacao === "emprestado") return "Emprestado";
  if (meus.some((e) => e.prazo < hoje)) return "Bloqueado por atraso";
  if (meus.length >= 3) return "Limite de 3 itens";
  return "Solicitar empréstimo";
}
