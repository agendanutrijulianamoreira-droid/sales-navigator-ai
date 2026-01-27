-- Add brand kit fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS brand_primary_color text DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS brand_secondary_color text DEFAULT '#ec4899',
ADD COLUMN IF NOT EXISTS brand_neutral_color text DEFAULT '#64748b',
ADD COLUMN IF NOT EXISTS brand_font_title text DEFAULT 'inter',
ADD COLUMN IF NOT EXISTS brand_font_body text DEFAULT 'inter',
ADD COLUMN IF NOT EXISTS brand_logo_url text,
ADD COLUMN IF NOT EXISTS brand_watermark_url text,
ADD COLUMN IF NOT EXISTS brand_style text DEFAULT 'minimal',
ADD COLUMN IF NOT EXISTS brand_locked boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.brand_style IS 'Visual style preset: minimal, clinical, premium, bold, warm';
COMMENT ON COLUMN public.profiles.brand_locked IS 'When true, all generated designs must use brand kit settings';