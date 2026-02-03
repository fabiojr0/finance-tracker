# Finance Tracker - Schema do Banco de Dados

## Diagrama ER (Entity Relationship)

```
┌─────────────────┐         ┌─────────────────┐
│   auth.users    │         │    profiles     │
│  (Supabase)     │◄────────│                 │
├─────────────────┤   1:1   ├─────────────────┤
│ id (PK)         │         │ id (PK, FK)     │
│ email           │         │ email           │
│ encrypted_pass  │         │ full_name       │
│ ...             │         │ avatar_url      │
└─────────────────┘         │ currency        │
                            │ created_at      │
                            │ updated_at      │
                            └────────┬────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                     1:N  │                     │ 1:N
                          │                     │
            ┌─────────────▼──────┐   ┌─────────▼────────┐
            │    categories      │   │  transactions    │
            ├────────────────────┤   ├──────────────────┤
            │ id (PK)            │   │ id (PK)          │
            │ user_id (FK)       │   │ user_id (FK)     │
            │ name               │◄──┤ category_id (FK) │
            │ type               │N:1│ type             │
            │ icon               │   │ amount           │
            │ color              │   │ description      │
            │ is_active          │   │ date             │
            │ created_at         │   │ status           │
            │ updated_at         │   │ notes            │
            └────────────────────┘   │ is_recurring     │
                                     │ tags[]           │
                                     │ created_at       │
                                     │ updated_at       │
                                     └──────────────────┘
```

## Tabelas

### 1. profiles
Extensão do `auth.users` do Supabase com dados adicionais do usuário.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

#### Campos
| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | NO | - | ID do usuário (FK para auth.users) |
| email | TEXT | NO | - | Email do usuário (único) |
| full_name | TEXT | YES | NULL | Nome completo |
| avatar_url | TEXT | YES | NULL | URL do avatar |
| currency | TEXT | NO | 'BRL' | Moeda preferida |
| created_at | TIMESTAMPTZ | NO | NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NO | NOW() | Data de atualização |

#### Índices
```sql
CREATE INDEX profiles_email_idx ON profiles(email);
```

#### RLS Policies
```sql
-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

### 2. categories
Categorias para classificação de transações.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'investimento')),
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_category UNIQUE (user_id, name, type)
);
```

#### Campos
| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | NO | gen_random_uuid() | ID único da categoria |
| user_id | UUID | NO | - | ID do usuário (FK) |
| name | TEXT | NO | - | Nome da categoria |
| type | TEXT | NO | - | Tipo: 'receita', 'despesa' ou 'investimento' |
| icon | TEXT | YES | NULL | Emoji ou ícone |
| color | TEXT | YES | NULL | Cor hex (ex: #f97316) |
| is_active | BOOLEAN | NO | TRUE | Se categoria está ativa |
| created_at | TIMESTAMPTZ | NO | NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NO | NOW() | Data de atualização |

#### Constraints
```sql
-- Tipo deve ser 'receita', 'despesa' ou 'investimento'
CHECK (type IN ('receita', 'despesa', 'investimento'))

-- Combinação de user_id + name + type deve ser única
CONSTRAINT unique_user_category UNIQUE (user_id, name, type)
```

#### Índices
```sql
CREATE INDEX categories_user_id_idx ON categories(user_id);
CREATE INDEX categories_type_idx ON categories(type);
```

#### RLS Policies
```sql
-- Usuários podem ver suas categorias
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar categorias
CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas categorias
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar suas categorias
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);
```

#### Categorias Padrão
Criadas automaticamente via trigger `handle_new_user()`:

**Despesas**:
- Alimentação (utensils)
- Transporte (car)
- Moradia (home)
- Saúde (heart)
- Lazer (gamepad)
- Educação (graduation-cap)
- Outros (package)

**Receitas**:
- Salário (wallet)
- Freelance (briefcase)
- Vendas (shopping-bag)
- Outros (coins)

**Investimentos**:
- Ações (trending-up)
- Renda Fixa (landmark)
- Fundos (bar-chart)
- Criptomoedas (coins)
- Outros (piggy-bank)

---

### 3. transactions
Registro de todas as transações financeiras.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category_id UUID REFERENCES categories ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'transferencia', 'investimento')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  status TEXT DEFAULT 'concluida' CHECK (status IN ('pendente', 'concluida', 'cancelada')),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

#### Campos
| Campo | Tipo | Nullable | Default | Descrição |
|-------|------|----------|---------|-----------|
| id | UUID | NO | gen_random_uuid() | ID único da transação |
| user_id | UUID | NO | - | ID do usuário (FK) |
| category_id | UUID | YES | NULL | ID da categoria (FK) |
| type | TEXT | NO | - | Tipo: receita/despesa/transferencia/investimento |
| amount | DECIMAL(15,2) | NO | - | Valor (sempre positivo) |
| description | TEXT | NO | - | Descrição da transação |
| notes | TEXT | YES | NULL | Observações adicionais |
| date | DATE | NO | - | Data da transação |
| status | TEXT | NO | 'concluida' | Status da transação |
| is_recurring | BOOLEAN | NO | FALSE | Se é recorrente |
| recurring_frequency | TEXT | YES | NULL | Frequência (mensal, semanal) |
| tags | TEXT[] | YES | NULL | Array de tags |
| created_at | TIMESTAMPTZ | NO | NOW() | Data de criação |
| updated_at | TIMESTAMPTZ | NO | NOW() | Data de atualização |

#### Constraints
```sql
-- Tipo válido
CHECK (type IN ('receita', 'despesa', 'transferencia', 'investimento'))

-- Valor sempre positivo
CHECK (amount > 0)

-- Status válido
CHECK (status IN ('pendente', 'concluida', 'cancelada'))
```

#### Índices
```sql
CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX transactions_date_idx ON transactions(date DESC);
CREATE INDEX transactions_category_id_idx ON transactions(category_id);
CREATE INDEX transactions_type_idx ON transactions(type);
CREATE INDEX transactions_status_idx ON transactions(status);
```

#### RLS Policies
```sql
-- Usuários podem ver suas transações
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar transações
CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas transações
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuários podem deletar suas transações
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 4. budgets (Planejado)
Orçamentos mensais por categoria.

```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category_id UUID REFERENCES categories ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  period TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

---

## Triggers e Functions

### handle_new_user()
Trigger executado quando um novo usuário se cadastra.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar perfil
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);

  -- Criar categorias de despesa
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (NEW.id, 'Alimentacao', 'despesa', 'utensils', '#f97316'),
    (NEW.id, 'Transporte', 'despesa', 'car', '#3b82f6'),
    (NEW.id, 'Moradia', 'despesa', 'home', '#8b5cf6'),
    (NEW.id, 'Saude', 'despesa', 'heart', '#ef4444'),
    (NEW.id, 'Lazer', 'despesa', 'gamepad', '#ec4899'),
    (NEW.id, 'Educacao', 'despesa', 'graduation-cap', '#10b981'),
    (NEW.id, 'Outros', 'despesa', 'package', '#6b7280');

  -- Criar categorias de receita
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (NEW.id, 'Salario', 'receita', 'wallet', '#22c55e'),
    (NEW.id, 'Freelance', 'receita', 'briefcase', '#14b8a6'),
    (NEW.id, 'Vendas', 'receita', 'shopping-bag', '#06b6d4'),
    (NEW.id, 'Outros', 'receita', 'coins', '#84cc16');

  -- Criar categorias de investimento
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (NEW.id, 'Acoes', 'investimento', 'trending-up', '#3b82f6'),
    (NEW.id, 'Renda Fixa', 'investimento', 'landmark', '#6366f1'),
    (NEW.id, 'Fundos', 'investimento', 'bar-chart', '#8b5cf6'),
    (NEW.id, 'Criptomoedas', 'investimento', 'coins', '#f59e0b'),
    (NEW.id, 'Outros', 'investimento', 'piggy-bank', '#0ea5e9');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## Queries Comuns

### Buscar transações com categoria
```sql
SELECT
  t.*,
  c.name as category_name,
  c.icon as category_icon,
  c.color as category_color
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 'user-uuid'
ORDER BY t.date DESC, t.created_at DESC
LIMIT 100;
```

### Calcular saldo do mês
```sql
SELECT
  SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END) as income,
  SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END) as expenses,
  SUM(CASE WHEN type = 'receita' THEN amount ELSE -amount END) as balance
FROM transactions
WHERE user_id = 'user-uuid'
  AND date >= DATE_TRUNC('month', CURRENT_DATE)
  AND date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
```

### Gastos por categoria (mês atual)
```sql
SELECT
  c.name,
  c.icon,
  c.color,
  SUM(t.amount) as total
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.user_id = 'user-uuid'
  AND t.type = 'despesa'
  AND t.date >= DATE_TRUNC('month', CURRENT_DATE)
  AND t.date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY c.id, c.name, c.icon, c.color
ORDER BY total DESC;
```

---

## Migrations

### Adicionar novo campo
```sql
-- Adicionar campo 'attachment_url' em transactions
ALTER TABLE transactions
ADD COLUMN attachment_url TEXT;

-- Criar índice se necessário
CREATE INDEX transactions_attachment_idx ON transactions(attachment_url)
WHERE attachment_url IS NOT NULL;
```

### Modificar constraint
```sql
-- Adicionar novo tipo de transação
ALTER TABLE transactions
DROP CONSTRAINT transactions_type_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check
CHECK (type IN ('receita', 'despesa', 'transferencia', 'investimento'));
```

### Backfill de dados
```sql
-- Exemplo: Preencher campo vazio com valor padrão
UPDATE transactions
SET status = 'concluida'
WHERE status IS NULL;
```

---

## Backup e Restore

### Backup (via Supabase Dashboard)
1. Project Settings → Database
2. Database Backups → Download

### Backup Manual (via SQL)
```bash
# Exportar schema
pg_dump -h db.xxx.supabase.co -U postgres -s -n public > schema.sql

# Exportar dados
pg_dump -h db.xxx.supabase.co -U postgres -a -n public > data.sql
```

### Restore
```bash
psql -h db.xxx.supabase.co -U postgres -d postgres < schema.sql
psql -h db.xxx.supabase.co -U postgres -d postgres < data.sql
```
