import { useMemo } from "react";
import { meusEmprestimos } from "./regras";
import { useAuth } from "@/stores/auth";
import { useEmprestimosMock } from "@/stores/emprestimosMock";

export function useContextoUsuario() {
  const usuario = useAuth((estado) => estado.usuario);
  const todos = useEmprestimosMock((estado) => estado.emprestimos);
  const meus = useMemo(
    () => meusEmprestimos(todos.filter((item) => !item.devolvido), usuario?.nome ?? ""),
    [todos, usuario?.nome]
  );
  return { usuario, meus, todos };
}
