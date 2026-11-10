export type Papel = "colaborador" | "operacoes";

export interface ClaimsAuth {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  role?: unknown;
  papel?: unknown;
  full_name?: unknown;
  name?: unknown;
  email?: unknown;
}

export function extrairPapel(claims: ClaimsAuth): Papel {
  const papel =
    claims.app_metadata?.papel ??
    claims.app_metadata?.role ??
    claims.papel ??
    claims.role;
  return papel === "operacoes" ? "operacoes" : "colaborador";
}

export function extrairNome(claims: ClaimsAuth): string {
  const nome =
    claims.user_metadata?.nome ??
    claims.full_name ??
    claims.name ??
    claims.email;
  return typeof nome === "string" && nome.length > 0 ? nome : "Colaborador";
}

export function iniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toLocaleUpperCase("pt-BR") ?? "")
    .join("");
}
