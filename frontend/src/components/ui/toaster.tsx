import { useToast } from "@/stores/toast";

export function Toaster() {
  const mensagem = useToast((estado) => estado.mensagem);
  return mensagem ? (
    <div role="status" className="toast">{mensagem}</div>
  ) : null;
}
