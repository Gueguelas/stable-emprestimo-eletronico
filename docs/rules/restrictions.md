---
description: O que o agente não pode fazer neste projeto
globs: []
alwaysApply: true
---

# O que não fazer
> leitor: agente

## Autoridade

- Não escreva ADR. Se encontrar uma decisão que precisa de um, descreva
  a decisão e as alternativas, e PARE. Quem decide é o time.
- Não contrarie o que está em docs/adr/. Se precisar contrariar, pare.
- Não responda por conta própria o que o PRD deixou ambíguo. Liste as
  perguntas e espere. (Ex.: quem provisiona tenant, quem convida
  usuário, provedor de e-mail — o PRD não cobre.)
- Não escolha biblioteca que não esteja no ADR-001. Proponha e espere.
- Não decida por conta própria o que o PRD e o ADR-002 deixaram em
  aberto (papéis, matriz de permissão, tokens visuais fora do
  docs/adr/002-layout-design-system.md).

## Escopo

- Não altere arquivo fora do escopo da tarefa atual.
- Não refatore código fora do pedido atual, nem em outro repositório
  (front ou API) que não seja o alvo da tarefa.
- Não gere scaffold automático de framework sem mostrar antes o que
  ele vai criar.
- Não escreva código de funcionalidade sem uma spec ou requisito
  correspondente no PRD. Se não houver cobertura, proponha a spec e
  espere.
- Não crie pacote compartilhado de tipos entre front e API: o
  contrato atravessa via OpenAPI gerado com orval.
- Não escreva cliente HTTP à mão nem reescreva tipos de resposta à
  mão. Regere o cliente a partir do `openapi.json`.
- Não troque o dono do schema: o Prisma Migrate é o único dono. RLS,
  policies e triggers entram como SQL bruto dentro das migrations —
  nunca como script solto ou segundo dono.
- Não use `class-validator`: validação de entrada é Zod via
  `nestjs-zod`, do mesmo schema que gera o OpenAPI.
- Não duplique estado derivado de regra de negócio à mão: contagens,
  KPIs, cores, rótulos e habilitação de botão são derivados no render.
- Não deixe o front falar direto com o Supabase: a autorização por
  tenant é resolvida no guard da API. O `tenant_id` do request vem do
  JWT, nunca do body ou da query.

## Ritmo

- Não escreva código antes de um plano aprovado. Escreva o plano,
  mostre e espere.
- "Pode implementar" NÃO autoriza o plano inteiro: execute UMA tarefa,
  rode os checks, mostre o resultado e pare.
- Não relate sucesso parcial. Se um check falhou, a tarefa não
  terminou.

## Git

- Não faça commits nem push sem pedido explícito do usuário.
- Sempre deixe as modificações em staging para o usuário avaliar e dar
  o veredito.
- Não faça push na branch de produção: deploy acontece por push, e a
  decisão de publicar é do time.
- Nunca versionar o `.env`.

## Produção

- Não rode deploy nem altere configuração da Vercel.
- Não toque no projeto Supabase remoto: nada de SQL, de alteração de
  schema ou de dado por lá. Schema e SQL bruto vivem nas migrations do
  Prisma Migrate, aplicadas pelo fluxo definido no ADR-001.
- Não adicione `tenant_id` a tabela existente por conta própria:
  exige backfill e revisão de toda query que a toca.

## Precedência

- Se o código e uma spec discordarem sobre comportamento, a spec está
  certa até que alguém mude a spec.
- Se o código e o PRD discordarem sobre regra de negócio, o PRD está
  certo até que o time mude o PRD.
- Se uma regra de procedimento contrariar um ADR, o PRD ou uma spec,
  PARE e avise. Não escolha um dos dois por conta própria.
- "Pode ir" e "pode implementar" não revogam nada deste arquivo.

