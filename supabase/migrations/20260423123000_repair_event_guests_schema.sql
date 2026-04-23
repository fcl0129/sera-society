-- Repair event_guests so organizer guest invitations match the live dashboard.
-- This is intentionally idempotent and safe for older environments.

BEGIN;

-- Ensure the table exists with the minimum identity columns if a very old project is missing it.
CREATE TABLE IF NOT EXISTS public.event_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing modern columns expected by the organizer dashboard.
ALTER TABLE public.event_guests
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS plus_one_allowed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plus_one_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rsvp_message TEXT,
  ADD COLUMN IF NOT EXISTS rsvp_responded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rsvp_token TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS tier TEXT,
  ADD COLUMN IF NOT EXISTS rsvp_status TEXT NOT NULL DEFAULT 'pending';

-- Older environments may have required guest_id too early; invitations should work before signup.
ALTER TABLE public.event_guests
  ALTER COLUMN guest_id DROP NOT NULL;

-- If an older schema used email instead of invited_email, backfill and then keep invited_email as the canonical field.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'event_guests'
      AND column_name = 'email'
  ) THEN
    EXECUTE $sql$
      UPDATE public.event_guests
      SET invited_email = COALESCE(invited_email, email)
      WHERE invited_email IS NULL
    $sql$;
  END IF;
END
$$;

-- Normalize invited emails and generate tokens where missing.
UPDATE public.event_guests
SET invited_email = lower(trim(invited_email))
WHERE invited_email IS NOT NULL;

UPDATE public.event_guests
SET rsvp_token = encode(extensions.gen_random_bytes(18), 'base64')
WHERE rsvp_token IS NULL;

-- Backfill guest_id for already-existing profiles.
UPDATE public.event_guests eg
SET guest_id = p.id
FROM public.profiles p
WHERE eg.guest_id IS NULL
  AND eg.invited_email IS NOT NULL
  AND p.email IS NOT NULL
  AND lower(trim(p.email)) = lower(trim(eg.invited_email));

-- Tighten defaults and constraints once data is in place.
ALTER TABLE public.event_guests
  ALTER COLUMN invited_email SET NOT NULL,
  ALTER COLUMN rsvp_token SET NOT NULL,
  ALTER COLUMN rsvp_token SET DEFAULT encode(extensions.gen_random_bytes(18), 'base64'),
  ALTER COLUMN rsvp_status SET DEFAULT 'pending';

ALTER TABLE public.event_guests DROP CONSTRAINT IF EXISTS event_guests_rsvp_status_check;
ALTER TABLE public.event_guests
  ADD CONSTRAINT event_guests_rsvp_status_check
  CHECK (rsvp_status IN ('pending', 'accepted', 'declined'));

CREATE UNIQUE INDEX IF NOT EXISTS event_guests_rsvp_token_unique
  ON public.event_guests(rsvp_token);

CREATE UNIQUE INDEX IF NOT EXISTS event_guests_event_email_unique
  ON public.event_guests(event_id, lower(invited_email));

COMMIT;
