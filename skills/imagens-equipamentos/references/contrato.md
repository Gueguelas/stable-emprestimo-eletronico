# Contrato Pixabay
Fonte: https://pixabay.com/api/docs/ — consultada em 10/11/2026.
Licença: https://pixabay.com/service/license-summary/ (Pixabay Content License).

- API exige chave. Cache de respostas por 24h; respeitar 429 e não executar downloads em massa. Uma preparação solicitada busca candidatos para os 12 itens.
- Sem hotlink permanente: baixar, redimensionar e armazenar no bucket público `equipamentos` pelo operador.
- API e download só aceitam domínios Pixabay. O manifesto registra pageURL, autor, ID, licença, hash e revisão; não guarda URL da requisição com chave.
- Sharp normaliza com resize contain em fundo neutro 800×600, mantendo equipamento inteiro; metadados originais são removidos. `metadata()` confirma as dimensões depois da gravação.
- Um `recorte` opcional em `buscas.json` usa frações da imagem já orientada (`left`, `top`, `width`, `height`, de 0 a 1). Serve para enquadrar o equipamento inteiro e excluir elementos do cenário; não permite apagar/retocar marcas, texto ou partes do equipamento. O manifesto conserva a receita e o hash da origem. O resultado precisa de nova inspeção visual, inclusive base e bordas do equipamento.
- Reenquadrar uma fonte rejeitada só é possível com ID e novo recorte explícitos. A recusa anterior e seu hash são preservados, o novo hash precisa ser diferente e a revisão volta a pendente. A seleção automática continua excluindo IDs recusados; ID/hash de outro item ativo nunca pode ser reutilizado. O campo `reenquadramentoDe` vincula a versão anterior, sem converter sua reprovação em aprovação.
- Nomes `TI-0001.jpg` a `TI-0012.jpg`. Duplicação por ID da foto, hash da origem e hash normalizado é recusada. Similaridade visual continua parte da revisão.
- Preparar novamente conserva candidato íntegro e não rebaixa aprovação existente. Reprovar mantém histórico e exclui o ID da próxima seleção.
- `buscas.json` permite refinar termos, escolher página (1–100) e ID retornado pela API, por patrimônio. Cache é separado por termos e página; o manifesto registra a busca efetiva. A origem da API continua fixa e nenhuma seleção dispensa revisão. Não guarde chaves nesse arquivo.
- Crédito de tela “Fotos: Pixabay” e créditos individuais no manifesto são decisões aprovadas, não alegação de que a licença sempre exige atribuição.
- `PIXABAY_API_KEY` é entrada secreta somente do processo local. `scripts/imagens.cjs` usa o carregador nativo do Node para `.env.local` fornecido pelo operador, quando existente; variáveis exportadas prevalecem. Não preencher arquivo de ambiente pelo agente, não imprimir valores e não adicionar a chave ao cliente web. O arquivo já é ignorado pelo Git.
- `artifacts/imagens/` contém candidatos e cache, ignorados pelo Git. Copiar manifesto revisado e evidências para a entrega quando a operação real ocorrer; nunca declarar a operação executada sem isso.

Após revisão: operador cria bucket público no painel Supabase e envia os 12 JPG usando os mesmos nomes (upsert). Antes de popular URLs, abre cada URL em sessão anônima. Upload, Auth e publicação são ações humanas separadas da skill.
