const path = require("node:path");

// Só o processo lê a configuração fornecida pelo operador. Não criar, editar,
// imprimir ou versionar .env.local. Variáveis já exportadas têm precedência.
function carregarSecret(arquivo = path.resolve(__dirname, "../.env.local")) {
  try {
    process.loadEnvFile(arquivo);
  } catch (erro) {
    if (erro.code !== "ENOENT")
      throw new Error(
        "Não foi possível carregar a configuração local das imagens; confira o formato do arquivo sem expor a chave.",
      );
  }
}

module.exports = { carregarSecret };
if (require.main === module) {
  try {
    carregarSecret();
    require("../.agents/skills/imagens-equipamentos/scripts/preparar.cjs").executarCli();
  } catch (erro) {
    console.error(erro.message);
    process.exitCode = 1;
  }
}
