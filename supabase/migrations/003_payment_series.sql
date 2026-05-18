-- Agrupamento de pagamentos recorrentes em séries
-- Adiciona series_id para identificar instâncias da mesma transação recorrente

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS series_id UUID;

CREATE INDEX IF NOT EXISTS transactions_series_id_idx
  ON transactions(series_id);
