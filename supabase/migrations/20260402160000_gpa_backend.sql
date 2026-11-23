-- GPA Gendong Adventure - Full Backend Migration
-- Tables: posts, settings, admin_users

-- ============================================================
-- 1. POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Umum',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_date ON public.posts(date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON public.posts(featured);

-- ============================================================
-- 2. SETTINGS TABLE (single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name TEXT DEFAULT 'GPA Gendong Adventure',
  tagline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  logo TEXT DEFAULT '/assets/images/app_logo.png',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  youtube TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  facebook TEXT DEFAULT '',
  about_text TEXT DEFAULT '',
  vision_text TEXT DEFAULT '',
  mission_text TEXT DEFAULT '',
  missions TEXT[] DEFAULT ARRAY[]::TEXT[],
  established TEXT DEFAULT '',
  location TEXT DEFAULT '',
  stats JSONB DEFAULT '{"members":"100+","expeditions":"50+","yearsActive":"9+","treesPlanted":"1000+"}'::JSONB,
  donation_info JSONB DEFAULT '{}'::JSONB,
  team JSONB DEFAULT '[]'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT settings_single_row CHECK (id = 1)
);

-- ============================================================
-- 3. ADMIN USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Administrator',
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);

-- ============================================================
-- 4. UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS settings_updated_at ON public.settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Posts: public read, no direct write (via API routes)
DROP POLICY IF EXISTS "posts_public_read" ON public.posts;
CREATE POLICY "posts_public_read" ON public.posts
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "posts_service_write" ON public.posts;
CREATE POLICY "posts_service_write" ON public.posts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Settings: public read, service write
DROP POLICY IF EXISTS "settings_public_read" ON public.settings;
CREATE POLICY "settings_public_read" ON public.settings
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "settings_service_write" ON public.settings;
CREATE POLICY "settings_service_write" ON public.settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Admin users: service only
DROP POLICY IF EXISTS "admin_users_service_only" ON public.admin_users;
CREATE POLICY "admin_users_service_only" ON public.admin_users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 6. SEED DATA
-- ============================================================
DO $$
BEGIN
  -- Seed settings
  INSERT INTO public.settings (
    id, site_name, tagline, description, logo, email, phone, address,
    instagram, youtube, whatsapp, facebook,
    about_text, vision_text, mission_text, missions, established, location,
    stats, donation_info, team
  ) VALUES (
    1,
    'GPA Gendong Adventure',
    'Bentuklah karakter hidup untuk menjadi lebih baik, jagalah alam untuk suatu kehidupan',
    'Komunitas pecinta alam berdiri sejak 2015 di Bengkulu.',
    '/assets/images/app_logo.png',
    'info@gpagendongadventure.or.id',
    '+62 812-xxxx-xxxx',
    'Bengkulu, Indonesia',
    'https://instagram.com/gpagendongadventure',
    'https://youtube.com/@gpagendongadventure',
    'https://wa.me/62812xxxxxxxx',
    'https://facebook.com/gpagendongadventure',
    'GPA (Gerakan Pecinta Alam) Gendong Adventure adalah komunitas pecinta alam yang berdiri pada 22 Agustus 2015 di Bengkulu, Indonesia.',
    'Menjadi organisasi mandiri dengan anggota berpikir luas dan bertanggung jawab terhadap lingkungan.',
    'Mengajak masyarakat menjaga lingkungan, meningkatkan solidaritas, melaksanakan kegiatan sosial, dan edukasi lingkungan.',
    ARRAY['Mengajak masyarakat menjaga lingkungan','Meningkatkan solidaritas','Melaksanakan kegiatan sosial','Edukasi lingkungan'],
    '22 Agustus 2015',
    'Bengkulu, Indonesia',
    '{"members":"100+","expeditions":"50+","yearsActive":"9+","treesPlanted":"1000+"}'::JSONB,
    jsonb_build_object(
      'title', 'Dukung kegiatan pelestarian lingkungan dan sosial kami',
      'description', 'Donasi Anda membantu kami menyelenggarakan lebih banyak kegiatan konservasi.',
      'bankAccounts', jsonb_build_array(
        jsonb_build_object('bank','BCA','accountNumber','1234567890','accountName','GPA Gendong Adventure','logo','BCA'),
        jsonb_build_object('bank','Mandiri','accountNumber','0987654321','accountName','GPA Gendong Adventure','logo','Mandiri'),
        jsonb_build_object('bank','BNI','accountNumber','1122334455','accountName','GPA Gendong Adventure','logo','BNI')
      ),
      'eWallets', jsonb_build_array(
        jsonb_build_object('name','GoPay','number','081234567890','logo','GoPay'),
        jsonb_build_object('name','OVO','number','081234567890','logo','OVO'),
        jsonb_build_object('name','Dana','number','081234567890','logo','Dana')
      )
    ),
    jsonb_build_array(
      jsonb_build_object('name','Pendiri GPA','role','Founder & Ketua Umum','image','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80','bio','Pendiri GPA Gendong Adventure sejak 22 Agustus 2015 di Bengkulu'),
      jsonb_build_object('name','Koordinator Lingkungan','role','Koordinator Lingkungan','image','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80','bio','Aktivis lingkungan dan pecinta alam, memimpin program konservasi mangrove'),
      jsonb_build_object('name','Koordinator Pendidikan','role','Koordinator Pendidikan','image','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80','bio','Bertanggung jawab atas program diksar dan pelatihan anggota baru'),
      jsonb_build_object('name','Koordinator Sosial','role','Koordinator Sosial','image','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80','bio','Penggerak kegiatan sosial dan pemberdayaan masyarakat Bengkulu')
    )
  ) ON CONFLICT (id) DO NOTHING;

  -- Seed admin user (password: admin123)
  INSERT INTO public.admin_users (username, password_hash, name, role)
  VALUES ('admin', crypt('admin123', gen_salt('bf', 10)), 'Administrator', 'admin')
  ON CONFLICT (username) DO NOTHING;

  -- Seed posts
  INSERT INTO public.posts (title, slug, category, date, images, description, content, featured)
  VALUES
    (
      'Penanaman Mangrove Pesisir Bengkulu',
      'penanaman-mangrove-pesisir-bengkulu',
      'Lingkungan',
      '2016-03-12',
      ARRAY['https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80','https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80','https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80'],
      'Kegiatan penanaman mangrove sebagai upaya pencegahan abrasi dan perlindungan pesisir Bengkulu.',
      'Sejak awal berdiri, GPA Gendong Adventure aktif dalam kegiatan penanaman mangrove bersama masyarakat pesisir. Kegiatan ini merupakan wujud nyata kepedulian kami terhadap lingkungan pesisir Bengkulu yang terus terancam abrasi.',
      true
    ),
    (
      'Penanaman 1000 Bibit Mangrove',
      'penanaman-1000-bibit-mangrove',
      'Lingkungan',
      '2018-07-22',
      ARRAY['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80','https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'],
      'Penanaman ribuan bibit mangrove sebagai bentuk kepedulian lingkungan pesisir Bengkulu.',
      'Dilakukan bersama relawan sebagai bentuk kepedulian lingkungan. Kegiatan penanaman 1000 bibit mangrove ini melibatkan anggota GPA Gendong Adventure bersama relawan dari berbagai komunitas di Bengkulu.',
      true
    ),
    (
      'Diksar Angkatan VIII',
      'diksar-angkatan-viii',
      'Pendidikan',
      '2025-02-10',
      ARRAY['https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80'],
      'Pelatihan dasar anggota baru GPA Gendong Adventure di Bukit Kandis, Bengkulu.',
      'Materi meliputi survival, navigasi, dan kepemimpinan. Diksar Angkatan VIII merupakan program wajib bagi anggota baru GPA Gendong Adventure.',
      false
    ),
    (
      'FGD Dampak Pertambangan',
      'fgd-dampak-pertambangan',
      'Sosial',
      '2025-09-07',
      ARRAY['https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&q=80','https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80'],
      'Diskusi bersama akademisi dan masyarakat membahas dampak pertambangan terhadap lingkungan.',
      'Membahas dampak pertambangan terhadap lingkungan. Forum Group Discussion ini menghadirkan akademisi, aktivis lingkungan, dan masyarakat terdampak.',
      false
    )
  ON CONFLICT (slug) DO NOTHING;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Seed data error: %', SQLERRM;
END $$;
