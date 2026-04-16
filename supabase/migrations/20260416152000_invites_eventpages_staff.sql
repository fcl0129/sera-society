-- Invitation builder, guest-facing event page editor, and staff role assignment

CREATE TABLE IF NOT EXISTS public.invitation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL,
  name TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'editorial',
  primary_color TEXT NOT NULL DEFAULT '#7A2231',
  accent_color TEXT NOT NULL DEFAULT '#D4B48C',
  typography TEXT NOT NULL DEFAULT 'serif',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invitation_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Organizers can manage own invitation templates"
    ON public.invitation_templates FOR ALL
    USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_invitation_templates_organizer ON public.invitation_templates(organizer_id);

CREATE TABLE IF NOT EXISTS public.event_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE REFERENCES public.events(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  headline TEXT NOT NULL,
  description TEXT,
  dress_code TEXT,
  location_notes TEXT,
  hero_image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.event_pages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Organizers can manage event pages for own events"
    ON public.event_pages FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = event_pages.event_id
          AND e.organizer_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = event_pages.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_event_pages_event ON public.event_pages(event_id);
CREATE INDEX IF NOT EXISTS idx_event_pages_slug ON public.event_pages(slug);

CREATE TABLE IF NOT EXISTS public.event_staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  staff_user_id UUID,
  staff_email TEXT,
  role TEXT NOT NULL CHECK (role IN ('organizer', 'door', 'bartender', 'host')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT event_staff_identifier_required CHECK (staff_user_id IS NOT NULL OR staff_email IS NOT NULL)
);

ALTER TABLE public.event_staff_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Organizers can manage staff roles for own events"
    ON public.event_staff_roles FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = event_staff_roles.event_id
          AND e.organizer_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = event_staff_roles.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_event_staff_roles_event ON public.event_staff_roles(event_id);
