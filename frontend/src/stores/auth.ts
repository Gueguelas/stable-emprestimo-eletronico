import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { extrairNome, extrairPapel, iniciais, type Papel } from "@/features/auth/claims";
import { supabase, supabaseConfigurado } from "@/lib/supabase";

export interface UsuarioApp {
  id: string;
  nome: string;
  email: string;
  iniciais: string;
  papel: Papel;
  token: string | null;
  modoDev: boolean;
}

interface EstadoAuth {
  usuario: UsuarioApp | null;
  erro: string | null;
  entrar: (email: string, senha: string) => Promise<void>;
  entrarComoOperacoes: () => void;
  sair: () => Promise<void>;
  definirErro: (erro: string | null) => void;
}

function usuarioDaSessao(user: User, session: Session | null): UsuarioApp {
  const nome = extrairNome({
    app_metadata: user.app_metadata,
    user_metadata: user.user_metadata,
    email: user.email
  });
  return {
    id: user.id,
    nome,
    email: user.email ?? "",
    iniciais: iniciais(nome),
    papel: extrairPapel({
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata
    }),
    token: session?.access_token ?? null,
    modoDev: false
  };
}

function usuarioDev(papel: Papel, email = "ana.ribeiro@stable.local"): UsuarioApp {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    nome: "Ana Ribeiro",
    email,
    iniciais: "AR",
    papel,
    token: "token-falso-de-desenvolvimento",
    modoDev: true
  };
}

export const useAuth = create<EstadoAuth>((set) => ({
  usuario: null,
  erro: null,
  entrar: async (email, senha) => {
    set({ erro: null });
    if (!supabaseConfigurado || !supabase) {
      if (!email.trim() || !senha) {
        set({ erro: "Informe seu e-mail e sua senha." });
        return;
      }
      set({ usuario: usuarioDev("colaborador", email.trim()) });
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });
    if (error) {
      set({ erro: "Não foi possível entrar. Confira suas credenciais." });
      return;
    }
    set({
      usuario: data.user ? usuarioDaSessao(data.user, data.session) : null,
      erro: null
    });
  },
  entrarComoOperacoes: () => {
    if (!supabaseConfigurado) {
      set({ usuario: usuarioDev("operacoes"), erro: null });
    } else {
      set({ erro: "Use uma conta de Operações para entrar." });
    }
  },
  sair: async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        set({ erro: "Não foi possível encerrar a sessão." });
        return;
      }
    }
    set({ usuario: null, erro: null });
  },
  definirErro: (erro) => set({ erro })
}));

export async function inicializarAuth(): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    useAuth.getState().definirErro("Não foi possível restaurar a sessão.");
  } else if (data.session?.user) {
    useAuth.setState({
      usuario: usuarioDaSessao(data.session.user, data.session)
    });
  }
  supabase.auth.onAuthStateChange((_evento, session) => {
    useAuth.setState({
      usuario: session?.user ? usuarioDaSessao(session.user, session) : null
    });
  });
}
