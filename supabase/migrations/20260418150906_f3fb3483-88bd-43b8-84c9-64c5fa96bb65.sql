-- Core auth, role, event, and redemption schema (idempotent + replay-safe)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'app_role'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('guest', 'bartender', 'host_admin');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.app_role NOT NULL DEFAULT 'guest',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
    ) THEN
      BEGIN
        ALTER TABLE public.profiles
          ALTER COLUMN role TYPE public.app_role
          USING (
            CASE
              WHEN role::text IN ('host_admin','bartender','guest') THEN role::text::public.app_role
              ELSE 'guest'::public.app_role
            END
          );
      EXCEPTION WHEN others THEN
        -- Preserve replayability in partially inconsistent environments
        NULL;
      END;
    ELSE
      ALTER TABLE public.profiles ADD COLUMN role public.app_role NOT NULL DEFAULT 'guest';
    END IF;

    UPDATE public.profiles
    SET role = 'guest'::public.app_role
    WHERE role IS NULL;

    ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'guest'::public.app_role;
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email'
  ) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (lower(email));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.current_role()
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'guest'::public.app_role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role public.app_role := 'guest';
BEGIN
  IF lower(NEW.email) IN ('admin@serasociety.com') THEN
    assigned_role := 'host_admin';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
      role = COALESCE(public.profiles.role, EXCLUDED.role);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'email'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'raw_user_meta_data'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

DROP TRIGGER IF EXISTS profiles_touch ON public.profiles;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    CREATE TRIGGER profiles_touch
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
  END IF;
END $$;

DROP POLICY IF EXISTS "Profiles: self-read" ON public.profiles;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id'
  ) THEN
    CREATE POLICY "Profiles: self-read"
      ON public.profiles FOR SELECT TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

DROP POLICY IF EXISTS "Profiles: admin-read-all" ON public.profiles;
CREATE POLICY "Profiles: admin-read-all"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'host_admin'));

DROP POLICY IF EXISTS "Profiles: bartender-read-all" ON public.profiles;
CREATE POLICY "Profiles: bartender-read-all"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'bartender'));

DROP POLICY IF EXISTS "Profiles: self-update-name" ON public.profiles;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    CREATE POLICY "Profiles: self-update-name"
      ON public.profiles FOR UPDATE TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));
  END IF;
END $$;

DROP POLICY IF EXISTS "Profiles: admin-update" ON public.profiles;
CREATE POLICY "Profiles: admin-update"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'host_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'host_admin'));

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  venue TEXT,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='events') THEN
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE public.events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'organizer_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS events_organizer_idx ON public.events(organizer_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS events_touch ON public.events;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'updated_at'
  ) THEN
    CREATE TRIGGER events_touch
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.event_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  tier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, guest_id)
);
ALTER TABLE public.event_guests ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'event_guests' AND column_name = 'event_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS event_guests_event_idx ON public.event_guests(event_id);
  END IF;
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'event_guests' AND column_name = 'guest_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS event_guests_guest_idx ON public.event_guests(guest_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.drink_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18), 'base64'),
  status TEXT NOT NULL DEFAULT 'active',
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID REFERENCES public.profiles(id),
  redemption_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='drink_tickets') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='drink_tickets' AND column_name='status'
    ) THEN
      ALTER TABLE public.drink_tickets DROP CONSTRAINT IF EXISTS drink_tickets_status_check;
      ALTER TABLE public.drink_tickets ADD CONSTRAINT drink_tickets_status_check
        CHECK (status IN ('active', 'redeemed', 'revoked'));
      UPDATE public.drink_tickets SET status='active' WHERE status='issued';
      UPDATE public.drink_tickets SET status='revoked' WHERE status='void';
      ALTER TABLE public.drink_tickets ALTER COLUMN status SET DEFAULT 'active';
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='drink_tickets' AND column_name='redemption_method'
    ) THEN
      ALTER TABLE public.drink_tickets DROP CONSTRAINT IF EXISTS drink_tickets_redemption_method_check;
      ALTER TABLE public.drink_tickets ADD CONSTRAINT drink_tickets_redemption_method_check
        CHECK (redemption_method IS NULL OR redemption_method IN ('nfc_tag','qr','manual','device_emulation'));
    END IF;
    ALTER TABLE public.drink_tickets ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drink_tickets' AND column_name = 'event_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS tickets_event_idx ON public.drink_tickets(event_id);
  END IF;
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drink_tickets' AND column_name = 'guest_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS tickets_guest_idx ON public.drink_tickets(guest_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.nfc_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  station_label TEXT NOT NULL,
  payload_id TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.nfc_tags ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'nfc_tags' AND column_name = 'event_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS nfc_tags_event_idx ON public.nfc_tags(event_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.ticket_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.drink_tickets(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  redeemed_by UUID REFERENCES public.profiles(id),
  method TEXT NOT NULL CHECK (method IN ('nfc_tag','qr','manual','device_emulation')),
  station_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_redemptions ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ticket_redemptions' AND column_name = 'event_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS redemptions_event_idx ON public.ticket_redemptions(event_id);
  END IF;
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ticket_redemptions' AND column_name = 'ticket_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS redemptions_ticket_idx ON public.ticket_redemptions(ticket_id);
  END IF;
END $$;

DROP POLICY IF EXISTS "Events: organizer manage" ON public.events;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'organizer_id'
  ) THEN
    CREATE POLICY "Events: organizer manage"
      ON public.events FOR ALL TO authenticated
      USING (organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin'))
      WITH CHECK (organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin'));
  END IF;
END $$;

DROP POLICY IF EXISTS "Events: guests view own" ON public.events;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'id'
  ) THEN
    CREATE POLICY "Events: guests view own"
      ON public.events FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM public.event_guests eg WHERE eg.event_id = id AND eg.guest_id = auth.uid()));
  END IF;
END $$;

DROP POLICY IF EXISTS "Events: bartenders view active" ON public.events;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'status'
  ) THEN
    CREATE POLICY "Events: bartenders view active"
      ON public.events FOR SELECT TO authenticated
      USING (public.has_role(auth.uid(), 'bartender') AND status = 'published');
  END IF;
END $$;

DROP POLICY IF EXISTS "EventGuests: organizer manage" ON public.event_guests;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'event_guests' AND column_name = 'event_id'
  ) THEN
    CREATE POLICY "EventGuests: organizer manage"
      ON public.event_guests FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))))
      WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))));
  END IF;
END $$;

DROP POLICY IF EXISTS "EventGuests: guest view self" ON public.event_guests;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'event_guests' AND column_name = 'guest_id'
  ) THEN
    CREATE POLICY "EventGuests: guest view self"
      ON public.event_guests FOR SELECT TO authenticated
      USING (guest_id = auth.uid());
  END IF;
END $$;

DROP POLICY IF EXISTS "EventGuests: bartender view" ON public.event_guests;
CREATE POLICY "EventGuests: bartender view"
  ON public.event_guests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'bartender'));

DROP POLICY IF EXISTS "Tickets: organizer manage" ON public.drink_tickets;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drink_tickets' AND column_name = 'event_id'
  ) THEN
    CREATE POLICY "Tickets: organizer manage"
      ON public.drink_tickets FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))))
      WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))));
  END IF;
END $$;

DROP POLICY IF EXISTS "Tickets: guest view self" ON public.drink_tickets;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'drink_tickets' AND column_name = 'guest_id'
  ) THEN
    CREATE POLICY "Tickets: guest view self"
      ON public.drink_tickets FOR SELECT TO authenticated
      USING (guest_id = auth.uid());
  END IF;
END $$;

DROP POLICY IF EXISTS "Tickets: bartender view" ON public.drink_tickets;
CREATE POLICY "Tickets: bartender view"
  ON public.drink_tickets FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'bartender'));

DROP POLICY IF EXISTS "Tags: organizer manage" ON public.nfc_tags;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'nfc_tags' AND column_name = 'event_id'
  ) THEN
    CREATE POLICY "Tags: organizer manage"
      ON public.nfc_tags FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))))
      WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))));
  END IF;
END $$;

DROP POLICY IF EXISTS "Tags: guest view" ON public.nfc_tags;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'nfc_tags' AND column_name = 'active'
  ) AND EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'nfc_tags' AND column_name = 'event_id'
  ) THEN
    CREATE POLICY "Tags: guest view"
      ON public.nfc_tags FOR SELECT TO authenticated
      USING (active AND EXISTS (SELECT 1 FROM public.event_guests eg WHERE eg.event_id = nfc_tags.event_id AND eg.guest_id = auth.uid()));
  END IF;
END $$;

DROP POLICY IF EXISTS "Tags: bartender view" ON public.nfc_tags;
CREATE POLICY "Tags: bartender view"
  ON public.nfc_tags FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'bartender'));

DROP POLICY IF EXISTS "Redemptions: organizer view" ON public.ticket_redemptions;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ticket_redemptions' AND column_name = 'event_id'
  ) THEN
    CREATE POLICY "Redemptions: organizer view"
      ON public.ticket_redemptions FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))));
  END IF;
END $$;

DROP POLICY IF EXISTS "Redemptions: guest view self" ON public.ticket_redemptions;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'ticket_redemptions' AND column_name = 'guest_id'
  ) THEN
    CREATE POLICY "Redemptions: guest view self"
      ON public.ticket_redemptions FOR SELECT TO authenticated
      USING (guest_id = auth.uid());
  END IF;
END $$;

DROP POLICY IF EXISTS "Redemptions: bartender view" ON public.ticket_redemptions;
CREATE POLICY "Redemptions: bartender view"
  ON public.ticket_redemptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'bartender'));

CREATE OR REPLACE FUNCTION public.redeem_ticket(
  _token TEXT,
  _method TEXT,
  _station_label TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE PLPGSQL
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

  IF caller_role = 'guest' AND ticket.guest_id <> caller THEN
    RETURN jsonb_build_object('ok', false, 'code', 'forbidden', 'message', 'Not your ticket.');
  END IF;

  IF ticket.status = 'redeemed' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'already_redeemed', 'message', 'Ticket already redeemed.', 'redeemed_at', ticket.redeemed_at);
  END IF;

  IF ticket.status = 'revoked' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'void', 'message', 'Ticket is revoked.');
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

REVOKE ALL ON FUNCTION public.redeem_ticket(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_ticket(TEXT, TEXT, TEXT) TO authenticated;
