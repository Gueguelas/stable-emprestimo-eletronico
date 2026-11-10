# Stable — prática de SDD

API Nest/Prisma em `backend/`, SPA React/Vite em `frontend/`. A separação física em dois repositórios continua pendente; não houve deploy nesta execução.

## Desenvolvimento e conferência local
Instale as dependências dos dois subprojetos com `npm ci` em cada pasta. Docker local precisa estar ativo (o teste descobre o socket do contexto Docker/OrbStack). `npm --prefix backend run prisma:generate` gera o cliente Prisma.

Na raiz do Stable:
```sh
npm run contrato
npm run checks
npm run verificar-spec -- 002-dados-iniciais
npm run fechar-spec -- 003-solicitar-emprestimo
```

`contrato` exporta OpenAPI da API sem conectar banco e copia o artefato para o front, onde Orval gera transporte, tipos e validação. Não editar `frontend/src/api/generated/`.

`checks` executa testes PostgreSQL/Testcontainers, builds, Vitest, lint, Playwright, testes da skill e do gate, além de validar o conjunto real de fotos aprovado. Logs e hashes ficam em `docs/verificacoes/`. Playwright intercepta a API para conferir a UI; persistência, JWT, RLS e concorrência são testados separadamente contra PostgreSQL real.

O preparo de imagens e o provisionamento do professor também têm testes completos com APIs simuladas (`npm run test:imagens` e `npm run test:professor`). Eles verificam o código sem credenciais reais e não substituem revisão de fotos nem a conferência humana em produção.

Modo demo mantém telas demonstrativas de Operações; usuários reais só acessam catálogo e os próprios empréstimos. O token demo não é aceito pela API. Devolução real está fora desta prática.

## Fotos e operação humana
As **12 fotos reais revisadas** e o manifesto com 48 recusas estão em [docs/evidencias/imagens/](docs/evidencias/imagens/README.md). `npm run imagens:validar-entrega` confere esses arquivos sem chave nem rede. Estão prontas para upload humano; Storage público ainda não foi verificado.

Para novas buscas, siga `.agents/skills/imagens-equipamentos/SKILL.md`; a preparação requer chave Pixabay fornecida ao processo pelo operador. Testes sintéticos não contam como entrega de fotos.

Quando `PIXABAY_API_KEY` estiver exportada no terminal ou em `.env.local` na raiz do Stable, execute `npm run imagens:preparar`. O carregamento é automático; nenhuma troca de código é necessária. Arquivo de segredo não é criado/editado pelo agente, nem versionado. O processo prepara candidatos locais e preserva o progresso para repetição após falha. Revisão visual, validação e publicação seguem o roteiro abaixo.

Publicação, Storage, migrations remotas e a conta do professor são executados **pelo operador**, conforme [roteiro](docs/operacao-pratica.md). O seed automático recusa bancos remotos. Não há senha padrão escrita em código.

## Verificador
`agents/verificador-spec.md` é a fonte única. O runner abre um `codex exec` independente, ephemeral, em sandbox readonly, sem apps/plugins/MCP e com ambiente do shell sem segredos. A tabela segue `scripts/verificador.schema.json`. O subagente não conserta testes.

O fechamento compara o hash de código/testes/specs/regras/fotos/evidências locais, hashes dos logs, todos os CAs e o resultado do verificador. Ausência, desatualização, falha ou pendência impedem conclusão. Mudou código depois da revisão: repetir checks e verificador.

Para reproduzir a prova negativa/restauração, execute `npm run provar-verificador`. Ela retira temporariamente a cobertura de concorrência do mesmo usuário, executa checks/verificação, comprova a recusa e restaura os bytes originais em `finally`. Não cria commits. Veja `docs/verificacoes/prova/`.

Decisões e limites da entrega: [ENTREGA.md](ENTREGA.md).
