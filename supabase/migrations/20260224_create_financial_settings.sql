-- Tabela de Configurações Financeiras do Usuário
CREATE TABLE public.financial_settings (
  user_id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  monthly_income_goal numeric DEFAULT 5000, -- Meta de salário
  fixed_costs numeric DEFAULT 1000, -- Custos fixos mensais
  tax_rate numeric DEFAULT 10, -- Imposto (ex: 10% DAS/Simples)
  work_days_week integer DEFAULT 5,
  work_hours_day integer DEFAULT 6,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.financial_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can view own financial settings" 
ON public.financial_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own financial settings" 
ON public.financial_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial settings" 
ON public.financial_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar o updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_financial_settings_updated_at
BEFORE UPDATE ON public.financial_settings
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
