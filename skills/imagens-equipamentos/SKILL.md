---
name: imagens-equipamentos
description: Buscar e preparar fotos de equipamentos do Stable exclusivamente pelo Pixabay, validar 800x600, deduplicar e registrar revisão visual e créditos. Não faz upload, deploy nem escreve em Supabase.
---

# Imagens de equipamentos
Use o dataset canônico em `backend/prisma/equipamentos.json`. Leia [contrato e operação](references/contrato.md) antes de executar `scripts/preparar.cjs`.

1. Execute `npm run imagens:preparar` (ou `npm run imagens -- preparar`) na raiz do Stable. O comando consome `PIXABAY_API_KEY` exportada no terminal ou carrega automaticamente `.env.local` fornecido pelo operador; variável já exportada tem precedência. Não crie/edite o arquivo de segredo pelo agente nem abra, imprima ou versione seu conteúdo.
2. Inspecione cada arquivo candidato em `artifacts/imagens/`. Nenhuma pessoa, marca/logo legível, texto ou tela com conteúdo pode ser aceita. Safesearch não substitui essa inspeção.
3. Registre a revisão individual com `npm run imagens -- revisar TI-0001 aprovar "motivo da revisão visual"` ou `reprovar`. A aprovação nunca é automática. Rode preparar novamente para substituir rejeitadas.
   Se os termos iniciais não forem adequados, refine em `artifacts/imagens/buscas.json`, por exemplo `{"TI-0001":{"consulta":"closed laptop","pagina":1,"fotoId":123}}`. Página e ID são opcionais. O ID precisa constar na resposta da API dessa busca/página; isso seleciona candidato, sem aprová-lo. Um candidato existente só é substituído após reprovação explícita. Não edite respostas do cache para selecionar: preserve a resposta original e use este arquivo.
4. Execute `npm run imagens -- validar`. Só o manifesto completo e aprovado pode alimentar o seed com imagens.

O script garante tamanho, integridade, origem declarada e ausência de repetição exata; revisão visual garante conteúdo e adequação ao equipamento. Sem chave ou sem 12 fotos aprovadas, registre pendência. Não use placeholders ou outra fonte como entrega final.

Não existe comando de upload nesta skill. O operador usa o painel de Storage; nomes determinísticos permitem sobrescrever o mesmo objeto. Não capture como procedimento comprovado uma busca real que não ocorreu.

Os testes de `npm run test:imagens` exercitam também busca/download com API simulada, retomada, cache e substituição. Injeção de fetch/destino é interna aos testes; a CLI não aceita outra API ou origem de foto. Esses testes não são evidência de fotos reais aprovadas.
