ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS titulo_profissional TEXT,
  ADD COLUMN IF NOT EXISTS registro_profissional TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS intensidade_tom TEXT NOT NULL DEFAULT 'equilibrado',
  ADD COLUMN IF NOT EXISTS termos_proibidos TEXT;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_intensidade_tom_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_intensidade_tom_check
  CHECK (intensidade_tom IN ('clinico', 'equilibrado', 'agressivo'));

COMMENT ON COLUMN public.profiles.titulo_profissional IS 'Título exibido em bios/assinaturas: Dra., Dr., Nutricionista ou vazio';
COMMENT ON COLUMN public.profiles.registro_profissional IS 'Registro profissional (ex: CRN-9 12345)';
COMMENT ON COLUMN public.profiles.intensidade_tom IS 'Intensidade da linguagem de IA: clinico, equilibrado, agressivo';
COMMENT ON COLUMN public.profiles.termos_proibidos IS 'Lista de palavras/técnicas que a IA nunca deve usar';