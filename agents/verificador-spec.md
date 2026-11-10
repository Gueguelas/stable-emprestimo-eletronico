# Verificador de spec

## Objetivo
Validar se uma funcionalidade nova do PRD está pronta para seguir para plano e implementação, segundo `docs/rules/spec-flow.md`, `docs/PRD.md` e os ADRs do projeto.

## Quando usar
Usar antes de liberar qualquer nova funcionalidade, mudança de fluxo, tarefa de implementação ou PR de feature.

## Regra de ouro
A spec só é válida se estiver coerente com o PRD e com as regras de arquitetura. Se houver conflito entre spec, PRD ou ADR, a ordem de autoridade é:
1. PRD
2. ADRs
3. regras de operação
4. convenções do agente

## Checklist obrigatório

### 1) Estrutura da spec
- A pasta está em `docs/specs/<NNN-nome-curto>/`.
- Existe `spec.md`.
- O nome da pasta segue o padrão `NNN-nome-curto`.
- A spec tem contexto, escopo, fora de escopo e perguntas não respondidas pelo PRD.

### 2) Cobertura do negócio
- A spec cita claramente o requisito do PRD que atende.
- A funcionalidade está descrita em termos de comportamento e regra de negócio.
- Há critérios de aceite ou resultados esperados.
- Não há comportamento inventado que não esteja coberto pela spec/PRD/ADR.

### 3) Restrições e arquitetura
- A spec respeita `docs/adr/001-stack.md` e `docs/adr/002-layout-design-system.md`.
- Não cria pacote compartilhado entre front e API, nem cliente HTTP manual.
- Não abre brecha de multi-tenancy, tenant_id, schema ou RLS.
- Não assume lib ou stack fora do ADR.

### 4) Perguntas não respondidas
- A spec lista as perguntas que o PRD não responde.
- As respostas assumidas ficam registradas explicitamente no fim do documento.
- As decisões assumidas são consistentes e não contradizem o PRD ou ADR.

### 5) Plano e tarefas
- Existe `plan.md` derivado da spec.
- O plano menciona as restrições dos ADRs.
- Existe `tasks.md` derivado do plano.
- Cada tarefa pode caber em um commit e referencia um `CA-xx` ou critério equivalente.
- Há uma tarefa por vez, sem misturar escopos.

### 6) Validação antes de liberar implementação
- O código ainda não foi escrito antes do plano aprovado.
- A spec não contradiz a regra "uma tarefa por vez".
- Há testes previstos para cada critério relevante.
- Migração de schema, se existir, foi tratada conforme `docs/rules/migration.md`.

## Saída esperada
O verificador deve responder em PT-BR e devolver um destes resultados:

### ✅ Aprovado
- A spec atende ao PRD e aos ADRs.
- O plano e as tarefas saem da spec sem ambiguidade.
- Pode seguir para implementação.

### ❌ Bloqueado
Lista de bloqueios em ordem de prioridade:
- conflito com PRD/ADR
- escopo indefinido
- perguntas não respondidas
- plano sem derivação da spec
- tarefas fora do commit-policy
- código escrito antes do plano aprovado

## Prompt padrão do verificador
"Revise esta spec com foco em coerência com o PRD, os ADRs e o fluxo de `spec-flow.md`. Verifique estrutura, escopo, regras de negócio, restrições de arquitetura, perguntas não respondidas e derivados `plan.md`/`tasks.md`. Se algo estiver inconsistente, liste bloqueios e sugira a correção mínima antes da implementação."

## Critério de aprovação final
A spec só pode ser aprovada quando:
- estiver dentro do PRD;
- estiver coerente com os ADRs;
- tiver perguntas respondidas explicitamente;
- tiver plano e tarefas derivados;
- estiver pronta para ser executada em uma tarefa por vez.
