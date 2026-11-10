# ADR 002 — Layout e design system

- Status: Aceito
- Data: 2026-10-01

> Origem: este ADR registra as decisões antes documentadas em `docs/layout.md`
> (especificação de layout v1). O ADR-001 declara explicitamente que não decide
> design system, tokens e identidade visual — essa lacuna é fechada aqui.

## Contexto

O Stable substitui uma planilha compartilhada e precisa de uma identidade visual
única e reproduzível: catálogo, empréstimos e a visão de Operações saem de um
mesmo sistema de tokens, não de decisões ad hoc por tela. O desenho partiu de um
design system existente (**Nocturne** — interface escura, densa, acento usado
como linha e brilho, nunca como preenchimento sólido) e substituiu acento e
tipografia pela marca Stable. A especificação de reprodução completa vivia em
`docs/layout.md` como documento de handoff; este ADR a promove a decisão
registrada.

---

## Decisões

---

## 1. Base visual

| Item | Escolha |
|---|---|
| Design system base | Nocturne (interface escura e densa) |
| Tema | Escuro em toda a interface; sem modo claro na v1 |
| Acento | Teal `#2fb8ac` (marca Stable), como linha e brilho — nunca preenchimento sólido |
| Tipografia | Raleway, única família (Google Fonts, pesos 400/500/600/700) |
| Ícones | Phosphor Icons, quando houver |
| Protótipo | Uma folha `styles.css` do Nocturne + override de `:root`; todo o resto via `var(--*)` |

- **Nocturne como base** — o problema é reprodução fiel, não invenção de visual; partir de um sistema provado evita decidir token por token.
- **Acento como linha, não preenchimento** — o botão primário é contorno de 1px sobre transparente; nunca inundar áreas grandes com o acento. A interface fica quieta e o teal permanece sinal, não decoração.
- **Protótipo vs produção** — no front de produção a estilização é Tailwind + shadcn/ui (ADR-001). Os tokens e medidas deste ADR são normativos; a ferramenta de implementação não muda o que é normativo. Folha única e estilo inline valem para o protótipo, não para o front.
- **Fonte do desenho** — a justificativa do ADR-001 para Tailwind ("o design vem do Figma") refere-se a este desenho, de base Nocturne. Este ADR é a fonte normativa do visual; ajuste visual futuro passa por aqui, não por decisão por tela.

---

## 2. Cores

### Tokens de base (ground escuro)

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#161826` | fundo de toda página |
| `--color-surface` | `#232532` | cards, tabela, modal, inputs |
| `--color-text` | `#e9e9ed` | texto principal |
| `--color-divider` | `color-mix(in srgb, #e9e9ed 16%, transparent)` | bordas e réguas |
| `--color-neutral-900` | `#292b31` | avatares neutros na tabela |

### Acento da marca (substitui o acento do Nocturne)

Primária: **`#2fb8ac`** (teal). Rampa 100→900:

```
100 #e6faf7 · 200 #c2f1eb · 300 #93e3da · 400 #5fcfc4
500 #2fb8ac (base) · 600 #26978e · 700 #1d746d · 800 #15534e · 900 #0f3733
```

Uso: 500 para bordas/linhas/ícones e números de destaque; 300 para texto em tamanho de parágrafo sobre o fundo escuro (contraste); 900 para preenchimentos tintados (avatar do usuário, toast); 700 para bordas desses preenchimentos.
Tints por transparência usados no layout: `rgba(47,184,172,0.10)` (chip de filtro ativo), `0.12` (hover do botão primário e fundo de pill "Disponível"), `0.22` (pressed).

### Cores semânticas de situação (pills, bordas, prazos)

| Estado | Texto (`fg`) | Fundo (`bg`) | Borda (`bd`) |
|---|---|---|---|
| Disponível / Em dia | `#5fcfc4` | `rgba(47,184,172,0.12)` | `rgba(47,184,172,0.40)` |
| Emprestado / a vencer | `#c9a25f` | `rgba(201,162,95,0.12)` | `rgba(201,162,95,0.38)` |
| Em atraso / erro | `#e88b8b` | `rgba(200,90,90,0.14)` | `rgba(200,90,90,0.40)` |
| Em manutenção / inativo | `#9aa0ad` | `rgba(154,160,173,0.10)` | `rgba(154,160,173,0.30)` |

Banner de bloqueio por atraso: borda `#7a3b3b`, fundo `rgba(122,59,59,0.14)`, texto `#e88b8b`.

### Texto secundário

Sempre por transparência sobre `--color-text`, nunca um cinza novo:

| Opacidade | Uso |
|---|---|
| 72% | texto de apoio em painéis |
| 70% | labels de formulário |
| 62% | corpo de diálogo |
| 55% | subtítulos de página, metadados |
| 45% | kickers, patrimônio, dicas de KPI |
| 40% | rodapés discretos |

### Regras de cor

- Nunca preto puro nem branco puro.
- Nunca inundar áreas grandes com o acento: botão primário é **contorno** de 1px sobre transparente.
- Cromia baixa fora do acento; superfícies e bordas vêm dos neutros.

---

## 3. Tipografia

| Item | Escolha |
|---|---|
| Família | Raleway em `--font-heading` e `--font-body` |
| Peso | Títulos 600, corpo 400, marca 700 |
| Títulos | `line-height` ≈ 1.12, `letter-spacing: -0.015em`, `text-wrap: pretty` em títulos longos |
| Corpo | `line-height` 1.55 |

Escala usada:

| Elemento | Tamanho |
|---|---|
| H1 do login | 44px |
| H1 de tela interna | 30px |
| Número de KPI | 30px |
| H2 "Entrar" | 26px |
| Título de modal | 20px |
| Título de painel/seção | 17px |
| Título de card | 16.5px |
| Nome de item em lista | 16px |
| Subtítulo de página / lead do login | 14–16px |
| Corpo, célula de tabela, input, botão | 13.5–14px |
| Nota, metadado, chip | 12–13px |
| Kicker / cabeçalho de tabela | 11–11.5px, `letter-spacing: 0.08–0.09em`, `text-transform: uppercase` |
| Micro-rótulo (patrimônio, dica) | 11–12px |

Marca: `Stable` peso 700, `letter-spacing: 0.02em` — 17px na tela de login, 15px na barra de navegação.

---

## 4. Espaçamento, raios e elevação

Escala do Nocturne (densidade 0.70×): `2.8 · 5.6 · 8.4 · 11.2 · 16.8 · 22.4px`.
Raios: `--radius-sm 4px`, `--radius-md 8px` (botões, inputs, linhas de lista), `--radius-lg 14px` (cards, painéis, modal, moldura).
Elevação: `--shadow-sm/md/lg` do sistema; nunca sombras empilhadas.

Medidas aplicadas:

- Padding de conteúdo das telas internas: `36px 40px 64px`.
- Larguras máximas de conteúdo: Catálogo 1240px · Meus empréstimos 1000px · Operações 1320px · Equipamentos 1160px.
- Login: `64px 56px` em ambas as colunas.
- Barra de navegação: altura **60px**, padding lateral 40px, `gap: 32px` entre marca e abas.
- Card do catálogo: padding 18px, `gap: 12px` interno.
- Grade do catálogo: `repeat(auto-fill, minmax(292px, 1fr))`, `gap: 16px`.
- Linha de "Meus empréstimos": padding `18px 20px`, `gap: 20px` entre colunas.
- Grade de KPIs: 4 colunas, `gap: 14px`, padding `16px 18px`.
- Tabela: cabeçalho `12px 18px`, célula `13px 18px`.
- Modal: largura **420px**, padding 26px.
- Formulário de cadastro: grade 2 colunas, `gap: 14px`; coluna direita de regras com 300px.
- Layout sempre em flex/grid com `gap` — nunca margens por elemento para espaçar irmãos.

Alturas de controles: input/select 36px (padding `6px 10px`) · botão padrão 36px · botão do login 40px · avatar 28px (26px na tabela) · pill de status 3px/9px, `border-radius: 999px` · traços do limite de 3 itens: 5px de altura, largura flex igual, `border-radius: 999px`.

---

## 5. Componentes

> As classes abaixo descrevem papéis e estados do protótipo. No front de
> produção eles viram componentes shadcn/ui + Tailwind (ADR-001) com o mesmo
> contrato visual. Nomes de classe não são normativos; aparência e
> comportamento, sim.

- `.btn` + `.btn-primary` (contorno acento) · `.btn-secondary` (contorno divider) · `.btn-ghost` (texto acento) · `.btn-block`.
- `.tag` + `.tag-outline` para etiquetas de papel/seção.
- `.card` (+ `.card-kicker`, `.card-title`) e `.elev-sm/md/lg`.
- `.field` + `label` + `.input` (inclui `select` e `textarea`).
- `.radio` + `.dot` para a situação inicial no cadastro.
- `.nav` + `.nav-brand` para a barra de topo.
- `.table` para a lista de Operações.
- `.dialog-backdrop` + `.dialog` (+ `-title`, `-body`, `-actions`).
- Estados: hover tintado do acento, pressed um passo além, foco `outline: 2px solid var(--color-accent); outline-offset: 2px`. Desabilitado: `opacity .45` + `cursor: not-allowed`.
- Marca desenhada como quadrado de 22–26px com borda 1.5px do acento, raio 6–7px, e um quadradinho preenchido de 8–9px (raio 2px) centralizado.
- Régua de seção: `height:1px; background: linear-gradient(90deg, transparent, var(--color-divider) 48px, var(--color-divider) calc(100% - 48px), transparent)` — as réguas desaparecem nas pontas.

---

## 6. Páginas

### 6.1 Login
Grade `1.05fr 0.95fr`, altura mínima 820px.

- **Esquerda** (fundo `linear-gradient(160deg,#1b1f2e,#161826 60%)` + brilho radial `rgba(47,184,172,0.16)` de 520px, deslocado `left:-160px; top:120px`): marca no topo, título 44px em duas linhas, lead 16px em 60% de opacidade, e uma faixa de 3 estatísticas (`3 itens por pessoa`, `14 dias de prazo`, `0 linhas para preencher`) acima de uma borda superior; rodapé "Operações · TI interno" em 12px/40%.
- **Direita**: coluna de 340px centralizada verticalmente — H2 "Entrar", lead, campo E-mail, campo Senha, botão primário `btn-block` (40px), botão ghost "Entrar como Operações →", nota "Cada pessoa vê apenas os próprios empréstimos".

### 6.2 Catálogo
Cabeçalho: H1 "Catálogo" + contagem "X de Y equipamentos disponíveis agora"; busca de 260px alinhada à direita.
Banner de bloqueio (condicional). Linha de chips de filtro: Todos · Disponíveis · Emprestados · Em manutenção.
Grade de cards. Card = kicker de categoria (uppercase 11px) · nome 16.5px · patrimônio 12px · pill de situação à direita · linha de detalhe (min-height 18px: "Pronto para retirada no balcão" / "Com {pessoa} · devolver até {data}" / observação de manutenção) · botão de largura total.

### 6.3 Meus empréstimos
H1 + "N de 3 itens em seu nome · prazo padrão de 14 dias".
Barra de 3 traços (ocupados no acento, atraso em vermelho, vazios em `text 12%`).
Linhas de empréstimo com borda esquerda de 3px na cor do estado, em 5 colunas de flex: item (1.4) · Retirada (1) · Devolver até (1, na cor do estado) · pill (0.9) · botão "Devolver".
Estado vazio: caixa tracejada, padding 48px, centralizada, com botão "Ir ao catálogo".
Rodapé de regras em três itens de 12.5px.

### 6.4 Operações · empréstimos em aberto
H1 + lead; busca de 230px + botão primário "Cadastrar equipamento".
4 KPIs: Em aberto · Em atraso (vermelho) · Disponíveis (acento) · Manutenção (cinza), cada um com rótulo uppercase, número 30px e dica.
Tabela dentro de contêiner com raio `lg` e overflow hidden: Pessoa (avatar + nome) · Equipamento · Patrimônio · Retirada · Prazo (na cor do estado) · Situação (pill) · ação "Registrar devolução" alinhada à direita. Cabeçalho com fundo `text 5%`; linhas separadas por borda superior de 1px.
Estado sem resultados: texto centralizado, padding 40px.

### 6.5 Equipamentos (cadastro, Operações)
Grade `1fr 300px`, `gap: 34px`, alinhada ao topo.

- Formulário em card: Nome (2 colunas) · Categoria (select: Notebook, Monitor, Cabo, Câmera, Acessório) · Patrimônio · Observações (textarea, 2 colunas) · rádios de situação inicial (Disponível / Em manutenção) · rodapé com borda superior e ações "Cadastrar equipamento" (primário) + "Cancelar" (ghost).
- Coluna direita: painel "Regras em vigor" (4 itens com travessão no acento) e painel "Fora desta versão" (Reserva com data futura, Notificação por e-mail, Importação da planilha — em 42% de opacidade).

### 6.6 Sobreposições

- **Modal** (420px): título · corpo · bloco resumo com borda (raio `md`, padding `14px 16px`) contendo duas linhas rótulo/valor (o valor em destaque no acento) · ações à direita: "Cancelar" (secundário) + confirmação (primário). Backdrop `rgba(10,11,18,0.68)`, clique fora fecha, clique dentro não propaga.
- **Toast**: fixo, `left:50%` com `translateX(-50%)`, `bottom: 28px`, padding `12px 20px`, `border-radius: 999px`, fundo `--color-accent-900`, borda `--color-accent-700`, texto `--color-accent-200`, 13.5px. Sai automaticamente em **2600ms**.

---

## 7. Navegação

- Papéis: **Colaborador** → abas `Catálogo`, `Meus empréstimos`. **Operações** → `Catálogo`, `Operações`, `Equipamentos`, `Meus empréstimos`.
- Aba ativa: `border-bottom: 2px solid var(--color-accent)` e texto em 100%; inativa: linha transparente e texto em 55%. Botões de aba com altura total da barra (60px), padding lateral 14px, sem raio.
- Barra é `position: sticky; top: 0`, fundo `--color-bg`, `z-index: 20`; à direita: etiqueta do papel (`.tag-outline`), avatar com iniciais (fundo `accent-900`, borda `accent-700`, texto `accent-300`), nome e "Sair".
- Entradas: "Entrar" → Catálogo (papel Colaborador); "Entrar como Operações" → Operações (papel Operações). "Sair" → Login.
- Atalhos internos: banner de atraso → Meus empréstimos; estado vazio → Catálogo; "Cadastrar equipamento" → Equipamentos; "Cancelar" no cadastro → Operações; após cadastrar → Operações + toast.
- No protótipo, as transições são troca de tela na mesma janela, sem URL — é isso que "não há rotas aninhadas" descreve; no front de produção o roteamento é React Router (ADR-001). Sem modais empilhados, em nenhum dos dois.

---

## 8. Interações e regras visuais de negócio

> As regras de negócio em si vivem no PRD; aqui está o compromisso visual de
> como cada estado se apresenta. Em todos os casos, o estado é **derivado no
> render** — contagens, KPIs, cores de estado, rótulo e habilitação de botão
> nunca são duplicados à mão.

1. **Solicitar empréstimo** (card disponível): abre modal com "Devolver até = hoje + 14 dias". Confirmar → item passa a `emprestado` com o nome da pessoa, sai do disponível, entra em Meus empréstimos e na tabela de Operações; toast de confirmação.
2. **Devolver** (Meus empréstimos): modal "Devolução em {hoje}". Confirmar → item volta a `disponivel`, libera um slot, sai da tabela de Operações; toast.
3. **Registrar devolução** (Operações, balcão): mesmo efeito, com "Pessoa" no lugar da data no resumo do modal.
4. **Limite de 3 itens**: com 3 empréstimos ativos, todo botão de solicitar fica desabilitado com o rótulo "Limite de 3 itens" e vira `btn-secondary`.
5. **Atraso bloqueia**: com qualquer item em atraso, os botões viram "Bloqueado por atraso" (desabilitados) e o banner vermelho aparece no topo do catálogo com atalho para o item pendente.
6. **Manutenção**: nunca conta como disponível; card com pill cinza, detalhe com a observação e botão "Indisponível" desabilitado.
7. **Item já com o usuário**: botão "Está com você" (desabilitado); com outra pessoa: "Emprestado" (desabilitado) e o detalhe mostra quem e o prazo.
8. **Busca**: catálogo filtra por nome + patrimônio; Operações filtra por pessoa + item; ambas case-insensitive, filtragem imediata a cada tecla, com estado vazio próprio.
9. **Filtros de situação**: exclusivos (Todos / Disponíveis / Emprestados / Em manutenção); ativo ganha borda e texto no acento e fundo `rgba(47,184,172,0.10)`.
10. **Cadastro**: nome obrigatório (sem nome → toast "Informe o nome do equipamento"); patrimônio vazio cai para `TI-—`; item entra no topo da lista.
11. **Escopo por pessoa**: cada usuário vê somente os próprios empréstimos; a visão completa existe apenas em Operações.

Fora da v1: reserva com data futura, notificação por e-mail, importação de planilha.

---

## 9. Animações

Discretas e curtas — a interface é quieta.

```css
@keyframes fadeUp { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
```

- Cards do catálogo: `fadeUp .25s ease both` ao renderizar.
- Modal: `fadeUp .18s ease both`; backdrop aparece sem animação.
- Toast: `fadeUp .2s ease both` na entrada, remoção após 2600ms.
- Hover/pressed de botões e bordas de input: transição implícita do design system; nenhum efeito de escala, sombra pulsante ou parallax.
- Nada de animação em números de KPI, tabela ou navegação.

---

## 10. Dados de exemplo e controles de protótipo

Fixture para reproduzir as telas fielmente — dado de protótipo, não modelagem de
domínio.

Usuário: **Ana Ribeiro** (iniciais AR). Data de referência: **31/08/2026**.

Equipamentos: Notebook Dell Latitude 5450 (TI-0142, disponível) · MacBook Pro 14 M3 (TI-0088, com Marcos Lemos até 07/09) · Monitor LG 27" 4K (TI-0231, disponível) · Monitor Dell 24" FHD (TI-0233, manutenção — "Painel com falha, retorna em 05/09") · Câmera Sony ZV-1 (TI-0301, com Ana até 12/09) · Cabo HDMI 2.1 3m (TI-0455, disponível) · Dock Thunderbolt 4 (TI-0512, com Ana até 05/09) · Tripé Manfrotto Befree (TI-0318, manutenção — "Trava do centro quebrada") · Headset Jabra Evolve2 (TI-0402, disponível).

Empréstimos em aberto: Ana Ribeiro/Sony ZV-1 (29/08→12/09) · Ana Ribeiro/Dock (22/08→05/09) · Marcos Lemos/MacBook (24/08→07/09) · Júlia Prado/Notebook Lenovo T14 TI-0119 (26/08→09/09) · Rafael Souza/Monitor AOC 24" TI-0244 (18/08→01/09) · Camila Nunes/Câmera GoPro Hero 12 TI-0307 (05/08→19/08, **em atraso**).

Assim, por padrão: 2 de 3 slots da Ana ocupados e em dia, 4 itens disponíveis, 2 em manutenção, 6 empréstimos em aberto, 1 em atraso.

> Reconciliação com o seed (`backend/prisma/seed.ts`): os contadores acima
> descrevem a visão do protótipo, de 9 itens. No banco são 12 equipamentos,
> porque os empréstimos de Júlia, Rafael e Camila referenciam itens fora da
> lista (Lenovo T14 TI-0119, Monitor AOC TI-0244, GoPro Hero 12 TI-0307) e o
> seed os materializa. No schema, `situacao` é intrínseca
> (`disponivel`/`em_manutencao`); "emprestado" nunca é coluna — deriva do
> empréstimo em aberto.

Notas de protótipo (não valem para o front de produção):

- Estado da aplicação em memória: `view`, `role`, `query`, `opsQuery`, `filter`, `modal`, `toast`, `items[]`, `loans[]`, campos do formulário.
- Controles úteis: `startView` (login, catalogo, meus, operações, cadastro) e `demoState` (none, modal-solicitar, modal-devolver, sem-emprestimos, atraso-bloqueado, toast).
- Altura mínima das telas: 820px; larguras de referência do desenho: 1360–1440px.

---

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Biblioteca de UI com visual próprio (MUI, Ant) | Brigaria com a exigência de reprodução fiel do desenho; mesma razão do Tailwind + shadcn/ui no ADR-001 |
| Tema claro ou modo duplo | Dobra o custo de contraste e de testes; a v1 é de uso interno |
| Acento como preenchimento sólido de botões e cards | Remove o contraste que distingue ação de estado; a interface grita |
| Cinza fixo para texto secundário | Duplica tokens e diverge quando o fundo muda; transparência sobre `--color-text` acompanha qualquer ajuste |
| Segunda família tipográfica (título + corpo) | Duas famílias e dois contratos de peso para um app operacional interno não compensam |
| Animações ricas (parallax, escala, sombra pulsante) | Interface de operação; movimento chama atenção onde não há decisão |
| Outro conjunto de ícones (Material, Lucide) | Phosphor tem traço fino coerente com a densidade do Nocturne |

---

## Consequências

**Fica mais fácil**

- Reproduzir novas telas: token, medida e componente existem antes da decisão por tela.
- Auditar consistência: cor ou medida fora dos tokens é desvio visível.
- Trocar acento ou fonte: mudança concentrada no `:root` / configuração de tema.
- Onboarding de quem implementa: especificação única e fechada, sem regra espalhada.

**Fica mais difícil**

- Contraste depende de disciplina: texto secundário por transparência exige conferir a opacidade por função (40–72%).
- Dark-first: um tema claro depois é recalibração de cada transparência e tint, não um flag.
- Densidade 0.70× apertada: deslizar uma medida quebra o padrão inteiro.
- Acento restrito a linha e tint limita destaques grandes e ilustrações coloridas.

**O que isso impede de fazer depois sem custo**

- Trocar a fonte ou o acento: recalibra todo contraste calibrado sobre o fundo escuro.
- Adicionar modo claro: cada transparência de texto e tint de acento precisa revisão.
- Usar o acento como preenchimento sólido em superfícies grandes: contradiz a regra central.
- Introduzir segunda família tipográfica ou segundo conjunto de ícones.

**Dependência do contexto**

- Raleway vem de Google Fonts; sem acesso à rede, o fallback depende do stack tipográfico do sistema — os tamanhos da escala 3 já foram calibrados para Raleway.

---

## O que este ADR não decide

- Implementação de tema no front (config Tailwind, tokens em shadcn/ui) — ferramenta, não decisão visual; a ferramenta segue o ADR-001.
- Rotas e URLs do front real — o protótipo troca de tela na mesma janela; o roteamento é React Router (ADR-001).
- Responsividade abaixo de 1360px — as larguras de referência do desenho são 1360–1440px.
- Acessibilidade além das regras de contraste registradas aqui (WCAG, navegação por teclado, leitores de tela).
- Microcopy além do tom registrado (PT-BR, direto, operacional, sem exclamação, sem emoji).
- Modelagem de domínio e estado real — os dados da seção 10 são fixture de protótipo.
- Onde os dados do domínio vêm — API, schema e autorização são do ADR-001 e do PRD.





