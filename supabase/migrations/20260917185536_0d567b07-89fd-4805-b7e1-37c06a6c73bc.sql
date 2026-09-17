
DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
           FROM pg_policies WHERE schemaname='public'
  LOOP
    IF p.cmd = 'UPDATE' AND p.with_check IS NULL AND p.qual IS NOT NULL THEN
      EXECUTE format('ALTER POLICY %I ON public.%I WITH CHECK (%s)', p.policyname, p.tablename, p.qual);
    END IF;

    IF p.roles = '{public}'::name[]
       AND NOT (p.tablename = 'subscription_plans' AND p.policyname = 'Anyone can view active plans') THEN
      EXECUTE format('ALTER POLICY %I ON public.%I TO authenticated', p.policyname, p.tablename);
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
           WHERE n.nspname='public' AND c.relkind='r'
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t.relname);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t.relname);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t.relname);
  END LOOP;
END $$;

GRANT SELECT ON public.subscription_plans TO anon;
REVOKE INSERT, UPDATE, DELETE ON public.research_items FROM authenticated;
