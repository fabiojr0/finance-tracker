-- Finance Tracker - Database Schema
-- Execute este arquivo no SQL Editor do Supabase

-- ==========================================
-- TABELAS
-- ==========================================

-- Perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'investimento', 'transferencia')),
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_category UNIQUE (user_id, name, type)
);

-- Transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
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

-- ==========================================
-- ÍNDICES
-- ==========================================

CREATE INDEX IF NOT EXISTS categories_user_id_idx ON categories(user_id);
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON transactions(category_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories
CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGER: Criar perfil e categorias padrão
-- ==========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar perfil
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email);

  -- Categorias de despesa
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (NEW.id, 'Alimentacao', 'despesa', 'utensils', '#f97316'),
    (NEW.id, 'Transporte', 'despesa', 'car', '#3b82f6'),
    (NEW.id, 'Moradia', 'despesa', 'home', '#8b5cf6'),
    (NEW.id, 'Saude', 'despesa', 'heart', '#ef4444'),
    (NEW.id, 'Lazer', 'despesa', 'gamepad', '#ec4899'),
    (NEW.id, 'Educacao', 'despesa', 'graduation-cap', '#10b981'),
    (NEW.id, 'Outros', 'despesa', 'package', '#6b7280');

  -- Categorias de receita
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (NEW.id, 'Salario', 'receita', 'wallet', '#22c55e'),
    (NEW.id, 'Freelance', 'receita', 'briefcase', '#14b8a6'),
    (NEW.id, 'Vendas', 'receita', 'shopping-bag', '#06b6d4'),
    (NEW.id, 'Outros', 'receita', 'coins', '#84cc16');

  -- Categorias de investimento
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (NEW.id, 'Acoes', 'investimento', 'trending-up', '#3b82f6'),
    (NEW.id, 'Renda Fixa', 'investimento', 'landmark', '#6366f1'),
    (NEW.id, 'Fundos', 'investimento', 'bar-chart', '#8b5cf6'),
    (NEW.id, 'Criptomoedas', 'investimento', 'coins', '#f59e0b'),
    (NEW.id, 'Outros', 'investimento', 'piggy-bank', '#0ea5e9');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
