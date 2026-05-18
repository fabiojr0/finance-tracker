-- Persistir full_name informado no cadastro
-- Atualiza a função do trigger para ler raw_user_meta_data->>'full_name'

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_full_name TEXT;
BEGIN
  meta_full_name := NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), '');

  -- Criar perfil
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, meta_full_name);

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
