
-- Grants for previously-existing tables that have RLS but no Data API privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seating_tables TO authenticated;
GRANT ALL ON public.seating_tables TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seating_assignments TO authenticated;
GRANT ALL ON public.seating_assignments TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_messages TO authenticated;
GRANT ALL ON public.event_messages TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wrapped_summaries TO authenticated;
GRANT ALL ON public.wrapped_summaries TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_roles TO authenticated;
GRANT ALL ON public.staff_roles TO service_role;

-- Wrapped recap: add a host note + published flag
ALTER TABLE public.wrapped_summaries
  ADD COLUMN IF NOT EXISTS custom_note text,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS wrapped_summaries_event_unique ON public.wrapped_summaries(event_id);

-- Public RPC: fetch wrapped recap by guest RSVP token (post-event guest experience).
CREATE OR REPLACE FUNCTION public.get_wrapped_by_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g RECORD;
  e RECORD;
  w RECORD;
  attended int;
  invited int;
  accepted int;
  tickets_total int;
  tickets_redeemed int;
BEGIN
  SELECT * INTO g FROM public.event_guests WHERE rsvp_token = _token;
  IF g.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found');
  END IF;

  SELECT id, title, starts_at, ends_at, venue, description, cover_image_url, status
    INTO e FROM public.events WHERE id = g.event_id;

  SELECT * INTO w FROM public.wrapped_summaries WHERE event_id = g.event_id;

  SELECT count(*) INTO invited FROM public.event_guests WHERE event_id = g.event_id;
  SELECT count(*) INTO accepted FROM public.event_guests WHERE event_id = g.event_id AND rsvp_status = 'accepted';
  SELECT count(DISTINCT c.guest_id) INTO attended FROM public.checkins c WHERE c.event_id = g.event_id;
  SELECT count(*) INTO tickets_total FROM public.drink_tickets WHERE event_id = g.event_id AND status <> 'void';
  SELECT count(*) INTO tickets_redeemed FROM public.drink_tickets WHERE event_id = g.event_id AND status = 'redeemed';

  RETURN jsonb_build_object(
    'ok', true,
    'event', to_jsonb(e),
    'guest', jsonb_build_object(
      'id', g.id,
      'full_name', g.full_name,
      'invited_email', g.invited_email,
      'rsvp_status', g.rsvp_status
    ),
    'wrapped', CASE WHEN w.id IS NULL THEN NULL ELSE jsonb_build_object(
      'custom_note', w.custom_note,
      'is_published', w.is_published,
      'summary', w.summary,
      'created_at', w.created_at,
      'updated_at', w.updated_at
    ) END,
    'stats', jsonb_build_object(
      'invited', invited,
      'accepted', accepted,
      'attended', attended,
      'tickets_total', tickets_total,
      'tickets_redeemed', tickets_redeemed
    )
  );
END;
$$;

-- Public RPC: fetch host broadcasts by guest token (rendered on the guest pass).
CREATE OR REPLACE FUNCTION public.get_broadcasts_by_token(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  g RECORD;
  rows jsonb;
BEGIN
  SELECT id, event_id INTO g FROM public.event_guests WHERE rsvp_token = _token;
  IF g.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'not_found');
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', m.id,
    'body', m.body,
    'channel', m.channel,
    'created_at', m.created_at
  ) ORDER BY m.created_at DESC), '[]'::jsonb) INTO rows
  FROM public.event_messages m
  WHERE m.event_id = g.event_id;

  RETURN jsonb_build_object('ok', true, 'messages', rows);
END;
$$;

-- Trigger to keep wrapped_summaries.updated_at in sync
DROP TRIGGER IF EXISTS wrapped_summaries_touch ON public.wrapped_summaries;
CREATE TRIGGER wrapped_summaries_touch
  BEFORE UPDATE ON public.wrapped_summaries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
