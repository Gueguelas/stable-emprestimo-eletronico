import { Link, NavLink, useNavigate } from "react-router-dom";
import { Brand } from "@/components/ui/brand";
import { useAuth } from "@/stores/auth";
<<<<<<< HEAD
=======
import { useToast } from "@/stores/toast";
>>>>>>> a52456606c59e2feef60eb067f786b93e23ae2a1

export function AppNav() {
  const usuario = useAuth((estado) => estado.usuario);
  const sair = useAuth((estado) => estado.sair);
<<<<<<< HEAD
=======
  const mostrarToast = useToast((estado) => estado.mostrar);
>>>>>>> a52456606c59e2feef60eb067f786b93e23ae2a1
  const navigate = useNavigate();
  if (!usuario) return null;

  const links =
    usuario.papel === "operacoes"
      ? [
          ["/catalogo", "Catálogo"],
          ["/operacoes", "Operações"],
          ["/equipamentos", "Equipamentos"],
          ["/meus-emprestimos", "Meus empréstimos"]
        ]
      : [
          ["/catalogo", "Catálogo"],
          ["/meus-emprestimos", "Meus empréstimos"]
        ];

  async function encerrarSessao() {
    await sair();
<<<<<<< HEAD
    navigate("/login", { replace: true });
=======
    const { usuario: sessao, erro } = useAuth.getState();
    if (erro) {
      mostrarToast(erro);
    } else if (!sessao) {
      navigate("/login", { replace: true });
    }
>>>>>>> a52456606c59e2feef60eb067f786b93e23ae2a1
  }

  return (
    <header className="nav">
      <Link to="/catalogo" className="nav-brand" aria-label="Stable, catálogo">
        <Brand compacto />
      </Link>
      <nav className="nav-links" aria-label="Navegação principal">
        {links.map(([href, texto]) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            {texto}
          </NavLink>
        ))}
      </nav>
      <div className="nav-user">
        <span className="tag tag-outline">{usuario.papel === "operacoes" ? "Operações" : "Colaborador"}</span>
        <span className="avatar" aria-hidden="true">{usuario.iniciais}</span>
        <span className="nav-name">{usuario.nome}</span>
        <button className="button button-ghost nav-logout" onClick={() => void encerrarSessao()}>
          Sair
        </button>
      </div>
    </header>
  );
}
