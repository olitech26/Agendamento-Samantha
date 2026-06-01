-- =============================================================
-- CRIAR ADMINISTRADOR INICIAL DA EMPRESA
-- Rode depois do schema_banco_vazio.sql.
-- Antes de rodar, troque:
--   NOME_DA_EMPRESA_OU_ADMIN
--   admin
--   TROCAR_SENHA_FORTE
-- =============================================================

insert into public.perfis (nome, permissoes)
values (
  'Administrador',
  array[
    'dashboard','agendamentos','clientes','servicos','produtos',
    'atendentes','campanhas','financeiro','relatorios',
    'usuarios','perfis','contatos','whatsapp',
    'configuracoes','backup','personalizacao'
  ]
)
on conflict (nome) do update set permissoes = excluded.permissoes;

insert into public.usuarios (nome, usuario, senha, perfil, ativo)
values ('NOME_DA_EMPRESA_OU_ADMIN', 'admin', 'TROCAR_SENHA_FORTE', 'Administrador', true)
on conflict (usuario) do update
set nome = excluded.nome,
    senha = excluded.senha,
    perfil = 'Administrador',
    ativo = true;
