
ALTER TABLE public.calendar_items
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS conteudo_corpo text,
  ADD COLUMN IF NOT EXISTS cabecalho text,
  ADD COLUMN IF NOT EXISTS rodape text,
  ADD COLUMN IF NOT EXISTS estrategia_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS cover_mode text,
  ADD COLUMN IF NOT EXISTS cover_image_url text,
  ADD COLUMN IF NOT EXISTS slide_images jsonb NOT NULL DEFAULT '[]'::jsonb;

DROP TRIGGER IF EXISTS update_calendar_items_updated_at ON public.calendar_items;
CREATE TRIGGER update_calendar_items_updated_at
BEFORE UPDATE ON public.calendar_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS instagram_handle text;
