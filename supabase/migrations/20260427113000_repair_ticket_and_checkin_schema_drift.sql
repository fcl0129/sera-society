-- Repair schema drift between legacy ticket/check-in tables and current app model.
-- Idempotent by design so it can be re-run safely.

-- ---------------------------------------------------------------------------
-- Part A: drink_tickets token/ticket_code compatibility
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.drink_tickets') IS NULL THEN
    RAISE NOTICE 'public.drink_tickets does not exist, skipping Part A';
    RETURN;
  END IF;

  -- 1) Ensure canonical token column exists.
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'drink_tickets'
      AND column_name = 'token'
  ) THEN
    ALTER TABLE public.drink_tickets ADD COLUMN token text;
  END IF;

  -- 2) Backfill token from legacy ticket_code where available.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'drink_tickets'
      AND column_name = 'ticket_code'
  ) THEN
    UPDATE public.drink_tickets
    SET token = ticket_code
    WHERE token IS NULL
      AND ticket_code IS NOT NULL;
  END IF;

  -- 3) Backfill any remaining null/blank/duplicate token values with secure random values.
  UPDATE public.drink_tickets
  SET token = encode(extensions.gen_random_bytes(18), 'base64')
  WHERE token IS NULL OR btrim(token) = '';

  WITH ranked AS (
    SELECT id,
           row_number() OVER (PARTITION BY token ORDER BY created_at NULLS LAST, id) AS rn
    FROM public.drink_tickets
    WHERE token IS NOT NULL
  )
  UPDATE public.drink_tickets dt
  SET token = encode(extensions.gen_random_bytes(18), 'base64')
  FROM ranked r
  WHERE dt.id = r.id
    AND r.rn > 1;

  -- 4/6) Ensure default + NOT NULL for token.
  ALTER TABLE public.drink_tickets
    ALTER COLUMN token SET DEFAULT encode(extensions.gen_random_bytes(18), 'base64'),
    ALTER COLUMN token SET NOT NULL;

  -- 5) Ensure unique token index/constraint exists.
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'drink_tickets_token_key'
      AND conrelid = 'public.drink_tickets'::regclass
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'drink_tickets'
      AND indexname = 'drink_tickets_token_key'
  ) THEN
    CREATE UNIQUE INDEX drink_tickets_token_key ON public.drink_tickets(token);
  END IF;

  -- 7/8/9) Keep legacy ticket_code if present, but ensure it cannot block inserts.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'drink_tickets'
      AND column_name = 'ticket_code'
  ) THEN
    ALTER TABLE public.drink_tickets
      ALTER COLUMN ticket_code DROP NOT NULL,
      ALTER COLUMN ticket_code SET DEFAULT encode(extensions.gen_random_bytes(18), 'base64');
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- Part B: checkins.guest_id FK must target event_guests(id)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.checkins') IS NULL THEN
    RAISE NOTICE 'public.checkins does not exist, skipping Part B';
    RETURN;
  END IF;

  -- Remove orphaned rows before FK recreation (safe cleanup; avoids silent corruption).
  DELETE FROM public.checkins c
  WHERE NOT EXISTS (
    SELECT 1 FROM public.event_guests eg WHERE eg.id = c.guest_id
  );

  ALTER TABLE public.checkins
    ALTER COLUMN guest_id TYPE uuid USING guest_id::uuid,
    ALTER COLUMN guest_id SET NOT NULL;

  ALTER TABLE public.checkins DROP CONSTRAINT IF EXISTS checkins_guest_id_fkey;

  ALTER TABLE public.checkins
    ADD CONSTRAINT checkins_guest_id_fkey
    FOREIGN KEY (guest_id)
    REFERENCES public.event_guests(id)
    ON DELETE CASCADE;

  CREATE INDEX IF NOT EXISTS idx_checkins_guest_id ON public.checkins(guest_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_checkins_event_guest_unique ON public.checkins(event_id, guest_id);
END;
$$;

-- ---------------------------------------------------------------------------
-- Part C: ticket_redemptions compatibility for accountless guests
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.ticket_redemptions') IS NULL THEN
    RAISE NOTICE 'public.ticket_redemptions does not exist, skipping Part C';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ticket_redemptions'
      AND column_name = 'event_guest_id'
  ) THEN
    ALTER TABLE public.ticket_redemptions
      ADD COLUMN event_guest_id uuid REFERENCES public.event_guests(id) ON DELETE SET NULL;
  END IF;

  UPDATE public.ticket_redemptions tr
  SET event_guest_id = dt.event_guest_id
  FROM public.drink_tickets dt
  WHERE tr.ticket_id = dt.id
    AND tr.event_guest_id IS NULL
    AND dt.event_guest_id IS NOT NULL;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ticket_redemptions'
      AND column_name = 'guest_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.ticket_redemptions
      ALTER COLUMN guest_id DROP NOT NULL;
  END IF;

  CREATE INDEX IF NOT EXISTS idx_ticket_redemptions_event_guest_id ON public.ticket_redemptions(event_guest_id);
END;
$$;

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

  INSERT INTO public.ticket_redemptions (
    ticket_id,
    event_id,
    guest_id,
    event_guest_id,
    redeemed_by,
    method,
    station_label
  )
  VALUES (
    ticket.id,
    ticket.event_id,
    ticket.guest_id,
    ticket.event_guest_id,
    caller,
    _method,
    _station_label
  );

  RETURN jsonb_build_object('ok', true, 'code', 'redeemed', 'ticket_id', ticket.id, 'event_id', ticket.event_id);
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_ticket(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_ticket(text, text, text) TO authenticated;
