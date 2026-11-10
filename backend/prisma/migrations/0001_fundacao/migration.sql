-- Migration 0001 — fundação: tenants, users, memberships, equipamentos, emprestimos.
-- RLS habilitada + policy explícita na MESMA migration (docs/rules/migration.md).
-- DDL aprovado pelo time em 21/09/2026.

-- Stubs de "auth" para Postgres local puro (Testcontainers): o Supabase já tem
-- o schema auth com auth.users e auth.uid(), então este bloco não faz nada lá.
do $fundacao$
begin
  if not exists (select 1 from pg_namespace where nspname = 'auth') then
    create schema auth;
    create table auth.users (
      id                 uuid primary key,
      email              text,
      encrypted_password text,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create function auth.uid() returns uuid
      language sql stable
      as $uid$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $uid$;
  end if;
end
$fundacao$;

create type papel as enum ('colaborador', 'operacoes');
create type categoria as enum ('notebook', 'monitor', 'cabo', 'camera', 'acessorio');
create type situacao_item as enum ('disponivel', 'em_manutencao');

create table tenants (
  id        uuid primary key default gen_random_uuid(),
  slug      text not null unique,
  nome      text not null,
  criado_em timestamptz not null default now()
);

create table users (
  id    uuid primary key references auth.users (id) on delete cascade,
  nome  text not null,
  email text not null unique
);

create table memberships (
  id        uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  user_id   uuid not null references users (id) on delete cascade,
  papel     papel not null default 'colaborador',
  unique (tenant_id, user_id)
);

-- Situação intrínseca: 'disponivel' | 'em_manutencao'.
-- "Emprestado" deriva do empréstimo em aberto — nunca coluna duplicada.
create table equipamentos (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants (id) on delete cascade,
  nome          text not null check (btrim(nome) <> ''),
  categoria     categoria not null,
  patrimonio    text not null,
  situacao      situacao_item not null default 'disponivel',
  observacao    text,
  cadastrado_em timestamptz not null default now(),
  unique (tenant_id, patrimonio)
);

create table emprestimos (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants (id) on delete cascade,
  equipamento_id uuid not null references equipamentos (id) on delete restrict,
  user_id        uuid not null references users (id) on delete cascade,
  retirada_em    date not null,
  prazo_em       date not null,
  devolvido_em   timestamptz,
  check (prazo_em >= retirada_em)
);

create index emprestimos_tenant_equip_idx on emprestimos (tenant_id, equipamento_id);

-- RLS: deny by default, policy explícita de isolamento por tenant.
-- A autorização primária é guard (Nest + CASL); RLS é defesa em profundidade.
alter table tenants      enable row level security;
alter table users        enable row level security;
alter table memberships  enable row level security;
alter table equipamentos enable row level security;
alter table emprestimos  enable row level security;

create policy tenants_sel on tenants for select
  using (id in (select m.tenant_id from memberships m where m.user_id = auth.uid()));

create policy users_sel on users for select
  using (id in (
    select m2.user_id
    from memberships m
    join memberships m2 on m2.tenant_id = m.tenant_id
    where m.user_id = auth.uid()
  ));

create policy memberships_sel on memberships for select
  using (tenant_id in (select m.tenant_id from memberships m where m.user_id = auth.uid()));

create policy equipamentos_sel on equipamentos for select
  using (tenant_id in (select m.tenant_id from memberships m where m.user_id = auth.uid()));

create policy emprestimos_sel on emprestimos for select
  using (tenant_id in (select m.tenant_id from memberships m where m.user_id = auth.uid()));
