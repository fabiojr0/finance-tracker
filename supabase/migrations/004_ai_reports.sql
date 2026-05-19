-- Histórico de relatórios gerados pela IA
-- Permite revisar análises anteriores com data de geração e período usado

CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  period_label TEXT,
  custom_prompt TEXT,
  report JSONB NOT NULL,
  summary JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS ai_reports_user_id_idx ON ai_reports(user_id);
CREATE INDEX IF NOT EXISTS ai_reports_created_at_idx ON ai_reports(created_at DESC);

ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai_reports" ON ai_reports
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own ai_reports" ON ai_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai_reports" ON ai_reports
  FOR DELETE USING (auth.uid() = user_id);
