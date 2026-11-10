const fs = require("node:fs/promises");
const path = require("node:path");
const {
  hash,
  validarManifesto,
} = require("../.agents/skills/imagens-equipamentos/scripts/preparar.cjs");

(async () => {
  const pasta = path.resolve(__dirname, "../docs/evidencias/imagens");
  const arquivo = path.join(pasta, "manifesto.json");
  const m = await validarManifesto(arquivo);
  const prova = JSON.parse(
    await fs.readFile(path.join(pasta, "preparacao.json")),
  );
  const respostas = JSON.parse(
    await fs.readFile(path.join(pasta, "respostas-api.json")),
  );
  const sha256 = hash(await fs.readFile(arquivo));
  if (
    sha256 !== prova.manifestoSha256 ||
    !m.itens.every(
      (i) =>
        i.tipo === "photo" &&
        respostas.respostas.some(
          (r) =>
            r.patrimonio === i.patrimonio &&
            r.id === i.fotoId &&
            r.autor === i.autor &&
            r.tipo === "photo" &&
            r.paginaOriginal === i.pagina &&
            r.consulta === i.busca &&
            r.pagina === i.paginaBusca,
        ),
    )
  )
    throw new Error("Evidência de origem/revisão desatualizada");
  console.log(
    JSON.stringify(
      {
        aprovadas: m.itens.length,
        reprovadas: m.rejeitadas.length,
        dimensoes: "800x600",
        idsDistintos: new Set(m.itens.map((i) => i.fotoId)).size,
        hashesDistintos: new Set(m.itens.map((i) => i.sha256)).size,
        manifestoSha256: sha256,
        revisao:
          "aprovações individuais registradas no manifesto; não é nova revisão visual",
        storagePublicoVerificado: false,
      },
      null,
      2,
    ),
  );
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
