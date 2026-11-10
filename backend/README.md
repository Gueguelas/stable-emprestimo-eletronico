# stable-api

API do Stable — empréstimo de equipamentos de TI. Documentação de referência no
repositório irmão `estabulo-emprestimo-eletronico` (PRD, layout, ADR-001, regras).

## Stack (ADR-001)

NestJS + Prisma + PostgreSQL (Supabase), Zod via nestjs-zod, JWT do Supabase
Auth validado por JWKS, multi-tenancy por `tenant_id` com contexto em
`AsyncLocalStorage`.

## Requisitos

- Node.js LTS (testado no v22)
- Docker (para o banco local e para os testes com Testcontainers)

## Como rodar

```bash
npm install

# banco local em container (porta 5433)
docker run --name stable-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=stable -p 5433:5432 -d postgres:16-alpine

# migration + seed
npm run migrate:dev      # cria/aplica a migration local
npm run db:reset         # reseta do zero e roda o seed idempotente

# API local em http://localhost:3000/v1
npm run start:dev
```

## Testes

```bash
npm run test
```

Os testes de repositório sobem um Postgres real em container, aplicam a
migration e o seed de verdade (nunca Prisma mockado) e derrubam o container no fim.

## Rotas

- `GET /health` — liveness, sem JWT e sem banco. Resposta `{ "status": "ok" }`.
- `GET /v1/equipamentos` — catálogo com situação derivada (`disponivel`,
  `emprestado` com quem e prazo, `em_manutencao` com observação). Requer
  `Authorization: Bearer <token do Supabase>`. Paginação por cursor
  (`?limite=50&cursor=...`). Erros em RFC 9457.

## Regras do projeto (valem sempre)

- `tenant_id` em toda tabela; o tenant do request vem do JWT, nunca do body/query.
- Prisma Migrate é o único dono do schema; RLS entra como SQL bruto dentro da migration.
- Validação com Zod (nestjs-zod) — nunca class-validator.
- Não commitar nem dar push sem pedido explícito.
