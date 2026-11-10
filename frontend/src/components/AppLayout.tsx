import { Outlet } from "react-router-dom";
import { AppNav } from "./AppNav";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/stores/auth";

export function AppLayout() {
  const usuario = useAuth((estado) => estado.usuario);
  return (
    <>
      {usuario?.modoDev && (
        <div className="dev-banner">
          Modo de desenvolvimento: sessão de demonstração. A API real recusará este token.
        </div>
      )}
      <AppNav />
      <main className="page-shell"><Outlet /></main>
      <Toaster />
    </>
  );
}
