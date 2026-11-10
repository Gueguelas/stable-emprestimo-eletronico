import { listaEquipamentosSchema } from "./schemas";

// Provisório até a API publicar openapi.json para gerar o cliente com orval.
export class ErroApi extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ErroApi";
  }
}

function baseApi(): string {
  return `${(import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "")}/v1`;
}

async function buscarPagina(cursor: string | null, token: string | null) {
  const url = new URL(`${baseApi()}/equipamentos`);
  url.searchParams.set("limite", "100");
  if (cursor) url.searchParams.set("cursor", cursor);
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const problem =
      typeof body === "object" && body !== null
<<<<<<< HEAD
        ? (body as { title?: unknown; detail?: unknown })
        : null;
    const detail =
      typeof problem?.detail === "string"
        ? problem.detail
        : typeof problem?.title === "string"
=======
        ? body
        : null;
    const detail =
      problem && "detail" in problem && typeof problem.detail === "string"
        ? problem.detail
        : problem && "title" in problem && typeof problem.title === "string"
>>>>>>> a52456606c59e2feef60eb067f786b93e23ae2a1
          ? problem.title
          : "Não foi possível carregar os equipamentos.";
    throw new ErroApi(detail, response.status);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ErroApi("A API retornou uma resposta inválida.", response.status);
  }
  const parsed = listaEquipamentosSchema.safeParse(body);
  if (!parsed.success) {
    throw new ErroApi("A resposta da API não corresponde ao contrato esperado.", response.status);
  }
  return parsed.data;
}

export async function listarEquipamentos(token: string | null) {
  const itens = [];
  let cursor: string | null = null;
  const vistos = new Set<string>();
  for (let pagina = 0; pagina < 20; pagina += 1) {
    const resultado = await buscarPagina(cursor, token);
    itens.push(...resultado.itens);
    cursor = resultado.proximoCursor;
    if (!cursor || vistos.has(cursor)) break;
    vistos.add(cursor);
  }
  return itens;
}
