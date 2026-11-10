# Handoff — prática Stable
Atualizado em 10/11/2026; plano integral aprovado e implementação local executada.
Branch: main; alterações locais em staging; nenhum commit/push/tag nesta sessão.
API: sessão, catálogo e empréstimos reais; JWT/membership; isolamento e concorrência transacionais.
Front: OpenAPI/Orval, fotos/fallback, solicitação e meus empréstimos via API; demo só em desenvolvimento.
Seed: 12 itens, manutenção só TI-0004/TI-0007, sem criar empréstimos; idempotência comprovada.
Migration 0002: imagem_url via Prisma diff; índice parcial e RLS na mesma migration; exceção P4002 documentada.
Testcontainers aplicou migrations/seed do zero; containers removidos; nenhum banco persistente alterado.
Pixabay real: 12 fotos aprovadas 800x600, 48 recusas; JPG/créditos/hashes em docs/evidencias/imagens/.
Chave fornecida pelo usuário foi consumida só no processo; nenhum segredo foi gravado no projeto.
Retomada real preservou manifesto e arquivos, sem consultar API; imagens:validar-entrega valida sem rede/chave.
Refinamento de termos/página/ID e recorte em buscas.json; reenquadramento nunca aprova automaticamente.
Verificador Codex ephemeral readonly; preflight comprova bloqueio de escrita/rede, sem MCP/apps/plugins.
Prova: teste de concorrência virou skip, foi reprovado e restaurado byte a byte; docs/verificacoes/prova/.
Checks: 21 API, 17 front, 12 Playwright, 11 imagens, 4 professor e 1 gate; builds/lint/sandbox passaram.
Pareceres finais atuais em docs/verificacoes/; estado a0e0c41176bcd6564c61768ae2e18ecc2d92026759b579b2d066d5fb67dc68f2.
Gate recusou ambos: 002 CA-04/05 (Storage e professor); 003 CA-07 (fotos no catálogo público). Demais CAs aprovados.
Nada publicado; nenhuma configuração de deploy nem arquivo de ambiente foi alterado pelo agente.
A chave não persiste no projeto; futuras buscas usam segredo fornecido ao processo pelo operador.
Não escrever no Supabase remoto, publicar, commitar ou criar tag pelo agente sem instrução aplicável.
Próximo passo: operador aplicar migration, enviar os 12 JPG e seguir docs/operacao-pratica.md para dados/conta/publicação.
