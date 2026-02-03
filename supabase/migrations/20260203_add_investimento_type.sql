-- Migration: Add 'investimento' type to categories and transactions
-- Date: 2026-02-03
-- Description: Adds support for investment transactions and categories

-- ==============================================
-- 1. Update categories table CHECK constraint
-- ==============================================

-- Drop the existing constraint
ALTER TABLE categories
DROP CONSTRAINT IF EXISTS categories_type_check;

-- Add new constraint with 'investimento' type
ALTER TABLE categories
ADD CONSTRAINT categories_type_check
CHECK (type IN ('receita', 'despesa', 'investimento'));

-- ==============================================
-- 2. Update transactions table CHECK constraint
-- ==============================================

-- Drop the existing constraint
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Add new constraint with 'investimento' type
ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check
CHECK (type IN ('receita', 'despesa', 'transferencia', 'investimento'));

-- ==============================================
-- 3. Update handle_new_user() function to include
--    default investment categories for new users
-- ==============================================

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

-- ==============================================
-- 4. (Optional) Add default investment categories
--    for existing users
-- ==============================================

-- Uncomment the following block if you want to add
-- default investment categories for all existing users:

/*
INSERT INTO public.categories (user_id, name, type, icon, color)
SELECT
  p.id,
  c.name,
  c.type,
  c.icon,
  c.color
FROM public.profiles p
CROSS JOIN (
  VALUES
    ('Acoes', 'investimento', 'trending-up', '#3b82f6'),
    ('Renda Fixa', 'investimento', 'landmark', '#6366f1'),
    ('Fundos', 'investimento', 'bar-chart', '#8b5cf6'),
    ('Criptomoedas', 'investimento', 'coins', '#f59e0b'),
    ('Outros', 'investimento', 'piggy-bank', '#0ea5e9')
) AS c(name, type, icon, color)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories cat
  WHERE cat.user_id = p.id
    AND cat.name = c.name
    AND cat.type = c.type
);
*/
