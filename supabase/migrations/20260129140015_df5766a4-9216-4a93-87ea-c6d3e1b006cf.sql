-- Create assets storage bucket for user photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true);

-- Policy: Users can upload their own files
CREATE POLICY "Users can upload their own assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assets' 
  AND auth.uid() IS NOT NULL
);

-- Policy: Users can view all public assets
CREATE POLICY "Public assets are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Policy: Users can update their own assets
CREATE POLICY "Users can update their own assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'assets' 
  AND auth.uid() IS NOT NULL
);

-- Policy: Users can delete their own assets
CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'assets' 
  AND auth.uid() IS NOT NULL
);