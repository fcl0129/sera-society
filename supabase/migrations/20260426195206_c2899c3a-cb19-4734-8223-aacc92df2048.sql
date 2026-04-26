-- Allow drink_tickets to be issued to event_guests rows that don't yet have an auth account.

-- 1. Make guest_id nullable so we can issue without an account.
ALTER TABLE public.drink_tickets
  ALTER COLUMN guest_id DROP NOT NULL;

-- 2. Add event_guest_id pointer to event_guests.
ALTER TABLE public.drink_tickets
  ADD COLUMN IF NOT EXISTS event_guest_id uuid REFERENCES public.event_guests(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_drink_tickets_event_guest ON public.drink_tickets(event_guest_id);

-- 3. Backfill event_guest_id where we can match by (event_id, guest_id -> auth uid).
UPDATE public.drink_tickets dt
SET event_guest_id = eg.id
FROM public.event_guests eg
WHERE dt.event_guest_id IS NULL
  AND dt.guest_id IS NOT NULL
  AND eg.event_id = dt.event_id
  AND eg.guest_id = dt.guest_id;

-- 4. Constraint: must have either event_guest_id or guest_id (or both).
ALTER TABLE public.drink_tickets DROP CONSTRAINT IF EXISTS drink_tickets_owner_present;
ALTER TABLE public.drink_tickets
  ADD CONSTRAINT drink_tickets_owner_present
  CHECK (event_guest_id IS NOT NULL OR guest_id IS NOT NULL);

-- 5. Public pass lookup by RSVP token. SECURITY DEFINER so the pass page works
--    without authentication. Returns event, guest summary, and all tickets for
--    that guest at that event.
CREATE OR REPLACE FUNCTION public.get_guest_pass_by_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g RECORD;
  e RECORD;
  ticket_rows jsonb;
BEGIN
  SELECT * INTO g FROM public.event_guests WHERE rsvp_token = _token;
  IF g.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found');
  END IF;

  SELECT id, title, starts_at, ends_at, venue, description, status, cover_image_url
    INTO e FROM public.events WHERE id = g.event_id;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', t.id,
      'token', t.token,
      'status', t.status,
      'redeemed_at', t.redeemed_at,
      'created_at', t.created_at
    ) ORDER BY t.created_at
  ), '[]'::jsonb) INTO ticket_rows
  FROM public.drink_tickets t
  WHERE t.event_id = g.event_id
    AND (
      t.event_guest_id = g.id
      OR (t.guest_id IS NOT NULL AND t.guest_id = g.guest_id)
    );

  RETURN jsonb_build_object(
    'ok', true,
    'event', to_jsonb(e),
    'guest', jsonb_build_object(
      'id', g.id,
      'full_name', g.full_name,
      'invited_email', g.invited_email,
      'rsvp_status', g.rsvp_status,
      'plus_one_allowed', g.plus_one_allowed,
      'plus_one_count', g.plus_one_count
    ),
    'tickets', ticket_rows
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_guest_pass_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_guest_pass_by_token(text) TO anon, authenticated;

-- 6. Update redeem_ticket to support tickets owned via event_guest_id (accountless).
--    Behavior preserved for account-linked tickets.
CREATE OR REPLACE FUNCTION public.redeem_ticket(
  _token text,
  _method text,
  _station_label text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ticket RECORD;
  caller UUID := auth.uid();
  caller_role public.app_role := 'guest'::public.app_role;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'unauthorized', 'message', 'Sign in required.');
  END IF;

  IF _method NOT IN ('nfc_tag','qr','manual','device_emulation') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_method', 'message', 'Invalid redemption method.');
  END IF;

  SELECT role INTO caller_role FROM public.profiles WHERE id = caller;

  SELECT * INTO ticket FROM public.drink_tickets WHERE token = _token FOR UPDATE;

  IF ticket.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid', 'message', 'Ticket not found.');
  END IF;

  -- Guests can only redeem their own ticket. They own it if their auth uid
  -- matches guest_id, OR if their auth uid is linked to the event_guest row.
  IF caller_role = 'guest' THEN
    IF NOT (
      (ticket.guest_id IS NOT NULL AND ticket.guest_id = caller)
      OR (
        ticket.event_guest_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM public.event_guests eg
          WHERE eg.id = ticket.event_guest_id AND eg.guest_id = caller
        )
      )
    ) THEN
      RETURN jsonb_build_object('ok', false, 'code', 'forbidden', 'message', 'Not your ticket.');
    END IF;
  END IF;

  IF ticket.status = 'redeemed' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'already_redeemed', 'message', 'Ticket already redeemed.', 'redeemed_at', ticket.redeemed_at);
  END IF;

  IF ticket.status IN ('void','revoked') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'void', 'message', 'Ticket is voided.');
  END IF;

  UPDATE public.drink_tickets
  SET status = 'redeemed',
      redeemed_at = now(),
      redeemed_by = caller,
      redemption_method = _method
  WHERE id = ticket.id;

  INSERT INTO public.ticket_redemptions (ticket_id, event_id, guest_id, redeemed_by, method, station_label)
  VALUES (ticket.id, ticket.event_id, ticket.guest_id, caller, _method, _station_label);

  RETURN jsonb_build_object('ok', true, 'code', 'redeemed', 'ticket_id', ticket.id, 'event_id', ticket.event_id);
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_ticket(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_ticket(text, text, text) TO authenticated;