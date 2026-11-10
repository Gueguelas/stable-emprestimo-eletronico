# Plan BIZARRO — reproduzir o front do Stable exatamente como feito

Documento para outra IA. Não é um roadmap. É o registro do que foi feito, na ordem, com as decisões que não estavam no pedido e o critério de “igual”.

Idioma da UI: português do Brasil. Não commitar nem dar push. Não mexer no `backend/` além de ler.

---

## 0. Pedido original e o que foi combinado

Pedido: “Quero fazer o front-end” no projeto `estabulo-emprestimo-eletronico`.

Pergunta feita ao usuário (escolha confirmada):

> Foundation + login + Catálogo wired to the real API; other pages as mocks.

Tradução operacional:

- Fundação do app (Vite, tokens, kit).
- Login real (Supabase).
- Catálogo ligado a `GET /v1/equipamentos`.
- Meus empréstimos, Operações e Equipamentos com dados de exemplo (ADR-002 §10), estado só em memória.

Depois o usuário pediu:

1. Rodar o dev server (`npm run dev` na porta 5173) e abrir no browser canvas.
2. Tutorial no README de como rodar o front com o backend local **e** com a API em produção, e também o front na Vercel.
3. Publicar o front na Vercel — **não foi feito** (CLI deslogado; deploy temporário também exigiu login). Não invente URL de produção.
4. Este `plan.md`.

---

## 1. Onde criar

Pasta nova, irmã do backend:

```
estabulo-emprestimo-eletronico/frontend/
```

ADR-001 pede repositório separado. **Não separe agora.** A pasta tem que ser extraível depois (sem imports para `../backend`).

Leia antes de escrever (normativos, não opcionais):

- `AGENTS.md`
- `docs/adr/001-stack.md` §§ 2, 4, 7
- `docs/adr/002-layout-design-system.md` inteiro
- `docs/PRD.md`
- `docs/rules/clean-code.md`, `tests.md`, `checks.md`
- `prototipo/catalogo.html` (referência visual)
- `backend/src/equipamentos/equipamentos.schema.ts`
- `backend/src/main.ts` (prefixo `/v1`, CORS)
- `backend/src/auth` (JWT: a API só exige `sub` + `tenant_id`)

---

## 2. Stack exata (package.json)

Scripts:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "e2e": "playwright test"
}
```

Dependências (versões que passaram no build; pin aproximado ok se o lock for gerado de novo):

- runtime: react 18, react-dom, react-router-dom 6, @tanstack/react-query 5, zustand 5, react-hook-form 7, @hookform/resolvers 3, zod 3, @supabase/supabase-js 2, @phosphor-icons/react 2, @radix-ui/react-dialog, class-variance-authority, clsx, tailwind-merge
- dev: vite 5, @vitejs/plugin-react, typescript 5 strict, tailwindcss 3, postcss, autoprefixer, vitest 2, jsdom, @testing-library/react 16, jest-dom, user-event, @playwright/test, @types/react, @types/node

Alias `@` → `src`. TypeScript `strict`. Sem `any` solto. Sem class-validator. Sem MUI/Ant.

`.gitignore`: `node_modules`, `dist`, `.env`, `playwright-report`, `test-results`, `*.tsbuildinfo`.

`.env.example`:

```
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=
```

`vercel.json`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Tailwind: tema escuro único. Tokens ADR-002 no `theme.extend` / `:root` do `index.css`:

- bg `#161826`, surface `#232532`, text `#e9e9ed`, accent `#2fb8ac`
- divider `color-mix(in srgb, #e9e9ed 16%, transparent)`
- fonte Raleway (Google Fonts, 400/500/600/700) no `index.html`
- foco: `outline: 2px solid accent; outline-offset: 2px`
- desabilitado: opacity .45 + cursor not-allowed
- animação `fadeUp` 6px / .25s nos cards, .18s no modal, .2s no toast
- botão primário é **contorno** teal, nunca fill sólido

---

## 3. Árvore que tem que existir

```
frontend/
  .env.example  .gitignore  README.md  index.html  package.json  package-lock.json
  vercel.json  vite.config.ts  tailwind.config.ts  postcss.config.js
  tsconfig.json  playwright.config.ts
  e2e/smoke.spec.ts
  src/
    main.tsx  router.tsx  index.css  vite-env.d.ts  test-setup.ts
    api/client.ts  api/schemas.ts  api/useEquipamentos.ts
    lib/cn.ts  lib/datas.ts  lib/datas.test.ts  lib/supabase.ts
    stores/auth.ts  stores/toast.ts  stores/emprestimosMock.ts
    features/auth/claims.ts  features/auth/claims.test.ts
    features/emprestimos/regras.ts  regras.test.ts  prazo.ts  useContextoUsuario.ts
    features/catalogo/EquipamentoCard.tsx  situacao.ts
    components/AppLayout.tsx  AppNav.tsx
    components/ui/brand.tsx button.tsx card.tsx dialog.tsx input.tsx pill.tsx section-rule.tsx tag.tsx toaster.tsx
    pages/LoginPage.tsx CatalogoPage.tsx MeusEmprestimosPage.tsx OperacoesPage.tsx EquipamentosPage.tsx
    mocks/fixtures.ts
docs/handoff/2026-10-19.md
```

---

## 4. Contratos que não podem divergir

### 4.1 Papel

```ts
type Papel = "colaborador" | "operacoes";
```

Ler de `app_metadata.papel`, senão `app_metadata.role`, senão claim de topo `papel`. **Ignorar** o `role` de topo do Supabase (`authenticated`). Qualquer outro valor = `colaborador`.

Nome: `user_metadata.nome` → `full_name` → `name` → email.

### 4.2 Rotas (React Router data APIs, loaders, não só `<Navigate>`)

| path | guarda |
|---|---|
| `/login` | se já tem sessão, redirect `/catalogo` |
| `/` | exige sessão; senão `/login?para=<pathname>` |
| `/` index | redirect `/catalogo` |
| `/catalogo` | sessão |
| `/meus-emprestimos` | sessão |
| `/operacoes` | sessão + papel `operacoes`, senão `/catalogo` |
| `/equipamentos` | igual Operações |
| `*` | redirect `/catalogo` |

Nav (sticky, 60px, fundo bg, z-20):

- Colaborador: Catálogo, Meus empréstimos
- Operações: Catálogo, Operações, Equipamentos, Meus empréstimos
- Aba ativa: borda inferior 2px accent, texto 100%. Inativa: texto 55%.
- Direita: tag do papel, avatar com iniciais (fundo accent-900), nome, Sair.

### 4.3 Auth store (Zustand)

- Sessão Supabase real quando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` existem.
- **Sem essas vars: modo dev.** Qualquer e-mail/senha entra como Ana Ribeiro (id fixo de dev, papel colaborador ou um atalho “Entrar como Operações” que seta papel `operacoes`). Faixa de aviso no topo. Token falso. A API real recusa esse token — o Catálogo mostra erro. Isso é intencional.
- `supabase-js` guarda o token; o client HTTP manda `Authorization: Bearer <access_token>`.
- Sair limpa a store e volta ao login.

Login §6.1: grade ~1.05fr / 0.95fr, min-height 820px. Esquerda: marca, título em duas linhas, lead, 3 stats (`3 itens por pessoa`, `14 dias de prazo`, `0 linhas para preencher`), rodapé “Operações · TI interno”. Direita: coluna 340px, H2 “Entrar”, e-mail, senha, botão primário block, ghost “Entrar como Operações →”, nota “Cada pessoa vê apenas os próprios empréstimos”.

### 4.4 API

`src/api/schemas.ts` espelha `equipamentos.schema.ts`:

- situacao: `disponivel | emprestado | em_manutencao`
- categoria: `notebook | monitor | cabo | camera | acessorio`
- item: id uuid, nome, categoria, patrimonio, situacao, comPessoa nullable, prazo `YYYY-MM-DD` nullable, observacao nullable
- lista: `{ itens, proximoCursor }`
- query: limite 1–100 default 50, cursor opcional

Client:

- base = `VITE_API_URL` sem barra final + `/v1`
- Bearer do store
- erro: tentar parse RFC 9457 (`title`/`detail`); senão mensagem genérica
- validar resposta com zod; falha de parse é erro de UI, não crash silencioso

`useEquipamentos`: TanStack Query, pagina com cursor até acabar ou um limite razoável, devolve a lista achatada.

**Cliente é manual.** Comentário no arquivo: provisório até existir `openapi.json` + orval. Não gere orval agora — a API não publica o spec.

### 4.5 Regras derivadas (puras, testadas)

Constantes: limite 3, prazo padrão 14 dias, “a vencer” = prazo em até 2 dias.

`hoje` dos mocks = **`2026-08-31`** (data de referência do ADR-002 §10). Não use `new Date()` para julgar os empréstimos de exemplo, senão tudo vira atraso.

Precedência do botão do card (`acaoDoCard`):

1. `em_manutencao` → “Indisponível”, disabled, secondary
2. patrimônio está com a pessoa (set dos empréstimos dela **ou** `comPessoa === nome`) → “Está com você”
3. `emprestado` → “Emprestado”
4. pessoa com qualquer atraso → “Bloqueado por atraso”
5. ativos >= 3 → “Limite de 3 itens”
6. senão → “Solicitar empréstimo”, enabled, primary

Detalhe do card: disponível = “Pronto para retirada no balcão”; emprestado = “Com {pessoa} · devolver até {data}”; manutenção = observação.

Busca: nome + patrimônio, case-insensitive, a cada tecla. Filtros exclusivos: Todos / Disponíveis / Emprestados / Em manutenção. Chip ativo: borda e texto accent, fundo `rgba(47,184,172,0.10)`.

Contagem do header: “X de Y equipamentos disponíveis agora” — X e Y derivados, nunca hardcoded.

### 4.6 Catálogo (API real)

- loading, erro (mostrar detail do problem), vazio de busca, vazio de filtro
- banner vermelho se `bloqueadoPorAtraso`, link para `/meus-emprestimos`
- modal solicitar (420px): “Devolver até” = hoje dos mocks + 14 dias. Confirmar **não** chama API. Toast: funcionalidade em breve (rota não existe). Toast 2600ms, pill, fundo accent-900, texto accent-200, bottom 28px, centralizado.
- Empréstimos usados para limite/atraso/“está com você” vêm do store mock (§10), filtrados pelo nome da sessão. No modo dev o nome é Ana Ribeiro → 2 de 3 slots, em dia na data 31/08/2026.

### 4.7 Páginas mock (fixtures §10, um arquivo `src/mocks/fixtures.ts`)

Usuário de referência: Ana Ribeiro, iniciais AR.

Equipamentos do protótipo (9) + os 3 que o seed materializa fora da lista curta se a tabela de Operações precisar deles: Lenovo T14 TI-0119 (Júlia), AOC TI-0244 (Rafael), GoPro TI-0307 (Camila, **atraso** 19/08).

Empréstimos em aberto exatamente como o ADR §10.

**Meus empréstimos:** só os da pessoa logada. Barra de 3 traços (ocupado accent, atraso vermelho, vazio text 12%). Linha com borda esquerda 3px na cor do estado. Devolver abre modal “Devolução em {hoje}”; confirmar tira o item do store e toast. Vazio: caixa tracejada + “Ir ao catálogo”.

**Operações:** 4 KPIs derivados (em aberto, atraso, disponíveis, manutenção). Busca pessoa+item. Tabela. “Registrar devolução” mexe só no store. “Cadastrar equipamento” vai para `/equipamentos`.

**Equipamentos:** RHF + zod. Nome obrigatório (senão toast “Informe o nome do equipamento”). Patrimônio vazio → `TI-—`. Categoria select. Situação inicial rádio disponível / em manutenção. Sucesso: entra no topo da lista local, vai para Operações, toast. Cancelar → Operações. Painel “Regras em vigor” e “Fora desta versão” (42% opacidade): reserva futura, e-mail, importação de planilha.

Nada disso persiste no backend.

### 4.8 Testes que têm que passar

Vitest (21 testes na sessão original; o número pode variar se você cobrir o mesmo comportamento, mas estas asserções são obrigatórias):

- papel: `app_metadata.papel=operacoes` → operacoes; `role` de topo `authenticated` não vira operacoes; ausência → colaborador
- atraso se prazo < hoje; a_vencer se <= 2 dias
- limite 3 desabilita solicitar
- atraso tem precedência sobre limite
- manutenção / comigo / emprestado com os rótulos acima
- busca e filtro exclusivos

Playwright smoke (API mockada com `page.route`, **não** depende de Supabase nem da API real):

1. login renderiza
2. catálogo com rede mockada + filtro
3. erro RFC 9457 aparece na UI

Dev fallback no E2E para não precisar de chave.

Verificação de pronto (`docs/rules/checks.md`):

```bash
cd frontend && npm run test && npm run build
npx playwright install chromium && npm run e2e
```

Esperado na sessão original: Vitest 21 passed, `tsc -b && vite build` ok, Playwright 3 passed.

---

## 5. README (escrever de verdade, não um stub)

Seção “Tutorial: front + back”. Regra de ouro: front e API no **mesmo** projeto Supabase.

Pré-requisito: usuário criado no painel (cadastro fechado). `app_metadata`:

```json
{ "tenant_id": "<uuid do tenant suporte_ti do seed>", "papel": "operacoes" }
```

`tenant_id` obrigatório para a API. `papel` opcional.

**Opção A — API local.** Terminal backend: docker postgres 16 na 5433, `npm run db:reset`, `npm run start:dev` em `:3000`. Front: `VITE_API_URL=http://localhost:3000` + chaves Supabase. Sem `FRONT_ORIGIN`, CORS aceita qualquer origem.

**Opção B — front local, API na Vercel.** `VITE_API_URL=https://<api>.vercel.app` sem `/v1`. Checar `/health`. Se a API tiver `FRONT_ORIGIN`, incluir `http://localhost:5173` e redeploy. Aviso: lê dado de produção.

**Opção C — front na Vercel.** Projeto separado, root `frontend/`, framework Vite, output `dist`, env `VITE_*` (mudou = redeploy), `vercel.json` já reescreve SPA. Na API: `FRONT_ORIGIN=https://<front>.vercel.app`.

Tabela de sintomas: faixa de modo dev, 401 (Supabase diferente ou sem tenant_id), CORS, failed to fetch, abas de Operações ausentes.

---

## 6. Handoff

Criar `docs/handoff/2026-10-19.md` (não sobrescrever `docs/handoff/2026-09-21.md` nem criar `handoff.md` na raiz — a regra pede raiz, o que foi feito foi o arquivo datado em `docs/handoff/`; mantenha essa escolha e anote o desvio).

Conteúdo mínimo: o que existe, o que é mock, cliente manual até orval, papel em `app_metadata.papel`, próximo passo = POST equipamentos + solicitar/devolver + publicar openapi.json.

---

## 7. O que NÃO fazer (desvios que quebram “igual”)

- Não implementar solicitar/devolver contra a API. As rotas não existem. Toast “em breve” no solicitar; devolução e cadastro só em memória.
- Não usar orval.
- Não usar data real do sistema para julgar fixtures.
- Não colocar o front dentro de `backend/`.
- Não commitar `.env`.
- Não publicar na Vercel sem login do usuário. A tentativa com `npx vercel deploy --temporary` falhou (“Temporary deployments aren't available… Log in”). Documente o comando, não finja a URL.
- Não editar CORS do backend. `FRONT_ORIGIN` vazio já libera tudo.
- Não adicionar modo claro.
- Não preencher botão primário com teal sólido.
- Não duplicar contadores à mão.

---

## 8. Como rodar depois de construir

```bash
cd estabulo-emprestimo-eletronico/frontend
cp .env.example .env   # sem chaves = modo dev
npm install
npm run dev -- --port 5173
```

Abrir http://localhost:5173/login. Qualquer senha entra como Ana Ribeiro. Catálogo mostra erro de API (esperado). Meus empréstimos / e, se entrar como Operações, Operações e Equipamentos, funcionam offline.

---

## 9. Critério de “fiz igual”

- Árvore da seção 3 presente.
- `npm run test` e `npm run build` verdes.
- Playwright smoke verde com rede mockada.
- Visual escuro, accent só em linha, Raleway, textos dos botões da seção 4.5 literais.
- Login com e sem Supabase nos dois comportamentos da seção 4.3.
- README com as três opções e `vercel.json` de SPA.
- Nenhum commit.
