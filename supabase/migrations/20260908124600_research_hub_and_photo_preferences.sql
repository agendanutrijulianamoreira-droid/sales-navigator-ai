-- Research Hub: cache editorial sources outside the browser and expose read-only
-- results to authenticated users. Writes are performed only by Edge Functions
-- with the service role.
CREATE TABLE public.research_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('article', 'news')),
  query_key TEXT NOT NULL,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  keywords TEXT[] NOT NULL DEFAULT '{}',
  source_metadata JSONB NOT NULL DEFAULT '{}',
  CONSTRAINT research_items_source_unique UNIQUE (type, query_key, external_id)
);

CREATE INDEX research_items_query_type_published_idx
  ON public.research_items (query_key, type, published_at DESC);
CREATE INDEX research_items_fetched_at_idx
  ON public.research_items (fetched_at DESC);

ALTER TABLE public.research_items ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.research_items FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.research_items FROM authenticated;
GRANT SELECT ON TABLE public.research_items TO authenticated;
GRANT ALL ON TABLE public.research_items TO service_role;

CREATE POLICY "Authenticated users can read research sources"
  ON public.research_items
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) IS NOT NULL);

-- Persistent visual direction for the AI photo studio. The reference stores a
-- private Storage object path, never a public URL.
ALTER TABLE public.profiles
  ADD COLUMN photo_scenario_reference TEXT,
  ADD COLUMN clothing_style_description TEXT;

COMMENT ON COLUMN public.profiles.photo_scenario_reference IS
  'Private assets bucket object path used as the environment reference for AI photos.';
COMMENT ON COLUMN public.profiles.clothing_style_description IS
  'User-defined wardrobe direction reused by the AI photo studio.';

-- Preserve row ownership when the new profile fields are edited from the app.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- A twice-daily refresh can be enabled after deployment by storing the project
-- URL and legacy service-role JWT in Vault. Keeping credentials in Vault avoids
-- committing them to migrations or client code.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DO $schedule$
DECLARE
  has_project_url BOOLEAN;
  has_service_key BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets WHERE name = 'project_url'
  ) INTO has_project_url;
  SELECT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets WHERE name = 'service_role_key'
  ) INTO has_service_key;

  IF has_project_url AND has_service_key AND NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'refresh-research-hub-twice-daily'
  ) THEN
    PERFORM cron.schedule(
      'refresh-research-hub-twice-daily',
      '15 8,20 * * *',
      $job$
        SELECT net.http_post(
          url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url')
            || '/functions/v1/fetch-research-items',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key'),
            'apikey', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
          ),
          body := '{"niche":"nutricao","subNiche":"saude da mulher","forceRefresh":true}'::jsonb
        );
      $job$
    );
  END IF;
END
$schedule$;
