# Entrega da prática

Estado: implementação e validação locais; a entrega acadêmica em produção ainda não está concluída. Não houve escrita do agente no banco/Storage remoto, deploy, commit, push ou tag. Fotos reais e conta do professor não são declaradas prontas por existirem scripts.

Resultado local em 10/11/2026: **21 testes da API, 17 do front e 12 de navegador**, além de **11 testes de imagens, quatro do provisionamento e um do gate**. Builds, lint e isolamento também são conferidos por `npm run checks`. A chave fornecida pelo usuário permitiu a execução real da skill: **12 fotos aprovadas de 800×600, 48 candidaturas reprovadas**, créditos e hashes em [evidências das fotos](docs/evidencias/imagens/README.md). A publicação no Storage e a conta/login reais do professor continuam pendentes. O verificador aprovou os demais critérios e o gate recusou ambos os fechamentos: **002 CA-04/05** (Storage e professor) e **003 CA-07** (fotos no catálogo público) permanecem pendentes. Pareceres e estado atual: [resumo](docs/verificacoes/resumo.json).

## Links
- Repositório: https://github.com/Gueguelas/stable-emprestimo-eletronico os arquivos desta sessão ainda são locais.
- Front/API: continuam neste checkout, em pastas separadas; extração para dois repositórios é pendência do ADR-001.
- Produção (Vercel): não conferida nesta sessão; nenhuma URL inventada.
- Evidências: [checks](docs/verificacoes/checks.json), [verificação 002](docs/verificacoes/002-dados-iniciais/atual.md), [verificação 003](docs/verificacoes/003-solicitar-emprestimo/atual.md), [prova negativa/restauração](docs/verificacoes/prova/prova.json).

## 1. Conflitos: pedido contra o que já existia

O HTML é um briefing deliberadamente contraditório; os HTMLs das aulas explicam como levantar conflitos, manter a fonte da verdade e exigir evidência. O enunciado original foi preservado.

| Pedido/pegadinha | Contrariava o quê | Decisão e motivo | Registro | Commit |
|---|---|---|---|---|
| Verificador corrigir teste quando for a única falha | Independência do revisor: quem avalia não corrige | Rejeitado. Principal corrige; evita transformar teste para confirmar o código | spec 003 CA-09; agents/verificador-spec.md | Sem commit |
| 5 empréstimos | PRD determina 3 | Mantidos 3, opção explicitamente confirmada pelo usuário | spec 003; backend/src/emprestimos/regras.ts | Sem commit |
| 14 dias úteis | Prazo do PRD e telas existentes: 14 dias | 14 corridos, opção confirmada; cálculo no servidor | spec 003; backend/test/prazo.spec.ts | Sem commit |
| TI-0010 em manutenção na lista | Briefing diz apenas TI-0004/TI-0007 e 10 disponíveis | TI-0010 disponível, confirmação do usuário | spec 002; backend/prisma/equipamentos.json | Sem commit |
| Senha escrita no seed | Regra global da prática: nenhum segredo em código/Git | Rejeitado. Segredo fornecido ao processo pelo operador; provisionamento via Auth, não inserção manual em auth.users | spec 002 CA-05; scripts/provisionar-professor.mjs | Sem commit |
| Instalar sharp sem discutir dependências | Rule pede decisão antes de biblioteca fora do ADR | Usuário aprovou sharp local; dependência de desenvolvimento, fora do runtime da API | spec 002; backend/package.json | Sem commit |
| Catálogo sem crédito | Contrato da skill pede crédito na tela | Usuário escolheu um link discreto “Fotos: Pixabay”; créditos individuais no manifesto | spec 002; frontend/src/pages/CatalogoPage.tsx | Sem commit |
| Fonte exclusiva Pexels | Usuário mandou substituir por Pixabay | Fonte substituída no contrato/pipeline; HTML original preservado como evidência | spec 002; skill referências | Sem commit |
| Dados e imagens em produção pelo agente | Regras da prática e do projeto proíbem escrita remota | Scripts locais e roteiro humano; sem credenciais de produção no verificador/skill | docs/operacao-pratica.md | Sem commit |
| Reaproveitar seed anterior com empréstimos demonstrativos | Dados iniciais exigem zero empréstimos | Seed cria só os 12 itens; repetição preserva empréstimos existentes, não os apaga para aparentar idempotência | spec 002; backend/prisma/seed.ts | Sem commit |
| Cliente HTTP manual do estado anterior | ADR-001 exige OpenAPI/Orval | Transporte, tipos e validação gerados; adaptação de sessão/paginação sem reescrever fetch | spec 003 CA-07; npm run contrato | Sem commit |
| Rodar migrate dev conforme procedimento antigo | Introspecção local encontrou P4002 na FK para auth.users | Gerar coluna com Prisma Migrate diff; não passar a ser dono do Auth. Índice/policies continuam na mesma migration, testada por reset | docs/rules/migration.md; docs/verificacoes/migration-geracao.txt | Sem commit |
| Prova com dois commits e entrega com tag | Usuário pediu alterações locais sem commit/push/tag | Evidências e hashes de arquivos/estado; commits da prova e tag ficam pendentes de ação humana, sem simulação | seção 6; roteiro humano | Sem commit |

## 1b. Lacunas: decisões necessárias

| Spec | O que faltava | Alternativas | Decisão e por quê | Commit |
|---|---|---|---|---|
| 002 | O que fazer com dados antigos | Apagar tudo; preservar e sinalizar divergência | Preservar. Ferramenta de publicação recusa tenant com itens fora da prática; não apagar empréstimos existentes | Sem commit |
| 002 | Como revisar imagem | Confiar em safesearch; inspeção explícita | Pipeline garante propriedades mecânicas; inspeção visual e motivo obrigatório para aprovar conteúdo | Sem commit |
| 002 | Como repetir envio | Nome aleatório; caminho estável | TI-0001.jpg etc.; upload humano sobrescreve mesmo objeto e publicação compara hash público/aprovado | Sem commit |
| 002 | Usuário existente | Recriar; redefinir senha; reutilizar | Reutilizar e conferir login, sem reset silencioso; parar se conta tiver empréstimos ou tenant conflitante | Sem commit |
| 003 | Data e fuso | Navegador; instante UTC; data de São Paulo | Relógio servidor, data de São Paulo; hoje vence sem atraso, ontem bloqueia | Sem commit |
| 003 | Como impedir corrida do limite | Contar antes; serializable com retries; locks | Transação com lock membership → equipamento, contagem e criação dentro dela, índice único parcial como defesa | Sem commit |
| 003 | Origem do tenant no JWT | Só superior; só metadata; aceitar divergência | Superior ou app_metadata assinado; divergência recusada; nunca user_metadata/body/query; membership real | Sem commit |
| 003 | Posse/visibilidade | Nome da pessoa; UUID autenticado | Somente userId e tenant; nome igual não dá posse. Catálogo não divulga dados pessoais de empréstimos alheios | Sem commit |
| 003 | Erro ao ler empréstimos | Assumir zero; bloquear até confirmar | Bloquear solicitação, mostrar falha e permitir retry | Sem commit |
| 003 | Telas demonstrativas durante integração | Misturar mocks e dados reais; restringir | Mocks de Operações só em desenvolvimento; meus empréstimos usa API e não mostra devolução fictícia | Sem commit |

As decisões estão também nas specs respectivas. Identificadores de teste usam `test_ca_002_...` e `test_ca_003_...` para evitar confundir CA-01 de specs diferentes.

## 2. Onde o agente tentou decidir por você

O PRD dizia “14 dias”, sem a palavra “corridos”; o agente propôs essa interpretação e manter limite 3 antes de implementar. A divergência com “14 dias úteis” foi apresentada e o usuário escolheu explicitamente a opção do PRD. Também houve perguntas explícitas sobre TI-0010, sharp e crédito. Não inventamos uma intervenção humana posterior a um erro implementado: a evidência é de uma suposição exposta e confirmada antes do código.

Depois disso, o usuário aprovou o plano integral e pediu autonomia nas pegadinhas. As decisões técnicas restantes estão registradas na spec/plano; isso não foi tratado como autorização para publicação ou segredo em código.

## 3. Uma decisão que merece (ou não) um ADR

Locks de membership e equipamento foram escolhidos contra a alternativa defensável de transações serializable com retries. Só um lock no equipamento não protege o limite ao pedir itens diferentes; só contagem fora da transação permite corrida. Dois testes de concorrência cobrem as duas dimensões em Postgres real.

Não criamos ADR: esta é uma implementação delimitada da regra de empréstimo, registrada no plano da spec 003, sem mudar stack, dono do schema ou estratégia global de persistência. Se essa convenção passar a orientar outros domínios, deve ser proposta ao time como ADR. O agente não escreveu ADR em nome do time.

## 4. Skill imagens-equipamentos

- `SKILL.md`: quando usar, fluxo, fronteira local e obrigação da revisão visual. `references/contrato.md`: API, licença, cache, origem, critérios visuais e operação humana. `scripts/preparar.cjs`: consulta, download, normalização, hashes, manifesto e validação. Instruções orientam julgamento; código garante invariantes mecânicas.
- Garantido por código: 800×600 após gravar (`preparar.cjs:49`), IDs/hashes únicos, patrimônio/caminho esperados, integridade, campos de crédito e revisão aprovada antes de aceitar o manifesto (`preparar.cjs:171`). Domínios e redirects de download são validados; chave não entra no manifesto.
- Dependente de inspeção: pessoa, marca/logo legível, texto, conteúdo de tela, pertinência e semelhança visual entre fotos. Safesearch não é prova. Aprovação registra motivo; rejeição conserva histórico e exige outro candidato.
- O agente prepara arquivos locais. A skill não contém comando/cliente de upload nem recebe credencial de Storage. O verificador tem rede de ferramentas bloqueada e apps/MCP/plugins desativados; scripts de produção são exclusivos do operador e exigem TTY/confirmação, fora da skill.
- **12 fotos reais aprovadas; 48 candidaturas reprovadas** por pessoas, marcas/textos, conteúdo de tela, ilustração ou equipamento inadequado. A chave foi fornecida depois pelo usuário e consumida somente na entrada do processo, sem arquivo de segredo. A API respondeu, os candidatos foram inspecionados e as recusas/aceites foram registrados. Manifesto, JPG, metadados selecionados e retomada real estão em `docs/evidencias/imagens/`. Testes sintéticos continuam separados.
- Termos/página/ID puderam ser refinados sem mudar a origem da API. Dois enquadramentos com Sharp excluíram texto de acessórios/cenário preservando o equipamento principal inteiro, sem retocar marcas: TI-0005 e TI-0012. O recorte e o vínculo ao estado recusado anterior de TI-0012 estão no manifesto; a versão nova exigiu outra revisão. TI-0006/TI-0007 mostram ângulos diferentes, não reutilizam a mesma fotografia. As fotos ilustram o inventário; não comprovam polegadas, metragem, modelo ou resolução.
- A pedido do usuário, a entrada da secret ficou pronta para uso: `npm run imagens:preparar` lê `PIXABAY_API_KEY` exportada ou `.env.local` fornecido pelo operador, sem edição adicional de código. Nenhum arquivo de segredo foi criado/alterado pelo agente. Onze testes exercitam consulta/download, 12 candidatos, cache, retomada após falha, substituição de rejeitada, erros 401/429, origem de redirect, preservação de variável exportada, seleção/paginação, rejeição de metadado não fotográfico e recorte/reenquadramento sem aprovação automática. A CLI não aceita outra origem/API por configuração.
- O provisionamento do professor passou a ter quatro testes com API simulada: idempotência de Auth/espelhos/membership, preservação de senha, bloqueios de empréstimo/tenant, falha de login e pré-condições humanas. Isso resolve a ausência de teste do código; conta e login reais continuam pendentes de execução humana com os segredos corretos.
- Fonte consultada: https://pixabay.com/api/docs/ e https://pixabay.com/service/license-summary/. O link de crédito é decisão aprovada; não afirmamos que a licença exige atribuição em todos os usos.

## 5. Subagente verificador

- Gatilho: comando obrigatório `npm run fechar-spec -- <spec>`, registrado em AGENTS/spec-flow. Ele executa checks e nova execução `codex exec --ignore-user-config --ephemeral --sandbox read-only`. Não depende de o usuário lembrar de pedir uma revisão.
- Contexto: lê por conta própria spec, PRD, ADRs, rules, código, testes e logs. Não recebe o resumo do implementador como conclusão. Front e back são avaliados na mesma spec, sem presumir que teste de tela prova persistência no banco.
- Independência: nunca corrige, inclusive teste. Runner e instruções estão em `scripts/verificar-spec.mjs` e `agents/verificador-spec.md`; saída usa JSON schema fixo. Apps, plugins, MCP, navegador e busca estão desativados; shell não herda segredos. Readonly impede mudanças de arquivos; rede de comandos não dá acesso ao deploy.
- Comparação: CA, resultado, evidência e motivo, com hash das entradas. Gate recusa checks/relatório ausentes ou desatualizados, CA faltando, falha, ausência de teste ou pendência. Hashes de logs também são conferidos.

## 6. Verificador em ação

As tabelas e rodadas reais estão nos links acima. O histórico não é reconstruído a partir de opinião do implementador. `prova/prova.json` registra hashes antes/depois e restauração; `prova/negativa/` conserva o teste plantado, checks e parecer negativo. `erro.patch` mostra a cobertura retirada: concorrência do mesmo usuário ao alcançar o limite.

| Rodada real | CA e causa | Correção pelo principal |
|---|---|---|
| Negativa, 10/11/2026 | CA-05 SEM_TESTE: teste de concorrência do mesmo usuário estava em it.skip | Arquivo restaurado byte a byte; gate recusou a rodada negativa |
| Negativa e primeira restauração | CA-07 SEM_TESTE: testes só tinham imagem nula/fallback e não exercitavam loading | Novo E2E cobre loading, imagem carregada 800×600, proporção e falha de download; foto usada é fixture vetorial explícita, sem simular foto real da entrega |
| Negativa | CA-09 SEM_TESTE: prova ainda estava em execução | Rodada seguinte encontrou parecer negativo, recusa do gate e hashes da restauração, aprovando CA-09 |
| Antes da chave | CA-07 PENDENTE: cobertura local foi corrigida, mas fotos reais/Storage não haviam sido executados | Manter a pendência; nenhum teste sintético foi apresentado como foto real |
| Depois da chave | 12 fotos reais preparadas, revisadas e validadas localmente | Principal preservou 48 recusas, créditos e hashes; upload e acesso público seguem pendentes |
| Ressalva da revisão final | CA-01 da spec 002: zero empréstimos era conferido após limpeza de fixtures | Principal acrescentou teste que captura o banco imediatamente após migrations/seed, antes de fixtures ou limpeza; exige 12 equipamentos, zero empréstimos e zero usuários |
| Reforço após pedido de preparação da secret | CA-05 da spec 002 SEM_TESTE: não havia teste executado do provisionamento | Principal acrescentou quatro testes com API simulada; criação/login reais seguem pendentes de ação humana |

O isolamento foi exercitado: `docs/verificacoes/sandbox.json` registra bloqueio de escrita e rede pela sandbox. O runner executa esse preflight novamente antes de iniciar cada revisão; falha de isolamento impede o subagente.

O procedimento é `npm run provar-verificador`: tornar o teste skip, executar checks e verificador, exigir reprovação de CA-05 e recusa do gate, restaurar o arquivo em finally, repetir checks e verificação. Os dois commits pedidos pelo HTML **não foram feitos**, conforme instrução do usuário; hashes de arquivo/estado não são apresentados como hashes de commit.

Falhas anteriores do principal também foram reais: descoberta do socket Docker, fixture de atraso com prazo anterior à retirada (recusada corretamente pela constraint), montagem do teste de health e alias incorreto de tipo gerado. Foram corrigidas pelo principal antes da rodada final; não são atribuídas falsamente ao subagente.

## 7. Regra posta à prova

A rule de captura de skills proíbe registrar um procedimento como comprovado sem execução real. A atividade pede criar uma skill nova. Criamos a capacidade solicitada em `.agents/skills/`, validamos sua estrutura e mecânica com testes e posteriormente executamos busca, preparação, rejeição/substituição e revisão reais. Mantemos a skill descoberta em `.agents/skills/`; **não** registramos upload como procedimento executado. Busca e revisão locais agora têm evidência real; upload e conferência pública continuam pendentes.

O procedimento de migration também mostrou uma lacuna concreta: P4002 ao introspectar a FK do Auth. Registramos a exceção local na regra, com DDL produzido pelo engine Prisma e aplicação testada do zero. Não adicionamos um segundo dono de schema nem modelamos o Auth como domínio.

## 8. O que ficou de fora e o que faria diferente

- Pendentes: upload humano dos 12 JPG aprovados ao bucket público, migrations/dados/conta do professor no deploy e conferência de login/zero empréstimos na produção. A chave e a busca/revisão locais já foram resolvidas. Os CAs de produção não podem ser aprovados por testes sintéticos.
- Sem deploy, configuração de Vercel/segredos alterada pelo agente, commits, tag ou push. Sem migração para dois repositórios; declaração explícita evita aparentar cumprir esse requisito com pastas.
- Devolução, cadastro real, Operações real, e-mail, renovação e reserva permanecem fora da prática. O PRD completo ainda não está concluído.
- Playwright usa rede interceptada; o reload da demonstração exige novo login. PostgreSQL real e JWT assinado cobrem backend, mas não substituem o teste final de Supabase Auth/Vercel do operador.
- Criaria/configuraria os acessos e obteria a chave de imagens antes do início da atividade para permitir revisão visual e validação completa do fluxo real. Só marcaria a entrega final depois das evidências de produção e da revisão humana dos commits.
