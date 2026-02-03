# 💰 Finance Tracker

Aplicação web moderna e minimalista para monitoramento de finanças pessoais, desenvolvida com Next.js 15, TypeScript, Tailwind CSS e Supabase.

## 🎨 Design

- **Estilo**: Moderno e minimalista
- **Paleta de Cores**: Laranja (#f97316), Preto (#171717) e tons de Cinza
- **Sistema de Cores**: Variáveis CSS configuráveis em [app/globals.css](app/globals.css)
- **Responsivo**: Mobile-first, otimizado para todos os tamanhos de tela

## ✨ Funcionalidades

### Implementadas
- ✅ Estrutura base do projeto Next.js com App Router
- ✅ Sistema de cores com variáveis CSS customizáveis
- ✅ Integração com Supabase (cliente + servidor)
- ✅ Componentes UI base (Button, Input, Card, Badge, Label)
- ✅ Utilitários de formatação (moeda, data)
- ✅ Schemas de validação com Zod
- ✅ TypeScript types completos

### Em Desenvolvimento
- 🔄 Autenticação (Login/Cadastro)
- 🔄 Dashboard com resumo financeiro
- 🔄 Gestão de transações (receitas/despesas)
- 🔄 Gestão de categorias
- 🔄 Relatórios e gráficos
- 🔄 Configurações de perfil

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18 ou superior
- npm, yarn ou pnpm
- Conta no Supabase (gratuita)

### 1. Instalação

Clone o repositório e instale as dependências:

```bash
npm install
```

### 2. Configuração do Supabase

#### 2.1 Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha as informações:
   - **Name**: finance-tracker (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte (salve-a!)
   - **Region**: Escolha a região mais próxima
5. Clique em "Create new project" e aguarde (1-2 minutos)

#### 2.2 Obter Credenciais

1. No painel do projeto, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL**: Algo como `https://xxxxx.supabase.co`
   - **anon/public key**: Chave pública do projeto

#### 2.3 Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` na raiz do projeto e preencha com suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

#### 2.4 Criar Tabelas do Banco de Dados

No Supabase, vá em **SQL Editor** e execute o seguinte script:

```sql
-- Criar tabela de perfis
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  currency text default 'BRL',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS
alter table profiles enable row level security;

-- Políticas de segurança
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Criar tabela de categorias
create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('receita', 'despesa')),
  icon text,
  color text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_category unique (user_id, name, type)
);

-- Habilitar RLS
alter table categories enable row level security;

-- Políticas de segurança
create policy "Users can view own categories"
  on categories for select
  using (auth.uid() = user_id);

create policy "Users can create own categories"
  on categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on categories for delete
  using (auth.uid() = user_id);

-- Índice para performance
create index categories_user_id_idx on categories(user_id);

-- Criar tabela de transações
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references categories on delete set null,
  type text not null check (type in ('receita', 'despesa', 'transferencia')),
  amount decimal(15, 2) not null,
  description text not null,
  notes text,
  date date not null,
  status text default 'concluida' check (status in ('pendente', 'concluida', 'cancelada')),
  is_recurring boolean default false,
  recurring_frequency text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint positive_amount check (amount > 0)
);

-- Habilitar RLS
alter table transactions enable row level security;

-- Políticas de segurança
create policy "Users can view own transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Users can create own transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on transactions for delete
  using (auth.uid() = user_id);

-- Índices para performance
create index transactions_user_id_idx on transactions(user_id);
create index transactions_date_idx on transactions(date desc);
create index transactions_category_id_idx on transactions(category_id);

-- Função para criar perfil e categorias padrão automaticamente
create or replace function handle_new_user()
returns trigger as $$
begin
  -- Criar perfil
  insert into public.profiles (id, email)
  values (new.id, new.email);

  -- Criar categorias de despesa padrão
  insert into public.categories (user_id, name, type, icon, color) values
    (new.id, 'Alimentação', 'despesa', '🍽️', '#f97316'),
    (new.id, 'Transporte', 'despesa', '🚗', '#3b82f6'),
    (new.id, 'Moradia', 'despesa', '🏠', '#8b5cf6'),
    (new.id, 'Saúde', 'despesa', '🏥', '#ef4444'),
    (new.id, 'Lazer', 'despesa', '🎮', '#ec4899'),
    (new.id, 'Educação', 'despesa', '📚', '#10b981'),
    (new.id, 'Outros', 'despesa', '📌', '#6b7280');

  -- Criar categorias de receita padrão
  insert into public.categories (user_id, name, type, icon, color) values
    (new.id, 'Salário', 'receita', '💰', '#22c55e'),
    (new.id, 'Freelance', 'receita', '💼', '#14b8a6'),
    (new.id, 'Investimentos', 'receita', '📈', '#06b6d4'),
    (new.id, 'Outros', 'receita', '💵', '#84cc16');

  return new;
end;
$$ language plpgsql security definer;

-- Trigger para executar a função quando um novo usuário se cadastrar
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

### 3. Rodar o Projeto

#### Modo Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

#### Build de Produção

```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
finance-tracker/
├── app/                      # Next.js App Router
│   ├── globals.css          # Estilos globais e variáveis CSS
│   ├── layout.tsx           # Layout raiz
│   └── page.tsx             # Página inicial
├── components/              # Componentes React
│   ├── ui/                  # Componentes UI base
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   └── label.tsx
│   └── shared/              # Componentes compartilhados
│       ├── loading-spinner.tsx
│       └── empty-state.tsx
├── lib/                     # Bibliotecas e utilitários
│   ├── supabase/           # Configuração Supabase
│   │   ├── client.ts       # Cliente browser
│   │   ├── server.ts       # Cliente servidor
│   │   └── middleware.ts   # Middleware helper
│   ├── utils/              # Funções utilitárias
│   │   ├── cn.ts           # Class names
│   │   ├── format-currency.ts
│   │   ├── format-date.ts
│   │   └── validation.ts   # Schemas Zod
│   └── constants/          # Constantes
│       ├── categories.ts
│       └── ui-text.ts
├── types/                   # TypeScript types
│   ├── database.ts
│   ├── transaction.ts
│   ├── category.ts
│   └── user.ts
├── middleware.ts            # Next.js middleware
├── .env.local              # Variáveis de ambiente (não commitado)
└── .env.example            # Template de variáveis
```

## 🎨 Customizar Cores

Para alterar a paleta de cores, edite o arquivo [app/globals.css](app/globals.css):

```css
:root {
  /* Troque os valores RGB das cores */
  --primary-500: 249 115 22;  /* Laranja principal */
  --neutral-900: 23 23 23;    /* Preto */
  /* ... outras cores */
}
```

As cores são definidas usando valores RGB separados por espaços para funcionar com a função `rgb()` do Tailwind CSS com suporte a alpha channel.

## 🛠️ Tecnologias Utilizadas

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: [Supabase](https://supabase.com/)
  - PostgreSQL
  - Authentication
  - Row Level Security (RLS)
- **Formulários**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Datas**: [date-fns](https://date-fns.org/)

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm start` - Inicia servidor de produção
- `npm run lint` - Executa ESLint

## 🔒 Segurança

- **Row Level Security (RLS)**: Todas as tabelas têm políticas de segurança configuradas
- **Autenticação**: Gerenciada pelo Supabase Auth
- **Middleware**: Proteção de rotas implementada
- **Validação**: Schemas Zod para validação de dados

## 📦 Próximas Funcionalidades

- [ ] Dark mode
- [ ] Transações recorrentes automáticas
- [ ] Múltiplas contas/carteiras
- [ ] Upload de comprovantes
- [ ] Notificações de orçamento
- [ ] PWA (Progressive Web App)
- [ ] Exportação para PDF/CSV
- [ ] Integração com Open Banking

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 📞 Suporte

Se encontrar problemas:
1. Verifique se as credenciais do Supabase estão corretas em `.env.local`
2. Confirme que as tabelas foram criadas corretamente
3. Verifique o console do navegador e terminal para erros
4. Abra uma issue no GitHub com detalhes do problema

---

Desenvolvido com ❤️ usando Next.js e Supabase
