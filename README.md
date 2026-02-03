# Finance Tracker

Aplicação web para controle de finanças pessoais.

## Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Recharts
- Lucide Icons

## Funcionalidades

- Dashboard com resumo financeiro
- Gráficos de evolução e gastos por categoria
- Gestão de transações (receitas, despesas, investimentos)
- Filtros por tipo, categoria, status e período
- Gestão de categorias personalizadas
- Busca global (Ctrl+K)
- Design responsivo (mobile-first)

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

Crie um projeto em [supabase.com](https://supabase.com) e configure o `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 3. Criar banco de dados

Execute as migrations na pasta `supabase/migrations/` no SQL Editor do Supabase.

### 4. Rodar

```bash
npm run dev
```

Acesse [localhost:3000](http://localhost:3000)

## Estrutura

```
app/                    # Páginas (App Router)
  (auth)/              # Login/Cadastro
  (dashboard)/         # Dashboard, Transações, Categorias, etc.
components/            # Componentes React
  ui/                  # Componentes base (Button, Input, Card...)
  dashboard/           # Gráficos e stats
  transactions/        # Formulário e modal de transação
  shared/              # Componentes reutilizáveis
lib/                   # Utilitários e configurações
  supabase/            # Cliente Supabase
  contexts/            # React Context (FinanceProvider)
  utils/               # Formatação, validação, etc.
types/                 # TypeScript types
```

## Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run lint     # ESLint
```

## Licença

MIT
