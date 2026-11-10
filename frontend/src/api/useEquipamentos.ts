import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/stores/auth";
import { listarEquipamentos } from "./client";
export function useEquipamentos() {
  const id = useAuth((s) => s.usuario?.id);
  return useQuery({
    queryKey: ["equipamentos", id],
    queryFn: listarEquipamentos,
    enabled: Boolean(id),
  });
}
