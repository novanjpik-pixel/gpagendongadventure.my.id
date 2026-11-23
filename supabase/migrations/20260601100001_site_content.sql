-- Konten halaman yang bisa diubah dari dashboard admin (visi, misi, tujuan, profil, motto, struktur).
-- Bila baris tidak ada, website memakai isi bawaan di src/data/site.ts.
CREATE TABLE IF NOT EXISTS public.site_content (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "site_content_service_only" ON public.site_content;
CREATE POLICY "site_content_service_only" ON public.site_content FOR ALL TO service_role USING (true) WITH CHECK (true);
