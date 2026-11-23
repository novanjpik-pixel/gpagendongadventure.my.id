-- Perpustakaan Riset (/riset): daftar publikasi yang dibaca lewat pembaca halaman-demi-halaman.
CREATE TABLE IF NOT EXISTS public.riset_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jenis TEXT NOT NULL DEFAULT 'Laporan Riset',
  judul TEXT NOT NULL,
  ringkasan TEXT NOT NULL DEFAULT '',
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  sampul_url TEXT NOT NULL DEFAULT '',
  file_url TEXT NOT NULL,              -- PDF (/riset/x.pdf, URL Supabase) atau tautan Google Drive
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.riset_publications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "riset_service_only" ON public.riset_publications;
CREATE POLICY "riset_service_only" ON public.riset_publications FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO public.riset_publications (jenis, judul, ringkasan, tanggal, sampul_url, file_url, sort_order)
SELECT 'Dokumen Kajian Analisis',
       'Menilik Narasi Bengkulu Provinsi Konservasi',
       'Analisis kondisi kawasan hutan, kerusakan ekosistem hutan dan pesisir Bengkulu, serta pemenuhan perwujudan provinsi konservasi: 712,81 ha daratan terkikis (2002–2024), 190,24 km garis pantai terabrasi, 9.167,4 ha deforestasi (2025), dan 1.885 unit terancam rusak/roboh. Disusun oleh GPA Gendong Adventure dan DPC GMNI Bengkulu.',
       DATE '2026-08-09', '/riset/sampul-kajian-bengkulu-provinsi-konservasi.jpg', '/riset/kajian-bengkulu-provinsi-konservasi.pdf', 1
WHERE NOT EXISTS (SELECT 1 FROM public.riset_publications);
