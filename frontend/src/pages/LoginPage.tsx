import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Brand } from "@/components/ui/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabaseConfigurado } from "@/lib/supabase";
import { useAuth } from "@/stores/auth";
import { useToast } from "@/stores/toast";

const schemaLogin = z.object({
  email: z.string().email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha.")
});
type DadosLogin = z.infer<typeof schemaLogin>;

export function LoginPage() {
  const [buscando, setBuscando] = useState(false);
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const entrar = useAuth((estado) => estado.entrar);
  const entrarComoOperacoes = useAuth((estado) => estado.entrarComoOperacoes);
  const erro = useAuth((estado) => estado.erro);
  const mostrarToast = useToast((estado) => estado.mostrar);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<DadosLogin>({ resolver: zodResolver(schemaLogin) });

  async function submeter(dados: DadosLogin) {
    setBuscando(true);
    await entrar(dados.email, dados.senha);
    setBuscando(false);
    const usuario = useAuth.getState().usuario;
    if (usuario) navegar(params.get("para") || "/catalogo", { replace: true });
    else if (useAuth.getState().erro) mostrarToast(useAuth.getState().erro ?? "");
  }

  function entrarOps() {
    entrarComoOperacoes();
    if (useAuth.getState().usuario) navegar("/operacoes", { replace: true });
    else mostrarToast(useAuth.getState().erro ?? "Não foi possível entrar.");
  }

  return (
    <main className="login-page">
      <section className="login-intro">
        <Brand />
        <div className="login-copy">
          <p className="eyebrow">EMPRÉSTIMO DE EQUIPAMENTOS</p>
          <h1>O que você precisa,<br />sem complicação.</h1>
          <p className="login-lead">
            Equipamentos de TI disponíveis para o seu trabalho. Pegue emprestado, use e devolva.
          </p>
        </div>
        <div className="login-stats">
          <div><strong>3</strong><span>itens por pessoa</span></div>
          <div><strong>14</strong><span>dias de prazo</span></div>
          <div><strong>0</strong><span>linhas para preencher</span></div>
        </div>
        <footer>Operações · TI interno</footer>
      </section>
      <section className="login-form-side">
        <form className="login-form" onSubmit={handleSubmit(submeter)}>
          <p className="eyebrow">ACESSO INTERNO</p>
          <h2>Entrar</h2>
          <p className="login-form-lead">Use suas credenciais corporativas para continuar.</p>
          <label className="field">
            <span>E-mail</span>
            <Input type="email" autoComplete="username" placeholder="voce@empresa.com" {...register("email")} />
            {errors.email && <small className="field-error">{errors.email.message}</small>}
          </label>
          <label className="field">
            <span>Senha</span>
            <Input type="password" autoComplete="current-password" placeholder="Sua senha" {...register("senha")} />
            {errors.senha && <small className="field-error">{errors.senha.message}</small>}
          </label>
          {erro && <p className="field-error" role="alert">{erro}</p>}
          <Button block type="submit" disabled={buscando}>{buscando ? "Entrando…" : "Entrar"}</Button>
          {!supabaseConfigurado && (
            <Button block variant="ghost" type="button" onClick={entrarOps}>
              Entrar como Operações →
            </Button>
          )}
          <p className="login-note">Cada pessoa vê apenas os próprios empréstimos.</p>
          {supabaseConfigurado && <p className="login-note">Acesso com autenticação do Stable.</p>}
        </form>
      </section>
    </main>
  );
}
