-- Superuser-controlled user tier entitlements + enforcement on events

CREATE TABLE IF NOT EXISTS public.user_tier_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT,
  max_tier TEXT NOT NULL CHECK (max_tier IN ('essential', 'social', 'host', 'occasions')),
  assigned_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_tier_access_identity_required CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_tier_access_user_id_unique
  ON public.user_tier_access(user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_tier_access_email_unique
  ON public.user_tier_access(lower(email))
  WHERE email IS NOT NULL;

ALTER TABLE public.user_tier_access ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Master can manage user tier access"
    ON public.user_tier_access FOR ALL
    USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'master')
    WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'master');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can read own tier access"
    ON public.user_tier_access FOR SELECT
    USING (
      user_id = auth.uid()
      OR lower(email) = lower(auth.jwt() ->> 'email')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.touch_user_tier_access_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  IF NEW.email IS NOT NULL THEN
    NEW.email := lower(NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_user_tier_access_updated_at ON public.user_tier_access;
CREATE TRIGGER trg_touch_user_tier_access_updated_at
BEFORE INSERT OR UPDATE ON public.user_tier_access
FOR EACH ROW
EXECUTE FUNCTION public.touch_user_tier_access_updated_at();

CREATE OR REPLACE FUNCTION public.tier_rank(input_tier TEXT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE input_tier
    WHEN 'essential' THEN 1
    WHEN 'social' THEN 2
    WHEN 'host' THEN 3
    WHEN 'occasions' THEN 4
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_max_tier()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_tier TEXT;
BEGIN
  SELECT uta.max_tier
    INTO resolved_tier
  FROM public.user_tier_access uta
  WHERE uta.user_id = auth.uid()
     OR (uta.email IS NOT NULL AND lower(uta.email) = lower(auth.jwt() ->> 'email'))
  ORDER BY CASE WHEN uta.user_id = auth.uid() THEN 0 ELSE 1 END, uta.updated_at DESC
  LIMIT 1;

  RETURN COALESCE(resolved_tier, 'essential');
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_event_tier_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed_tier TEXT;
BEGIN
  IF NEW.organizer_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Event organizer mismatch for current user';
  END IF;

  allowed_tier := public.current_user_max_tier();

  IF public.tier_rank(NEW.tier) > public.tier_rank(allowed_tier) THEN
    RAISE EXCEPTION 'Tier % is not allowed. Max tier for user is %', NEW.tier, allowed_tier;
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='events'
  ) THEN
    DROP TRIGGER IF EXISTS trg_enforce_event_tier_access ON public.events;
    CREATE TRIGGER trg_enforce_event_tier_access
    BEFORE INSERT OR UPDATE OF tier, organizer_id ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_event_tier_access();
  END IF;
END $$;
