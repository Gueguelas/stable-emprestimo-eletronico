# Fotos reais da prática

Preparadas e inspecionadas em 10/11/2026, exclusivamente por consultas à API do Pixabay e downloads de URLs devolvidas por ela. A chave foi recebida somente na entrada do processo local, sem arquivo de ambiente ou segredo versionado.

São **12 arquivos aprovados de 800×600**, com 12 IDs, hashes de origem e hashes finais distintos. O [manifesto](manifesto.json) conserva autor, página original, licença, busca/página efetiva, hashes, revisão individual e o histórico de **48 candidaturas reprovadas**. [Respostas selecionadas da API](respostas-api.json) preservam os metadados consultados, sem chave nem URLs temporárias de download. [Validação e retomada](preparacao.json) registram o comando real, integridade e repetição sem consulta/download nem alteração do manifesto.

As fotos são ilustrativas dos equipamentos. Não comprovam fabricante, modelo, polegadas, metragem de cabo ou resolução da câmera; essas especificações são os dados do inventário. As duas fotografias de monitor isolado mostram ângulos e telas diferentes, com IDs e arquivos distintos; não são a mesma foto reutilizada.

TI-0005 recebeu um recorte para excluir o texto de um caderno do cenário, mantendo monitor e base inteiros. TI-0012 recebeu um recorte para excluir a inscrição em um acessório do cenário, preservando o corpo da câmera e sua alça. Os parâmetros estão em [buscas.json](buscas.json). Nenhuma marca ou inscrição no equipamento foi apagada ou retocada. A versão anterior de TI-0012 continua reprovada no histórico e vinculada pelo hash; a nova versão foi inspecionada e aprovada separadamente.

Validação reproduzível, sem chave nem rede:

```sh
node -e 'require("./.agents/skills/imagens-equipamentos/scripts/preparar.cjs").validarManifesto("docs/evidencias/imagens/manifesto.json").then(()=>console.log("12 fotos aprovadas, íntegras e 800x600"))'
```

Os 12 JPG deste diretório são os arquivos para o upload humano ao bucket público. Não foi realizado upload, nem verificado acesso anônimo a Storage. Depois do upload, use este manifesto no procedimento de dados em `docs/operacao-pratica.md`. O hash deste diretório faz parte do estado verificado; alterar uma foto/revisão torna o parecer anterior desatualizado.

Fonte e licença: [API Pixabay](https://pixabay.com/api/docs/) e [Pixabay Content License](https://pixabay.com/service/license-summary/). Créditos individuais estão no manifesto. O catálogo mantém o link “Fotos: Pixabay”.
