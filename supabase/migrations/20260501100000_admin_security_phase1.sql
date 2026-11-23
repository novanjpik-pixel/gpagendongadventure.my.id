-- GPA Gendong Adventure - Phase 1: Secure admin login & accounts
-- Idempotent: safe to run multiple times.
-- Includes base content tables (IF NOT EXISTS) so a fresh database works too.

-- ============================================================
-- 1. BASE CONTENT TABLES (no-op if they already exist)
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
-- 2. ADMIN USERS (secure: bcrypt hash, lockout fields)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Administrator',
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);

-- ============================================================
-- 3. ADMIN SESSIONS (server-side, token stored as SHA-256 hash)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  csrf_token TEXT NOT NULL,
  remember BOOLEAN NOT NULL DEFAULT false,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON public.admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON public.admin_sessions(expires_at);

-- ============================================================
-- 4. LOGIN ATTEMPTS (rate limiting: max 6 failures / 10 min)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  ip TEXT NOT NULL DEFAULT '',
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier ON public.login_attempts(identifier, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip, created_at DESC);

-- ============================================================
-- 5. FUNCTIONS
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

-- The old password-check helper is no longer used; remove it so it cannot be abused.
DROP FUNCTION IF EXISTS public.verify_admin_password(TEXT, TEXT);

-- ============================================================
-- 6. ENABLE RLS ON EVERY TABLE
-- ============================================================
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. RLS POLICIES
-- Public: SELECT only on public content. Writes: service_role only
-- (the Next.js API verifies the admin session before using it).
-- Security tables: service_role only (anon/authenticated denied).
-- ============================================================

-- posts
DROP POLICY IF EXISTS "posts_public_read" ON public.posts;
CREATE POLICY "posts_public_read" ON public.posts
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "posts_service_write" ON public.posts;
CREATE POLICY "posts_service_write" ON public.posts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- settings
DROP POLICY IF EXISTS "settings_public_read" ON public.settings;
CREATE POLICY "settings_public_read" ON public.settings
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "settings_service_write" ON public.settings;
CREATE POLICY "settings_service_write" ON public.settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- gallery (replace the overly broad "authenticated" write policy)
DROP POLICY IF EXISTS "public_can_read_gallery" ON public.gallery;
CREATE POLICY "public_can_read_gallery" ON public.gallery
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "authenticated_manage_gallery" ON public.gallery;

DROP POLICY IF EXISTS "gallery_service_write" ON public.gallery;
CREATE POLICY "gallery_service_write" ON public.gallery
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- admin_users
DROP POLICY IF EXISTS "admin_users_service_only" ON public.admin_users;
CREATE POLICY "admin_users_service_only" ON public.admin_users
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- admin_sessions
DROP POLICY IF EXISTS "admin_sessions_service_only" ON public.admin_sessions;
CREATE POLICY "admin_sessions_service_only" ON public.admin_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- login_attempts
DROP POLICY IF EXISTS "login_attempts_service_only" ON public.login_attempts;
CREATE POLICY "login_attempts_service_only" ON public.login_attempts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- 8. TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS settings_updated_at ON public.settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS admin_users_updated_at ON public.admin_users;
CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 9. REMOVE INSECURE DEFAULT ACCOUNT (admin / admin123)
-- The first admin is now created once via /admin/setup.
-- ============================================================
DO $$
BEGIN
  DELETE FROM public.admin_users
  WHERE username = 'admin'
    AND password_hash = crypt('admin123', password_hash);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Default admin cleanup skipped: %', SQLERRM;
END $$;

-- ============================================================
-- 10. STORAGE BUCKETS + POLICIES
-- Public read; uploads/deletes only through server (service_role).
-- Anonymous/authenticated direct uploads are removed.
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery',
  'gallery',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "images_public_read" ON storage.objects;
CREATE POLICY "images_public_read" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'images');

DROP POLICY IF EXISTS "images_anon_upload" ON storage.objects;

DROP POLICY IF EXISTS "images_service_upload" ON storage.objects;
CREATE POLICY "images_service_upload" ON storage.objects
  FOR INSERT TO service_role WITH CHECK (bucket_id = 'images');

DROP POLICY IF EXISTS "images_service_delete" ON storage.objects;
CREATE POLICY "images_service_delete" ON storage.objects
  FOR DELETE TO service_role USING (bucket_id = 'images');

DROP POLICY IF EXISTS "gallery_public_read" ON storage.objects;
CREATE POLICY "gallery_public_read" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "gallery_authenticated_upload" ON storage.objects;
DROP POLICY IF EXISTS "gallery_authenticated_delete" ON storage.objects;

DROP POLICY IF EXISTS "gallery_service_upload" ON storage.objects;
CREATE POLICY "gallery_service_upload" ON storage.objects
  FOR INSERT TO service_role WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "gallery_service_delete" ON storage.objects;
CREATE POLICY "gallery_service_delete" ON storage.objects
  FOR DELETE TO service_role USING (bucket_id = 'gallery');

-- ============================================================
-- 11. SEED CONTENT (only when empty) so the public site keeps working
-- ============================================================
DO $$
BEGIN
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
