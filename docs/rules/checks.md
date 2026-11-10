---
description: O que precisa passar antes de declarar uma tarefa pronta
globs: []
alwaysApply: true
---

# Verificação de fim de tarefa
> leitor: agente

## Quando
Sempre que você for dizer "pronto", "implementado" ou "funcionando".

## Procedimento
1. Rode os testes do repositório tocado pela tarefa, e cole a última
   linha da saída na resposta:
   - API: `npm run test` (Jest + supertest; repositório contra banco
     real via Testcontainers).
   - Front: `npm run test` (Vitest) e, se a tarefa tocou interface
     coberta por E2E, o Playwright.
2. Se a tarefa tocou migration, suba o banco local do zero: rode
   `npx prisma migrate reset` e confirme que ele aplica todas as
   migrations e o seed idempotente (`prisma/seed.ts`). Nunca contra o
   banco remoto.
3. Rode o build do repositório tocado antes de qualquer push:
   - Front: `npm run build` (Vite + TypeScript `strict`).
   - API: o build/lint equivalente definido no repositório.
   Build que quebra na Vercel é o feedback mais lento e mais caro
   deste projeto.
4. Rode `git status --short`. Só podem aparecer arquivos do escopo da
   tarefa. Para tarefa só de documentação ou protótipo, este é o único
   check aplicável — rode-o mesmo assim.
5. Diga qual critério esta tarefa atende, citando o item do PRD
   (seção "O que precisa existir" ou "Regras que Operações já
   decidiu") ou o CA-xx correspondente, se numerado.

## Verificação
Pronto = os comandos dos passos 1 a 4 terminaram sem falha E o git
status não trouxe surpresa. As duas coisas, não uma.

## Não faça
- Não relate sucesso parcial. Teste vermelho é tarefa não terminada,
  mesmo que o código "esteja certo".
- Não tente consertar a mesma falha duas vezes seguidas sem me mostrar
  a saída do erro.
- Não rode teste nem migration contra o banco remoto do Supabase.
- Se a tarefa mexeu no contrato (Zod/OpenAPI), não declare pronto sem
  regenerar o cliente orval no front e mostrar o diff do
  `openapi.json`/cliente gerado.

