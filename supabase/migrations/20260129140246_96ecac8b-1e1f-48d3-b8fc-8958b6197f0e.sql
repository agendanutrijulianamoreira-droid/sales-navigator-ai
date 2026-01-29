-- Create assets table for brand photos and images
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL,
  subtipo TEXT,
  url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own assets"
ON public.assets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assets"
ON public.assets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets"
ON public.assets FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets"
ON public.assets FOR DELETE
USING (auth.uid() = user_id);