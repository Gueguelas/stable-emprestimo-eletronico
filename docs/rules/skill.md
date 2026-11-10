## Quando
Ao terminar um procedimento que funcionou de primeira e é plausível que se
repita no projeto (reset de banco local, regeração do cliente orval, setup
de ambiente, ciclo de debug de uma classe de erro recorrente).

## Procedimento
1. Antes de improvisar qualquer procedimento conhecido, procure em
   docs/skills/ se um skill já cobre o passo. Se existir, siga-o.
2. Ao capturar um skill, crie docs/skills/<verbo-objeto>.md com, no máximo,
   20 linhas:
   - quando usar (uma frase)
   - passos na ordem exata, com os comandos literalmente
   - comando final de verificação
3. O skill cita as rules que o restringem (rules/checks.md,
   rules/migration.md) — nunca as duplica nem as contradiz.
4. Se o procedimento mudou desde a última execução, atualize o skill no
   mesmo commit da tarefa que revelou a diferença.
5. Nome do skill é imperativo e específico: resetar-banco-local.md,
   regerar-cliente-orval.md.

## Não faça
- Não capture skill de coisa one-off, específica de uma única tarefa.
- Não escreva skill que contrarie rules/, ADR ou PRD.
- Não genericize além do que o projeto já provou funcionar: skill sem
  execução real por trás não entra em docs/skills/.

## Verificação
Uma sessão nova, seguindo só o skill, executa o procedimento inteiro sem
perguntar nada e termina com o comando de verificação passando.
