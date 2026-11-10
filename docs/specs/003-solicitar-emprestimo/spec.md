# Spec 003 — Solicitar empréstimo

## Objetivo e vínculo
Colaborador autenticado solicita um equipamento disponível e consulta os próprios empréstimos persistidos. PRD itens 1–3; ADR-001 (REST/Zod/OpenAPI, isolamento, Prisma); ADR-002 (visual Stable).

## Regras e lacunas resolvidas
- Solicitação cria imediatamente, sem aprovação ou fila.
- PRD prevalece: até 3 abertos e prazo de 14 dias corridos, não 5 nem dias úteis. Data do servidor em America/Sao_Paulo; vencimento hoje não é atraso, ontem é.
- JWT verificado fornece sub e tenant_id superior ou app_metadata.tenant_id. Claims divergentes ou UUID inválido são rejeitados. user_metadata não autoriza tenant. Membership real é obrigatória; papel vem dela.
- POST aceita somente equipamentoId UUID; tenant, usuário e prazo não podem ser enviados pelo cliente.
- Bloquear a membership e depois o equipamento dentro da transação serializa pedidos do mesmo usuário e do mesmo item. Verificações e criação ocorrem dentro dela. Índice parcial protege a unicidade de empréstimo aberto.
- “Emprestado” é derivado, nunca gravado na situação intrínseca do item.
- GET empréstimos filtra por tenant e userId, nunca por nome. Catálogo não expõe nomes/prazos dos empréstimos de outras pessoas nesta prática.
- GET /v1/sessao devolve identidade, membership, data atual e prazo previsto; front usa essa referência e o prazo confirmado pelo POST.
- Erro: 400 corpo inválido; 401 JWT ausente/inválido; 403 sem membership; 404 item fora do tenant/inexistente; 409 indisponível; 422 atraso ou limite. Problem Details informa motivo.
- Em produção não há devolução, cadastro ou Operações simulados. Essas rotas demonstrativas só são acessíveis no modo demo.
- Modo demo só existe em desenvolvimento; build de produção sem Auth configurado recusa login.

## Critérios de aceitação
- CA-01: JWT validado e membership obrigatórios; claims conflitantes, inválidos e tenant enviado no body são recusados.
- CA-02: disponível cria um empréstimo 201 com prazo +14 dias corridos de São Paulo, aparece em GET abertos e permanece após nova consulta/reload.
- CA-03: manutenção e equipamento já emprestado retornam 409 com motivo, sem nova linha; catálogo deriva indisponibilidade.
- CA-04: três abertos impedem outro (422); um aberto vencido impede outro (422). Vencendo hoje é permitido; atraso tem precedência sobre limite.
- CA-05: concorrência no mesmo item cria só um empréstimo; concorrência do mesmo usuário para itens diferentes não ultrapassa três.
- CA-06: dois usuários do mesmo tenant não leem os empréstimos um do outro; outro tenant não lista nem solicita o equipamento. RLS é testada com papel sem bypass, não apenas como owner.
- CA-07: contrato gerado dos DTOs Zod; front usa cliente Orval; catálogo com fotos 4:3, busca/filtro/loading/erro/vazio; crédito Pixabay; sem dados mock nos fluxos reais.
- CA-08: UI confirma solicitação, mostra motivo de recusa, atualiza catálogo e meus empréstimos, impede duplo clique durante envio e mantém resultado após reload. Erros de carregamento de empréstimos bloqueiam solicitação.
- CA-09: verificador readonly reprova critério sem teste; não corrige teste nem código. Gate de fechamento recusa relatório ausente/desatualizado ou qualquer CA não aprovado.

## Contratos e fora de escopo
GET /v1/sessao; POST /v1/emprestimos {equipamentoId}; GET /v1/emprestimos?status=abertos; catálogo existente com imagemUrl nullable. Respostas de empréstimo: id, equipamentoId, equipamento, patrimonio, categoria, retirada, prazo. Listagem: {itens}. Sem devolução, reserva, renovação, e-mail, CRUD de Operações, deploy ou escrita remota pelo agente.
