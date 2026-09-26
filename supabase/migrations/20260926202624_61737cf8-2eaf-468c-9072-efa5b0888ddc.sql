CREATE TABLE public.quick_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  conteudo text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quick_notes TO authenticated;
GRANT ALL ON public.quick_notes TO service_role;
ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notes" ON public.quick_notes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_quick_notes_updated_at BEFORE UPDATE ON public.quick_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();