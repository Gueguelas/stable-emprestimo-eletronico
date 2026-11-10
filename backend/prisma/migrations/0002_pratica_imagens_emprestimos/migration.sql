-- Coluna gerada pelo engine Prisma Migrate (migrate diff entre schemas).
-- AlterTable
ALTER TABLE "equipamentos" ADD COLUMN     "imagem_url" TEXT;


-- Falha em dados inconsistentes em vez de apagar empréstimos existentes.
create unique index emprestimos_abertos_item_uq
  on emprestimos (tenant_id, equipamento_id) where devolvido_em is null;

-- A policy anterior consultava memberships dentro da própria policy,
-- causando recursão quando executada com papel sem BYPASSRLS.
drop policy memberships_sel on memberships;
create policy memberships_sel on memberships for select
  using (user_id = auth.uid());

-- Colaborador só lê os próprios empréstimos, inclusive no mesmo tenant.
drop policy emprestimos_sel on emprestimos;
create policy emprestimos_sel on emprestimos for select using (
  user_id = auth.uid() and exists (
    select 1 from memberships m
    where m.tenant_id = emprestimos.tenant_id and m.user_id = auth.uid()
  )
);
