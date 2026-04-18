-- 20260418100000_event_ops_role_redemption.sql
-- Normalize event-ops role/redemption schema in a way that is safe for
-- partially initialized databases and existing environments.

BEGIN;

-- -------------------------------------------------------------------
-- PROFILES: recreate updated_at trigger only if table/function exist
-- -------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
  ) THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_touch_profiles_updated_at ON public.profiles';

    IF EXISTS (
      SELECT 1
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE p.proname = 'touch_updated_at'
        AND n.nspname = 'public'
    ) THEN
      EXECUTE '
        CREATE TRIGGER trg_touch_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.touch_updated_at()
      ';
    END IF;
  END IF;
END
$$;

-- -------------------------------------------------------------------
-- DRINK TICKETS: normalize status values only if table exists
-- -------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'drink_tickets'
  ) THEN
    -- Drop old constraint if present
    EXECUTE 'ALTER TABLE public.drink_tickets DROP CONSTRAINT IF EXISTS drink_tickets_status_check';

    -- Allow both legacy and new values during transition
    EXECUTE $sql$
      ALTER TABLE public.drink_tickets
      ADD CONSTRAINT drink_tickets_status_check
      CHECK (status IN (''issued'', ''active'', ''redeemed'', ''revoked''))
    $sql$;

    -- Migrate legacy rows
    EXECUTE $sql$
      UPDATE public.drink_tickets
      SET status = ''active''
      WHERE status = ''issued''
    $sql$;

    -- Tighten to final allowed values
    EXECUTE 'ALTER TABLE public.drink_tickets DROP CONSTRAINT IF EXISTS drink_tickets_status_check';

    EXECUTE $sql$
      ALTER TABLE public.drink_tickets
      ADD CONSTRAINT drink_tickets_status_check
      CHECK (status IN (''active'', ''redeemed'', ''revoked''))
    $sql$;

    -- Set default for new rows
    EXECUTE $sql$
      ALTER TABLE public.drink_tickets
      ALTER COLUMN status SET DEFAULT ''active''
    $sql$;
  END IF;
END
$$;

COMMIT;