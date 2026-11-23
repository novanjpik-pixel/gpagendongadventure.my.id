-- GPA Gendong Adventure - Gallery Module Migration

-- ============================================================
-- 1. GALLERY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON public.gallery(sort_order);
CREATE INDEX IF NOT EXISTS idx_gallery_created_at ON public.gallery(created_at DESC);

-- ============================================================
-- 2. ENABLE RLS
-- ============================================================
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. RLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "public_can_read_gallery" ON public.gallery;
CREATE POLICY "public_can_read_gallery"
ON public.gallery
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "authenticated_manage_gallery" ON public.gallery;
CREATE POLICY "authenticated_manage_gallery"
ON public.gallery
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================
-- 4. STORAGE BUCKET FOR GALLERY IMAGES
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for gallery bucket
DROP POLICY IF EXISTS "gallery_public_read" ON storage.objects;
CREATE POLICY "gallery_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "gallery_authenticated_upload" ON storage.objects;
CREATE POLICY "gallery_authenticated_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "gallery_authenticated_delete" ON storage.objects;
CREATE POLICY "gallery_authenticated_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'gallery');
