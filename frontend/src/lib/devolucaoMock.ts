import type { Equipamento } from "@/api/schemas";
import { LIMITE_EMPRESTIMOS } from "@/features/emprestimos/regras";
import { adicionarDias, estaEmAtraso, HOJE_MOCK, PRAZO_PADRAO_DIAS } from "@/lib/datas";
import { useEmprestimosMock } from "@/stores/emprestimosMock";
import { useEquipamentosMock } from "@/stores/equipamentosMock";

export function registrarDevolucaoMock(id: string) {
  const emprestimo = useEmprestimosMock
    .getState()
    .emprestimos.find((item) => item.id === id);
  if (!emprestimo || emprestimo.devolvido) return false;
  useEmprestimosMock.getState().devolver(id);
  useEquipamentosMock.getState().devolverPatrimonio(emprestimo.patrimonio);
  return true;
}

export function solicitarEmprestimoMock(
  equipamento: Pick<Equipamento, "categoria" | "patrimonio" | "nome" | "situacao" | "comPessoa">,
  pessoa: string
) {
  const emprestimos = useEmprestimosMock.getState().emprestimos;
  const meus = emprestimos.filter((item) => item.pessoa === pessoa && !item.devolvido);

  if (equipamento.situacao === "em_manutencao") return false;
  if (equipamento.situacao === "emprestado" || equipamento.comPessoa) return false;
  if (meus.some((item) => !item.devolvido && estaEmAtraso(item.prazo))) return false;
  if (meus.length >= LIMITE_EMPRESTIMOS) return false;

  const prazo = adicionarDias(HOJE_MOCK, PRAZO_PADRAO_DIAS);
  useEmprestimosMock.getState().cadastrar({
    id: `loan-${pessoa.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    equipamento: equipamento.nome,
    patrimonio: equipamento.patrimonio,
    pessoa,
    retirada: HOJE_MOCK,
    prazo,
    devolvido: false,
    categoria: equipamento.categoria
  });
  useEquipamentosMock.getState().alocarPatrimonio(equipamento.patrimonio, pessoa, prazo);
  return true;
}
