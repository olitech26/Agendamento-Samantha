-- =============================================================
-- AGENDAMENTO SAMANTHA / OLITECH - BANCO VAZIO PARA NOVA EMPRESA
-- Rode este arquivo no Supabase em: SQL Editor > New Query > Run
-- Este script cria somente estrutura/tabelas. Não cadastra clientes,
-- serviços, produtos, agendamentos, financeiro ou dados de exemplo.
-- Depois rode criar_admin_primeiro_acesso.sql para criar o login inicial.
-- =============================================================

create extension if not exists "pgcrypto";

create table if not exists public.usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text,
  usuario text unique,
  senha text,
  perfil text default 'Administrador',
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table if not exists public.perfis (
  id uuid primary key default gen_random_uuid(),
  nome text unique,
  permissoes text[] default '{}',
  criado_em timestamptz default now()
);

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text,
  telefone text,
  whatsapp text,
  email text,
  observacoes text,
  origem text,
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table if not exists public.servicos (
  id uuid primary key default gen_random_uuid(),
  nome text,
  descricao text,
  duracao numeric default 0,
  custo numeric default 0,
  valor numeric default 0,
  comissao_percentual numeric default 0,
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table if not exists public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text,
  categoria text,
  estoque numeric default 0,
  custo numeric default 0,
  valor numeric default 0,
  comissao_percentual numeric default 0,
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table if not exists public.atendentes (
  id uuid primary key default gen_random_uuid(),
  nome text,
  telefone text,
  whatsapp text,
  email text,
  especialidade text,
  comissao_percentual numeric default 0,
  comissao_servico_percentual numeric default 0,
  comissao_produto_percentual numeric default 0,
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  nome text,
  tipo text,
  taxa_percentual numeric default 0,
  desconto_percentual numeric default 0,
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table if not exists public.campanhas (
  id uuid primary key default gen_random_uuid(),
  nome text,
  mensagem text,
  imagem_url text,
  status text default 'ativa',
  criado_em timestamptz default now()
);

create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid,
  cliente_nome text,
  atendente_id uuid,
  atendente_nome text,
  servico text,
  data_agendamento date,
  hora_agendamento time,
  status text default 'pendente',
  total numeric default 0,
  valor_sinal numeric default 0,
  valor_recebido numeric default 0,
  saldo numeric default 0,
  status_pagamento text default 'pendente',
  observacoes text,
  criado_em timestamptz default now()
);

create table if not exists public.configuracoes (
  id uuid primary key default gen_random_uuid(),
  chave text unique not null,
  valor text,
  atualizado_em timestamptz default now()
);



-- =============================================================
-- FINANCEIRO COMPLETO: entradas, saídas, pró-labore e relatórios
-- =============================================================
create table if not exists public.financeiro_movimentos (
  id uuid primary key default gen_random_uuid(),
  data_movimento date default current_date,
  tipo text default 'entrada' check (tipo in ('entrada','saida','prolabore')),
  descricao text,
  categoria text,
  valor numeric default 0,
  forma_pagamento text,
  status text default 'pago' check (status in ('pago','pendente','cancelado')),
  atendente_id uuid,
  atendente_nome text,
  origem text default 'manual',
  referencia_id uuid,
  observacoes text,
  criado_em timestamptz default now()
);

create index if not exists idx_financeiro_movimentos_data on public.financeiro_movimentos (data_movimento);
create index if not exists idx_financeiro_movimentos_tipo on public.financeiro_movimentos (tipo);
create index if not exists idx_financeiro_movimentos_categoria on public.financeiro_movimentos (categoria);

alter table public.financeiro_movimentos disable row level security;
grant all privileges on table public.financeiro_movimentos to anon, authenticated;

alter table public.usuarios disable row level security;
alter table public.perfis disable row level security;
alter table public.clientes disable row level security;
alter table public.servicos disable row level security;
alter table public.produtos disable row level security;
alter table public.atendentes disable row level security;
alter table public.pagamentos disable row level security;
alter table public.campanhas disable row level security;
alter table public.agendamentos disable row level security;
alter table public.configuracoes disable row level security;
alter table public.financeiro_movimentos disable row level security;

grant usage on schema public to anon, authenticated;
grant all privileges on all tables in schema public to anon, authenticated;
grant all privileges on all sequences in schema public to anon, authenticated;
grant all privileges on all functions in schema public to anon, authenticated;

-- Configurações base vazias. O cliente configura depois dentro do sistema.
insert into public.configuracoes (chave, valor)
values
('whatsapp_empresa', ''),
('evolution_url', ''),
('evolution_key', ''),
('evolution_instance', ''),
('layout_agendamento', '1'),
('nome_empresa', ''),
('logo_url', '')
on conflict (chave) do nothing;
