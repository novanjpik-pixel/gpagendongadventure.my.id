-- GPA Gendong Adventure - Phase 2: Members (Anggota), roles, page access, activity log
-- Idempotent: safe to run multiple times.

-- ============================================================
-- 1. ADMIN USERS: per-page access (empty array = all pages)
-- ============================================================
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS allowed_pages TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Normalise legacy role values to the three supported roles
UPDATE public.admin_users
SET role = 'contributor'
WHERE role NOT IN ('admin', 'editor', 'contributor');

-- ============================================================
-- 2. ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  object_type TEXT NOT NULL DEFAULT '',
  object_label TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- ============================================================
-- 3. RLS (service_role only: anonymous access must fail)
-- ============================================================
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_logs_service_only" ON public.activity_logs;
CREATE POLICY "activity_logs_service_only" ON public.activity_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
