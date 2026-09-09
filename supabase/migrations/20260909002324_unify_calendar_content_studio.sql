BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT;

ALTER TABLE public.calendar_items
  ADD COLUMN IF NOT EXISTS conteudo_corpo TEXT,
  ADD COLUMN IF NOT EXISTS cabecalho TEXT,
  ADD COLUMN IF NOT EXISTS rodape TEXT,
  ADD COLUMN IF NOT EXISTS estrategia_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS cover_mode TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS slide_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.calendar_items
  DROP CONSTRAINT IF EXISTS calendar_items_status_check;

ALTER TABLE public.calendar_items
  ADD CONSTRAINT calendar_items_status_check
  CHECK (status IN ('planejado', 'rascunho', 'pronto', 'em_aprovacao', 'aprovado', 'agendado', 'publicado'));

ALTER TABLE public.calendar_items
  DROP CONSTRAINT IF EXISTS calendar_items_cover_mode_check;

ALTER TABLE public.calendar_items
  ADD CONSTRAINT calendar_items_cover_mode_check
  CHECK (cover_mode IS NULL OR cover_mode IN ('ai', 'upload'));

DROP TRIGGER IF EXISTS update_calendar_items_updated_at ON public.calendar_items;
CREATE TRIGGER update_calendar_items_updated_at
  BEFORE UPDATE ON public.calendar_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS calendar_items_user_id_idx
  ON public.calendar_items (user_id);

DROP POLICY IF EXISTS "Users can view their own calendar_items" ON public.calendar_items;
DROP POLICY IF EXISTS "Users can insert their own calendar_items" ON public.calendar_items;
DROP POLICY IF EXISTS "Users can update their own calendar_items" ON public.calendar_items;
DROP POLICY IF EXISTS "Users can delete their own calendar_items" ON public.calendar_items;

REVOKE ALL ON TABLE public.calendar_items FROM anon;
REVOKE ALL ON TABLE public.calendar_items FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.calendar_items TO authenticated;

CREATE POLICY "Users can view their own calendar_items"
  ON public.calendar_items FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own calendar_items"
  ON public.calendar_items FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own calendar_items"
  ON public.calendar_items FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own calendar_items"
  ON public.calendar_items FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

COMMENT ON COLUMN public.profiles.instagram_handle IS
  'Instagram username without @, used in content footers.';
COMMENT ON COLUMN public.calendar_items.estrategia_snapshot IS
  'Immutable strategy context used by AI when the draft was generated.';
COMMENT ON COLUMN public.calendar_items.cover_image_url IS
  'Remote URL or assets:<private storage path> for the post cover.';

COMMIT;
