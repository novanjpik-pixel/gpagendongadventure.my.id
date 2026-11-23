-- GPA Gendong Adventure - Fix: admin_users column was named "admin_users" instead of "username"
-- Idempotent: safe to run multiple times.

DO $$
BEGIN
  -- Case 1: wrongly named column exists and "username" does not -> rename it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'admin_users'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'username'
  ) THEN
    ALTER TABLE public.admin_users RENAME COLUMN admin_users TO username;
  END IF;

  -- Case 2: neither column exists -> add username
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'admin_users' AND column_name = 'username'
  ) THEN
    ALTER TABLE public.admin_users ADD COLUMN username TEXT;
    UPDATE public.admin_users SET username = 'user_' || substr(id::text, 1, 8) WHERE username IS NULL;
    ALTER TABLE public.admin_users ALTER COLUMN username SET NOT NULL;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);

-- Make sure every other column the app expects exists
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS allowed_pages TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Ask PostgREST to refresh its schema cache so the renamed column is visible immediately
NOTIFY pgrst, 'reload schema';
