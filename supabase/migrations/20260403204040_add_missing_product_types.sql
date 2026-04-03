-- Migration: Adiciona novos tipos de produtos permitidos na coluna tipo_produto
-- Descrição: Inclui 'teste_genetico', 'acompanhamento', 'avaliacao' e 'mentoria_vip' na restrição de verificação.

BEGIN;

-- 1. Remover a restrição antiga (o nome padrão geralmente é 'products_tipo_produto_check')
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_tipo_produto_check;

-- 2. Adicionar a nova restrição com a lista expandida
ALTER TABLE public.products 
ADD CONSTRAINT products_tipo_produto_check 
CHECK (tipo_produto IN (
  'ebook', 
  'curso', 
  'mentoria', 
  'consultoria', 
  'grupo', 
  'desafio', 
  'outro',
  'teste_genetico',
  'acompanhamento',
  'avaliacao',
  'mentoria_vip'
));

COMMIT;
