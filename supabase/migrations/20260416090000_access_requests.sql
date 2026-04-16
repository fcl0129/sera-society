-- Access request workflow + master approval support

CREATE TABLE IF NOT EXISTS public.app_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  owner_notification_email TEXT NOT NULL DEFAULT 'admin@serasociety.com',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Master can read app settings"
    ON public.app_settings FOR SELECT
    USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'master');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Master can update app settings"
    ON public.app_settings FOR UPDATE
    USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'master')
    WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'master');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  events_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decision_note TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can create access request"
    ON public.access_requests FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Master can read access requests"
    ON public.access_requests FOR SELECT
    USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'master');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Master can update access requests"
    ON public.access_requests FOR UPDATE
    USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'master')
    WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'master');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_access_requests_created_at
  ON public.access_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_requests_status
  ON public.access_requests(status);

CREATE OR REPLACE FUNCTION public.enqueue_access_request_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  owner_email TEXT;
  message_id TEXT;
BEGIN
  SELECT owner_notification_email
    INTO owner_email
  FROM public.app_settings
  WHERE id = 1;

  IF owner_email IS NULL OR owner_email = '' THEN
    owner_email := 'admin@serasociety.com';
  END IF;

  message_id := gen_random_uuid()::text;

  INSERT INTO public.email_send_log (message_id, template_name, recipient_email, status, metadata)
  VALUES (
    message_id,
    'access_request',
    owner_email,
    'pending',
    jsonb_build_object(
      'request_id', NEW.id,
      'requester_email', NEW.email
    )
  );

  PERFORM pgmq.send(
    'transactional_emails',
    jsonb_build_object(
      'run_id', message_id,
      'message_id', message_id,
      'to', owner_email,
      'from', 'Sera Society <noreply@serasociety.com>',
      'sender_domain', 'admin.serasociety.com',
      'subject', 'Ny ansökan om access till Sera Society',
      'html', format(
        '<h2>Ny ansökan mottagen</h2><p><strong>Namn:</strong> %s</p><p><strong>E-post:</strong> %s</p><p><strong>Event:</strong> %s</p><p>Öppna adminpanelen för att godkänna eller avslå ansökan.</p>',
        NEW.name,
        NEW.email,
        coalesce(NEW.events_details, '—')
      ),
      'text', format(
        'Ny ansökan mottagen.\nNamn: %s\nE-post: %s\nEvent: %s\nÖppna adminpanelen för att godkänna eller avslå ansökan.',
        NEW.name,
        NEW.email,
        coalesce(NEW.events_details, '—')
      ),
      'label', 'access_request',
      'queued_at', now()
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enqueue_access_request_email ON public.access_requests;
CREATE TRIGGER trg_enqueue_access_request_email
AFTER INSERT ON public.access_requests
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_access_request_email();
