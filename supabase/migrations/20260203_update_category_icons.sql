-- Migration: Update category icons from emojis to Lucide icon names
-- Date: 2026-02-03
-- Description: Updates existing categories to use Lucide icon names
-- Available icons: wallet, credit-card, banknote, piggy-bank, trending-up, trending-down,
--   line-chart, bar-chart, dollar-sign, receipt, landmark, circle-dollar, coins, badge-dollar,
--   hand-coins, gem, shopping-cart, shopping-bag, store, package, gift, home, building2,
--   lightbulb, droplets, flame, wifi, wrench, hammer, car, bus, plane, train, fuel, bike,
--   utensils, coffee, pizza, beer, wine, apple, salad, sandwich, heart, activity, pill,
--   stethoscope, dumbbell, gamepad, music, film, tv, monitor, smartphone, laptop, headphones,
--   camera, book, graduation-cap, briefcase, building, users, baby, dog, cat, shirt, scissors,
--   sparkles, crown, star, phone, mail, file-text, zap, sun, moon, cloud, umbrella, tree,
--   flower, leaf, mountain, waves, anchor

-- ==============================================
-- Update expense categories (Despesas)
-- ==============================================

-- Alimentação
UPDATE categories SET icon = 'utensils'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%alimenta%' OR name ILIKE '%comida%' OR name ILIKE '%refeic%');

-- Transporte
UPDATE categories SET icon = 'car'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%transporte%' OR name ILIKE '%uber%' OR name ILIKE '%taxi%' OR name ILIKE '%carro%');

-- Moradia
UPDATE categories SET icon = 'home'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%moradia%' OR name ILIKE '%aluguel%' OR name ILIKE '%casa%' OR name ILIKE '%apartamento%');

-- Saúde
UPDATE categories SET icon = 'heart'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%saude%' OR name ILIKE '%saúde%' OR name ILIKE '%medic%' OR name ILIKE '%hospital%');

-- Lazer
UPDATE categories SET icon = 'gamepad'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%lazer%' OR name ILIKE '%entretenimento%' OR name ILIKE '%diversao%');

-- Educação
UPDATE categories SET icon = 'graduation-cap'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%educa%' OR name ILIKE '%escola%' OR name ILIKE '%curso%' OR name ILIKE '%faculdade%');

-- Compras
UPDATE categories SET icon = 'shopping-bag'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%compra%' OR name ILIKE '%shopping%' OR name ILIKE '%mercado%');

-- Contas/Serviços
UPDATE categories SET icon = 'file-text'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%conta%' OR name ILIKE '%fatura%' OR name ILIKE '%boleto%');

-- Luz/Energia
UPDATE categories SET icon = 'lightbulb'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%luz%' OR name ILIKE '%energia%' OR name ILIKE '%eletric%');

-- Água
UPDATE categories SET icon = 'droplets'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%agua%' OR name ILIKE '%água%');

-- Gás
UPDATE categories SET icon = 'flame'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%gas%' OR name ILIKE '%gás%');

-- Internet/Telefone
UPDATE categories SET icon = 'wifi'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%internet%' OR name ILIKE '%wifi%');

UPDATE categories SET icon = 'phone'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%telefone%' OR name ILIKE '%celular%');

-- Combustível
UPDATE categories SET icon = 'fuel'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%combustivel%' OR name ILIKE '%gasolina%' OR name ILIKE '%etanol%');

-- Vestuário
UPDATE categories SET icon = 'shirt'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%roupa%' OR name ILIKE '%vestuario%' OR name ILIKE '%calçado%');

-- Beleza
UPDATE categories SET icon = 'sparkles'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%beleza%' OR name ILIKE '%estetica%' OR name ILIKE '%salao%');

-- Pets
UPDATE categories SET icon = 'dog'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%pet%' OR name ILIKE '%animal%' OR name ILIKE '%cachorro%' OR name ILIKE '%gato%');

-- Assinaturas/Streaming
UPDATE categories SET icon = 'tv'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%assinatura%' OR name ILIKE '%streaming%' OR name ILIKE '%netflix%' OR name ILIKE '%spotify%');

-- Viagem
UPDATE categories SET icon = 'plane'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%viagem%' OR name ILIKE '%viaj%' OR name ILIKE '%ferias%');

-- Restaurante/Café
UPDATE categories SET icon = 'coffee'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%cafe%' OR name ILIKE '%café%' OR name ILIKE '%lanche%');

UPDATE categories SET icon = 'utensils'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%restaurante%' OR name ILIKE '%delivery%' OR name ILIKE '%ifood%');

-- Manutenção
UPDATE categories SET icon = 'wrench'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%manutenc%' OR name ILIKE '%conserto%' OR name ILIKE '%reparo%');

-- Academia/Esporte
UPDATE categories SET icon = 'dumbbell'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%academia%' OR name ILIKE '%esporte%' OR name ILIKE '%gym%');

-- Filhos/Família
UPDATE categories SET icon = 'users'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%familia%' OR name ILIKE '%filho%' OR name ILIKE '%criança%');

UPDATE categories SET icon = 'baby'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%bebe%' OR name ILIKE '%bebê%');

-- ==============================================
-- Update income categories (Receitas)
-- ==============================================

-- Salário
UPDATE categories SET icon = 'wallet'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%salario%' OR name ILIKE '%salário%');

-- Freelance
UPDATE categories SET icon = 'briefcase'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%freelance%' OR name ILIKE '%freela%' OR name ILIKE '%autonomo%');

-- Investimentos (receita de)
UPDATE categories SET icon = 'trending-up'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND type = 'receita'
  AND (name ILIKE '%investimento%' OR name ILIKE '%dividendo%' OR name ILIKE '%rendimento%');

-- Vendas
UPDATE categories SET icon = 'store'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%venda%' OR name ILIKE '%comercio%');

-- Presente/Bonus
UPDATE categories SET icon = 'gift'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%presente%' OR name ILIKE '%bonus%' OR name ILIKE '%bônus%');

-- ==============================================
-- Update investment categories (Investimentos)
-- ==============================================

-- Ações
UPDATE categories SET icon = 'trending-up'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND type = 'investimento'
  AND (name ILIKE '%acao%' OR name ILIKE '%ações%' OR name ILIKE '%acoes%' OR name ILIKE '%bolsa%');

-- Renda Fixa
UPDATE categories SET icon = 'landmark'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND type = 'investimento'
  AND (name ILIKE '%renda fixa%' OR name ILIKE '%tesouro%' OR name ILIKE '%cdb%' OR name ILIKE '%lci%' OR name ILIKE '%lca%');

-- Fundos
UPDATE categories SET icon = 'bar-chart'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND type = 'investimento'
  AND (name ILIKE '%fundo%' OR name ILIKE '%fii%' OR name ILIKE '%etf%');

-- Criptomoedas
UPDATE categories SET icon = 'coins'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND type = 'investimento'
  AND (name ILIKE '%cripto%' OR name ILIKE '%bitcoin%' OR name ILIKE '%ethereum%');

-- Poupança
UPDATE categories SET icon = 'piggy-bank'
WHERE (icon IS NULL OR icon ~ '[^\x00-\x7F]')
  AND (name ILIKE '%poupanca%' OR name ILIKE '%poupança%' OR name ILIKE '%reserva%');

-- ==============================================
-- Fallback: Set default icon based on type
-- for any remaining categories with invalid icons
-- ==============================================

-- Despesas sem ícone -> package
UPDATE categories
SET icon = 'package'
WHERE type = 'despesa'
  AND (icon IS NULL OR icon ~ '[^\x00-\x7F]' OR icon NOT IN (
    'wallet', 'credit-card', 'banknote', 'piggy-bank', 'trending-up', 'trending-down',
    'line-chart', 'bar-chart', 'dollar-sign', 'receipt', 'landmark', 'circle-dollar',
    'coins', 'badge-dollar', 'hand-coins', 'gem', 'shopping-cart', 'shopping-bag',
    'store', 'package', 'gift', 'home', 'building2', 'lightbulb', 'droplets', 'flame',
    'wifi', 'wrench', 'hammer', 'car', 'bus', 'plane', 'train', 'fuel', 'bike',
    'utensils', 'coffee', 'pizza', 'beer', 'wine', 'apple', 'salad', 'sandwich',
    'heart', 'activity', 'pill', 'stethoscope', 'dumbbell', 'gamepad', 'music',
    'film', 'tv', 'monitor', 'smartphone', 'laptop', 'headphones', 'camera', 'book',
    'graduation-cap', 'briefcase', 'building', 'users', 'baby', 'dog', 'cat', 'shirt',
    'scissors', 'sparkles', 'crown', 'star', 'phone', 'mail', 'file-text', 'zap',
    'sun', 'moon', 'cloud', 'umbrella', 'tree', 'flower', 'leaf', 'mountain', 'waves', 'anchor'
  ));

-- Receitas sem ícone -> coins
UPDATE categories
SET icon = 'coins'
WHERE type = 'receita'
  AND (icon IS NULL OR icon ~ '[^\x00-\x7F]' OR icon NOT IN (
    'wallet', 'credit-card', 'banknote', 'piggy-bank', 'trending-up', 'trending-down',
    'line-chart', 'bar-chart', 'dollar-sign', 'receipt', 'landmark', 'circle-dollar',
    'coins', 'badge-dollar', 'hand-coins', 'gem', 'shopping-cart', 'shopping-bag',
    'store', 'package', 'gift', 'home', 'building2', 'lightbulb', 'droplets', 'flame',
    'wifi', 'wrench', 'hammer', 'car', 'bus', 'plane', 'train', 'fuel', 'bike',
    'utensils', 'coffee', 'pizza', 'beer', 'wine', 'apple', 'salad', 'sandwich',
    'heart', 'activity', 'pill', 'stethoscope', 'dumbbell', 'gamepad', 'music',
    'film', 'tv', 'monitor', 'smartphone', 'laptop', 'headphones', 'camera', 'book',
    'graduation-cap', 'briefcase', 'building', 'users', 'baby', 'dog', 'cat', 'shirt',
    'scissors', 'sparkles', 'crown', 'star', 'phone', 'mail', 'file-text', 'zap',
    'sun', 'moon', 'cloud', 'umbrella', 'tree', 'flower', 'leaf', 'mountain', 'waves', 'anchor'
  ));

-- Investimentos sem ícone -> piggy-bank
UPDATE categories
SET icon = 'piggy-bank'
WHERE type = 'investimento'
  AND (icon IS NULL OR icon ~ '[^\x00-\x7F]' OR icon NOT IN (
    'wallet', 'credit-card', 'banknote', 'piggy-bank', 'trending-up', 'trending-down',
    'line-chart', 'bar-chart', 'dollar-sign', 'receipt', 'landmark', 'circle-dollar',
    'coins', 'badge-dollar', 'hand-coins', 'gem', 'shopping-cart', 'shopping-bag',
    'store', 'package', 'gift', 'home', 'building2', 'lightbulb', 'droplets', 'flame',
    'wifi', 'wrench', 'hammer', 'car', 'bus', 'plane', 'train', 'fuel', 'bike',
    'utensils', 'coffee', 'pizza', 'beer', 'wine', 'apple', 'salad', 'sandwich',
    'heart', 'activity', 'pill', 'stethoscope', 'dumbbell', 'gamepad', 'music',
    'film', 'tv', 'monitor', 'smartphone', 'laptop', 'headphones', 'camera', 'book',
    'graduation-cap', 'briefcase', 'building', 'users', 'baby', 'dog', 'cat', 'shirt',
    'scissors', 'sparkles', 'crown', 'star', 'phone', 'mail', 'file-text', 'zap',
    'sun', 'moon', 'cloud', 'umbrella', 'tree', 'flower', 'leaf', 'mountain', 'waves', 'anchor'
  ));
