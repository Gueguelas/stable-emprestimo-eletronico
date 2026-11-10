import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/stores/auth";
import { listarEquipamentos } from "./client";

export function useEquipamentos() {
  const token = useAuth((estado) => estado.usuario?.token ?? null);
  return useQuery({
    queryKey: ["equipamentos"],
    queryFn: () => listarEquipamentos(token)
  });
}
