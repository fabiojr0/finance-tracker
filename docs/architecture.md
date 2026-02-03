# Finance Tracker - Arquitetura

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Next.js    │  │  Tailwind    │  │   Lucide     │  │
│  │  App Router  │  │     CSS      │  │    Icons     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────▼────────────────────────────────┐
│              Next.js Server (Vercel Edge)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Server     │  │    API       │  │  Middleware  │  │
│  │  Components  │  │   Routes     │  │    (Auth)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         │ Supabase SDK
                         │
┌────────────────────────▼────────────────────────────────┐
│                   Supabase (Backend)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │  │
│  │   Database   │  │   (Email)    │  │   (Future)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Camadas da Aplicação

### 1. Camada de Apresentação (UI)
**Localização**: `components/`, `app/*/page.tsx`

**Responsabilidades**:
- Renderização de componentes React
- Gerenciamento de estado local (useState, useReducer)
- Validação de formulários (React Hook Form + Zod)
- Feedback visual (loading, errors, success)

**Tecnologias**:
- React 19
- Tailwind CSS
- Lucide React (ícones)

### 2. Camada de Lógica de Negócio (Hooks)
**Localização**: `lib/hooks/`

**Responsabilidades**:
- CRUD operations (Create, Read, Update, Delete)
- Estado global de dados (transactions, categories, user)
- Sincronização com backend
- Cache local (em memória)

**Hooks Principais**:
- `useUser()`: Autenticação e dados do usuário
- `useTransactions()`: CRUD de transações
- `useCategories()`: CRUD de categorias

### 3. Camada de Dados (Supabase)
**Localização**: `lib/supabase/`

**Responsabilidades**:
- Conexão com banco de dados
- Queries SQL via Supabase SDK
- Autenticação e autorização
- Row Level Security (RLS)

**Clients**:
- `client.ts`: Para Client Components
- `server.ts`: Para Server Components
- `middleware.ts`: Para Next.js Middleware

### 4. Camada de Tipos (TypeScript)
**Localização**: `types/`

**Responsabilidades**:
- Type safety em toda aplicação
- Contratos de dados
- Autocompletar no IDE

**Arquivos**:
- `database.ts`: Schema do Supabase
- `transaction.ts`: Tipos de transação
- `category.ts`: Tipos de categoria

## Fluxo de Dados

### Leitura de Dados (Read)
```
Component
  ↓ usa hook
Hook (useTransactions)
  ↓ chama
Supabase Client
  ↓ query SQL
PostgreSQL + RLS
  ↓ retorna
Supabase Client
  ↓ atualiza estado
Hook
  ↓ re-render
Component
```

### Escrita de Dados (Create/Update)
```
Component (Form)
  ↓ validação (Zod)
Hook (useTransactions.create)
  ↓ autenticação
Supabase Client
  ↓ insert/update
PostgreSQL + RLS
  ↓ trigger (se novo usuário)
Auto-criar categorias
  ↓ retorna dados
Supabase Client
  ↓ atualiza estado local
Hook
  ↓ re-render
Component (lista atualizada)
```

## Padrões de Implementação

### Client vs Server Components

#### Client Components ('use client')
```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function TransactionForm() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient() // Browser client

  // Interatividade, hooks, eventos
}
```

**Quando usar**:
- Hooks do React (useState, useEffect, etc.)
- Event handlers (onClick, onChange, etc.)
- Browser APIs (window, localStorage, etc.)
- Formulários interativos

#### Server Components (padrão)
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient() // Server client
  const { data } = await supabase.from('transactions').select()

  // Sem interatividade, apenas renderização
  return <div>{/* ... */}</div>
}
```

**Quando usar**:
- Fetching de dados no servidor
- SEO (meta tags, etc.)
- Performance (menos JS no cliente)
- Acesso a secrets (variáveis de ambiente server-only)

### Validação de Dados

#### Client-side (UX)
```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema } from '@/lib/utils/validation'

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(transactionSchema)
})
```

**Vantagens**:
- Feedback instantâneo
- Menos requests ao servidor
- Melhor UX

#### Server-side (Segurança)
```sql
-- PostgreSQL Constraints
ALTER TABLE transactions
ADD CONSTRAINT positive_amount CHECK (amount > 0);

-- Row Level Security
CREATE POLICY "Users own transactions"
ON transactions FOR ALL
USING (auth.uid() = user_id);
```

**Vantagens**:
- Não pode ser bypassado
- Validação centralizada
- Segurança garantida

### Segurança (RLS)

#### Como funciona
```
Client Request
  ↓
Supabase (verifica JWT token)
  ↓
PostgreSQL RLS (verifica políticas)
  ↓ auth.uid() = user_id?
Se SIM: retorna dados
Se NÃO: erro 403
```

#### Exemplo de Política
```sql
CREATE POLICY "policy_name"
ON table_name
FOR SELECT                    -- operação (SELECT, INSERT, UPDATE, DELETE, ALL)
USING (auth.uid() = user_id)  -- condição
```

## Rotas e Autenticação

### Grupos de Rotas

#### (auth) - Rotas Públicas
```
app/(auth)/
├── layout.tsx         # Layout específico (sem sidebar)
├── login/page.tsx     # Acessível sem autenticação
└── cadastro/page.tsx  # Acessível sem autenticação
```

#### (dashboard) - Rotas Protegidas
```
app/(dashboard)/
├── layout.tsx              # Layout com sidebar/header
├── dashboard/page.tsx      # Requer autenticação
├── transacoes/page.tsx     # Requer autenticação
└── ...                     # Todas requerem autenticação
```

### Middleware (Proteção)
```typescript
// middleware.ts (raiz)
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()

  // Se não autenticado E tentando acessar rota protegida
  if (!user && !isPublicRoute) {
    return redirect('/login')
  }

  // Se autenticado E tentando acessar página de login
  if (user && isAuthRoute) {
    return redirect('/dashboard')
  }
}
```

## Performance

### Otimizações Implementadas
1. **Server Components**: Menos JavaScript no cliente
2. **Lazy Loading**: Componentes pesados carregam sob demanda (planejado)
3. **Índices DB**: user_id, date, category_id indexados
4. **Limit Queries**: Máximo 100 registros por request
5. **Static Generation**: Páginas estáticas quando possível

### Métricas de Performance
```
Lighthouse Score (objetivo):
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: 100
```

## Escalabilidade

### Atual (MVP)
- Suporta: ~1000 usuários simultâneos
- Database: Supabase Free Tier (500MB)
- Hosting: Vercel Free Tier

### Futuro (Scale)
- Database: Supabase Pro ($25/mês) - 8GB
- Hosting: Vercel Pro ($20/mês) - Unlimited
- CDN: Cloudflare (grátis)
- Caching: Redis (para queries frequentes)

## Diagrama de Componentes

```
app/
├── (auth)/
│   ├── layout.tsx
│   │   └── LoginForm / SignupForm
│   │       └── Button, Input, Label
│   └── page.tsx
│
└── (dashboard)/
    ├── layout.tsx
    │   ├── Header
    │   │   └── Button (Logout)
    │   ├── Sidebar
    │   │   └── Navigation Links
    │   └── children (páginas)
    │
    ├── dashboard/page.tsx
    │   ├── StatsCard[]
    │   └── RecentTransactions
    │       └── TransactionItem[]
    │
    ├── transacoes/page.tsx
    │   ├── TransactionForm
    │   │   ├── Input, Select, Label
    │   │   └── Button
    │   └── TransactionList
    │       └── TransactionItem[]
    │           ├── Badge (category)
    │           └── Button (edit/delete)
    │
    └── categorias/page.tsx
        ├── CategoryForm
        │   └── Input, Button
        └── CategoryList
            └── CategoryItem[]
```

## Dependências Principais

```json
{
  "dependencies": {
    "next": "15.x",           // Framework
    "react": "19.x",          // UI Library
    "@supabase/ssr": "^0.8",  // Supabase SSR
    "tailwindcss": "^3.4",    // Styling
    "zod": "^4.x",            // Validation
    "react-hook-form": "^7.x", // Forms
    "date-fns": "^4.x",       // Dates
    "lucide-react": "^0.5"    // Icons
  }
}
```
