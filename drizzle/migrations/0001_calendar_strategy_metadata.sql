-- Strategic context makes every calendar item traceable to a goal and campaign.
ALTER TABLE public.calendar_items
  ADD COLUMN IF NOT EXISTS objetivo TEXT,
  ADD COLUMN IF NOT EXISTS etapa_funil TEXT,
  ADD COLUMN IF NOT EXISTS campanha TEXT,
  ADD COLUMN IF NOT EXISTS canal TEXT NOT NULL DEFAULT 'instagram',
  ADD COLUMN IF NOT EXISTS produto TEXT,
  ADD COLUMN IF NOT EXISTS fonte TEXT;

CREATE INDEX IF NOT EXISTS idx_calendar_items_strategy
  ON public.calendar_items (user_id, objetivo, etapa_funil, campanha);
