const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mkdtemp, readFile, writeFile, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { createRequire } = require("node:module");
const sharp = createRequire(path.resolve(__dirname, "../backend/package.json"))(
  "sharp",
);
const {
  normalizar,
  validarManifesto,
  origem,
  hash,
  preparar,
  revisar,
  mensagemSegura,
} = require("../.agents/skills/imagens-equipamentos/scripts/preparar.cjs");
const { carregarSecret } = require("./imagens.cjs");
const dados = require("../backend/prisma/equipamentos.json");

test("test_ca_03_04_dimensao_revisao_integridade_e_fotos_repetidas", async () => {
  const pasta = await mkdtemp(path.join(tmpdir(), "stable-imagens-"));
  try {
    const itens = [];
    for (const [n, item] of dados.entries()) {
      const bytes = await sharp({
        create: {
          width: 91 + n,
          height: 151,
          channels: 3,
          background: { r: 20 * n, g: 100, b: 70 },
        },
      })
        .png()
        .toBuffer();
      const arquivo = `${item.patrimonio}.jpg`;
      const sha256 = await normalizar(bytes, path.join(pasta, arquivo));
      itens.push({
        patrimonio: item.patrimonio,
        arquivo,
        fotoId: n + 1,
        autor: "Fixture sintética: não é foto de entrega",
        pagina: `https://pixabay.com/photos/test-${n + 1}/`,
        licenca: "https://pixabay.com/service/license-summary/",
        origemSha256: hash(bytes),
        sha256,
        largura: 800,
        altura: 600,
        revisao: {
          estado: "aprovada",
          motivo: "Fixture para testar validação; não houve busca real",
        },
      });
    }
    const destino = path.join(pasta, "manifesto.json");
    const salvar = () =>
      writeFile(destino, JSON.stringify({ fonte: "Pixabay", itens }));
    await salvar();
    assert.equal((await validarManifesto(destino)).itens.length, 12);
    itens[0].revisao.estado = "pendente";
    await salvar();
    await assert.rejects(validarManifesto(destino), /revisão/);
    itens[0].revisao.estado = "aprovada";
    const id = itens[1].fotoId;
    itens[1].fotoId = itens[0].fotoId;
    await salvar();
    await assert.rejects(validarManifesto(destino), /repetida/);
    itens[1].fotoId = id;
    await salvar();
    await writeFile(
      path.join(pasta, itens[0].arquivo),
      await readFile(path.join(pasta, itens[1].arquivo)),
    );
    await assert.rejects(validarManifesto(destino), /alterada/);
    assert.throws(
      () => origem("https://pixabay.com.evil.example/a.jpg"),
      /Origem/,
    );
    assert.throws(() => origem("http://pixabay.com/a.jpg"), /Origem/);
  } finally {
    await rm(pasta, { recursive: true, force: true });
  }
});

async function cenario(executar) {
  const pastaSaida = await mkdtemp(path.join(tmpdir(), "stable-pipeline-"));
  const consultas = [],
    downloads = [];
  let falharFoto = null;
  let statusBusca = 200;
  let redirecionar = false;
  let tipoFoto = "photo";
  const foto = (id) => ({
    id,
    type: tipoFoto,
    user: "Autor sintético do teste, sem foto real",
    pageURL: `https://pixabay.com/photos/fixture-${id}/`,
    largeImageURL: `https://cdn.pixabay.com/fixture/${id}.png`,
  });
  const bytes = new Map();
  async function fetchImpl(endereco, opcoes) {
    const url = new URL(endereco);
    if (url.origin === "https://pixabay.com" && url.pathname === "/api/") {
      assert.equal(opcoes.redirect, "error");
      assert.equal(url.searchParams.get("key"), "chave-sintetica-nao-real");
      assert.equal(url.searchParams.get("image_type"), "photo");
      const q = url.searchParams.get("q");
      if (q === "laptop refinado fixture")
        assert.equal(url.searchParams.get("page"), "2");
      const n =
        q === "laptop refinado fixture"
          ? 0
          : dados.findIndex((i) => i.busca === q);
      assert.notEqual(n, -1);
      consultas.push(n);
      if (statusBusca !== 200)
        return new Response("Erro sintético", { status: statusBusca });
      return Response.json({ hits: [foto(n + 1), foto(n + 101)] });
    }
    assert.equal(url.origin, "https://cdn.pixabay.com");
    assert.equal(opcoes.redirect, "manual");
    const id = Number(url.pathname.match(/(\d+)\.png$/)[1]);
    downloads.push(id);
    if (falharFoto === id) throw new Error("Falha sintética de conexão");
    if (redirecionar)
      return new Response(null, {
        status: 302,
        headers: { location: "https://outra-origem.example/foto.png" },
      });
    if (!bytes.has(id))
      bytes.set(
        id,
        await sharp({
          create: {
            width: 1200,
            height: 900,
            channels: 3,
            background: { r: id % 256, g: (id * 31) % 256, b: (id * 47) % 256 },
          },
        })
          .png()
          .toBuffer(),
      );
    return new Response(bytes.get(id));
  }
  const opcoes = {
    chave: "chave-sintetica-nao-real",
    pastaSaida,
    fetchImpl,
    log: () => {},
  };
  try {
    await executar({
      pastaSaida,
      consultas,
      downloads,
      opcoes,
      falharFoto: (id) => {
        falharFoto = id;
      },
      statusBusca: (status) => {
        statusBusca = status;
      },
      redirecionar: () => {
        redirecionar = true;
      },
      tipoFoto: (tipo) => {
        tipoFoto = tipo;
      },
    });
  } finally {
    await rm(pastaSaida, { recursive: true, force: true });
  }
}

test("test_ca_002_03_04_pipeline_com_secret_12_downloads_cache_revisao_e_retomada", async () => {
  await cenario(async ({ opcoes, pastaSaida, consultas, downloads }) => {
    const m = await preparar(opcoes);
    assert.equal(m.itens.length, 12);
    assert.equal(consultas.length, 12);
    assert.equal(downloads.length, 12);
    assert.equal(new Set(m.itens.map((i) => i.fotoId)).size, 12);
    assert.equal(
      m.itens.every((i) => i.revisao.estado === "pendente"),
      true,
    );
    const caminho = path.join(pastaSaida, "manifesto.json");
    await assert.rejects(validarManifesto(caminho), /revisão/);
    const repetido = await preparar(opcoes);
    assert.deepEqual(repetido, m);
    assert.equal(consultas.length, 12);
    assert.equal(downloads.length, 12);
    await revisar(
      "TI-0001",
      "reprovar",
      "Fixture: exercitar substituição; sem revisão de foto real",
      { pastaSaida },
    );
    const substituido = await preparar(opcoes);
    assert.equal(substituido.rejeitadas.length, 1);
    assert.equal(
      substituido.itens.find((i) => i.patrimonio === "TI-0001").fotoId,
      101,
    );
    assert.equal(
      consultas.length,
      12,
      "Substituição deve aproveitar cache de 24h",
    );
    assert.equal(downloads.length, 13);
    for (const i of substituido.itens)
      await revisar(
        i.patrimonio,
        "aprovar",
        "Fixture sintética aprovada exclusivamente para testar o fluxo",
        { pastaSaida },
      );
    assert.equal((await validarManifesto(caminho)).itens.length, 12);
    assert.equal(
      (await preparar(opcoes)).itens.every(
        (i) => i.revisao.estado === "aprovada",
      ),
      true,
    );
    assert.equal(
      (await readFile(caminho, "utf8")).includes(opcoes.chave),
      false,
    );
  });
});

test("test_ca_002_03_pipeline_sem_secret_recusa_antes_de_chamar_api", async () => {
  await cenario(async ({ opcoes, consultas }) => {
    await assert.rejects(
      preparar({ ...opcoes, chave: "" }),
      /PIXABAY_API_KEY ausente/,
    );
    assert.equal(consultas.length, 0);
  });
});

test("test_ca_002_03_recusa_resposta_nao_fotografica_mesmo_com_filtro_da_api", async () => {
  await cenario(async ({ opcoes, tipoFoto, downloads }) => {
    tipoFoto("vector");
    await assert.rejects(preparar(opcoes), /Sem candidato distinto/);
    assert.equal(downloads.length, 0);
  });
});

test("test_ca_002_03_recorte_local_reproduzivel_sem_alterar_conteudo", async () => {
  const pasta = await mkdtemp(path.join(tmpdir(), "stable-recorte-"));
  try {
    const bytes = await sharp({
      create: { width: 100, height: 100, channels: 3, background: "white" },
    })
      .composite([
        {
          input: await sharp({
            create: {
              width: 50,
              height: 100,
              channels: 3,
              background: "black",
            },
          })
            .png()
            .toBuffer(),
          left: 0,
          top: 0,
        },
      ])
      .png()
      .toBuffer();
    const arquivo = path.join(pasta, "recorte.jpg");
    const recorte = { left: 0, top: 0, width: 0.5, height: 1 };
    const primeiro = await normalizar(bytes, arquivo, recorte);
    const pixel = await sharp(arquivo)
      .extract({ left: 400, top: 300, width: 1, height: 1 })
      .raw()
      .toBuffer();
    assert.equal(
      pixel.every((c) => c < 5),
      true,
    );
    assert.equal(await normalizar(bytes, arquivo, recorte), primeiro);
    const meta = await sharp(arquivo).metadata();
    assert.deepEqual([meta.width, meta.height], [800, 600]);
    await assert.rejects(
      normalizar(bytes, arquivo, { left: 0.9, top: 0, width: 0.5, height: 1 }),
      /Recorte/,
    );
  } finally {
    await rm(pasta, { recursive: true, force: true });
  }
});

test("test_ca_002_03_busca_refinada_seleciona_somente_id_retornado_pela_api", async () => {
  await cenario(async ({ opcoes, pastaSaida, downloads }) => {
    const arquivo = path.join(pastaSaida, "buscas.json");
    const selecao = {
      "TI-0001": {
        consulta: "laptop refinado fixture",
        fotoId: 9999,
        pagina: 2,
      },
    };
    await writeFile(arquivo, JSON.stringify(selecao));
    await assert.rejects(preparar(opcoes), /Sem candidato distinto/);
    assert.equal(downloads.length, 0);
    selecao["TI-0001"].fotoId = 101;
    await writeFile(arquivo, JSON.stringify(selecao));
    const m = await preparar(opcoes);
    assert.equal(m.itens[0].fotoId, 101);
    assert.equal(m.itens[0].busca, "laptop refinado fixture");
    assert.equal(m.itens[0].revisao.estado, "pendente");
    await assert.rejects(
      validarManifesto(path.join(pastaSaida, "manifesto.json")),
      /revisão/,
    );
  });
});

test("test_ca_002_03_pipeline_interrompe_401_429_sem_aprovar_nem_repetir", async () => {
  for (const status of [401, 429])
    await cenario(async ({ opcoes, statusBusca, consultas, downloads }) => {
      statusBusca(status);
      await assert.rejects(preparar(opcoes), new RegExp(`respondeu ${status}`));
      assert.equal(consultas.length, 1);
      assert.equal(downloads.length, 0);
    });
});

test("test_ca_002_03_reenquadramento_explicito_conserva_recusa_e_exige_nova_revisao", async () => {
  await cenario(async ({ opcoes, pastaSaida }) => {
    const inicial = await preparar(opcoes);
    const anterior = inicial.itens[0];
    await revisar("TI-0001", "reprovar", "Fixture: cenário impróprio", {
      pastaSaida,
    });
    await writeFile(
      path.join(pastaSaida, "buscas.json"),
      JSON.stringify({
        "TI-0001": {
          fotoId: 1,
          recorte: { left: 0, top: 0, width: 0.5, height: 1 },
        },
      }),
    );
    const novo = await preparar(opcoes);
    const item = novo.itens.find((i) => i.patrimonio === "TI-0001");
    assert.equal(novo.rejeitadas[0].sha256, anterior.sha256);
    assert.equal(item.reenquadramentoDe, anterior.sha256);
    assert.equal(item.origemSha256, anterior.origemSha256);
    assert.notEqual(item.sha256, anterior.sha256);
    assert.equal(item.revisao.estado, "pendente");
    await assert.rejects(
      validarManifesto(path.join(pastaSaida, "manifesto.json")),
      /revisão/,
    );
    await revisar("TI-0002", "reprovar", "Fixture: forçar seleção repetida", {
      pastaSaida,
    });
    await writeFile(
      path.join(pastaSaida, "buscas.json"),
      JSON.stringify({
        "TI-0002": {
          consulta: dados[0].busca,
          fotoId: 1,
          recorte: { left: 0, top: 0, width: 0.25, height: 1 },
        },
      }),
    );
    await assert.rejects(preparar(opcoes), /Sem candidato distinto/);
  });
});

test("test_ca_002_03_04_pipeline_retoma_depois_de_falha_sem_refazer_itens", async () => {
  await cenario(async ({ opcoes, falharFoto, downloads, pastaSaida }) => {
    falharFoto(3);
    await assert.rejects(preparar(opcoes), /Falha sintética/);
    assert.equal(
      JSON.parse(await readFile(path.join(pastaSaida, "manifesto.json"))).itens
        .length,
      2,
    );
    falharFoto(null);
    assert.equal((await preparar(opcoes)).itens.length, 12);
    assert.equal(downloads.filter((id) => id === 1).length, 1);
    assert.equal(downloads.filter((id) => id === 2).length, 1);
  });
});

test("test_ca_002_03_pipeline_bloqueia_redirect_para_fonte_externa", async () => {
  await cenario(async ({ opcoes, redirecionar, downloads }) => {
    redirecionar();
    await assert.rejects(preparar(opcoes), /Origem não permitida/);
    assert.equal(downloads.length, 1);
  });
});

test("test_ca_002_03_secret_local_carregada_sem_sobrescrever_exportada_ou_expor_erro", async () => {
  const temp = await mkdtemp(path.join(tmpdir(), "stable-secret-fixture-"));
  const anterior = process.env.PIXABAY_API_KEY;
  try {
    const arquivo = path.join(temp, ".env.local");
    await writeFile(arquivo, "PIXABAY_API_KEY=valor-sintetico-do-arquivo\n");
    delete process.env.PIXABAY_API_KEY;
    carregarSecret(arquivo);
    assert.equal(process.env.PIXABAY_API_KEY, "valor-sintetico-do-arquivo");
    process.env.PIXABAY_API_KEY = "valor-sintetico-exportado";
    carregarSecret(arquivo);
    assert.equal(process.env.PIXABAY_API_KEY, "valor-sintetico-exportado");
    assert.doesNotThrow(() => carregarSecret(path.join(temp, "ausente")));
    const segredo = "fixture-chave/com?caracteres";
    const mensagem = mensagemSegura(
      new Error(`${segredo} ${encodeURIComponent(segredo)}`),
      segredo,
    );
    assert.equal(mensagem, "[segredo] [segredo]");
  } finally {
    if (anterior === undefined) delete process.env.PIXABAY_API_KEY;
    else process.env.PIXABAY_API_KEY = anterior;
    await rm(temp, { recursive: true, force: true });
  }
});
