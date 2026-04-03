
CREATE TABLE public.implementation_checklist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  task_key text NOT NULL,
  fase integer NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_key)
);

ALTER TABLE public.implementation_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklist" ON public.implementation_checklist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklist" ON public.implementation_checklist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklist" ON public.implementation_checklist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklist" ON public.implementation_checklist FOR DELETE USING (auth.uid() = user_id);
