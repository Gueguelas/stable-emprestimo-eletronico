import { createBrowserRouter, redirect } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { CatalogoPage } from "@/pages/CatalogoPage";
import { MeusEmprestimosPage } from "@/pages/MeusEmprestimosPage";
import { OperacoesPage } from "@/pages/OperacoesPage";
import { EquipamentosPage } from "@/pages/EquipamentosPage";
import { useAuth } from "@/stores/auth";

function loaderSessao({ request }: { request: Request }) {
  if (!useAuth.getState().usuario) {
    const caminho = new URL(request.url).pathname;
    return redirect(`/login?para=${encodeURIComponent(caminho)}`);
  }
  return null;
}

function loaderOperacoes() {
  const usuario = useAuth.getState().usuario;
  if (!usuario) return redirect("/login?para=%2Foperacoes");
  if (usuario.papel !== "operacoes") return redirect("/catalogo");
  return null;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    loader: () => useAuth.getState().usuario ? redirect("/catalogo") : null,
    element: <LoginPage />
  },
  {
    path: "/",
    loader: loaderSessao,
    element: <AppLayout />,
    children: [
      { index: true, loader: () => redirect("/catalogo") },
      { path: "catalogo", element: <CatalogoPage /> },
      { path: "meus-emprestimos", element: <MeusEmprestimosPage /> },
      { path: "operacoes", loader: loaderOperacoes, element: <OperacoesPage /> },
      { path: "equipamentos", loader: loaderOperacoes, element: <EquipamentosPage /> }
    ]
  },
  { path: "*", loader: () => redirect("/catalogo") }
]);
