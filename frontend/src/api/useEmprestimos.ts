import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/stores/auth";
import { meusEmprestimosApi, sessaoApi, solicitarApi } from "./client";
export function useDadosEmprestimos() {
  const id = useAuth((s) => s.usuario?.id);
  const sessao = useQuery({
    queryKey: ["sessao", id],
    queryFn: sessaoApi,
    enabled: Boolean(id),
    staleTime: 30000,
  });
  const emprestimos = useQuery({
    queryKey: ["emprestimos", id],
    queryFn: meusEmprestimosApi,
    enabled: Boolean(id),
  });
  return { sessao, emprestimos };
}
export function useSolicitar() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: solicitarApi,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["equipamentos"] }),
        client.invalidateQueries({ queryKey: ["emprestimos"] }),
        client.invalidateQueries({ queryKey: ["sessao"] }),
      ]);
    },
    onError: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["equipamentos"] }),
        client.invalidateQueries({ queryKey: ["emprestimos"] }),
      ]);
    },
  });
}
