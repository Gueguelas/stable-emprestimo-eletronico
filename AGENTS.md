# AGENTS.md

## O que é este projeto
**Stable** é o app web, em português do Brasil, de empréstimo de equipamentos de
TI — notebooks, monitores, cabos, câmeras — para uso interno. Ele substitui a
planilha compartilhada onde ninguém sabe o que está disponível e devolução só é
registrada se alguém lembrar.

- **Colaborador**: vê o catálogo, solicita empréstimo de item disponível e devolve o que está com ele — vê somente os próprios empréstimos.
- **Operações**: cadastra equipamentos, vê todos os empréstimos em aberto e registra devolução no balcão.

Estado atual: este checkout contém documentação, protótipo, API em `backend/`
e front em `frontend/`. A separação em dois repositórios continua sendo a
decisão do ADR-001; a migração para repositórios próprios ainda é pendência.
A API implementa health check, sessão, catálogo e solicitação/listagem de
empréstimos persistidos. O front integra os fluxos reais por OpenAPI/Orval.
Devolução, Operações e cadastro reais estão fora desta prática; demos só em
desenvolvimento. Upload das fotos, conta do professor e produção dependem das ações
do operador descritas em docs/operacao-pratica.md; o PRD completo continua pendente.

## Comandos
Documentação e protótipo não têm build. Os comandos de teste, build e lint
vivem junto com o código em `backend/` (API) e `frontend/` (front); o front
também tem E2E com Playwright. O que rodar antes de declarar uma tarefa pronta
está em docs/rules/checks.md, e o procedimento de schema está em
docs/rules/migration.md.

Git: siga docs/rules/restrictions.md e docs/rules/operacoes.md. Commit e push
exigem pedido explícito do usuário; não faça push na produção. Ao receber
autorização para commitar, faça um commit por tarefa com a mensagem citando a
tarefa e o critério de aceitação.

## Estrutura
```
docs/PRD.md                → o que o negócio quer: requisitos e regras
docs/adr/001-stack.md      → decisões de arquitetura e consequências
docs/adr/002-layout-design-system.md → design system Nocturne (acento teal
                             do Stable, Raleway, dark), páginas e regras
                             visuais — antigo docs/layout.md, promovido a ADR
docs/rules/restrictions.md → o que o agente não pode fazer (vale sempre)
docs/rules/checks.md       → o que precisa passar antes de dizer "pronto"
docs/rules/migration.md    → procedimento para qualquer mudança de schema
docs/rules/operacoes.md    → contrato de operação: Git, níveis de autorização
                             (livre / avisar depois / pedir antes / proibido)
docs/rules/spec-flow.md    → fluxo de funcionalidade nova: spec → plano → tarefas
docs/rules/tests.md        → regras para escrever, alterar ou remover testes
docs/rules/skill.md        → quando capturar e como reusar skills
docs/rules/handoff.md      → o que escrever no handoff ao fechar a sessão
docs/rules/clean-code.md   → guia de referência Clean Code TypeScript (consulta)
docs/skills/               → skills capturados: procedimentos que já funcionaram
docs/handoff/              → onde a sessão parou (escrever ao fim de cada sessão)
prototipo/                 → protótipo navegável do layout (catalogo.html)
backend/                   → API (NestJS + Prisma); separação em repo próprio
                             é pendência, não mudança do ADR-001
frontend/                  → SPA React/Vite; catálogo e empréstimos integrados à API
CLAUDE.md                  → aponta para este arquivo
.env                       → ignorado pelo git — nunca versionar
.env.example               → modelo das variáveis esperadas
skills/                    → Pasta de skils para serem utilizadas se necessário 
```

## Convenções obrigatórias
- Idioma da interface e dos docs: **PT-BR**; datas em `DD/MM/AAAA`; tom direto,
  sem exclamações, sem emoji.
- Regra de UI salva de regra de negócio: qualquer mudança de estado é derivada
  no render — contagens, KPIs, cores, rótulo e habilitação de botão; nunca
  duplicar esse estado à mão.
- Contrato front↔API atravessa via **OpenAPI gerado** (orval no front); nunca
  reescrever tipos de resposta à mão.
- Multi-tenancy desde o schema: `tenant_id` em toda tabela de domínio e
  `memberships (user_id, tenant_id, role)`; o tenant do request vem do JWT,
  resolvido no guard — nunca do body ou da query.
- O **Prisma Migrate** é o único dono do schema; RLS, policies e triggers entram
  como SQL bruto dentro das migrations, não como script solto ou segundo dono.
- Validação de entrada com **Zod** (via `nestjs-zod`), nunca `class-validator`
  — o OpenAPI sai do mesmo schema que valida.

## Rotina por tipo de tarefa
- **Qualquer tarefa**: leia docs/rules/restrictions.md antes de começar.
- **Antes de dizer "pronto", "implementado" ou "funcionando"**: siga
  docs/rules/checks.md — testes, build, git status e o critério do PRD
  atendido, citados na resposta.
- **Qualquer mudança de schema** (tabela, coluna, índice, constraint, policy),
  mesmo trivial: siga docs/rules/migration.md — plano de DDL na resposta,
  PARE para aprovação, migration via Prisma com RLS na mesma migration,
  banco local apenas.
- **Antes de qualquer ação sobre arquivos, dependência ou migração**:
  consulte o nível de autorização em docs/rules/operacoes.md — "pedir antes"
  significa descrever o que pretende fazer e PARE; "proibido" não se executa
  mesmo se pedido no meio da tarefa.
- **Funcionalidade nova do PRD**: siga docs/rules/spec-flow.md — crie a
  pasta de spec no padrão NNN-nome-curto, liste as perguntas que o PRD não
  responde e espere as respostas, depois plan.md e tasks.md; uma tarefa por
  vez, com checks ao fim de cada uma.
- **Ao escrever, alterar ou remover testes**: siga docs/rules/tests.md —
  banco local apenas (nunca o remoto), nome do teste cita o critério
  (test_ca_xx), teste de endpoint verifica status E corpo, tabela com
  política de acesso tem um teste que prova o bloqueio.
- **Procedimento que funcionou de primeira e vai se repetir**: procure um
  skill em docs/skills/ antes de improvisar e capture o novo —
  docs/rules/skill.md.
- **Ao fechar a sessão** ("vamos fechar" ou fim de uma tarefa do plano):
  siga docs/rules/handoff.md — sobrescreva o handoff.md da raiz com, no
  máximo, 25 linhas sobre onde parou.
- **Ao escrever código**: use docs/rules/clean-code.md como referência de
  consulta — guia, não regra dura; as convenções deste arquivo e do PRD
  vencem quando entrarem em conflito.

## O que NÃO fazer
Resumo — a fonte de verdade é docs/rules/restrictions.md; leia-o por inteiro.
- Não commitar nem dar push sem o usuário pedir; sempre deixar em staging.
- Não criar pacote compartilhado de tipos entre front e API.
- Não escrever cliente HTTP à mão nem deixar o front falar direto com o
  Supabase — driblaria a autorização por tenant.
- Não trocar o dono do schema; adicionar `tenant_id` a tabela existente exige
  backfill e revisão de toda query.
- Não refatorar código fora do pedido atual.
- Não rodar deploy, alterar configuração da Vercel nem tocar no projeto
  Supabase remoto (SQL, schema ou dado).
- Não instalar dependência, criar ou alterar migration, deletar ou renomear
  arquivo sem pedir antes (docs/rules/operacoes.md); variável de ambiente e
  config de deploy são proibidas, mesmo se pedidas no meio da tarefa.
- Não capturar skill sem execução real por trás nem começar funcionalidade
  sem a pasta de spec no padrão (docs/rules/skill.md, docs/rules/spec-flow.md).

## Onde olhar
### Prática SDD 002/003
- Plano integral explicitamente aprovado pelo usuário; decisões em `docs/specs/002-dados-iniciais/spec.md` e `docs/specs/003-solicitar-emprestimo/spec.md`.
- Skill descoberta em `.agents/skills/imagens-equipamentos/`; scripts só preparam arquivos locais, sem upload.
- Verificador: `agents/verificador-spec.md`, acionado pelo comando obrigatório `npm run fechar-spec -- 003-solicitar-emprestimo` (ou 002).
- `npm run checks` registra testes/build/lint/E2E e hash das entradas em `docs/verificacoes/`. Relatório não substitui evidência de produção.
- Nunca editar ou corrigir pelo verificador. Se Codex readonly não estiver disponível, deixar verificação pendente, sem substituir por revisão do próprio implementador.
- Nesta prática, sharp local e complementação Swagger/Orval do contrato existente foram autorizados no plano. Não estender a autorização para outras bibliotecas, ADRs, configuração de deploy ou produção.

- docs/PRD.md — o que o negócio quer
- docs/adr/002-layout-design-system.md — como a UI deve se parecer e se comportar
- docs/adr/001-stack.md — por que decidimos assim e as consequências
- docs/rules/restrictions.md — o que não fazer; leia antes de qualquer mexida
- docs/rules/checks.md — verificação de fim de tarefa
- docs/rules/migration.md — procedimento de mudança de schema
- docs/rules/operacoes.md — níveis de autorização e contrato de Git
- docs/rules/spec-flow.md — por onde começar uma funcionalidade nova
- docs/rules/tests.md — regras para qualquer teste
- docs/rules/skill.md — quando capturar e reusar skills
- docs/rules/handoff.md — o que escrever ao fechar a sessão
- docs/rules/clean-code.md — referência de código limpo em TypeScript
- docs/skills/ — procedimentos já provados no projeto
- docs/handoff/ — onde eu parei no desenvolvimento
