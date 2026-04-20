-- 1. Add new columns to event_guests
ALTER TABLE public.event_guests
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS plus_one_allowed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plus_one_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rsvp_message text,
  ADD COLUMN IF NOT EXISTS rsvp_responded_at timestamptz,
  ADD COLUMN IF NOT EXISTS rsvp_token text;

-- 2. Backfill rsvp_token for existing rows
UPDATE public.event_guests
   SET rsvp_token = encode(extensions.gen_random_bytes(18), 'base64')
 WHERE rsvp_token IS NULL;

-- 3. Set NOT NULL + default for rsvp_token going forward
ALTER TABLE public.event_guests
  ALTER COLUMN rsvp_token SET DEFAULT encode(extensions.gen_random_bytes(18), 'base64'),
  ALTER COLUMN rsvp_token SET NOT NULL;

-- 4. Unique token + unique guest per event
CREATE UNIQUE INDEX IF NOT EXISTS event_guests_rsvp_token_unique
  ON public.event_guests(rsvp_token);

-- Normalize email + dedupe before adding unique constraint
UPDATE public.event_guests
   SET invited_email = lower(trim(invited_email))
 WHERE invited_email IS NOT NULL;

-- Migrate legacy rsvp_status values
UPDATE public.event_guests SET rsvp_status = 'accepted' WHERE rsvp_status IN ('yes','going');
UPDATE public.event_guests SET rsvp_status = 'declined' WHERE rsvp_status IN ('no','not_going');
UPDATE public.event_guests SET rsvp_status = 'pending'  WHERE rsvp_status NOT IN ('accepted','declined','pending');

-- Add CHECK on rsvp_status (drop first if exists)
ALTER TABLE public.event_guests DROP CONSTRAINT IF EXISTS event_guests_rsvp_status_check;
ALTER TABLE public.event_guests
  ADD CONSTRAINT event_guests_rsvp_status_check
  CHECK (rsvp_status IN ('pending','accepted','declined'));

-- Unique guest per event (case-insensitive on email)
CREATE UNIQUE INDEX IF NOT EXISTS event_guests_event_email_unique
  ON public.event_guests(event_id, lower(invited_email));

-- 5. Public RSVP access via token (anon + authenticated)
DROP POLICY IF EXISTS "EventGuests: public read by token" ON public.event_guests;
CREATE POLICY "EventGuests: public read by token"
  ON public.event_guests
  FOR SELECT
  TO anon, authenticated
  USING (rsvp_token IS NOT NULL);
-- Note: rows are only retrievable when caller filters by .eq('rsvp_token', x).
-- We tighten this with a security-definer RPC instead — see below.

DROP POLICY IF EXISTS "EventGuests: public read by token" ON public.event_guests;

-- 6. Security-definer RPCs for public RSVP flow
CREATE OR REPLACE FUNCTION public.get_rsvp_by_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g RECORD;
  e RECORD;
BEGIN
  SELECT * INTO g FROM public.event_guests WHERE rsvp_token = _token;
  IF g.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found');
  END IF;
  SELECT id, title, starts_at, ends_at, venue, description, rsvp_cutoff_at, status
    INTO e FROM public.events WHERE id = g.event_id;
  RETURN jsonb_build_object(
    'ok', true,
    'guest', jsonb_build_object(
      'id', g.id,
      'full_name', g.full_name,
      'invited_email', g.invited_email,
      'phone_number', g.phone_number,
      'rsvp_status', g.rsvp_status,
      'plus_one_allowed', g.plus_one_allowed,
      'plus_one_count', g.plus_one_count,
      'rsvp_message', g.rsvp_message,
      'rsvp_responded_at', g.rsvp_responded_at
    ),
    'event', to_jsonb(e)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_rsvp(
  _token text,
  _status text,
  _full_name text DEFAULT NULL,
  _phone_number text DEFAULT NULL,
  _plus_one_count integer DEFAULT 0,
  _message text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g RECORD;
  e RECORD;
  final_plus_ones integer;
BEGIN
  IF _status NOT IN ('accepted','declined') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_status');
  END IF;

  SELECT * INTO g FROM public.event_guests WHERE rsvp_token = _token FOR UPDATE;
  IF g.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found');
  END IF;

  SELECT * INTO e FROM public.events WHERE id = g.event_id;
  IF e.rsvp_cutoff_at IS NOT NULL AND e.rsvp_cutoff_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'code', 'cutoff_passed');
  END IF;

  final_plus_ones := 0;
  IF _status = 'accepted' AND g.plus_one_allowed THEN
    final_plus_ones := GREATEST(0, COALESCE(_plus_one_count, 0));
  END IF;

  UPDATE public.event_guests
     SET rsvp_status      = _status,
         full_name        = COALESCE(NULLIF(trim(_full_name), ''), full_name),
         phone_number     = COALESCE(NULLIF(trim(_phone_number), ''), phone_number),
         plus_one_count   = final_plus_ones,
         rsvp_message     = NULLIF(trim(_message), ''),
         rsvp_responded_at = now()
   WHERE id = g.id;

  RETURN jsonb_build_object('ok', true, 'status', _status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_rsvp_by_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_rsvp(text, text, text, text, integer, text) TO anon, authenticated;

-- 7. Realtime for organizer dashboard
ALTER TABLE public.event_guests REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
     WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'event_guests'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.event_guests';
  END IF;
END $$;