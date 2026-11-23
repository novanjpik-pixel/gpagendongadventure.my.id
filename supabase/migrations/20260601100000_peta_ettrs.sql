-- Peta ETTRS (Explore The Tropical Rainforest Sumatra): lapisan GeoJSON + pengaturan peta.
-- Idempotent: aman dijalankan berulang.

CREATE TABLE IF NOT EXISTS public.peta_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  grup TEXT NOT NULL DEFAULT 'Temuan Pemantauan',
  warna TEXT NOT NULL DEFAULT '#2d6a4f',
  gaya TEXT NOT NULL DEFAULT 'isi' CHECK (gaya IN ('isi','arsir','garis')),
  opacity NUMERIC NOT NULL DEFAULT 0.45,
  garis NUMERIC NOT NULL DEFAULT 1.6,
  ukuran NUMERIC NOT NULL DEFAULT 6,
  ket TEXT NOT NULL DEFAULT '',
  sumber TEXT NOT NULL DEFAULT '',
  aktif BOOLEAN NOT NULL DEFAULT TRUE,   -- tampil di peta publik
  awal BOOLEAN NOT NULL DEFAULT TRUE,    -- menyala saat peta dibuka
  sort_order INTEGER NOT NULL DEFAULT 0,
  tipe TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  n INTEGER NOT NULL DEFAULT 0,
  bbox NUMERIC[],
  title_key TEXT NOT NULL DEFAULT '',
  warna_oleh TEXT NOT NULL DEFAULT '',
  geojson JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_peta_layers_order ON public.peta_layers(sort_order, created_at);

CREATE TABLE IF NOT EXISTS public.peta_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  judul TEXT NOT NULL DEFAULT 'Peta *ETTRS* Sumatra',
  deskripsi TEXT NOT NULL DEFAULT 'Explore The Tropical Rainforest Sumatra',
  lon NUMERIC NOT NULL DEFAULT 102.3,
  lat NUMERIC NOT NULL DEFAULT -3.6,
  zoom NUMERIC NOT NULL DEFAULT 6.4,
  metodologi TEXT NOT NULL DEFAULT '',
  f_sentinel BOOLEAN NOT NULL DEFAULT TRUE,
  f_cloudless BOOLEAN NOT NULL DEFAULT TRUE,
  f_tutupan BOOLEAN NOT NULL DEFAULT TRUE,
  f_gfw BOOLEAN NOT NULL DEFAULT TRUE,
  f_udara BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO public.peta_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Hanya service_role (server Next.js) yang boleh membaca/menulis.
ALTER TABLE public.peta_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peta_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "peta_layers_service_only" ON public.peta_layers;
CREATE POLICY "peta_layers_service_only" ON public.peta_layers FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "peta_settings_service_only" ON public.peta_settings;
CREATE POLICY "peta_settings_service_only" ON public.peta_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
