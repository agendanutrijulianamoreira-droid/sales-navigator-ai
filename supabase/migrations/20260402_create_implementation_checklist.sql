-- Migration: Create implementation GPS tracking
-- Objetivo: Rastrear o progresso da nutricionista nas 4 fases da metodologia

BEGIN;

CREATE TABLE IF NOT EXISTS public.implementation_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_key TEXT NOT NULL,
  fase INTEGER NOT NULL CHECK (fase BETWEEN 1 AND 4),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_key)
);

ALTER TABLE public.implementation_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist" ON public.implementation_checklist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklist" ON public.implementation_checklist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklist" ON public.implementation_checklist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklist" ON public.implementation_checklist FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_checklist_user ON public.implementation_checklist(user_id);

COMMIT;
