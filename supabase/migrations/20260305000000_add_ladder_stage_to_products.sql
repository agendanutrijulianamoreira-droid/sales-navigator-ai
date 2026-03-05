-- Migration: Add ladder_stage to products
-- Descrição: Separa o formato do produto de sua função na escada de valor.

BEGIN;

-- 1. Adiciona a coluna com valor padrão 'core'
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS ladder_stage TEXT NOT NULL DEFAULT 'core';

-- 2. Adiciona restrição de valores permitidos
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_ladder_stage_check;

ALTER TABLE public.products 
ADD CONSTRAINT products_ladder_stage_check 
CHECK (ladder_stage IN ('isca', 'entrada', 'core', 'premium'));

-- 3. Backfill inteligente baseado no tipo de produto existente
UPDATE public.products SET ladder_stage = 'isca' WHERE tipo_produto IN ('ebook');
UPDATE public.products SET ladder_stage = 'entrada' WHERE tipo_produto IN ('desafio', 'grupo');
UPDATE public.products SET ladder_stage = 'core' WHERE tipo_produto IN ('consultoria', 'curso', 'outro');
UPDATE public.products SET ladder_stage = 'premium' WHERE tipo_produto IN ('mentoria');

COMMIT;
