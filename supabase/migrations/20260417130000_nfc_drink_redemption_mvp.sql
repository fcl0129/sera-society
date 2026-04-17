-- NFC drink redemption MVP schema

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upsert own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own tickets"
    ON public.tickets FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Organizers can view event tickets"
    ON public.tickets FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = tickets.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.redemption_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash BYTEA NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  station_id TEXT,
  redemption_id UUID
);

ALTER TABLE public.redemption_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own redemption tokens"
    ON public.redemption_tokens FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  station_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'rejected')),
  reason TEXT,
  remaining_tickets INT,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own redemptions"
    ON public.redemptions FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Organizers can read event redemptions"
    ON public.redemptions FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = redemptions.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_tickets_event_user ON public.tickets(event_id, user_id);
CREATE INDEX IF NOT EXISTS idx_redemption_tokens_expiry ON public.redemption_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_redemptions_event_time ON public.redemptions(event_id, redeemed_at DESC);

CREATE OR REPLACE FUNCTION public.touch_tickets_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_tickets_updated_at ON public.tickets;
CREATE TRIGGER trg_touch_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.touch_tickets_updated_at();

CREATE OR REPLACE FUNCTION public.issue_redemption_token(
  p_user_id UUID,
  p_event_id UUID,
  p_ttl_seconds INT DEFAULT 45
)
RETURNS TABLE(token TEXT, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  IF auth.uid() IS NOT NULL AND auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not authorized for user';
  END IF;

  IF p_ttl_seconds < 30 OR p_ttl_seconds > 60 THEN
    RAISE EXCEPTION 'ttl must be between 30 and 60 seconds';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.user_id = p_user_id
      AND t.event_id = p_event_id
      AND t.balance > 0
  ) THEN
    RAISE EXCEPTION 'no tickets remaining';
  END IF;

  v_token := encode(gen_random_bytes(24), 'base64url');
  v_expires_at := now() + make_interval(secs => p_ttl_seconds);

  INSERT INTO public.redemption_tokens (token_hash, user_id, event_id, expires_at)
  VALUES (digest(v_token, 'sha256'), p_user_id, p_event_id, v_expires_at);

  RETURN QUERY SELECT v_token, v_expires_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.issue_redemption_token(UUID, UUID, INT) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.redeem_drink_ticket(
  p_token TEXT,
  p_station_id TEXT
)
RETURNS TABLE(status TEXT, remaining_tickets INT, user_id UUID, event_id UUID, redemption_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_token_row public.redemption_tokens%ROWTYPE;
  v_ticket public.tickets%ROWTYPE;
  v_redemption_id UUID;
  v_status TEXT := 'rejected';
  v_reason TEXT := NULL;
BEGIN
  SELECT * INTO v_token_row
  FROM public.redemption_tokens
  WHERE token_hash = digest(p_token, 'sha256')
  FOR UPDATE;

  IF v_token_row.id IS NULL THEN
    v_reason := 'invalid_token';
    RETURN QUERY SELECT v_status, NULL::INT, NULL::UUID, NULL::UUID, NULL::UUID;
    RETURN;
  END IF;

  IF v_token_row.used_at IS NOT NULL THEN
    v_reason := 'already_used';
  ELSIF v_token_row.expires_at < v_now THEN
    v_reason := 'expired';
  ELSE
    SELECT * INTO v_ticket
    FROM public.tickets
    WHERE user_id = v_token_row.user_id
      AND event_id = v_token_row.event_id
    FOR UPDATE;

    IF v_ticket.id IS NULL OR v_ticket.balance <= 0 THEN
      v_reason := 'no_tickets';
    ELSE
      UPDATE public.tickets
      SET balance = balance - 1
      WHERE id = v_ticket.id
      RETURNING * INTO v_ticket;

      v_status := 'success';
      v_reason := NULL;
    END IF;
  END IF;

  INSERT INTO public.redemptions(user_id, event_id, station_id, status, reason, remaining_tickets)
  VALUES (
    v_token_row.user_id,
    v_token_row.event_id,
    COALESCE(NULLIF(trim(p_station_id), ''), 'UNKNOWN'),
    v_status,
    v_reason,
    CASE WHEN v_status = 'success' THEN v_ticket.balance ELSE NULL END
  )
  RETURNING id INTO v_redemption_id;

  IF v_status = 'success' THEN
    UPDATE public.redemption_tokens
    SET used_at = v_now,
        station_id = COALESCE(NULLIF(trim(p_station_id), ''), 'UNKNOWN'),
        redemption_id = v_redemption_id
    WHERE id = v_token_row.id;
  END IF;

  RETURN QUERY SELECT v_status, CASE WHEN v_status = 'success' THEN v_ticket.balance ELSE NULL END, v_token_row.user_id, v_token_row.event_id, v_redemption_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_drink_ticket(TEXT, TEXT) TO anon, authenticated, service_role;
