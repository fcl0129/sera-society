-- Core organizer entities for a functional post-login dashboard

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL,
  title TEXT NOT NULL,
  venue TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  capacity INT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Organizers can create own events"
    ON public.events FOR INSERT
    WITH CHECK (auth.uid() = organizer_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Organizers can read own events"
    ON public.events FOR SELECT
    USING (auth.uid() = organizer_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Organizers can update own events"
    ON public.events FOR UPDATE
    USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Organizers can delete own events"
    ON public.events FOR DELETE
    USING (auth.uid() = organizer_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON public.events(starts_at);

CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  rsvp_status TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'yes', 'no', 'maybe')),
  plus_ones INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Organizers can manage guests for own events"
    ON public.guests FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = guests.event_id
          AND e.organizer_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = guests.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_guests_event ON public.guests(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_rsvp_status ON public.guests(rsvp_status);

CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_in_by UUID
);

ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Organizers can manage checkins for own events"
    ON public.checkins FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = checkins.event_id
          AND e.organizer_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = checkins.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_checkins_event_guest_unique ON public.checkins(event_id, guest_id);

-- Keep updated_at fresh for events
CREATE OR REPLACE FUNCTION public.touch_events_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_events_updated_at ON public.events;
CREATE TRIGGER trg_touch_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.touch_events_updated_at();
