
CREATE TABLE public.revenue_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data DATE NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL DEFAULT 'outro',
  produto_id UUID NULL,
  paciente_nome TEXT NULL,
  descricao TEXT NULL,
  recorrente BOOLEAN NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own revenue_entries" ON public.revenue_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own revenue_entries" ON public.revenue_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revenue_entries" ON public.revenue_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own revenue_entries" ON public.revenue_entries FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.expense_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data DATE NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL DEFAULT 'outro',
  descricao TEXT NULL,
  recorrente BOOLEAN NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expense_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expense_entries" ON public.expense_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expense_entries" ON public.expense_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expense_entries" ON public.expense_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expense_entries" ON public.expense_entries FOR DELETE USING (auth.uid() = user_id);
