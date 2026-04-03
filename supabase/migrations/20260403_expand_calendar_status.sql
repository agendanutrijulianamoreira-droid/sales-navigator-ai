-- Migration: Expand calendar_items status for production pipeline
BEGIN;

ALTER TABLE public.calendar_items DROP CONSTRAINT IF EXISTS calendar_items_status_check;
ALTER TABLE public.calendar_items ADD CONSTRAINT calendar_items_status_check
  CHECK (status IN ('planejado', 'rascunho', 'pronto', 'agendado', 'publicado'));

-- Backfill: 'criado' → 'pronto' (old value → new equivalent)
UPDATE public.calendar_items SET status = 'pronto' WHERE status = 'criado';

COMMIT;
