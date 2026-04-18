-- Ensure app profiles support explicit role-based routing

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (lower(email));

UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id
  AND (p.email IS NULL OR p.email <> u.email);


INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'full_name', split_part(COALESCE(u.email, ''), '@', 1), 'Sera Member'),
  CASE
    WHEN u.raw_user_meta_data ->> 'role' IN ('host_admin', 'bartender', 'guest')
      THEN u.raw_user_meta_data ->> 'role'
    WHEN u.raw_app_meta_data ->> 'role' IN ('host_admin', 'bartender', 'guest')
      THEN u.raw_app_meta_data ->> 'role'
    ELSE 'guest'
  END
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_role TEXT;
BEGIN
  resolved_role := CASE
    WHEN NEW.raw_user_meta_data ->> 'role' IN ('host_admin', 'bartender', 'guest')
      THEN NEW.raw_user_meta_data ->> 'role'
    WHEN NEW.raw_app_meta_data ->> 'role' IN ('host_admin', 'bartender', 'guest')
      THEN NEW.raw_app_meta_data ->> 'role'
    ELSE 'guest'
  END;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(COALESCE(NEW.email, ''), '@', 1), 'Sera Member'),
    resolved_role
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
        role = COALESCE(public.profiles.role, EXCLUDED.role),
        updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_from_auth_user ON auth.users;
CREATE TRIGGER trg_sync_profile_from_auth_user
AFTER INSERT OR UPDATE OF email, raw_user_meta_data, raw_app_meta_data ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_from_auth_user();

CREATE OR REPLACE FUNCTION public.promote_profile_to_host_admin(target_user_id UUID)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  acting_role TEXT;
  updated_profile public.profiles;
BEGIN
  acting_role := auth.jwt() -> 'app_metadata' ->> 'role';

  IF auth.role() <> 'service_role' AND acting_role <> 'master' THEN
    RAISE EXCEPTION 'Only master or service role can promote users';
  END IF;

  UPDATE public.profiles
  SET role = 'host_admin',
      updated_at = now()
  WHERE id = target_user_id
  RETURNING * INTO updated_profile;

  IF updated_profile.id IS NULL THEN
    RAISE EXCEPTION 'Profile not found for user %', target_user_id;
  END IF;

  RETURN updated_profile;
END;
$$;

REVOKE ALL ON FUNCTION public.promote_profile_to_host_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_profile_to_host_admin(UUID) TO authenticated, service_role;
