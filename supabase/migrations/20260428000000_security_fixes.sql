-- ═══════════════════════════════════════════════
-- 1. Storage: bucket assets → privado
--    e políticas filtram por owner (auth.uid())
-- ═══════════════════════════════════════════════
UPDATE storage.buckets SET public = false WHERE id = 'assets';

-- Recriar políticas de UPDATE/DELETE filtrando pelo dono do arquivo
DROP POLICY IF EXISTS "Users can update their own assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own assets" ON storage.objects;

CREATE POLICY "Users can update their own assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Leitura: apenas o próprio dono (bucket privado)
DROP POLICY IF EXISTS "Public assets are viewable by everyone" ON storage.objects;
CREATE POLICY "Users can view their own assets"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assets'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ═══════════════════════════════════════════════
-- 2. user_credits: remover acesso de escrita direta
--    para usuários autenticados (apenas service role)
-- ═══════════════════════════════════════════════
REVOKE INSERT, UPDATE, DELETE ON public.user_credits FROM authenticated;

-- ═══════════════════════════════════════════════
-- 3. has_role / has_premium_access:
--    revogar execução pública, restringir ao próprio usuário
-- ═══════════════════════════════════════════════
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_premium_access(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_premium_access(uuid) TO authenticated;

-- ═══════════════════════════════════════════════
-- 4. financial_goals: garantir política DELETE
-- ═══════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'financial_goals' AND policyname = 'Users can delete their own financial goals'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can delete their own financial goals"
      ON public.financial_goals FOR DELETE
      USING (auth.uid() = user_id)
    $policy$;
  END IF;
END $$;
