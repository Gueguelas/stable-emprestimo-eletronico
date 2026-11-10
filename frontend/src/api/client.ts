import { useAuth } from "@/stores/auth";
import {
  listarEquipamentos as pagina,
  listarMeusEmprestimos,
  obterSessao,
  solicitarEmprestimo,
} from "./generated/stable";
import {
  ListarEquipamentosResponse,
  ListarMeusEmprestimosResponse,
  ObterSessaoResponse,
  SolicitarEmprestimoResponse,
} from "./generated/validation";
import type { Equipamento } from "./schemas";

export class ErroApi extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ErroApi";
  }
}
function opcoes(): RequestInit {
  const token = useAuth.getState().usuario?.token;
  return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
}
function sucesso<T>(r: { data: T; status: number }): T {
  if (r.status < 200 || r.status >= 300) {
    const body: unknown = r.data;
    const p = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    throw new ErroApi(
      typeof p.detail === "string"
        ? p.detail
        : typeof p.title === "string"
          ? p.title
          : "Não foi possível concluir a operação.",
      r.status,
    );
  }
  return r.data;
}
// Transporte e tipos são gerados pelo Orval. Esta camada só compõe paginação,
// autenticação e validação também gerada; não escreve fetch nem endpoints.
export async function listarEquipamentos() {
  const itens: Equipamento[] = [];
  let cursor: string | undefined;
  const vistos = new Set<string>();
  for (let n = 0; n < 100; n++) {
    const r = ListarEquipamentosResponse.parse(
      sucesso(await pagina({ limite: 100, cursor }, opcoes())),
    );
    itens.push(...r.itens);
    if (!r.proximoCursor) return itens;
    if (vistos.has(r.proximoCursor)) throw new Error("Paginação inválida retornada pela API.");
    vistos.add(r.proximoCursor);
    cursor = r.proximoCursor;
  }
  throw new Error("Limite de páginas excedido; catálogo incompleto.");
}
export async function meusEmprestimosApi() {
  return ListarMeusEmprestimosResponse.parse(
    sucesso(await listarMeusEmprestimos({ status: "abertos" }, opcoes())),
  );
}
export async function sessaoApi() {
  return ObterSessaoResponse.parse(sucesso(await obterSessao(opcoes())));
}
export async function solicitarApi(equipamentoId: string) {
  return SolicitarEmprestimoResponse.parse(
    sucesso(await solicitarEmprestimo({ equipamentoId }, opcoes())),
  );
}
