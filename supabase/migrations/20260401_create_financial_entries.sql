-- Migration: Create revenue and expense tracking tables
-- Objetivo: Permitir registro granular de receitas e despesas para DRE real

BEGIN;

-- ══ RECEITAS ══
CREATE TABLE IF NOT EXISTS public.revenue_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  valor DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('consulta', 'retorno', 'infoproduto', 'mentoria', 'desafio', 'grupo', 'parceria', 'outro')),
  produto_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  paciente_nome TEXT,
  descricao TEXT,
  recorrente BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ══ DESPESAS ══
CREATE TABLE IF NOT EXISTS public.expense_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  valor DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('aluguel', 'software', 'trafego', 'funcionario', 'material', 'imposto', 'alimentacao', 'transporte', 'educacao', 'outro')),
  descricao TEXT,
  recorrente BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ══ CAMPOS EXTRAS EM PRODUCTS ══
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS custo_entrega DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS horas_por_unidade DECIMAL(5,2) DEFAULT 1;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS recorrencia TEXT DEFAULT 'avulso' CHECK (recorrencia IN ('avulso', 'mensal', 'trimestral', 'semestral', 'anual'));
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS capacidade_max INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS bonus TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS promessa TEXT;

-- ══ RLS ══
ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_entries ENABLE ROW LEVEL SECURITY;

-- Revenue policies
CREATE POLICY "Users can view own revenue" ON public.revenue_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own revenue" ON public.revenue_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revenue" ON public.revenue_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own revenue" ON public.revenue_entries FOR DELETE USING (auth.uid() = user_id);

-- Expense policies
CREATE POLICY "Users can view own expenses" ON public.expense_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expense_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expense_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expense_entries FOR DELETE USING (auth.uid() = user_id);

-- ══ INDEXES ══
CREATE INDEX IF NOT EXISTS idx_revenue_user_date ON public.revenue_entries(user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_expense_user_date ON public.expense_entries(user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_categoria ON public.revenue_entries(user_id, categoria);
CREATE INDEX IF NOT EXISTS idx_expense_categoria ON public.expense_entries(user_id, categoria);

COMMIT;
