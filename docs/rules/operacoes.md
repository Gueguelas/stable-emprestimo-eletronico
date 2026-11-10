---
description: Contrato de operacao entre mim e o agente neste projeto
globs: []
alwaysApply: true
---

# Contrato de operação

## Git
> leitor: agente

- Commit e push só com pedido explícito do usuário, conforme
  `RESTRICTIONS.md`. Não faça push na produção.
- Commits são feitos no repositório da raiz e nos repositórios abaixo - o de cima sendo uma visâo geral do projeto, e os de baixo sendo o front e a API. O commit é feito no repositório correto, de acordo com a tarefa.
- Commits são feitos nas branchs de ´dev´, e após tudo completo, Pull Request para a branch ´main´ . O deploy acontece por push, e a decisão de publicar é do time.
- Quando o usuário autorizar um commit, faça um por tarefa e use uma
  mensagem que cite a tarefa e o critério de aceitação.
- Nunca junte código e mudança de regra no mesmo commit.
- Sem autorização para commit, deixe as alterações em staging para
  revisão, conforme `AGENTS.md`.

## Autorização por tipo de ação
> leitor: agente

| ação                                        | nível          |
|---------------------------------------------|----------------|
| Editar arquivo existente dentro do escopo da tarefa | livre   |
| Criar arquivo novo                          | avisar depois  |
| Deletar ou renomear arquivo                 | pedir antes    |
| Instalar ou atualizar dependência           | pedir antes    |
| Criar ou alterar migration                  | pedir antes    |
| Mexer em variável de ambiente, config de deploy | proibido   |

O que cada nível significa:
- livre — faça e siga em frente.
- avisar depois — faça e me diga na resposta o que fez.
- pedir antes — descreva o que pretende fazer e PARE.
- proibido — não faça, mesmo que eu peça no meio de uma tarefa.
  Se eu pedir, me lembre desta linha.

## Configuração do operador
> leitor: humano — isto não é instrução para o agente

| fase                              | modelo / raciocínio |
|-----------------------------------|---------------------|
| Escrever a spec                   | raciocínio alto     |
| Planejar e quebrar em tarefas     | padrão              |
| Executar uma tarefa já decidida   | rápido              |
| Debugar algo que quebrou          | padrão              |
| Revisar o diff antes do commit    | rápido              |

- Revisão de diff acontece em sessão limpa, de preferência com
  modelo diferente do que escreveu o código.
- Sessão longa não se corrige com regra mais enfática: encerre
  seguindo rules/handoff.md e abra outra.
