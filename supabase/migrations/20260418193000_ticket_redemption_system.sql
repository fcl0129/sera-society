-- Sera Society production ticket redemption system

-- Expand roles to product roles while preserving existing values.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'app_role'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'organizer';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS display_name TEXT,
      ADD COLUMN IF NOT EXISTS email TEXT;

    UPDATE public.profiles AS p
    SET display_name = COALESCE(p.display_name, p.full_name)
    WHERE p.display_name IS NULL;

    UPDATE public.profiles AS p
    SET email = COALESCE(p.email, lower(u.email))
    FROM auth.users AS u
    WHERE u.id = p.id
      AND p.email IS NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('organizer', 'bartender', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id, role)
);

CREATE INDEX IF NOT EXISTS staff_assignments_event_idx ON public.staff_assignments(event_id);
CREATE INDEX IF NOT EXISTS staff_assignments_user_idx ON public.staff_assignments(user_id);
ALTER TABLE public.staff_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Staff assignments readable by organizer or assigned user" ON public.staff_assignments;
  CREATE POLICY "Staff assignments readable by organizer or assigned user"
    ON public.staff_assignments FOR SELECT
    TO authenticated
    USING (
      user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = staff_assignments.event_id
          AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin'))
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Staff assignments managed by organizer" ON public.staff_assignments;
  CREATE POLICY "Staff assignments managed by organizer"
    ON public.staff_assignments FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = staff_assignments.event_id
          AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin'))
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = staff_assignments.event_id
          AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin'))
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='events') THEN
    ALTER TABLE public.events
      ADD COLUMN IF NOT EXISTS slug TEXT;

    UPDATE public.events
    SET slug = COALESCE(slug, regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g') || '-' || left(id::text, 8))
    WHERE slug IS NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS events_slug_idx ON public.events(slug);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.redemption_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bar_nfc_tag', 'bartender_device', 'entry_gate', 'qr_station')),
  identifier TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, identifier)
);

CREATE INDEX IF NOT EXISTS redemption_points_event_idx ON public.redemption_points(event_id);
ALTER TABLE public.redemption_points ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Redemption points organizer manage" ON public.redemption_points;
  CREATE POLICY "Redemption points organizer manage"
    ON public.redemption_points FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = redemption_points.event_id
          AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin'))
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = redemption_points.event_id
          AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin'))
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Redemption points staff read" ON public.redemption_points;
  CREATE POLICY "Redemption points staff read"
    ON public.redemption_points FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.staff_assignments sa
        WHERE sa.event_id = redemption_points.event_id
          AND sa.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = redemption_points.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'cancelled', 'expired')),
  code TEXT NOT NULL UNIQUE,
  qr_payload TEXT NOT NULL,
  nfc_payload TEXT,
  redemption_limit INTEGER NOT NULL DEFAULT 1 CHECK (redemption_limit > 0),
  redeemed_count INTEGER NOT NULL DEFAULT 0 CHECK (redeemed_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tickets') THEN
    ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
    ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS ticket_type TEXT;
    ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS code TEXT;
    ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS qr_payload TEXT;
    ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS nfc_payload TEXT;
    ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS redemption_limit INTEGER NOT NULL DEFAULT 1;
    ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS redeemed_count INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='tickets' AND column_name='guest_id'
    ) THEN
      UPDATE public.tickets
      SET owner_user_id = COALESCE(owner_user_id, guest_id)
      WHERE owner_user_id IS NULL;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='tickets' AND column_name='status'
    ) THEN
      ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_status_check;
      ALTER TABLE public.tickets ADD CONSTRAINT tickets_status_check
        CHECK (status IN ('active', 'redeemed', 'cancelled', 'expired'));
    END IF;

    ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tickets' AND column_name='event_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tickets' AND column_name='owner_user_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS tickets_event_owner_idx ON public.tickets(event_id, owner_user_id);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tickets' AND column_name='code'
  ) THEN
    CREATE INDEX IF NOT EXISTS tickets_code_idx ON public.tickets(code);
  END IF;
END $$;

DROP TRIGGER IF EXISTS tickets_touch ON public.tickets;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tickets' AND column_name='updated_at'
  ) THEN
    CREATE TRIGGER tickets_touch BEFORE UPDATE ON public.tickets
      FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Tickets guest read own" ON public.tickets;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tickets' AND column_name='owner_user_id'
  ) THEN
    CREATE POLICY "Tickets guest read own"
      ON public.tickets FOR SELECT
      TO authenticated
      USING (owner_user_id = auth.uid());
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Tickets organizer and staff read" ON public.tickets;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tickets' AND column_name='event_id'
  ) THEN
    CREATE POLICY "Tickets organizer and staff read"
      ON public.tickets FOR SELECT
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.events e WHERE e.id = tickets.event_id AND e.organizer_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.staff_assignments sa WHERE sa.event_id = tickets.event_id AND sa.user_id = auth.uid())
        OR public.has_role(auth.uid(), 'host_admin')
      );
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Tickets organizer manage" ON public.tickets;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='tickets' AND column_name='event_id'
  ) THEN
    CREATE POLICY "Tickets organizer manage"
      ON public.tickets FOR ALL
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.events e WHERE e.id = tickets.event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin')))
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.events e WHERE e.id = tickets.event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin')))
      );
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE SET NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  redemption_point_id UUID REFERENCES public.redemption_points(id) ON DELETE SET NULL,
  redeemed_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  method TEXT NOT NULL CHECK (method IN ('qr', 'nfc')),
  result TEXT NOT NULL CHECK (result IN ('success', 'already_redeemed', 'invalid', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='redemptions') THEN
    ALTER TABLE public.redemptions ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE SET NULL;
    ALTER TABLE public.redemptions ADD COLUMN IF NOT EXISTS redemption_point_id UUID REFERENCES public.redemption_points(id) ON DELETE SET NULL;
    ALTER TABLE public.redemptions ADD COLUMN IF NOT EXISTS redeemed_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    ALTER TABLE public.redemptions ADD COLUMN IF NOT EXISTS method TEXT;
    ALTER TABLE public.redemptions ADD COLUMN IF NOT EXISTS result TEXT;
    ALTER TABLE public.redemptions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
    ALTER TABLE public.redemptions ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='redemptions' AND column_name='method'
    ) THEN
      ALTER TABLE public.redemptions DROP CONSTRAINT IF EXISTS redemptions_method_check;
      ALTER TABLE public.redemptions ADD CONSTRAINT redemptions_method_check
        CHECK (method IN ('qr', 'nfc'));
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='redemptions' AND column_name='result'
    ) THEN
      ALTER TABLE public.redemptions DROP CONSTRAINT IF EXISTS redemptions_result_check;
      ALTER TABLE public.redemptions ADD CONSTRAINT redemptions_result_check
        CHECK (result IN ('success', 'already_redeemed', 'invalid', 'blocked'));
    END IF;

    ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='redemptions' AND column_name='event_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='redemptions' AND column_name='created_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS redemptions_event_created_idx ON public.redemptions(event_id, created_at DESC);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='redemptions' AND column_name='ticket_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS redemptions_ticket_idx ON public.redemptions(ticket_id);
  END IF;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Redemptions organizer and staff read" ON public.redemptions;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='redemptions' AND column_name='event_id'
  ) THEN
    CREATE POLICY "Redemptions organizer and staff read"
      ON public.redemptions FOR SELECT
      TO authenticated
      USING (
        EXISTS (SELECT 1 FROM public.events e WHERE e.id = redemptions.event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin')))
        OR EXISTS (SELECT 1 FROM public.staff_assignments sa WHERE sa.event_id = redemptions.event_id AND sa.user_id = auth.uid())
        OR EXISTS (
          SELECT 1
          FROM public.tickets t
          WHERE t.id = redemptions.ticket_id
            AND (
              (EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tickets' AND column_name='owner_user_id') AND t.owner_user_id = auth.uid())
              OR (EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tickets' AND column_name='guest_id') AND t.guest_id = auth.uid())
            )
        )
      );
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.can_redeem_event_ticket(_event_id uuid)
RETURNS boolean
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
      SELECT 1 FROM public.events e WHERE e.id = _event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin'))
    ) OR EXISTS (
      SELECT 1 FROM public.staff_assignments sa
      WHERE sa.event_id = _event_id
        AND sa.user_id = auth.uid()
        AND sa.role IN ('bartender', 'organizer', 'staff')
    );
$$;

GRANT EXECUTE ON FUNCTION public.can_redeem_event_ticket(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.redeem_event_ticket(
  p_code text,
  p_method text,
  p_redemption_point_id uuid DEFAULT NULL,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ticket public.tickets%ROWTYPE;
  v_allowed boolean;
  v_now timestamptz := now();
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'unauthorized', 'message', 'Sign in required');
  END IF;

  IF p_method NOT IN ('qr', 'nfc') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_method', 'message', 'Unsupported method');
  END IF;

  SELECT * INTO v_ticket
  FROM public.tickets t
  WHERE t.code = p_code OR t.qr_payload = p_code OR t.nfc_payload = p_code
  FOR UPDATE;

  IF v_ticket.id IS NULL THEN
    INSERT INTO public.redemptions(ticket_id, event_id, redemption_point_id, redeemed_by_user_id, method, result, metadata)
    VALUES (NULL, NULL, p_redemption_point_id, auth.uid(), p_method, 'invalid', p_payload || jsonb_build_object('submitted_code', p_code));
    RETURN jsonb_build_object('ok', false, 'code', 'invalid', 'message', 'Ticket is invalid');
  END IF;

  SELECT public.can_redeem_event_ticket(v_ticket.event_id) INTO v_allowed;
  IF NOT v_allowed THEN
    INSERT INTO public.redemptions(ticket_id, event_id, redemption_point_id, redeemed_by_user_id, method, result, metadata)
    VALUES (v_ticket.id, v_ticket.event_id, p_redemption_point_id, auth.uid(), p_method, 'blocked', p_payload);
    RETURN jsonb_build_object('ok', false, 'code', 'forbidden', 'message', 'Not assigned to this event');
  END IF;

  IF v_ticket.status IN ('cancelled', 'expired') THEN
    INSERT INTO public.redemptions(ticket_id, event_id, redemption_point_id, redeemed_by_user_id, method, result, metadata)
    VALUES (v_ticket.id, v_ticket.event_id, p_redemption_point_id, auth.uid(), p_method, 'blocked', p_payload || jsonb_build_object('status', v_ticket.status));
    RETURN jsonb_build_object('ok', false, 'code', 'blocked', 'message', 'Ticket cannot be redeemed');
  END IF;

  IF v_ticket.redeemed_count >= v_ticket.redemption_limit OR v_ticket.status = 'redeemed' THEN
    INSERT INTO public.redemptions(ticket_id, event_id, redemption_point_id, redeemed_by_user_id, method, result, metadata)
    VALUES (v_ticket.id, v_ticket.event_id, p_redemption_point_id, auth.uid(), p_method, 'already_redeemed', p_payload || jsonb_build_object('redeemed_count', v_ticket.redeemed_count));
    RETURN jsonb_build_object('ok', false, 'code', 'already_redeemed', 'message', 'Ticket already redeemed', 'redeemed_count', v_ticket.redeemed_count);
  END IF;

  UPDATE public.tickets
  SET redeemed_count = redeemed_count + 1,
      status = CASE WHEN redeemed_count + 1 >= redemption_limit THEN 'redeemed' ELSE 'active' END,
      updated_at = v_now
  WHERE id = v_ticket.id
    AND redeemed_count < redemption_limit;

  IF NOT FOUND THEN
    INSERT INTO public.redemptions(ticket_id, event_id, redemption_point_id, redeemed_by_user_id, method, result, metadata)
    VALUES (v_ticket.id, v_ticket.event_id, p_redemption_point_id, auth.uid(), p_method, 'already_redeemed', p_payload || jsonb_build_object('race_condition', true));
    RETURN jsonb_build_object('ok', false, 'code', 'already_redeemed', 'message', 'Ticket already redeemed');
  END IF;

  INSERT INTO public.redemptions(ticket_id, event_id, redemption_point_id, redeemed_by_user_id, method, result, metadata)
  VALUES (v_ticket.id, v_ticket.event_id, p_redemption_point_id, auth.uid(), p_method, 'success', p_payload);

  SELECT * INTO v_ticket FROM public.tickets WHERE id = v_ticket.id;

  RETURN jsonb_build_object(
    'ok', true,
    'code', 'redeemed',
    'message', 'Ticket redeemed',
    'ticket_id', v_ticket.id,
    'event_id', v_ticket.event_id,
    'ticket_type', v_ticket.ticket_type,
    'redeemed_count', v_ticket.redeemed_count,
    'redemption_limit', v_ticket.redemption_limit,
    'status', v_ticket.status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_event_ticket(text, text, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_event_ticket(text, text, uuid, jsonb) TO authenticated, service_role;
