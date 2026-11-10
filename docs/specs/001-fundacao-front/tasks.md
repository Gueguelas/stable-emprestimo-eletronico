# Tasks — 001-fundacao-front

Derivado de `plan.md`. Uma tarefa por vez; ao terminar, `rules/checks.md`
(`npm run test`, `npm run build`, `git status --short`, citação do CA).
Uma tarefa = um commit. CA: **01** login · **02** catálogo · **03** solicitar ·
**04** devolver · **05** Operações · **06** limite 3 · **07** prazo 14 ·
**08** atraso bloqueia · **09** manutenção · **10** escopo por pessoa.

> Dependências com nível "pedir antes" (`operacoes.md`): instalação dos
> pacotes da tarefa 1. As demais tarefas da fundação criam arquivos
> ("avisar depois") sobre essa base.

| # | Tarefa | CA | Checks |
|---|---|---|---|
| 1 | Scaffold: `package.json`, `tsconfig` strict, Vite + alias `@/`, ESLint + Prettier (espelho da API), Vitest + jsdom, `index.html` com Raleway, `main.tsx` mínimo, `.gitignore`, `npm install` | 01 (pré-condição de todos) | `npm run build`, `npm run test` (suíte vazia ok), `git status` |
| 2 | Design system: tokens `@theme` do ADR-002 (cores, rampa teal, raios, escala, tipografia), base de reset, keyframes `fadeUp` | 02, 03, 04, 05 (pré-condição visual) | build + teste de snapshot/valor dos tokens |
| 3 | Primitivos shadcn: `button` (variantes primary contorno/secondary/ghost/desabilitado), `input`, `label`, `dialog`, `toast`, `pill-situacao`, `chip-filtro`, `avatar` — conforme ADR-002 §5 | 02, 03, 04, 05 | build + testes de render por variante |
| 4 | Módulo `src/regras/`: `situacao`, `motivoBloqueio` (limite/atraso), `kpis`, `prazoDeHoje(+14)`, `formatarData DD/MM/AAAA`, `estaEmAtraso` — funções puras | 06, 07, 08, 09, 10 | testes Vitest `test_ca_06…test_ca_10` (blocos de regra PRD) |
| 5 | Sessão: client `supabase-js`, `SessaoProvider`, loader de sessão no React Router, `GuardSessao` + `GuardPapel` (papel virá de `GET /v1/sessao` — schema mockável enquanto a rota não existe, trocado pelo cliente orval na tarefa 8) | 01, 10 | testes dos guards (sem sessão → login; papel errado → redirect) |
| 6 | Shell: barra sticky 60px com marca, abas derivadas do papel, tag, avatar, Sair; rotas + outlet conforme plan §2 | 01, 10 | testes: abas do colaborador × abas de Operações |
| 7 | Página de login (ADR-002 §6.1): grade, faixa de estatísticas, form e-mail/senha via RHF+zod, redireciona por papel, erros via toast | 01 | testes do form (submit, erro de credencial); E2E fica p/ spec 002 |
| 8 | API (dependência): `GET /v1/sessao` + expor `openapi.json` — spec de API própria antes de codar | 01, 10 | testes da API (status + corpo, isolamento por tenant) |
| 9 | Contrato: versionar `openapi.json`, `orval.config.ts`, gerar `src/api/generated`, `api/chaves.ts`, adaptar SessaoProvider ao cliente gerado | 01 | build; diff do gerado revisado |

Próximas specs (fora desta): **002-catalogo** (CA-02, usa rota existente),
**003-solicitar-emprestimo** (CA-03 + 06/07/08), **004-devolucao** (CA-04 + 10),
**005-operacoes** (CA-05), **006-cadastro-equipamento** (CA-09 + form) — cada
uma com spec → plan → tasks, iniciada só após as rotas da API correspondentes
existirem e o `openapi.json` estar atualizado.
