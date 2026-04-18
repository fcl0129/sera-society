-- 20260418100000_event_ops_role_redemption.sql
-- Normalize event-ops roles and drink ticket redemption status handling.
-- This version is written to be resilient on existing databases.

BEGIN;

-- -------------------------------------------------------------------
-- PROFILES: ensure updated_at trigger can be recreated safely
-- -------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_touch_profiles_updated_at ON public.profiles;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'touch_updated_at'
  ) THEN
    EXECUTE '
      CREATE TRIGGER trg_touch_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.touch_updated_at()
    ';
  END IF;
END $$;

-- -------------------------------------------------------------------
-- DRINK TICKETS: safely migrate status values from old -> new naming
-- -------------------------------------------------------------------

ALTER TABLE public.drink_tickets
DROP CONSTRAINT IF EXISTS drink_tickets_status_check;

ALTER TABLE public.drink_tickets
ADD CONSTRAINT drink_tickets_status_check
CHECK (status IN ('issued', 'active', 'redeemed', 'revoked'));

UPDATE public.drink_tickets
SET status = 'active'
WHERE status = 'issued';

ALTER TABLE public.drink_tickets
DROP CONSTRAINT IF EXISTS drink_tickets_status_check;

ALTER TABLE public.drink_tickets
ADD CONSTRAINT drink_tickets_status_check
CHECK (status IN ('active', 'redeemed', 'revoked'));

ALTER TABLE public.drink_tickets
ALTER COLUMN status SET DEFAULT 'active';

COMMIT;