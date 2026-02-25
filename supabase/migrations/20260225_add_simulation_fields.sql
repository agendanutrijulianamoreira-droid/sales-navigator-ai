-- Adicionar campos de simulação de preços à tabela de produtos
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS hours_spent numeric DEFAULT 1,
ADD COLUMN IF NOT EXISTS material_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS desired_margin numeric DEFAULT 30;

-- Comentários para documentação
COMMENT ON COLUMN public.products.hours_spent IS 'Horas de dedicação estimadas para o produto/serviço';
COMMENT ON COLUMN public.products.material_cost IS 'Custos extras diretos (plataformas, materiais, etc)';
COMMENT ON COLUMN public.products.desired_margin IS 'Margem de lucro desejada em porcentagem';
