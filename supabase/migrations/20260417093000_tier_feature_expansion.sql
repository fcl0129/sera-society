-- Tier feature expansion (Essential, Social, Host, Occasions)

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'essential' CHECK (tier IN ('essential', 'social', 'host', 'occasions')),
  ADD COLUMN IF NOT EXISTS reminder_days INT[] NOT NULL DEFAULT ARRAY[3],
  ADD COLUMN IF NOT EXISTS rsvp_cutoff_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contact_host_email TEXT,
  ADD COLUMN IF NOT EXISTS test_mode BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.event_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'host_message' CHECK (channel IN ('host_message', 'sms', 'email', 'chat')),
  body TEXT NOT NULL,
  sent_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.event_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Organizers can manage event messages for own events"
    ON public.event_messages FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = event_messages.event_id
          AND e.organizer_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = event_messages.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_event_messages_event ON public.event_messages(event_id);

DO $$
BEGIN
  ALTER TABLE public.event_staff_roles DROP CONSTRAINT IF EXISTS event_staff_roles_role_check;
  ALTER TABLE public.event_staff_roles
    ADD CONSTRAINT event_staff_roles_role_check
    CHECK (role IN ('organizer', 'door', 'bartender', 'host', 'viewer'));
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.seating_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  seat_count INT NOT NULL CHECK (seat_count > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, label)
);

ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Organizers can manage seating tables for own events"
    ON public.seating_tables FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = seating_tables.event_id
          AND e.organizer_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = seating_tables.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.seating_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  seating_table_id UUID NOT NULL REFERENCES public.seating_tables(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, guest_id)
);

ALTER TABLE public.seating_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Organizers can manage seating assignments for own events"
    ON public.seating_assignments FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = seating_assignments.event_id
          AND e.organizer_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = seating_assignments.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_seating_tables_event ON public.seating_tables(event_id);
CREATE INDEX IF NOT EXISTS idx_seating_assignments_event ON public.seating_assignments(event_id);

CREATE TABLE IF NOT EXISTS public.event_timeline_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('timeline', 'checklist')),
  starts_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.event_timeline_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Organizers can manage timeline items for own events"
    ON public.event_timeline_items FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = event_timeline_items.event_id
          AND e.organizer_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = event_timeline_items.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_event_timeline_items_event ON public.event_timeline_items(event_id);

CREATE TABLE IF NOT EXISTS public.event_post_event_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.event_post_event_summaries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Organizers can manage post-event summaries for own events"
    ON public.event_post_event_summaries FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = event_post_event_summaries.event_id
          AND e.organizer_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = event_post_event_summaries.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_event_post_event_summaries_event ON public.event_post_event_summaries(event_id);
