# Spec — 001-fundacao-front

- Status: **perguntas respondidas por decisão do operador** ("assuma o que achar
  melhor e prossiga", 19/10/2026) — respostas registradas no fim deste arquivo
- plan.md e tasks.md: escritos a partir desta spec

## Contexto

O front do Stable não existe (`frontend/` vazio). A stack está decidida no
ADR-001 (React + Vite + React Router data APIs + TanStack Query + Zustand +
RHF/zodResolver + Tailwind + shadcn/ui + cliente orval + supabase-js) e o
visual no ADR-002 (Nocturne dark, acento teal `#2fb8ac` como linha, Raleway,
Phosphor, 5 telas + modal/toast). O protótipo aprovado está em
`prototipo/catalogo.html`.

Esta spec cobre a **fundação** do front inteiro (scaffold, design system,
roteamento, sessão, camada de API, shell de navegação, modal/toast, módulo de
regras derivadas, setup de testes). As telas viram specs próprias (catálogo,
solicitar/devolver, Operações, cadastro) seguindo o mesmo fluxo.

## Escopo proposto

1. Scaffold Vite + React + TypeScript `strict` em `frontend/`.
2. Design system do ADR-002 implementado como tokens Tailwind + variantes
   shadcn/ui (botão primário em contorno, pills, escala tipográfica Raleway,
   medidas da seção 4 do ADR-002).
3. React Router (data APIs): rotas com `loader` de sessão, shell com barra de
   navegação por papel (ADR-002 §7).
4. Sessão via `supabase-js` (ADR-001 §7): token no header `Authorization`,
   guard de rota e guard de papel.
5. Camada de API: `openapi.json` versionado + orval gerando
   `src/api/generated` (nunca editar à mão); TanStack Query com invalidação e
   polling.
6. Modal de confirmação e toast conforme ADR-002 §6.6 (420px; toast 2600ms).
7. Módulo de regras derivadas puro (`src/regras/`) — situação, limite de 3,
   bloqueio por atraso, KPIs, prazo 14 dias, `DD/MM/AAAA` — com testes Vitest.
8. Playwright com os fluxos críticos: login, solicitar empréstimo, devolver
   (ADR-001 §8).

## Fora de escopo

- Reserva com data futura, notificação por e-mail, importação de planilha (PRD).
- Tela de convite/provisionamento (o PRD não cobre).
- Tema claro, animações além das do ADR-002 §9.
- Deploy, config da Vercel, variáveis de ambiente reais (proibido para o agente).

## Perguntas que o PRD e os ADRs não respondem — e as respostas assumidas

1. **Origem do papel do usuário na UI — ASSUMIDO: endpoint `GET /v1/sessao` na
   API**, retornando `nome`, `email` e `papel` (`memberships` do tenant do JWT).
   Racional: o access token do Supabase não traz o papel de membership; claim
   custom exigiria mexer no projeto Supabase remoto (proibido ao agente).
   Consequência: cria uma tarefa de API como dependência do guard de papel.
2. **Ordem API × front — ASSUMIDO: contrato proposto primeiro, API cumpre antes
   de cada tela.** A fundação (scaffold, tokens, regras, roteamento, shell,
   login) não depende de nenhuma rota nova. Cada tela só inicia depois que sua
   rota existir na API e o `openapi.json` puder ser gerado — evita re-trabalho
   no cliente orval. Nada de mock silencioso de contrato.
3. **Repositório — ASSUMIDO: o front nasce em `frontend/` desta cópia**, na
   mesma situação da API (`backend/`), com migração para repositório próprio
   como pendência já registrada no AGENTS.md (não muda o ADR-001).
4. **Botão "Entrar como Operações" — ASSUMIDO: não existe no front real.**
   Login é e-mail + senha; as abas derivam do papel vindo de `GET /v1/sessao`.
   O atalho é exclusivo do protótipo.
5. **Responsividade abaixo de 1360px — ASSUMIDO: desktop-first, largura mínima
   suportada 1024px** (colunas quebram por `auto-fill`/grid natural, sem
   design de tablet/mobile na v1). Abaixo de 1024px não há compromisso.
6. **Acessibilidade além do contraste — ASSUMIDO: semântica e foco pelos
   primitivos (botão/label/inputs nativos por trás do shadcn) + regra de foco do
   ADR-002 §5; sem auditoria WCAG dedicada na v1.** Reavaliar antes da entrega
   final.
7. **Paginação do catálogo — ASSUMIDO: botão "Carregar mais" ao fim da grade,
   usando o cursor que a API já retorna.** Sem paginação por página/offset.

## Requisitos do PRD cobertos por esta spec e as seguintes

- Item 1 (Login + escopo por pessoa) · Item 2 (catálogo) · Item 3 (solicitar)
  · Item 4 (devolver) · Item 5 (tela de Operações) · regras: limite 3,
  prazo 14 dias, atraso bloqueia, manutenção nunca disponível.
