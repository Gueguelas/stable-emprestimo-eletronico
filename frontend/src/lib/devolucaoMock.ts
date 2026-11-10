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
