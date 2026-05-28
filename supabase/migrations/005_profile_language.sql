-- Adiciona a preferência de idioma ao perfil do usuário.
-- Valores suportados pela aplicação: 'pt', 'en', 'es'.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'pt';
