# Agendamento Samantha / Olitech - Pacote para Empresas

Sistema de agendamento online com banco vazio, pronto para criar uma instalação separada para cada empresa/cliente.

## O que vem neste pacote

- Sistema React/Vite corrigido para Render.
- Layout mobile ajustado.
- ComboBox/pesquisas com busca a partir de 2 caracteres.
- Banco vazio em `schema_banco_vazio.sql`.
- Script separado para criar o primeiro administrador em `criar_admin_primeiro_acesso.sql`.
- Arquivo `.env.example` com as variáveis necessárias.

## Modelo recomendado para vender/usar em várias empresas

Use **um Supabase e um Render para cada empresa**.

Exemplo:

```text
Empresa A
Render: empresa-a.onrender.com
Supabase: projeto-empresa-a
Banco: dados apenas da Empresa A

Empresa B
Render: empresa-b.onrender.com
Supabase: projeto-empresa-b
Banco: dados apenas da Empresa B
```

Não use o mesmo Supabase para várias empresas, porque os dados podem misturar. Para usar um único banco para todas, seria necessário transformar o sistema em multiempresa com `tenant_id` em todas as tabelas.

---

# Passo a passo para publicar uma nova empresa

## 1. Criar projeto no Supabase

1. Acesse o Supabase.
2. Clique em **New Project**.
3. Coloque um nome, por exemplo: `salao-samantha`.
4. Crie a senha do banco e aguarde o projeto ficar pronto.

## 2. Criar o banco vazio

1. No Supabase da empresa, vá em **SQL Editor**.
2. Clique em **New Query**.
3. Abra o arquivo `schema_banco_vazio.sql` deste pacote.
4. Copie tudo, cole no SQL Editor e clique em **Run**.

Esse script cria as tabelas, mas não coloca clientes, serviços, produtos nem agendamentos.

## 3. Criar o primeiro administrador

1. Abra o arquivo `criar_admin_primeiro_acesso.sql`.
2. Troque estes campos:

```sql
'NOME_DA_EMPRESA_OU_ADMIN'
'admin'
'TROCAR_SENHA_FORTE'
```

Exemplo:

```sql
values ('Salão Samantha', 'admin', 'SenhaForte123', 'Administrador', true)
```

3. Cole no **SQL Editor** do Supabase e clique em **Run**.

Depois disso, o login será:

```text
Usuário: admin
Senha: a senha que você colocou
```

## 4. Pegar as chaves do Supabase

No Supabase da empresa:

1. Vá em **Project Settings**.
2. Clique em **API**.
3. Copie:

```text
Project URL
anon public key
```

Você vai usar isso no Render.

## 5. Subir o sistema no GitHub

Para cada empresa, crie um repositório separado no GitHub.

Exemplos:

```text
agendamento-salao-samantha
agendamento-barbearia-joao
agendamento-clinica-bella
```

Depois envie todos os arquivos deste pacote para o repositório.

## 6. Criar o site no Render

1. Acesse o Render.
2. Clique em **New**.
3. Escolha **Static Site**.
4. Conecte o GitHub.
5. Selecione o repositório da empresa.

Use estas configurações:

```text
Root Directory:
deixe vazio

Build Command:
npm install --no-package-lock --no-audit --no-fund && npm run build

Publish Directory:
dist
```

## 7. Colocar variáveis de ambiente no Render

No Render, dentro do site da empresa:

1. Vá em **Environment**.
2. Adicione:

```env
VITE_SUPABASE_URL=COLE_A_URL_DO_SUPABASE_DA_EMPRESA
VITE_SUPABASE_ANON_KEY=COLE_A_CHAVE_ANON_PUBLIC_DA_EMPRESA
NODE_VERSION=20.19.0
NPM_CONFIG_PACKAGE_LOCK=false
NPM_CONFIG_AUDIT=false
NPM_CONFIG_FUND=false
```

3. Salve.
4. Clique em **Manual Deploy**.
5. Escolha **Clear build cache & deploy**.

## 8. Primeiro acesso da empresa

Depois que o site abrir:

1. Entre com o usuário admin criado no SQL.
2. Vá em **Usuários** e cadastre os usuários da empresa.
3. Vá em **Perfis** e ajuste permissões, se necessário.
4. Vá em **Personalização** para cor/tema.
5. Vá em **Configurações** para WhatsApp/Evolution.
6. Cadastre atendentes.
7. Cadastre serviços.
8. Cadastre produtos, se usar.
9. Comece os agendamentos.

---

# Como repetir para outra empresa

Para cada nova empresa:

1. Criar novo Supabase.
2. Rodar `schema_banco_vazio.sql`.
3. Rodar `criar_admin_primeiro_acesso.sql` com nome e senha da empresa.
4. Criar novo repositório no GitHub.
5. Criar novo Static Site no Render.
6. Colocar as chaves Supabase dessa empresa no Render.

Nunca use as chaves de uma empresa em outra.

---

# Configuração do WhatsApp / Evolution API

Dentro do sistema:

1. Vá em **Configurações**.
2. Informe:
   - URL da Evolution API.
   - API Key.
   - Nome da instância.
   - WhatsApp da empresa.
3. Clique para gerar QR Code.
4. No celular, abra WhatsApp > Aparelhos conectados > Conectar aparelho.
5. Escaneie o QR Code.

Se for vender para várias empresas, o ideal é cada empresa ter a própria instância/número da Evolution API.

---

# Backup por empresa

Dentro do sistema, o administrador pode ir em **Backup** e gerar arquivo `.json` com os dados da empresa.

Recomendado:

- Fazer backup antes de atualizar o sistema.
- Guardar backup separado por cliente.
- Não restaurar backup de uma empresa no banco de outra.

---

# Atualizar sistema de uma empresa

1. Substitua os arquivos no GitHub da empresa.
2. No Render, clique em **Manual Deploy > Clear build cache & deploy**.
3. Não rode o `schema_banco_vazio.sql` novamente em banco com dados, a menos que saiba o que está fazendo.

Se houver atualização de banco no futuro, use scripts incrementais separados.

---

# Comandos úteis para teste local

```bash
npm install
npm run dev
```

Para gerar build:

```bash
npm run build
```

---

# Observação de segurança

Este sistema usa login simples pela tabela `usuarios`. Para empresas maiores, o ideal no futuro é migrar para autenticação oficial do Supabase Auth, senhas criptografadas e regras RLS mais fortes.

## Financeiro completo

Esta versão possui financeiro com:

- Entradas.
- Saídas.
- Pró-labore/retirada do proprietário.
- Status pago, pendente e cancelado.
- Categoria financeira.
- Forma de pagamento.
- Responsável/atendente.
- Relatório por período.
- Resumo de entradas, saídas, pró-labore, pendentes e lucro líquido.
- Relatório por categoria.
- Botão Imprimir/PDF.
- Exportação CSV.

Para bancos já criados antes desta versão, rode novamente o arquivo `schema_banco_vazio.sql` no Supabase. Ele não apaga dados existentes, apenas cria a tabela nova `financeiro_movimentos` se ainda não existir.
