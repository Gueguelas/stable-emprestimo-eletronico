const fs = require("node:fs/promises");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { createRequire } = require("node:module");
const raiz = path.resolve(__dirname, "../../../..");
const sharp = createRequire(path.join(raiz, "backend/package.json"))("sharp");
const dados = require(path.join(raiz, "backend/prisma/equipamentos.json"));
const pasta = path.join(raiz, "artifacts/imagens");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const licenca = "https://pixabay.com/service/license-summary/";

async function ler(caminho, padrao) {
  try {
    return JSON.parse(await fs.readFile(caminho, "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return padrao;
    throw e;
  }
}
async function salvar(caminho, valor) {
  await fs.writeFile(caminho, JSON.stringify(valor, null, 2) + "\n");
}
function origem(url) {
  const u = new URL(url);
  if (
    u.protocol !== "https:" ||
    !(u.hostname === "pixabay.com" || u.hostname === "cdn.pixabay.com")
  )
    throw new Error("Origem não permitida");
  return u;
}
async function baixar(url, fetchImpl = globalThis.fetch, tentativas = 0) {
  origem(url);
  const r = await fetchImpl(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(30000),
  });
  if (r.status >= 300 && r.status < 400 && tentativas < 3) {
    return baixar(
      new URL(r.headers.get("location"), url).href,
      fetchImpl,
      tentativas + 1,
    );
  }
  if (!r.ok)
    throw new Error(
      `Pixabay respondeu ${r.status}; interrompido, sem retry automático`,
    );
  const bytes = Buffer.from(await r.arrayBuffer());
  if (bytes.length > 25 * 1024 * 1024) throw new Error("Imagem excede 25 MB");
  return bytes;
}
async function normalizar(bytes, arquivo, recorte) {
  let imagem = sharp(bytes).rotate();
  if (recorte !== undefined) {
    const { left, top, width, height } = recorte ?? {};
    if (
      ![left, top, width, height].every(Number.isFinite) ||
      left < 0 ||
      top < 0 ||
      width <= 0 ||
      height <= 0 ||
      left + width > 1 ||
      top + height > 1
    )
      throw new Error("Recorte deve usar frações válidas da imagem orientada");
    const orientada = await imagem.toBuffer({ resolveWithObject: true });
    const x = Math.floor(left * orientada.info.width);
    const y = Math.floor(top * orientada.info.height);
    const w = Math.floor(width * orientada.info.width);
    const h = Math.floor(height * orientada.info.height);
    if (w < 1 || h < 1) throw new Error("Recorte vazio");
    imagem = sharp(orientada.data).extract({
      left: x,
      top: y,
      width: w,
      height: h,
    });
  }
  await imagem
    .resize(800, 600, { fit: "contain", background: "#232532" })
    .jpeg({ quality: 88 })
    .toFile(arquivo);
  const meta = await sharp(arquivo).metadata();
  if (meta.width !== 800 || meta.height !== 600)
    throw new Error("Dimensão inválida");
  return hash(await fs.readFile(arquivo));
}
async function preparar({
  chave = process.env.PIXABAY_API_KEY,
  pastaSaida = pasta,
  fetchImpl = globalThis.fetch,
  log = console.log,
} = {}) {
  if (!chave?.trim())
    throw new Error(
      "PIXABAY_API_KEY ausente. Operador deve fornecer a chave ao processo local.",
    );
  await fs.mkdir(pastaSaida, { recursive: true });
  const destino = path.join(pastaSaida, "manifesto.json");
  // Refinamento local de termos/ID continua usando exclusivamente a API fixa.
  const buscas = await ler(path.join(pastaSaida, "buscas.json"), {});
  const manifesto = await ler(destino, {
    fonte: "Pixabay",
    itens: [],
    rejeitadas: [],
  });
  const ids = new Set(
    [...manifesto.itens, ...manifesto.rejeitadas].map((i) => i.fotoId),
  );
  const hashes = new Set(
    [...manifesto.itens, ...manifesto.rejeitadas].flatMap((i) => [
      i.sha256,
      i.origemSha256,
    ]),
  );
  for (const item of dados) {
    const existente = manifesto.itens.find(
      (i) => i.patrimonio === item.patrimonio,
    );
    if (existente) {
      if (
        hash(await fs.readFile(path.join(pastaSaida, existente.arquivo))) !==
        existente.sha256
      )
        throw new Error(
          "Candidato alterado: revisar integridade antes de continuar",
        );
      continue;
    }
    const busca = buscas[item.patrimonio]?.consulta ?? item.busca;
    const fotoId = buscas[item.patrimonio]?.fotoId;
    const recorte = buscas[item.patrimonio]?.recorte;
    const pagina = buscas[item.patrimonio]?.pagina ?? 1;
    if (
      typeof busca !== "string" ||
      !busca.trim() ||
      busca.length > 100 ||
      !Number.isSafeInteger(pagina) ||
      pagina < 1 ||
      pagina > 100 ||
      (fotoId !== undefined && (!Number.isSafeInteger(fotoId) || fotoId <= 0))
    )
      throw new Error(`Busca/ID inválido para ${item.patrimonio}`);
    const cache = path.join(
      pastaSaida,
      `cache-${hash(pagina === 1 ? busca : `${busca}\0${pagina}`)}.json`,
    );
    let resposta = await ler(cache, null);
    if (!resposta || Date.now() - resposta.em > 86400000) {
      const url = new URL("https://pixabay.com/api/");
      for (const [k, v] of Object.entries({
        key: chave,
        q: busca,
        image_type: "photo",
        safesearch: "true",
        min_width: "800",
        min_height: "600",
        per_page: "20",
        page: String(pagina),
      }))
        url.searchParams.set(k, v);
      const r = await fetchImpl(url, {
        redirect: "error",
        signal: AbortSignal.timeout(30000),
      });
      if (!r.ok) throw new Error(`Busca Pixabay respondeu ${r.status}`);
      resposta = { em: Date.now(), dados: await r.json() };
      await salvar(cache, resposta);
    }
    let escolhido;
    const candidatas = (resposta.dados.hits ?? []).filter(
      (foto) => fotoId === undefined || foto.id === fotoId,
    );
    for (const foto of candidatas) {
      if (foto.type !== "photo") continue;
      const anterior = manifesto.rejeitadas.find((i) => i.fotoId === foto.id);
      const reenquadrar =
        fotoId === foto.id &&
        recorte &&
        anterior &&
        JSON.stringify(recorte) !== JSON.stringify(anterior.recorte) &&
        !manifesto.itens.some((i) => i.fotoId === foto.id);
      if (ids.has(foto.id) && !reenquadrar) continue;
      origem(foto.pageURL);
      const bytes = await baixar(foto.largeImageURL, fetchImpl);
      const origemSha256 = hash(bytes);
      if (
        hashes.has(origemSha256) &&
        (!reenquadrar ||
          manifesto.itens.some((i) => i.origemSha256 === origemSha256))
      )
        continue;
      const arquivo = `${item.patrimonio}.jpg`;
      const sha256 = await normalizar(
        bytes,
        path.join(pastaSaida, arquivo),
        recorte,
      );
      if (hashes.has(sha256)) continue;
      escolhido = {
        patrimonio: item.patrimonio,
        busca,
        paginaBusca: pagina,
        ...(recorte === undefined ? {} : { recorte }),
        ...(reenquadrar ? { reenquadramentoDe: anterior.sha256 } : {}),
        arquivo,
        fotoId: foto.id,
        tipo: foto.type,
        autor: foto.user,
        pagina: foto.pageURL,
        licenca,
        origemSha256,
        sha256,
        largura: 800,
        altura: 600,
        revisao: { estado: "pendente" },
      };
      break;
    }
    if (!escolhido)
      throw new Error(
        `Sem candidato distinto para ${item.patrimonio}; revisar busca, sem usar outra fonte`,
      );
    manifesto.itens.push(escolhido);
    ids.add(escolhido.fotoId);
    hashes.add(escolhido.sha256);
    hashes.add(escolhido.origemSha256);
    await salvar(destino, manifesto);
    log(`${item.patrimonio}: candidato baixado; revisão pendente`);
  }
  return manifesto;
}
async function revisar(
  patrimonio,
  decisao,
  motivo,
  { pastaSaida = pasta } = {},
) {
  if (!["aprovar", "reprovar"].includes(decisao) || !motivo?.trim())
    throw new Error("Informe aprovar/reprovar e motivo da inspeção visual");
  const destino = path.join(pastaSaida, "manifesto.json");
  const m = await ler(destino, null);
  const item = m?.itens.find((i) => i.patrimonio === patrimonio);
  if (!item) throw new Error("Candidato não encontrado");
  if (
    hash(await fs.readFile(path.join(pastaSaida, item.arquivo))) !== item.sha256
  )
    throw new Error("Arquivo alterado desde a preparação");
  item.revisao = {
    estado: decisao === "aprovar" ? "aprovada" : "reprovada",
    motivo,
    em: new Date().toISOString(),
  };
  if (decisao === "reprovar") {
    m.itens = m.itens.filter((i) => i !== item);
    m.rejeitadas.push(item);
  }
  await salvar(destino, m);
}
async function validarManifesto(caminho = path.join(pasta, "manifesto.json")) {
  const m = await ler(caminho, null);
  if (m?.fonte !== "Pixabay" || m.itens?.length !== dados.length)
    throw new Error("Manifesto precisa das 12 fotos do Pixabay");
  const ids = new Set(),
    hashes = new Set(),
    originais = new Set(),
    patrimonios = new Set();
  for (const i of m.itens) {
    if (
      !dados.some((d) => d.patrimonio === i.patrimonio) ||
      patrimonios.has(i.patrimonio)
    )
      throw new Error("Patrimônio inválido/repetido");
    if (
      i.arquivo !== `${i.patrimonio}.jpg` ||
      i.revisao?.estado !== "aprovada" ||
      !i.revisao.motivo?.trim()
    )
      throw new Error("Arquivo ou revisão visual inválida");
    origem(i.pagina);
    if (
      !i.autor ||
      i.licenca !== licenca ||
      !Number.isInteger(i.fotoId) ||
      !/^[a-f0-9]{64}$/.test(i.origemSha256)
    )
      throw new Error("Créditos incompletos");
    const arquivo = path.join(path.dirname(caminho), i.arquivo);
    const meta = await sharp(arquivo).metadata();
    if (
      meta.width !== 800 ||
      meta.height !== 600 ||
      i.largura !== 800 ||
      i.altura !== 600 ||
      hash(await fs.readFile(arquivo)) !== i.sha256
    )
      throw new Error("Imagem alterada ou fora de 800×600");
    if (
      ids.has(i.fotoId) ||
      hashes.has(i.sha256) ||
      originais.has(i.origemSha256)
    )
      throw new Error("Foto repetida");
    ids.add(i.fotoId);
    hashes.add(i.sha256);
    originais.add(i.origemSha256);
    patrimonios.add(i.patrimonio);
  }
  return m;
}
function mensagemSegura(erro, segredo = process.env.PIXABAY_API_KEY) {
  let mensagem = String(erro.message);
  if (segredo) {
    mensagem = mensagem.split(encodeURIComponent(segredo)).join("[segredo]");
    mensagem = mensagem.split(segredo).join("[segredo]");
  }
  return mensagem;
}
async function executarCli(args = process.argv.slice(2)) {
  const [acao, patrimonio, decisao, ...motivo] = args;
  const operacao =
    acao === "preparar"
      ? preparar()
      : acao === "revisar"
        ? revisar(patrimonio, decisao, motivo.join(" "))
        : acao === "validar"
          ? validarManifesto()
          : Promise.reject(new Error("Use preparar, revisar ou validar"));
  try {
    await operacao;
    console.log("Operação local concluída");
    if (acao === "preparar")
      console.log(
        "Candidatos em artifacts/imagens/. Inspecione e registre a revisão visual antes de validar.",
      );
  } catch (erro) {
    console.error(mensagemSegura(erro));
    process.exitCode = 1;
  }
}
module.exports = {
  normalizar,
  validarManifesto,
  origem,
  hash,
  preparar,
  revisar,
  executarCli,
  mensagemSegura,
};
if (require.main === module) executarCli();
