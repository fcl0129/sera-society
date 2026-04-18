-- 20260418113000_profiles_role_sync.sql
-- Ensure app profiles support explicit role-based routing,
-- but only if the profiles table exists.

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS email TEXT;

    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS role TEXT;

    UPDATE public.profiles
    SET role = 'guest'
    WHERE role IS NULL OR btrim(role) = '';

    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('host_admin', 'bartender', 'guest'));
  END IF;
END
$$;

COMMIT;
