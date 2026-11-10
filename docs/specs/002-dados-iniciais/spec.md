# Spec 002 — Dados iniciais e fotos

## Objetivo e vínculo
Popular o tenant `suporte_ti` com os 12 equipamentos da prática e preparar a conta do professor, sem empréstimos iniciais. PRD: catálogo e login. ADR-001: Nest, Prisma, Supabase Auth/Storage e OpenAPI; ADR-002: aparência existente.

## Decisões aprovadas
- Pixabay substitui Pexels por instrução do usuário. Somente sua API pode fornecer fotos de equipamento.
- Somente TI-0004 e TI-0007 ficam em manutenção. TI-0010 fica disponível: prevalece o briefing dos dados sobre a lista contraditória.
- Sharp, aprovado pelo usuário, é ferramenta local de preparação, não parte do servidor. Exceção à lista de bibliotecas do ADR-001; não muda a arquitetura.
- Crédito discreto “Fotos: Pixabay” prevalece sobre o pedido de retirar crédito. Autoria/licença também ficam no manifesto.
- Nenhuma senha literal no seed. Operador provisiona Auth pela API administrativa com segredo fornecido em execução, depois associa o UUID ao tenant.
- O seed novo não cria usuários fictícios nem empréstimos. Não limpa dados existentes: se já houver equipamentos demonstrativos, operador deve resolver a divergência antes da publicação; não existe limpeza remota automática.
- Imagem é nullable para preservar equipamentos legados. Os 12 itens só satisfazem a entrega final quando as fotos revisadas estiverem no Storage público.
- Fotos precisam de revisão visual explícita; safesearch e metadados não comprovam ausência de pessoa, logo, texto ou conteúdo de tela.
- Termos, página e ID podem ser refinados localmente, sempre na API fixa do Pixabay. Recorte com Sharp só enquadra o equipamento inteiro e exclui elementos do cenário; nunca apaga/retoca inscrições ou marcas no equipamento. Reenquadrar uma fonte rejeitada exige seleção explícita, arquivo diferente, histórico preservado e nova revisão; não permite reutilizar foto/ID em dois itens ativos.
- Preparação não requer ajustes de código ao fornecer a secret: `npm run imagens:preparar` consome a variável exportada ou `.env.local` criado pelo operador. O agente não cria/edita segredos. Cache e retomada conservam candidatos anteriores; testes com API simulada comprovam esse fluxo sem alegar fotos reais.

## Critérios de aceitação
- CA-01: banco vazio recebe TI-0001 a TI-0012, 4 notebooks, 3 monitores, 3 cabos, 2 câmeras; apenas TI-0004 e TI-0007 em manutenção; zero empréstimos.
- CA-02: repetir seed preserva IDs e empréstimos existentes, sem duplicação por tenant/patrimônio.
- CA-03: pipeline gera 12 fotos reais distintas do Pixabay, exatamente 800×600, com origem, autor, licença e hashes; nenhuma sem aprovação visual. Foto rejeitada é substituída, não aprovada automaticamente.
- CA-04: arquivo preparado tem caminho determinístico; manifesto é validado antes do seed com imagens. Upload é ação humana; URLs públicas abrem sem login. Local e produção são evidências separadas.
- CA-05: provisionamento humano idempotente cria/localiza o professor, mantém senha fora do código, associa membership colaborador e recusa declarar sucesso se a conta tiver empréstimos. Login real em produção deve ser conferido pelo operador.
- CA-06: verificador independente compara cada CA com evidência atual; pendência externa nunca vira aprovação local fictícia.

## Contrato afetado e fora de escopo
`equipamentos.imagem_url` nullable; GET /v1/equipamentos inclui `imagemUrl`. Seed e manifesto são contratos internos. Sem deploy, upload remoto pelo agente, senha versionada, exclusão automática de legado ou separação física dos repositórios nesta prática.
