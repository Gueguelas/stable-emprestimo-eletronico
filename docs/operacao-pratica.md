# Roteiro humano — publicação da prática

Este roteiro não é autorização para o agente escrever em produção. Nenhuma destas etapas de Supabase/publicação foi executada nesta sessão. A busca e a revisão locais das fotos foram realizadas. Execute a partir da raiz do Stable, com credenciais fornecidas apenas ao processo, sem arquivos de segredo versionados. Não use a conta do professor para empréstimos de teste.

## 1. Fotos locais concluídas; como retomar
As 12 fotos reais aprovadas, seus créditos e a validação estão em `docs/evidencias/imagens/`. Use esses JPG no upload; não é necessário consultar novamente a API para publicar o conjunto atual. Foram reprovadas 48 candidaturas antes do conjunto final. A repetição local preservou arquivos e manifesto, sem nova consulta.

Para uma preparação futura, obtenha uma chave em https://pixabay.com/api/docs/ e disponibilize `PIXABAY_API_KEY` no processo local por seu gerenciador de segredos. Também é aceito um `.env.local` criado por você na raiz do Stable, com essa variável; o comando o carrega automaticamente sem imprimir a chave. Variável exportada no terminal prevalece sobre o arquivo. O agente não cria/edita seu arquivo de segredo.
```sh
npm run imagens:preparar
# Inspecione visualmente cada JPG; registre cada aprovação/reprovação e motivo.
npm run imagens -- revisar TI-0001 aprovar "descrição da inspeção realizada"
# Repita revisão para os demais; substitua candidatos reprovados com preparar.
npm run imagens -- validar
```
Não execute aprovar só para fazer o validador passar. A revisão precisa excluir pessoas, marcas/logos legíveis, texto e telas com conteúdo; também conferir equipamento e distinção visual. O manifesto e arquivos ficam em `artifacts/imagens/`, ignorados pelo Git. A cópia aprovada atual está versionada em `docs/evidencias/imagens/`, sem cache/chaves. Refinamentos de termos, página, ID e recorte ficam em `buscas.json`; consulte o contrato da skill antes de alterar o enquadramento. Reenquadramento exige inspeção nova e preservação da recusa anterior.

O fluxo completo tem 11 testes com API simulada e uma execução real documentada, incluindo 12 downloads, cache, retomada, substituição de candidato reprovado, recusa de chave ausente/inválida, limite de requisições e origem indevida. Depois de configurar uma chave válida não é necessário alterar código. A API real ainda pode recusar credenciais, impor limite ou não oferecer candidato adequado: o comando informa o motivo e preserva os itens já preparados; nunca aprova automaticamente para contornar isso.

## 2. Aplicar schema e enviar fotos
Revise a nova migration, especialmente o índice parcial: ela falha caso já haja dois empréstimos abertos do mesmo equipamento. Não apague empréstimos para contornar uma falha; investigue os dados antes.

Somente você configura `DATABASE_URL` e `DIRECT_URL` para o projeto certo no seu processo. Na pasta `backend/`, execute `npx prisma migrate deploy`. Nunca edite migration já aplicada nem use outro dono de schema.

No painel Supabase, crie/confira bucket público `equipamentos` e envie os 12 JPG com nomes TI-0001.jpg a TI-0012.jpg. Repetição sobrescreve o mesmo nome; não cria sufixos. Abra as URLs em sessão anônima. A skill não contém upload nem recebe credencial de Storage.

## 3. Popular os dados por ação humana
O seed automático `backend/prisma/seed.ts` aceita somente banco local. Para o banco do deploy, o comando separado abaixo exige TTY, confirmação escrita e as fotos públicas idênticas ao manifesto aprovado:
```sh
npm run dados:producao -- --manifesto docs/evidencias/imagens/manifesto.json --base-publica https://SEU-PROJETO.supabase.co/storage/v1/object/public/equipamentos/
```
Use o banco e o Storage do mesmo projeto. Se houver equipamentos antigos fora da prática no tenant, a ferramenta para; decida a migração do legado manualmente. Não existe limpeza automática. O upsert não cria empréstimos nem apaga empréstimos existentes. Repita e confira que continuam os mesmos 12 IDs, com 10 disponíveis e 2 em manutenção antes dos seus testes.

## 4. Provisionar professor
Forneça ao processo `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `PROFESSOR_PASSWORD` usando o meio seguro do operador. A senha esperada é a definida pelo professor no enunciado; não a copie para o seed, documentação nova ou linha de comando.
```sh
npm run professor
```
A ferramenta só opera em terminal interativo após confirmação. Localiza e reutiliza o usuário pelo e-mail; cria Auth pelo endpoint administrativo, espelha `users`, associa membership colaborador e grava tenant em app_metadata. Não insere diretamente em auth.users. Se conta já existir, não redefine sua senha; verifica login com a senha fornecida e recusa sucesso em caso de divergência. Se houver empréstimos da conta, para para investigação.

`npm run test:professor` comprova esse fluxo com uma API simulada: repetição sem duplicar Auth/membership, ausência de redefinição de senha, conta com empréstimo/tenant conflitante recusada, falha de login sem declaração de sucesso e exigência de TTY/segredos/confirmação. Nenhuma credencial ou conta real é usada nesses testes.

## 5. Publicar e conferir
Revise o diff e faça commits somente quando decidir; mantenha mudanças de regras separadas de código. A prova negativa e restauração ainda precisam dos dois commits exigidos pela atividade, se o professor mantiver esse requisito. Não invente hashes.

Publique front e API pelos seus projetos Vercel existentes e confira origens/API/Auth já configurados. Nenhuma configuração de deploy foi alterada pelo agente. Confira login real do professor sem criar empréstimos, fotos públicas 800×600 e estados iniciais. Use outra conta para testar solicitação, limite, indisponibilidade e persistência; confira novamente zero empréstimos na conta do professor.

Anexe evidências reais de produção e atualize o ENTREGA.md. Reexecute checks e verificadores antes de declarar specs prontas. Só depois, por ação sua, crie/envie a tag `entrega-pratica` sobre os commits corretos. A migração para dois repositórios continua pendente e deve ser declarada, não simulada com links inexistentes.
