# Troubleshooting - Problemas Comuns

## Problema: Não consegue criar conta

### Passo 1: Verificar se o servidor está rodando
```bash
npm run dev
```
Deve aparecer: `Ready on http://localhost:3000`

### Passo 2: Verificar erros no Console do Browser
1. Abra o site (http://localhost:3000)
2. Pressione F12 para abrir DevTools
3. Vá na aba "Console"
4. Tente criar a conta novamente
5. Veja se aparece algum erro em vermelho

**Erros comuns**:
- ❌ "Invalid API key" → Credenciais erradas no .env.local
- ❌ "Failed to fetch" → Servidor não rodando ou URL errada
- ❌ "User already registered" → Email já cadastrado

### Passo 3: Verificar Configuração do Supabase

#### 3.1 Desabilitar Confirmação de Email (Temporário)
1. Acesse seu projeto no Supabase
2. Vá em **Authentication** → **Providers** → **Email**
3. DESABILITE "Confirm email" (apenas para testes)
4. Clique em "Save"

#### 3.2 Verificar se as Tabelas Existem
1. No Supabase, vá em **Table Editor**
2. Verifique se existem as tabelas:
   - ✅ profiles
   - ✅ categories
   - ✅ transactions

**Se NÃO existirem, execute o SQL abaixo**.

### Passo 4: Executar SQL Completo

No Supabase, vá em **SQL Editor** → **New query** e execute:

```sql
-- ============================================
-- FINANCE TRACKER - DATABASE SETUP
-- ============================================

-- 1. CRIAR TABELA DE PERFIS
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. CRIAR TABELA DE CATEGORIAS
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_category UNIQUE (user_id, name, type)
);

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own categories" ON categories;
CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Índice para performance
DROP INDEX IF EXISTS categories_user_id_idx;
CREATE INDEX categories_user_id_idx ON categories(user_id);

-- 3. CRIAR TABELA DE TRANSAÇÕES
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'transferencia')),
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL,
  status TEXT DEFAULT 'concluida' CHECK (status IN ('pendente', 'concluida', 'cancelada')),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para performance
DROP INDEX IF EXISTS transactions_user_id_idx;
CREATE INDEX transactions_user_id_idx ON transactions(user_id);

DROP INDEX IF EXISTS transactions_date_idx;
CREATE INDEX transactions_date_idx ON transactions(date DESC);

DROP INDEX IF EXISTS transactions_category_id_idx;
CREATE INDEX transactions_category_id_idx ON transactions(category_id);

-- 4. FUNÇÃO PARA CRIAR PERFIL E CATEGORIAS PADRÃO
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar perfil
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);

  -- Criar categorias de despesa padrão
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (NEW.id, 'Alimentação', 'despesa', '🍽️', '#f97316'),
    (NEW.id, 'Transporte', 'despesa', '🚗', '#3b82f6'),
    (NEW.id, 'Moradia', 'despesa', '🏠', '#8b5cf6'),
    (NEW.id, 'Saúde', 'despesa', '🏥', '#ef4444'),
    (NEW.id, 'Lazer', 'despesa', '🎮', '#ec4899'),
    (NEW.id, 'Educação', 'despesa', '📚', '#10b981'),
    (NEW.id, 'Outros', 'despesa', '📌', '#6b7280');

  -- Criar categorias de receita padrão
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (NEW.id, 'Salário', 'receita', '💰', '#22c55e'),
    (NEW.id, 'Freelance', 'receita', '💼', '#14b8a6'),
    (NEW.id, 'Investimentos', 'receita', '📈', '#06b6d4'),
    (NEW.id, 'Outros', 'receita', '💵', '#84cc16');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CRIAR TRIGGER
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT 'Setup completo!' as status;
```

### Passo 5: Verificar se executou com sucesso

Após executar o SQL, você deve ver:
- ✅ "Success. No rows returned"
- OU ✅ Uma mensagem "Setup completo!"

### Passo 6: Verificar Triggers

No Supabase SQL Editor, execute:

```sql
-- Verificar se o trigger existe
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

Deve retornar 1 linha mostrando o trigger.

### Passo 7: Testar Cadastro Novamente

1. Volte para http://localhost:3000
2. Clique em "Começar Agora" ou "Cadastro"
3. Preencha:
   - Email: teste@exemplo.com
   - Senha: 123456 (mínimo 6 caracteres)
   - Confirmar Senha: 123456
4. Clique em "Cadastrar"

**O que deve acontecer**:
- ✅ Mensagem verde: "Conta criada com sucesso!"
- ✅ Se email confirmation estiver DESABILITADO → Redireciona para /login
- ⚠️ Se email confirmation estiver HABILITADO → Precisa verificar email

### Passo 8: Se ainda não funcionar

Execute este SQL para ver se o usuário foi criado:

```sql
-- Ver usuários cadastrados
SELECT id, email, created_at, confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**Possíveis cenários**:

1. **Usuário aparece na lista**:
   - ✅ Cadastro funcionou!
   - Se `confirmed_at` é NULL → Precisa confirmar email
   - Vá nas configurações do Auth e desabilite "Confirm email"

2. **Usuário NÃO aparece**:
   - ❌ Erro no formulário ou validação
   - Verifique o console do browser (F12)
   - Verifique erros no terminal onde roda `npm run dev`

### Passo 9: Logs de Erro

**No terminal** (onde roda npm run dev):
```bash
# Procure por erros como:
# - "Supabase error"
# - "Failed to sign up"
# - Stack traces em vermelho
```

**No Browser Console** (F12):
```javascript
// Procure por:
// - Network errors (aba Network)
// - Console errors (aba Console)
// - Verifique a requisição para Supabase
```

## Solução Rápida (Se nada funcionar)

Execute este SQL para **DESABILITAR RLS TEMPORARIAMENTE**:

```sql
-- ATENÇÃO: Apenas para debug local!
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
```

Tente cadastrar novamente. Se funcionar, o problema é nas políticas RLS.

Para **RE-HABILITAR RLS**:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
```

## Problemas Conhecidos

### 1. "Email rate limit exceeded"
**Solução**: Aguarde alguns minutos antes de tentar novamente.

### 2. "User already registered"
**Solução**: Use outro email ou delete o usuário:
```sql
-- Ver usuários
SELECT id, email FROM auth.users;

-- Deletar (CUIDADO!)
DELETE FROM auth.users WHERE email = 'seu@email.com';
```

### 3. "Invalid login credentials"
**Solução**:
- Verifique se a senha tem no mínimo 6 caracteres
- Tente resetar a senha no Supabase Dashboard

## Precisa de Ajuda?

Me envie:
1. ❌ Erros do Console (F12 → Console)
2. ❌ Erros do Terminal (onde roda npm run dev)
3. ✅ Resultado do SQL: `SELECT * FROM auth.users LIMIT 1;`
4. ✅ Screenshot da tela de cadastro
