# Plan — 001-fundacao-front

Derivado de `spec.md`. Restrições que vêm dos ADRs (não negociáveis):

- **ADR-001 §2**: React, Vite, React Router (data APIs), TanStack Query,
  Zustand, RHF + zodResolver, Tailwind, shadcn/ui, cliente orval, TS `strict`.
- **ADR-001 §4**: contrato só via `openapi.json` gerado; cliente gerado
  versionado no front; erros RFC 9457; paginação por cursor; sem tempo real
  (polling do TanStack Query).
- **ADR-001 §7**: sessão = `supabase-js`, token no header; papel resolvido na
  API; o front nunca fala direto com o Supabase para dados.
- **ADR-001 §8**: Vitest (unitário) + Playwright (E2E); CI do front falha se o
  cliente gerado divergir.
- **ADR-002**: tokens, tipografia Raleway, acento teal como linha e brilho,
  medidas, componentes, páginas, animações, regras visuais §8 — normativos.
- **AGENTS.md**: estado derivado no render; PT-BR; `DD/MM/AAAA`; nenhum
  cliente HTTP à mão.

## 1. Estrutura de pastas

```
frontend/
├── index.html                ← Raleway 400/500/600/700 (Google Fonts)
├── package.json              ← scripts: dev, build, test, lint, generate
├── tsconfig.json             ← strict: true
├── vite.config.ts            ← alias @/, seção test (Vitest + jsdom)
├── eslint.config.js          ← typescript-eslint (config espelhada da API)
├── openapi.json              ← artefato da API, versionado
├── orval.config.ts           ← gera src/api/generated/
└── src/
    ├── main.tsx · app/ (router, providers)
    ├── api/generated/         ← orval; nunca editado à mão
    ├── api/chaves.ts          ← chaves de query centralizadas
    ├── sessao/ (supabase client, provider, guards de rota e papel)
    ├── regras/ (situacao, limites, botoes, kpis, datas — funções puras)
    ├── components/ (ui do shadcn + compostos do ADR-002)
    ├── paginas/ (login, catalogo, meus-emprestimos, operacoes, equipamentos-novo)
    └── estilos/ (tokens @theme do ADR-002, base, keyframes)
```

## 2. Rotas e guards

| Rota | Guard | Papel |
|---|---|---|
| `/login` | pública | — |
| `/` | sessão | redirect → `/catalogo` |
| `/catalogo` | sessão | ambos |
| `/meus-emprestimos` | sessão | ambos |
| `/operacoes` | sessão + papel `operacoes` | operações |
| `/equipamentos/novo` | sessão + papel `operacoes` | operações |

Shell com `<Outlet/>`: barra sticky 60px; abas derivam do papel da sessão
(mesma fonte para aba ativa, tag e guard — nada de `if` espalhado).

## 3. Design system (ADR-002 → Tailwind)

- Tokens no `@theme` do Tailwind: `--color-bg #161826`, `--color-surface
  #232532`, `--color-text #e9e9ed`, `--color-divider` (color-mix 16%), rampa
  teal 100–900 (500 = `#2fb8ac`), pares semânticos fg/bg/bd por situação.
- Texto secundário só por transparência sobre `--color-text` (72/70/62/55/45/40%).
- Raios 4/8/14; escala 0.70× (`2.8 5.6 8.4 11.2 16.8 22.4`); alturas 36/40px.
- Raleway: títulos 600, corpo 400, marca 700; kickers 11px uppercase 0.08em.
- Botão primário = contorno 1px teal sobre transparente; foco outline 2px
  teal offset 2px; desabilitado opacity .45.

## 4. Regras derivadas (`src/regras/`, funções puras)

- `situacao(item, emprestimo, euId)` → `disponivel | emprestado | em_atraso |
  em_manutencao | comigo` (emprestado nunca é coluna).
- `motivoBloqueio(meusAtivos)` → `null | limite | atraso` → rótulo e variante
  do botão saem daqui (ADR-002 §8.4/§8.5).
- `kpis(equipamentos, emprestimosAbertos)`; `prazoDeHoje(14)`;
  `formatarData` (`DD/MM/AAAA`); `estaEmAtraso(prazo, hoje)`.
- Nenhum desses valores é recalculado à mão no JSX.

## 5. Camada de dados

- orval a partir do `openapi.json` versionado; hooks TanStack Query.
- Queries: `sessao`, `equipamentos` (cursor, `placeholderData`),
  `emprestimos/meus`, `emprestimos/abertos`. Polling curto no catálogo e em
  Operações (sem WebSocket — ADR-001 §4).
- Mutations invalidam as chaves afetadas → toast; erro RFC 9457 tratado num
  ponto só (o front nunca lê `message` como regra de negócio).

## 6. Sequência (API cumpre antes de cada tela)

| Fase | Dependência de API |
|---|---|
| Fundação (esta spec): scaffold, tokens, regras, roteamento, shell, login | nenhuma; login usa só Supabase Auth |
| `GET /v1/sessao` (papel) | **nova rota na API** |
| Catálogo (spec 002) | `GET /v1/equipamentos` **existe**; falta expor `openapi.json` |
| Solicitar empréstimo (spec 003) | `POST /v1/emprestimos` — nova |
| Meus empréstimos + devolução (spec 004) | leitura/devolução de empréstimos — novos |
| Operações (spec 005) | `GET /v1/emprestimos` (abertos) — novo |
| Cadastro (spec 006) | `POST /v1/equipamentos` — novo |

Cada rota nova tem spec própria de API (padrão NNN) antes da tela que a
consome; nada de inventar tipo de resposta à mão enquanto o `openapi.json`
não existe.

## 7. Ferramentas e versões (compatíveis com Node v22.9.0 da máquina)

| Pacote | Versão | Motivo |
|---|---|---|
| vite | ^6.4.4 | Vite 7 exige Node ≥22.12; 6 é o topo compatível |
| @vitejs/plugin-react | ^5 | peer aceita vite ^6 |
| vitest | ^4.1.12 | v5 exige Node ^22.12; v4 aceita ^22 |
| typescript | ^5.9.3 | typescript-eslint aceita `<6.1` |
| eslint / typescript-eslint | ^10 / ^8.71 | peer `eslint ^10` ok |
| tailwindcss + @tailwindcss/vite | ^4.3.3 | peer vite ^6 ok; config CSS-first |
| react / react-dom | ^19.3 | atual |
| react-router-dom | ^7.18 | data APIs (ADR-001) |
| @tanstack/react-query | ^5.104 | ADR-001 |
| zod + @hookform/resolvers + react-hook-form | ^4.6 / ^5.9 / ^7.9 | resolvers 6 exige `effect@^4` e conflita; 5.9 é a estável com zod 4 |
| @supabase/supabase-js | ^2.118 | ADR-001 §7 |
| @phosphor-icons/react | ^2.1 | ADR-002 |
| orval | ^8.43 | ADR-001 §4 |
| @playwright/test | ^1.x | ADR-001 §8 (browsers instalados na tarefa de E2E) |

Zustand entra quando aparecer estado de cliente real (filtros persistentes,
wizard) — ADR-001 o prevê, mas não há necessidade dele na fundação.

## 8. Riscos

- `openapi.json` ainda não é exposto pela API (passo 3 do handoff) — bloqueia
  as fases 2+; é tarefa de API explícita no tasks.md.
- CSP restritiva (ADR-001 §10) pode bloquear Google Fonts — se ocorrer,
  self-hostar Raleway é mudança de ADR, avisar antes.
- Playwright baixa browsers (~300MB) — instalar só na tarefa de E2E, com aviso.
- Sem Supabase local declarado no projeto: roda-se o front contra o Supabase
  remoto de desenvolvimento só para login manual; testes automatizados nunca
  dependem da rede (mock do client de sessão nos testes).
