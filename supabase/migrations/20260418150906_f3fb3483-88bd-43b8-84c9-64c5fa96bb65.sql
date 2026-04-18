-- Roles enum
CREATE TYPE public.app_role AS ENUM ('guest', 'bartender', 'host_admin');

-- Profiles table (NEVER reference auth.users via FK from app tables; use user_id text join)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.app_role NOT NULL DEFAULT 'guest',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX profiles_email_idx ON public.profiles (lower(email));

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security definer role checker (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
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
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Auto-create profile on signup, with admin allowlist
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
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Profiles RLS
CREATE POLICY "Profiles: self-read" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "Profiles: admin-read-all" ON public.profiles FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'host_admin'));
CREATE POLICY "Profiles: bartender-read-all" ON public.profiles FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'bartender'));
CREATE POLICY "Profiles: self-update-name" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Profiles: admin-update" ON public.profiles FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'host_admin')) WITH CHECK (public.has_role(auth.uid(), 'host_admin'));

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  venue TEXT,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX events_organizer_idx ON public.events(organizer_id);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER events_touch BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Event guests
CREATE TABLE public.event_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  tier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, guest_id)
);
CREATE INDEX event_guests_event_idx ON public.event_guests(event_id);
CREATE INDEX event_guests_guest_idx ON public.event_guests(guest_id);
ALTER TABLE public.event_guests ENABLE ROW LEVEL SECURITY;

-- Drink tickets
CREATE TABLE public.drink_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18), 'base64'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','redeemed','void')),
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID REFERENCES public.profiles(id),
  redemption_method TEXT CHECK (redemption_method IN ('nfc_tag','qr','manual','device_emulation')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX tickets_event_idx ON public.drink_tickets(event_id);
CREATE INDEX tickets_guest_idx ON public.drink_tickets(guest_id);
ALTER TABLE public.drink_tickets ENABLE ROW LEVEL SECURITY;

-- NFC tags
CREATE TABLE public.nfc_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  station_label TEXT NOT NULL,
  payload_id TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX nfc_tags_event_idx ON public.nfc_tags(event_id);
ALTER TABLE public.nfc_tags ENABLE ROW LEVEL SECURITY;

-- Ticket redemptions audit log
CREATE TABLE public.ticket_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.drink_tickets(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  redeemed_by UUID REFERENCES public.profiles(id),
  method TEXT NOT NULL CHECK (method IN ('nfc_tag','qr','manual','device_emulation')),
  station_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX redemptions_event_idx ON public.ticket_redemptions(event_id);
CREATE INDEX redemptions_ticket_idx ON public.ticket_redemptions(ticket_id);
ALTER TABLE public.ticket_redemptions ENABLE ROW LEVEL SECURITY;

-- ===== EVENTS RLS =====
CREATE POLICY "Events: organizer manage"
  ON public.events FOR ALL TO authenticated
  USING (organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin'))
  WITH CHECK (organizer_id = auth.uid() OR public.has_role(auth.uid(), 'host_admin'));

CREATE POLICY "Events: guests view own"
  ON public.events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.event_guests eg WHERE eg.event_id = id AND eg.guest_id = auth.uid()));

CREATE POLICY "Events: bartenders view active"
  ON public.events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'bartender') AND status = 'published');

-- ===== EVENT_GUESTS RLS =====
CREATE POLICY "EventGuests: organizer manage"
  ON public.event_guests FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))));

CREATE POLICY "EventGuests: guest view self"
  ON public.event_guests FOR SELECT TO authenticated
  USING (guest_id = auth.uid());

CREATE POLICY "EventGuests: bartender view"
  ON public.event_guests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'bartender'));

-- ===== DRINK_TICKETS RLS =====
CREATE POLICY "Tickets: organizer manage"
  ON public.drink_tickets FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))));

CREATE POLICY "Tickets: guest view self"
  ON public.drink_tickets FOR SELECT TO authenticated
  USING (guest_id = auth.uid());

CREATE POLICY "Tickets: bartender view"
  ON public.drink_tickets FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'bartender'));

-- ===== NFC_TAGS RLS =====
CREATE POLICY "Tags: organizer manage"
  ON public.nfc_tags FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))));

CREATE POLICY "Tags: guest view"
  ON public.nfc_tags FOR SELECT TO authenticated
  USING (active AND EXISTS (SELECT 1 FROM public.event_guests eg WHERE eg.event_id = nfc_tags.event_id AND eg.guest_id = auth.uid()));

CREATE POLICY "Tags: bartender view"
  ON public.nfc_tags FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'bartender'));

-- ===== REDEMPTIONS RLS =====
CREATE POLICY "Redemptions: organizer view"
  ON public.ticket_redemptions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR public.has_role(auth.uid(),'host_admin'))));

CREATE POLICY "Redemptions: guest view self"
  ON public.ticket_redemptions FOR SELECT TO authenticated
  USING (guest_id = auth.uid());

CREATE POLICY "Redemptions: bartender view"
  ON public.ticket_redemptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'bartender'));

-- ===== REDEEM RPC: secure server-side redemption =====
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
  caller_role public.app_role;
BEGIN
  IF caller IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'unauthorized', 'message', 'Sign in required.');
  END IF;

  IF _method NOT IN ('nfc_tag','qr','manual','device_emulation') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_method', 'message', 'Invalid redemption method.');
  END IF;

  SELECT role INTO caller_role FROM public.profiles WHERE id = caller;

  -- Lock the ticket row to prevent double redemption
  SELECT * INTO ticket FROM public.drink_tickets WHERE token = _token FOR UPDATE;

  IF ticket.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid', 'message', 'Ticket not found.');
  END IF;

  -- Authorization: bartender/host_admin can redeem any ticket; guest can only redeem their own
  IF caller_role = 'guest' AND ticket.guest_id <> caller THEN
    RETURN jsonb_build_object('ok', false, 'code', 'forbidden', 'message', 'Not your ticket.');
  END IF;

  IF ticket.status = 'redeemed' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'already_redeemed', 'message', 'Ticket already redeemed.', 'redeemed_at', ticket.redeemed_at);
  END IF;

  IF ticket.status = 'void' THEN
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

REVOKE ALL ON FUNCTION public.redeem_ticket(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_ticket(TEXT, TEXT, TEXT) TO authenticated;