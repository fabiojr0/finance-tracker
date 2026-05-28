-- Cria perfil + categorias padrão de acordo com o idioma e a moeda
-- escolhidos no cadastro (raw_user_meta_data->>'language' / 'currency').
-- Os ícones e cores são idênticos aos da 002; apenas os NOMES mudam por idioma.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_full_name TEXT;
  user_lang TEXT;
  user_currency TEXT;
BEGIN
  meta_full_name := NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), '');

  user_lang := COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'language', ''), 'pt');
  IF user_lang NOT IN ('pt', 'en', 'es') THEN
    user_lang := 'pt';
  END IF;

  user_currency := COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'currency', ''), 'BRL');

  -- Perfil
  INSERT INTO public.profiles (id, email, full_name, language, currency)
  VALUES (NEW.id, NEW.email, meta_full_name, user_lang, user_currency);

  -- Categorias padrão por idioma (mesmos ícones/cores da migração 002)
  IF user_lang = 'en' THEN
    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
      (NEW.id, 'Food', 'despesa', 'utensils', '#f97316'),
      (NEW.id, 'Transport', 'despesa', 'car', '#3b82f6'),
      (NEW.id, 'Housing', 'despesa', 'home', '#8b5cf6'),
      (NEW.id, 'Health', 'despesa', 'heart', '#ef4444'),
      (NEW.id, 'Leisure', 'despesa', 'gamepad', '#ec4899'),
      (NEW.id, 'Education', 'despesa', 'graduation-cap', '#10b981'),
      (NEW.id, 'Other', 'despesa', 'package', '#6b7280');

    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
      (NEW.id, 'Salary', 'receita', 'wallet', '#22c55e'),
      (NEW.id, 'Freelance', 'receita', 'briefcase', '#14b8a6'),
      (NEW.id, 'Sales', 'receita', 'shopping-bag', '#06b6d4'),
      (NEW.id, 'Other', 'receita', 'coins', '#84cc16');

    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
      (NEW.id, 'Stocks', 'investimento', 'trending-up', '#3b82f6'),
      (NEW.id, 'Fixed Income', 'investimento', 'landmark', '#6366f1'),
      (NEW.id, 'Funds', 'investimento', 'bar-chart', '#8b5cf6'),
      (NEW.id, 'Crypto', 'investimento', 'coins', '#f59e0b'),
      (NEW.id, 'Other', 'investimento', 'piggy-bank', '#0ea5e9');

  ELSIF user_lang = 'es' THEN
    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
      (NEW.id, 'Alimentación', 'despesa', 'utensils', '#f97316'),
      (NEW.id, 'Transporte', 'despesa', 'car', '#3b82f6'),
      (NEW.id, 'Vivienda', 'despesa', 'home', '#8b5cf6'),
      (NEW.id, 'Salud', 'despesa', 'heart', '#ef4444'),
      (NEW.id, 'Ocio', 'despesa', 'gamepad', '#ec4899'),
      (NEW.id, 'Educación', 'despesa', 'graduation-cap', '#10b981'),
      (NEW.id, 'Otros', 'despesa', 'package', '#6b7280');

    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
      (NEW.id, 'Salario', 'receita', 'wallet', '#22c55e'),
      (NEW.id, 'Freelance', 'receita', 'briefcase', '#14b8a6'),
      (NEW.id, 'Ventas', 'receita', 'shopping-bag', '#06b6d4'),
      (NEW.id, 'Otros', 'receita', 'coins', '#84cc16');

    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
      (NEW.id, 'Acciones', 'investimento', 'trending-up', '#3b82f6'),
      (NEW.id, 'Renta Fija', 'investimento', 'landmark', '#6366f1'),
      (NEW.id, 'Fondos', 'investimento', 'bar-chart', '#8b5cf6'),
      (NEW.id, 'Criptomonedas', 'investimento', 'coins', '#f59e0b'),
      (NEW.id, 'Otros', 'investimento', 'piggy-bank', '#0ea5e9');

  ELSE
    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
      (NEW.id, 'Alimentação', 'despesa', 'utensils', '#f97316'),
      (NEW.id, 'Transporte', 'despesa', 'car', '#3b82f6'),
      (NEW.id, 'Moradia', 'despesa', 'home', '#8b5cf6'),
      (NEW.id, 'Saúde', 'despesa', 'heart', '#ef4444'),
      (NEW.id, 'Lazer', 'despesa', 'gamepad', '#ec4899'),
      (NEW.id, 'Educação', 'despesa', 'graduation-cap', '#10b981'),
      (NEW.id, 'Outros', 'despesa', 'package', '#6b7280');

    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
      (NEW.id, 'Salário', 'receita', 'wallet', '#22c55e'),
      (NEW.id, 'Freelance', 'receita', 'briefcase', '#14b8a6'),
      (NEW.id, 'Vendas', 'receita', 'shopping-bag', '#06b6d4'),
      (NEW.id, 'Outros', 'receita', 'coins', '#84cc16');

    INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
      (NEW.id, 'Ações', 'investimento', 'trending-up', '#3b82f6'),
      (NEW.id, 'Renda Fixa', 'investimento', 'landmark', '#6366f1'),
      (NEW.id, 'Fundos', 'investimento', 'bar-chart', '#8b5cf6'),
      (NEW.id, 'Criptomoedas', 'investimento', 'coins', '#f59e0b'),
      (NEW.id, 'Outros', 'investimento', 'piggy-bank', '#0ea5e9');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
