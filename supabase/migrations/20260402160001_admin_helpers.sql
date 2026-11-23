-- Helper function to verify admin password
CREATE OR REPLACE FUNCTION public.verify_admin_password(
  input_password TEXT,
  stored_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT stored_hash = crypt(input_password, stored_hash);
$$;

-- Storage bucket for images (run via Supabase dashboard or API)
-- This migration creates the RLS policies for the images bucket
-- The bucket itself must be created via Supabase Dashboard > Storage

-- Allow public read on images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "images_public_read" ON storage.objects;
CREATE POLICY "images_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'images');

DROP POLICY IF EXISTS "images_service_upload" ON storage.objects;
CREATE POLICY "images_service_upload"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "images_anon_upload" ON storage.objects;
CREATE POLICY "images_anon_upload"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "images_service_delete" ON storage.objects;
CREATE POLICY "images_service_delete"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'images');
