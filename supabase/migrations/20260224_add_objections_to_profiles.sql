-- Adicionar coluna de objeções na tabela de perfis
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS objecoes text;

-- Comentário para clareza
COMMENT ON COLUMN public.profiles.objecoes IS 'Objeções comuns do público-alvo geradas pela IA ou inseridas pelo usuário.';
