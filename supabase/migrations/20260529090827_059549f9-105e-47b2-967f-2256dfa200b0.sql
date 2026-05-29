
-- Extend events table for Event Studio
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_page_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'private_link';

CREATE UNIQUE INDEX IF NOT EXISTS events_slug_key ON public.events(slug) WHERE slug IS NOT NULL;

-- Allow anyone to read PUBLISHED events (guest microsite)
DROP POLICY IF EXISTS "Events: public read published" ON public.events;
CREATE POLICY "Events: public read published"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

GRANT SELECT ON public.events TO anon;

-- Guestbook entries
CREATE TABLE IF NOT EXISTS public.event_guestbook_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  guest_name text NOT NULL,
  message text NOT NULL,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.event_guestbook_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_guestbook_entries TO authenticated;
GRANT ALL ON public.event_guestbook_entries TO service_role;
ALTER TABLE public.event_guestbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guestbook: public read approved on published events"
  ON public.event_guestbook_entries FOR SELECT
  TO anon, authenticated
  USING (approved AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.status = 'published'));

CREATE POLICY "Guestbook: public insert on published events"
  ON public.event_guestbook_entries FOR INSERT
  TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.status = 'published'));

CREATE POLICY "Guestbook: organizer manage"
  ON public.event_guestbook_entries FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR has_role(auth.uid(), 'host_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR has_role(auth.uid(), 'host_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))));

-- Prompt responses
CREATE TABLE IF NOT EXISTS public.event_prompt_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  prompt_id text NOT NULL,
  prompt_label text NOT NULL,
  guest_name text NOT NULL,
  response text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.event_prompt_responses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_prompt_responses TO authenticated;
GRANT ALL ON public.event_prompt_responses TO service_role;
ALTER TABLE public.event_prompt_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prompts: public insert on published"
  ON public.event_prompt_responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.status = 'published'));

CREATE POLICY "Prompts: organizer read"
  ON public.event_prompt_responses FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR has_role(auth.uid(), 'host_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))));

CREATE POLICY "Prompts: organizer manage"
  ON public.event_prompt_responses FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR has_role(auth.uid(), 'host_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR has_role(auth.uid(), 'host_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))));

-- Event photos
CREATE TABLE IF NOT EXISTS public.event_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  guest_name text,
  image_url text NOT NULL,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.event_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_photos TO authenticated;
GRANT ALL ON public.event_photos TO service_role;
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos: public read approved on published"
  ON public.event_photos FOR SELECT
  TO anon, authenticated
  USING (approved AND EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.status = 'published'));

CREATE POLICY "Photos: public insert on published"
  ON public.event_photos FOR INSERT
  TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.status = 'published'));

CREATE POLICY "Photos: organizer manage"
  ON public.event_photos FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR has_role(auth.uid(), 'host_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND (e.organizer_id = auth.uid() OR has_role(auth.uid(), 'host_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role))));

-- Storage bucket for event photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-photos', 'event-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "event-photos public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-photos');

CREATE POLICY "event-photos public upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'event-photos');
