
-- Update handle_new_user to assign admin role to allowlisted email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  assigned_role public.app_role := 'guest';
BEGIN
  IF lower(NEW.email) IN ('admin@serasociety.com') THEN
    assigned_role := 'admin';
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
$function$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END$$;

UPDATE public.profiles
SET role = 'admin'::public.app_role
WHERE lower(email) = 'admin@serasociety.com'
  AND role::text NOT IN ('admin','host_admin');

-- access_requests
CREATE TABLE IF NOT EXISTS public.access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  organization text,
  reason text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS access_requests_status_idx ON public.access_requests(status, created_at DESC);
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "AccessReq: anyone can submit" ON public.access_requests;
CREATE POLICY "AccessReq: anyone can submit" ON public.access_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "AccessReq: admins read" ON public.access_requests;
CREATE POLICY "AccessReq: admins read" ON public.access_requests
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role));

DROP POLICY IF EXISTS "AccessReq: admins update" ON public.access_requests;
CREATE POLICY "AccessReq: admins update" ON public.access_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role));

-- user_tier_access
CREATE TABLE IF NOT EXISTS public.user_tier_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  email text,
  max_tier text NOT NULL DEFAULT 'essential'
    CHECK (max_tier IN ('essential','social','host','occasions')),
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS user_tier_access_email_idx ON public.user_tier_access(lower(email));
CREATE INDEX IF NOT EXISTS user_tier_access_user_idx ON public.user_tier_access(user_id);
ALTER TABLE public.user_tier_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tier: self read" ON public.user_tier_access;
CREATE POLICY "Tier: self read" ON public.user_tier_access
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR lower(coalesce(email,'')) = lower(coalesce((auth.jwt() ->> 'email')::text, ''))
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
  );

DROP POLICY IF EXISTS "Tier: admin manage" ON public.user_tier_access;
CREATE POLICY "Tier: admin manage" ON public.user_tier_access
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role));

-- events: missing columns
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS capacity integer,
  ADD COLUMN IF NOT EXISTS enable_qr boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS enable_nfc boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'essential'
    CHECK (tier IN ('essential','social','host','occasions')),
  ADD COLUMN IF NOT EXISTS reminder_days integer[] DEFAULT ARRAY[3]::integer[],
  ADD COLUMN IF NOT EXISTS rsvp_cutoff_at timestamptz,
  ADD COLUMN IF NOT EXISTS contact_host_email text,
  ADD COLUMN IF NOT EXISTS test_mode boolean NOT NULL DEFAULT false;

-- events RLS: organizer + admin
DROP POLICY IF EXISTS "Events: organizer manage" ON public.events;
CREATE POLICY "Events: organizer manage" ON public.events
  FOR ALL TO authenticated
  USING (organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- Fix the broken Events: guests view own policy (eg.event_id = eg.id was wrong)
DROP POLICY IF EXISTS "Events: guests view own" ON public.events;
CREATE POLICY "Events: guests view own" ON public.events
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.event_guests eg
    WHERE eg.event_id = events.id AND eg.guest_id = auth.uid()
  ));

-- event_guests
ALTER TABLE public.event_guests
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS rsvp_status text NOT NULL DEFAULT 'pending'
    CHECK (rsvp_status IN ('pending','yes','no','maybe'));

ALTER TABLE public.event_guests ALTER COLUMN guest_id DROP NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='event_guests_event_id_guest_id_key'
  ) THEN
    ALTER TABLE public.event_guests DROP CONSTRAINT event_guests_event_id_guest_id_key;
  END IF;
END$$;

CREATE UNIQUE INDEX IF NOT EXISTS event_guests_event_email_uq
  ON public.event_guests(event_id, lower(invited_email));

DROP POLICY IF EXISTS "EventGuests: organizer manage" ON public.event_guests;
CREATE POLICY "EventGuests: organizer manage" ON public.event_guests
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_guests.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_guests.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))));

-- Supporting tables
CREATE TABLE IF NOT EXISTS public.event_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  body text NOT NULL,
  channel text NOT NULL DEFAULT 'broadcast',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.event_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "EvMsg: organizer manage" ON public.event_messages;
CREATE POLICY "EvMsg: organizer manage" ON public.event_messages
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_messages.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_messages.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))));

CREATE TABLE IF NOT EXISTS public.staff_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  staff_email text,
  role text NOT NULL DEFAULT 'host',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff: organizer manage" ON public.staff_roles;
CREATE POLICY "Staff: organizer manage" ON public.staff_roles
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = staff_roles.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = staff_roles.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))));

CREATE TABLE IF NOT EXISTS public.seating_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  label text NOT NULL,
  seat_count integer NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Seat: organizer manage" ON public.seating_tables;
CREATE POLICY "Seat: organizer manage" ON public.seating_tables
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = seating_tables.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = seating_tables.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))));

CREATE TABLE IF NOT EXISTS public.seating_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL REFERENCES public.event_guests(id) ON DELETE CASCADE,
  seating_table_id uuid NOT NULL REFERENCES public.seating_tables(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seating_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "SeatA: organizer manage" ON public.seating_assignments;
CREATE POLICY "SeatA: organizer manage" ON public.seating_assignments
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = seating_assignments.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = seating_assignments.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))));

CREATE TABLE IF NOT EXISTS public.timeline_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'timeline' CHECK (kind IN ('timeline','checklist')),
  starts_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "TL: organizer manage" ON public.timeline_items;
CREATE POLICY "TL: organizer manage" ON public.timeline_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = timeline_items.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = timeline_items.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))));

CREATE TABLE IF NOT EXISTS public.wrapped_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.wrapped_summaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Wrap: organizer manage" ON public.wrapped_summaries;
CREATE POLICY "Wrap: organizer manage" ON public.wrapped_summaries
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = wrapped_summaries.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = wrapped_summaries.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))));

CREATE TABLE IF NOT EXISTS public.checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL REFERENCES public.event_guests(id) ON DELETE CASCADE,
  checked_in_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, guest_id)
);
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Chk: organizer manage" ON public.checkins;
CREATE POLICY "Chk: organizer manage" ON public.checkins
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = checkins.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = checkins.event_id
    AND (e.organizer_id = auth.uid()
      OR public.has_role(auth.uid(), 'host_admin'::public.app_role)
      OR public.has_role(auth.uid(), 'admin'::public.app_role))));
DROP POLICY IF EXISTS "Chk: bartender read" ON public.checkins;
CREATE POLICY "Chk: bartender read" ON public.checkins
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'bartender'::public.app_role));
