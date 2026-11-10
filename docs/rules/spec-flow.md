## Quando
Ao iniciar qualquer funcionalidade nova do PRD.

## Procedimento
1. Crie docs/specs/<NNN-nome-curto>/ com spec.md.
2. Antes de escrever a spec, liste as perguntas que o PRD não
   responde. Espere as respostas.
3. plan.md sai da spec e cita os ADRs que o restringem.
4. tasks.md sai do plano. Cada tarefa cita um CA-xx e cabe
   num commit.
5. Uma tarefa por vez. Ao terminar, siga rules/checks.md.
6. Na prática 002/003, fechamento somente por `npm run fechar-spec -- <NNN-nome>`:
   o comando executa checks e inicia `agents/verificador-spec.md` em contexto
   limpo readonly. Não declarar pronta com CA pendente/sem teste ou relatório
   ausente/desatualizado. Só o principal corrige, inclusive teste quebrado.

## Não faça
- Não escreva código antes do plano aprovado.
- Não crie pasta de spec fora do padrão NNN-nome-curto.
