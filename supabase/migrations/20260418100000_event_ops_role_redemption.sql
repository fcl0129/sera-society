-- Sera Society event operations MVP foundation

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('host_admin', 'bartender', 'guest')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can upsert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.touch_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_touch_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.touch_profiles_updated_at();

-- Keep naming aligned with product language
UPDATE public.drink_tickets
SET status = 'active'
WHERE status = 'issued';

DO $$
BEGIN
  ALTER TABLE public.drink_tickets DROP CONSTRAINT IF EXISTS drink_tickets_status_check;
  ALTER TABLE public.drink_tickets
    ADD CONSTRAINT drink_tickets_status_check
    CHECK (status IN ('active', 'redeemed', 'void'));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.guest_event_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, guest_user_id)
);

ALTER TABLE public.guest_event_memberships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Guests can read own event memberships"
    ON public.guest_event_memberships FOR SELECT
    USING (guest_user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Hosts can manage guest event memberships"
    ON public.guest_event_memberships FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = guest_event_memberships.event_id
          AND e.organizer_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = guest_event_memberships.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_guest_event_memberships_event ON public.guest_event_memberships(event_id);
CREATE INDEX IF NOT EXISTS idx_guest_event_memberships_guest_user ON public.guest_event_memberships(guest_user_id);

CREATE TABLE IF NOT EXISTS public.ticket_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.drink_tickets(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  redeemed_by UUID REFERENCES auth.users(id),
  station_label TEXT,
  redemption_method TEXT NOT NULL DEFAULT 'bartender_assisted' CHECK (redemption_method IN ('bartender_assisted', 'guest_token', 'nfc', 'qr')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ticket_id)
);

ALTER TABLE public.ticket_redemptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Hosts can read event ticket redemptions"
    ON public.ticket_redemptions FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = ticket_redemptions.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Bartenders can read assigned event ticket redemptions"
    ON public.ticket_redemptions FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.event_staff_roles esr
        WHERE esr.event_id = ticket_redemptions.event_id
          AND esr.role = 'bartender'
          AND (esr.staff_user_id = auth.uid() OR lower(esr.staff_email) = lower(auth.jwt() ->> 'email'))
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_ticket_redemptions_event_created ON public.ticket_redemptions(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_redemptions_redeemed_by ON public.ticket_redemptions(redeemed_by);

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_role TEXT;
BEGIN
  SELECT p.role INTO resolved_role
  FROM public.profiles p
  WHERE p.id = auth.uid();

  RETURN COALESCE(resolved_role, 'guest');
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.redeem_drink_ticket_by_code(
  p_event_id UUID,
  p_ticket_code TEXT,
  p_station_label TEXT DEFAULT NULL
)
RETURNS TABLE(status TEXT, message TEXT, ticket_id UUID, redeemed_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket public.drink_tickets%ROWTYPE;
  v_now TIMESTAMPTZ := now();
  v_redemption_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT 'invalid'::TEXT, 'Unauthorized request'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  IF NOT (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = p_event_id
        AND e.organizer_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.event_staff_roles esr
      WHERE esr.event_id = p_event_id
        AND esr.role = 'bartender'
        AND (esr.staff_user_id = auth.uid() OR lower(esr.staff_email) = lower(auth.jwt() ->> 'email'))
    )
  ) THEN
    RETURN QUERY SELECT 'invalid'::TEXT, 'Not assigned to this event'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  SELECT * INTO v_ticket
  FROM public.drink_tickets dt
  WHERE dt.event_id = p_event_id
    AND dt.ticket_code = p_ticket_code
  FOR UPDATE;

  IF v_ticket.id IS NULL THEN
    RETURN QUERY SELECT 'invalid'::TEXT, 'Invalid ticket'::TEXT, NULL::UUID, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  IF v_ticket.status = 'void' THEN
    RETURN QUERY SELECT 'invalid'::TEXT, 'Ticket is void'::TEXT, v_ticket.id, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  IF v_ticket.status = 'redeemed' THEN
    RETURN QUERY SELECT 'already_redeemed'::TEXT, 'Already redeemed'::TEXT, v_ticket.id, v_ticket.redeemed_at;
    RETURN;
  END IF;

  UPDATE public.drink_tickets
  SET status = 'redeemed',
      redeemed_at = v_now,
      redeemed_by = auth.uid()
  WHERE id = v_ticket.id
    AND status = 'active';

  IF NOT FOUND THEN
    RETURN QUERY SELECT 'already_redeemed'::TEXT, 'Already redeemed'::TEXT, v_ticket.id, v_ticket.redeemed_at;
    RETURN;
  END IF;

  INSERT INTO public.ticket_redemptions (
    ticket_id,
    event_id,
    guest_id,
    redeemed_by,
    station_label,
    redemption_method,
    created_at
  ) VALUES (
    v_ticket.id,
    v_ticket.event_id,
    v_ticket.guest_id,
    auth.uid(),
    p_station_label,
    'bartender_assisted',
    v_now
  )
  ON CONFLICT (ticket_id) DO NOTHING
  RETURNING id INTO v_redemption_id;

  IF v_redemption_id IS NULL THEN
    RETURN QUERY SELECT 'already_redeemed'::TEXT, 'Already redeemed'::TEXT, v_ticket.id, v_ticket.redeemed_at;
    RETURN;
  END IF;

  RETURN QUERY SELECT 'redeemed'::TEXT, 'Redeemed'::TEXT, v_ticket.id, v_now;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_drink_ticket_by_code(UUID, TEXT, TEXT) TO authenticated, service_role;

INSERT INTO public.profiles (id, full_name, role)
SELECT u.id,
       COALESCE(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
       CASE
         WHEN u.raw_user_meta_data ->> 'role' IN ('host_admin', 'bartender', 'guest')
           THEN u.raw_user_meta_data ->> 'role'
         ELSE 'guest'
       END
FROM auth.users u
ON CONFLICT (id) DO NOTHING;
