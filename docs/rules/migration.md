---
description: Procedimento para qualquer mudança de schema
globs: ["prisma/migrations/**", "prisma/schema.prisma", "prisma/seed.ts"]
alwaysApply: false
---

# Mudança de schema
> leitor: agente

## Quando
Qualquer tarefa que precise criar, alterar ou remover tabela, coluna,
índice, constraint ou política de acesso (RLS) — inclusive quando a
mudança parecer trivial.

## Procedimento
1. Antes de gerar qualquer coisa: escreva a mudança pretendida (DDL +
   SQL bruto de RLS/policy/trigger, quando houver) na resposta e PARE.
   Eu aprovo ou corrijo.
2. Gere a migration pelo Prisma: `npx prisma migrate dev --name
   <nome>` contra o banco local. Uma migration por tarefa. O Prisma
   Migrate é o único dono do schema — nada de Supabase CLI nem SQL
   avulso como segundo dono.
3. RLS, policies e triggers entram como SQL bruto DENTRO da mesma
   migration, na linha do tempo versionada. Tabela nova nasce com Row
   Level Security habilitada e pelo menos uma policy explícita na
   mesma migration. Tabela sem policy não entra no repositório.
4. Toda tabela de domínio nasce com `tenant_id` desde o schema, junto
   com a referência necessária em `memberships (user_id, tenant_id,
   role)`. O tenant do request vem do JWT e é resolvido no guard —
   nunca do body ou da query.
5. Se a tabela já tem dado, diga o que acontece com as linhas
   existentes. Coluna obrigatória nova precisa de default ou de um
   passo de preenchimento (backfill) — e backfill de `tenant_id` em
   tabela existente é decisão do time, não do agente.
6. Aplique com `npx prisma migrate reset` no banco local e rode os
   testes de repositório (Testcontainers, Postgres real — nunca Prisma
   mockado para validar migration). Confirme que o seed idempotente
   (`prisma/seed.ts`) sobe sem erro.

## Verificação
`npx prisma migrate reset` numa máquina limpa aplica todas as
migrations do zero — incluindo o SQL bruto de RLS — e o seed sobe sem
erro e sem nenhum passo manual.

## Não faça
- Não altere schema pelo Studio do Supabase nem por SQL avulso. O que
  não está em migration do Prisma não existe.
- Não edite migration que já foi para o repositório remoto. Escreva a
  próxima. (Migration aplicada em produção também não se edita:
  `prisma migrate deploy` é o único caminho de produção.)
- Não toque no projeto Supabase remoto: nada de SQL, de alteração de
  schema ou de dado por lá. Tudo acontece no local.
- Não adicione `tenant_id` a tabela criada sem ele sem parar e pedir
  revisão: exige backfill e revisão de toda query que a toca.

