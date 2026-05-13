
-- ============================================================
-- Ticket Test Harness — isolated tt_* tables and RPCs
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tt_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tap_station_mode text NOT NULL DEFAULT 'auto_redeem' CHECK (tap_station_mode IN ('auto_redeem','staff_confirm')),
  is_test boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tt_guest_passes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.tt_events(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Demo Guest',
  guest_email text,
  manual_code text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tt_drink_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.tt_events(id) ON DELETE CASCADE,
  guest_pass_id uuid NOT NULL REFERENCES public.tt_guest_passes(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'unused' CHECK (status IN ('unused','pending','redeemed','expired','cancelled')),
  public_code text NOT NULL DEFAULT encode(extensions.gen_random_bytes(8),'hex'),
  redeemed_at timestamptz,
  redemption_method text,
  redemption_station_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tt_drink_units_pass_status_idx ON public.tt_drink_units (guest_pass_id, status);

CREATE TABLE IF NOT EXISTS public.tt_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.tt_events(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  station_type text NOT NULL DEFAULT 'bar',
  station_secret_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, slug)
);

CREATE TABLE IF NOT EXISTS public.tt_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.tt_events(id) ON DELETE CASCADE,
  guest_pass_id uuid NOT NULL REFERENCES public.tt_guest_passes(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','station_tapped','awaiting_staff_confirmation','redeemed','expired','cancelled')),
  expires_at timestamptz NOT NULL,
  station_id uuid REFERENCES public.tt_stations(id) ON DELETE SET NULL,
  ticket_unit_id uuid REFERENCES public.tt_drink_units(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  tapped_at timestamptz,
  redeemed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS tt_intents_pass_status_idx ON public.tt_intents (guest_pass_id, status);

CREATE TABLE IF NOT EXISTS public.tt_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.tt_events(id) ON DELETE CASCADE,
  guest_pass_id uuid NOT NULL REFERENCES public.tt_guest_passes(id) ON DELETE CASCADE,
  ticket_unit_id uuid REFERENCES public.tt_drink_units(id) ON DELETE SET NULL,
  method text NOT NULL,
  station_id uuid REFERENCES public.tt_stations(id) ON DELETE SET NULL,
  redeemed_by text,
  redeemed_at timestamptz NOT NULL DEFAULT now(),
  result text NOT NULL,
  device_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS tt_redemptions_event_idx ON public.tt_redemptions (event_id, redeemed_at DESC);

-- RLS: enabled with permissive policies for the test harness
ALTER TABLE public.tt_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_guest_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_drink_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tt_redemptions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['tt_events','tt_guest_passes','tt_drink_units','tt_stations','tt_intents','tt_redemptions'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "tt_read" ON public.%I', t);
    EXECUTE format('CREATE POLICY "tt_read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
  END LOOP;
END $$;

-- ============================================================
-- RPCs
-- ============================================================

CREATE OR REPLACE FUNCTION public.tt_seed_demo()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  ev public.tt_events;
  pass public.tt_guest_passes;
  station public.tt_stations;
  raw_secret text;
  i int;
BEGIN
  SELECT * INTO ev FROM public.tt_events WHERE slug = 'ticket-test';
  IF ev.id IS NULL THEN
    INSERT INTO public.tt_events (slug, name) VALUES ('ticket-test','Sera Ticket Test Event') RETURNING * INTO ev;
  END IF;

  SELECT * INTO pass FROM public.tt_guest_passes WHERE event_id = ev.id ORDER BY created_at LIMIT 1;
  IF pass.id IS NULL THEN
    INSERT INTO public.tt_guest_passes (event_id, display_name, manual_code)
    VALUES (ev.id, 'Demo Guest', upper(substr(encode(extensions.gen_random_bytes(4),'hex'),1,6)))
    RETURNING * INTO pass;
  END IF;

  -- Top up to 5 unused units
  i := (SELECT count(*) FROM public.tt_drink_units WHERE guest_pass_id = pass.id AND status = 'unused');
  WHILE i < 5 LOOP
    INSERT INTO public.tt_drink_units (event_id, guest_pass_id) VALUES (ev.id, pass.id);
    i := i + 1;
  END LOOP;

  SELECT * INTO station FROM public.tt_stations WHERE event_id = ev.id AND slug = 'bar-1';
  raw_secret := NULL;
  IF station.id IS NULL THEN
    raw_secret := encode(extensions.gen_random_bytes(16),'hex');
    INSERT INTO public.tt_stations (event_id, name, slug, station_type, station_secret_hash)
    VALUES (ev.id, 'Bar 1', 'bar-1', 'bar', encode(extensions.digest(raw_secret,'sha256'),'hex'))
    RETURNING * INTO station;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'event_id', ev.id,
    'pass_id', pass.id,
    'manual_code', pass.manual_code,
    'station_id', station.id,
    'station_slug', station.slug,
    'station_secret', raw_secret,  -- only present on first creation
    'tap_station_mode', ev.tap_station_mode
  );
END $$;

CREATE OR REPLACE FUNCTION public.tt_reset_demo()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  ev public.tt_events;
  result jsonb;
BEGIN
  SELECT * INTO ev FROM public.tt_events WHERE slug = 'ticket-test';
  IF ev.id IS NOT NULL THEN
    DELETE FROM public.tt_events WHERE id = ev.id;
  END IF;
  result := public.tt_seed_demo();
  RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.tt_set_mode(_event_id uuid, _mode text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _mode NOT IN ('auto_redeem','staff_confirm') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_mode');
  END IF;
  UPDATE public.tt_events SET tap_station_mode = _mode, updated_at = now() WHERE id = _event_id;
  RETURN jsonb_build_object('ok', true, 'mode', _mode);
END $$;

CREATE OR REPLACE FUNCTION public.tt_add_units(_pass_id uuid, _count int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pass public.tt_guest_passes;
  i int := 0;
BEGIN
  SELECT * INTO pass FROM public.tt_guest_passes WHERE id = _pass_id;
  IF pass.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;
  WHILE i < GREATEST(_count,0) LOOP
    INSERT INTO public.tt_drink_units (event_id, guest_pass_id) VALUES (pass.event_id, pass.id);
    i := i + 1;
  END LOOP;
  RETURN jsonb_build_object('ok', true, 'added', i);
END $$;

-- Expire any stale intents for a pass
CREATE OR REPLACE FUNCTION public._tt_expire_stale(_pass_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Release any held units on expired intents back to unused
  UPDATE public.tt_drink_units u
  SET status = 'unused', updated_at = now()
  FROM public.tt_intents i
  WHERE i.guest_pass_id = _pass_id
    AND i.status IN ('pending','station_tapped','awaiting_staff_confirmation')
    AND i.expires_at < now()
    AND u.id = i.ticket_unit_id
    AND u.status = 'pending';

  UPDATE public.tt_intents
  SET status = 'expired'
  WHERE guest_pass_id = _pass_id
    AND status IN ('pending','station_tapped','awaiting_staff_confirmation')
    AND expires_at < now();
END $$;

CREATE OR REPLACE FUNCTION public.tt_get_pass_state(_pass_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pass public.tt_guest_passes;
  ev public.tt_events;
  total int; used int; remaining int;
  active_intent jsonb;
  recent jsonb;
  station public.tt_stations;
BEGIN
  PERFORM public._tt_expire_stale(_pass_id);

  SELECT * INTO pass FROM public.tt_guest_passes WHERE id = _pass_id;
  IF pass.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;
  SELECT * INTO ev FROM public.tt_events WHERE id = pass.event_id;
  SELECT * INTO station FROM public.tt_stations WHERE event_id = ev.id AND slug = 'bar-1';

  SELECT count(*) INTO total FROM public.tt_drink_units WHERE guest_pass_id = pass.id;
  SELECT count(*) INTO used FROM public.tt_drink_units WHERE guest_pass_id = pass.id AND status = 'redeemed';
  remaining := total - used;

  SELECT to_jsonb(i.*) INTO active_intent
  FROM public.tt_intents i
  WHERE i.guest_pass_id = pass.id
    AND i.status IN ('pending','station_tapped','awaiting_staff_confirmation')
  ORDER BY i.created_at DESC LIMIT 1;

  SELECT COALESCE(jsonb_agg(to_jsonb(r.*) ORDER BY r.redeemed_at DESC), '[]'::jsonb) INTO recent
  FROM (
    SELECT * FROM public.tt_redemptions WHERE guest_pass_id = pass.id ORDER BY redeemed_at DESC LIMIT 20
  ) r;

  RETURN jsonb_build_object(
    'ok', true,
    'event', to_jsonb(ev),
    'pass', to_jsonb(pass),
    'station', to_jsonb(station),
    'total', total,
    'used', used,
    'remaining', remaining,
    'active_intent', active_intent,
    'recent', recent
  );
END $$;

CREATE OR REPLACE FUNCTION public.tt_create_intent(_pass_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pass public.tt_guest_passes;
  remaining int;
  existing public.tt_intents;
  new_intent public.tt_intents;
BEGIN
  PERFORM public._tt_expire_stale(_pass_id);
  SELECT * INTO pass FROM public.tt_guest_passes WHERE id = _pass_id;
  IF pass.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;

  SELECT count(*) INTO remaining FROM public.tt_drink_units WHERE guest_pass_id = pass.id AND status = 'unused';
  IF remaining <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'code', 'no_tickets_remaining');
  END IF;

  SELECT * INTO existing FROM public.tt_intents
  WHERE guest_pass_id = pass.id AND status IN ('pending','station_tapped','awaiting_staff_confirmation')
  ORDER BY created_at DESC LIMIT 1;
  IF existing.id IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'intent', to_jsonb(existing), 'reused', true);
  END IF;

  INSERT INTO public.tt_intents (event_id, guest_pass_id, expires_at)
  VALUES (pass.event_id, pass.id, now() + interval '90 seconds')
  RETURNING * INTO new_intent;

  RETURN jsonb_build_object('ok', true, 'intent', to_jsonb(new_intent));
END $$;

CREATE OR REPLACE FUNCTION public.tt_cancel_intent(_intent_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i public.tt_intents;
BEGIN
  SELECT * INTO i FROM public.tt_intents WHERE id = _intent_id FOR UPDATE;
  IF i.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;
  IF i.ticket_unit_id IS NOT NULL THEN
    UPDATE public.tt_drink_units SET status = 'unused', updated_at = now()
    WHERE id = i.ticket_unit_id AND status = 'pending';
  END IF;
  UPDATE public.tt_intents SET status = 'cancelled' WHERE id = i.id;
  RETURN jsonb_build_object('ok', true);
END $$;

-- Internal helper: lock and consume one unused unit atomically
CREATE OR REPLACE FUNCTION public._tt_lock_one_unit(_pass_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM public.tt_drink_units
  WHERE guest_pass_id = _pass_id AND status = 'unused'
  ORDER BY created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1;
  RETURN uid;
END $$;

CREATE OR REPLACE FUNCTION public.tt_tap_station(_station_slug text, _station_secret text, _pass_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  pass public.tt_guest_passes;
  ev public.tt_events;
  st public.tt_stations;
  intent public.tt_intents;
  unit_id uuid;
  total int; used int; remaining int;
BEGIN
  PERFORM public._tt_expire_stale(_pass_id);
  SELECT * INTO pass FROM public.tt_guest_passes WHERE id = _pass_id;
  IF pass.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;
  SELECT * INTO ev FROM public.tt_events WHERE id = pass.event_id;
  SELECT * INTO st FROM public.tt_stations WHERE event_id = ev.id AND slug = _station_slug AND is_active;
  IF st.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'invalid_station'); END IF;
  IF st.station_secret_hash <> encode(extensions.digest(coalesce(_station_secret,''),'sha256'),'hex') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'unauthorized');
  END IF;

  SELECT * INTO intent FROM public.tt_intents
  WHERE guest_pass_id = pass.id AND status IN ('pending','station_tapped')
  ORDER BY created_at DESC LIMIT 1
  FOR UPDATE;

  IF intent.id IS NULL THEN
    INSERT INTO public.tt_redemptions (event_id, guest_pass_id, method, station_id, result)
    VALUES (ev.id, pass.id, 'tap_station', st.id, 'invalid');
    RETURN jsonb_build_object('ok', false, 'code', 'no_active_intent', 'message', 'No active drink ticket. Press Use drink ticket first.');
  END IF;

  unit_id := public._tt_lock_one_unit(pass.id);
  IF unit_id IS NULL THEN
    INSERT INTO public.tt_redemptions (event_id, guest_pass_id, method, station_id, result)
    VALUES (ev.id, pass.id, 'tap_station', st.id, 'no_tickets_remaining');
    UPDATE public.tt_intents SET status = 'cancelled' WHERE id = intent.id;
    RETURN jsonb_build_object('ok', false, 'code', 'no_tickets_remaining');
  END IF;

  IF ev.tap_station_mode = 'auto_redeem' THEN
    UPDATE public.tt_drink_units SET status = 'redeemed', redeemed_at = now(),
      redemption_method = 'tap_station', redemption_station_id = st.id, updated_at = now()
    WHERE id = unit_id;
    UPDATE public.tt_intents SET status = 'redeemed', tapped_at = now(), redeemed_at = now(),
      station_id = st.id, ticket_unit_id = unit_id WHERE id = intent.id;
    INSERT INTO public.tt_redemptions (event_id, guest_pass_id, ticket_unit_id, method, station_id, result)
    VALUES (ev.id, pass.id, unit_id, 'tap_station', st.id, 'success');
  ELSE
    -- staff_confirm: hold the unit
    UPDATE public.tt_drink_units SET status = 'pending', updated_at = now() WHERE id = unit_id;
    UPDATE public.tt_intents SET status = 'awaiting_staff_confirmation', tapped_at = now(),
      station_id = st.id, ticket_unit_id = unit_id WHERE id = intent.id;
  END IF;

  SELECT count(*) INTO total FROM public.tt_drink_units WHERE guest_pass_id = pass.id;
  SELECT count(*) INTO used FROM public.tt_drink_units WHERE guest_pass_id = pass.id AND status = 'redeemed';
  remaining := total - used;

  RETURN jsonb_build_object('ok', true, 'mode', ev.tap_station_mode, 'unit_id', unit_id,
    'total', total, 'used', used, 'remaining', remaining);
END $$;

CREATE OR REPLACE FUNCTION public.tt_confirm_intent(_intent_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i public.tt_intents;
  total int; used int;
BEGIN
  SELECT * INTO i FROM public.tt_intents WHERE id = _intent_id FOR UPDATE;
  IF i.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;
  IF i.status <> 'awaiting_staff_confirmation' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'invalid_state');
  END IF;
  IF i.ticket_unit_id IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'no_unit'); END IF;

  UPDATE public.tt_drink_units SET status = 'redeemed', redeemed_at = now(),
    redemption_method = 'tap_station', redemption_station_id = i.station_id, updated_at = now()
  WHERE id = i.ticket_unit_id;
  UPDATE public.tt_intents SET status = 'redeemed', redeemed_at = now() WHERE id = i.id;
  INSERT INTO public.tt_redemptions (event_id, guest_pass_id, ticket_unit_id, method, station_id, result)
  VALUES (i.event_id, i.guest_pass_id, i.ticket_unit_id, 'tap_station', i.station_id, 'success');

  SELECT count(*) INTO total FROM public.tt_drink_units WHERE guest_pass_id = i.guest_pass_id;
  SELECT count(*) INTO used FROM public.tt_drink_units WHERE guest_pass_id = i.guest_pass_id AND status = 'redeemed';
  RETURN jsonb_build_object('ok', true, 'remaining', total - used, 'used', used, 'total', total);
END $$;

CREATE OR REPLACE FUNCTION public.tt_reject_intent(_intent_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE i public.tt_intents;
BEGIN
  SELECT * INTO i FROM public.tt_intents WHERE id = _intent_id FOR UPDATE;
  IF i.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;
  IF i.ticket_unit_id IS NOT NULL THEN
    UPDATE public.tt_drink_units SET status = 'unused', updated_at = now()
    WHERE id = i.ticket_unit_id AND status = 'pending';
  END IF;
  UPDATE public.tt_intents SET status = 'cancelled' WHERE id = i.id;
  INSERT INTO public.tt_redemptions (event_id, guest_pass_id, method, station_id, result, metadata)
  VALUES (i.event_id, i.guest_pass_id, 'tap_station', i.station_id, 'unauthorized', jsonb_build_object('reason','rejected_by_staff'));
  RETURN jsonb_build_object('ok', true);
END $$;

CREATE OR REPLACE FUNCTION public.tt_redeem_qr(_pass_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pass public.tt_guest_passes;
  unit_id uuid;
  total int; used int;
BEGIN
  SELECT * INTO pass FROM public.tt_guest_passes WHERE id = _pass_id;
  IF pass.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;
  unit_id := public._tt_lock_one_unit(pass.id);
  IF unit_id IS NULL THEN
    INSERT INTO public.tt_redemptions (event_id, guest_pass_id, method, result)
    VALUES (pass.event_id, pass.id, 'qr_scan', 'no_tickets_remaining');
    RETURN jsonb_build_object('ok', false, 'code', 'no_tickets_remaining');
  END IF;
  UPDATE public.tt_drink_units SET status = 'redeemed', redeemed_at = now(),
    redemption_method = 'qr_scan', updated_at = now() WHERE id = unit_id;
  INSERT INTO public.tt_redemptions (event_id, guest_pass_id, ticket_unit_id, method, result)
  VALUES (pass.event_id, pass.id, unit_id, 'qr_scan', 'success');
  SELECT count(*) INTO total FROM public.tt_drink_units WHERE guest_pass_id = pass.id;
  SELECT count(*) INTO used FROM public.tt_drink_units WHERE guest_pass_id = pass.id AND status = 'redeemed';
  RETURN jsonb_build_object('ok', true, 'unit_id', unit_id, 'remaining', total - used, 'used', used, 'total', total);
END $$;

CREATE OR REPLACE FUNCTION public.tt_redeem_manual(_manual_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pass public.tt_guest_passes;
  unit_id uuid;
  total int; used int;
BEGIN
  SELECT * INTO pass FROM public.tt_guest_passes WHERE upper(manual_code) = upper(coalesce(_manual_code,''));
  IF pass.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'invalid'); END IF;
  unit_id := public._tt_lock_one_unit(pass.id);
  IF unit_id IS NULL THEN
    INSERT INTO public.tt_redemptions (event_id, guest_pass_id, method, result)
    VALUES (pass.event_id, pass.id, 'manual_code', 'no_tickets_remaining');
    RETURN jsonb_build_object('ok', false, 'code', 'no_tickets_remaining');
  END IF;
  UPDATE public.tt_drink_units SET status = 'redeemed', redeemed_at = now(),
    redemption_method = 'manual_code', updated_at = now() WHERE id = unit_id;
  INSERT INTO public.tt_redemptions (event_id, guest_pass_id, ticket_unit_id, method, result)
  VALUES (pass.event_id, pass.id, unit_id, 'manual_code', 'success');
  SELECT count(*) INTO total FROM public.tt_drink_units WHERE guest_pass_id = pass.id;
  SELECT count(*) INTO used FROM public.tt_drink_units WHERE guest_pass_id = pass.id AND status = 'redeemed';
  RETURN jsonb_build_object('ok', true, 'pass_id', pass.id, 'remaining', total - used, 'used', used, 'total', total);
END $$;

CREATE OR REPLACE FUNCTION public.tt_get_bartender_state(_event_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ev public.tt_events;
  pending jsonb;
  recent jsonb;
BEGIN
  SELECT * INTO ev FROM public.tt_events WHERE slug = _event_slug;
  IF ev.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'code', 'not_found'); END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'intent', to_jsonb(i.*),
    'pass', to_jsonb(p.*),
    'remaining', (SELECT count(*) FROM public.tt_drink_units u WHERE u.guest_pass_id = p.id AND u.status IN ('unused','pending'))
  ) ORDER BY i.tapped_at DESC), '[]'::jsonb) INTO pending
  FROM public.tt_intents i
  JOIN public.tt_guest_passes p ON p.id = i.guest_pass_id
  WHERE i.event_id = ev.id AND i.status = 'awaiting_staff_confirmation';

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'redemption', to_jsonb(r.*),
    'pass_name', p.display_name
  ) ORDER BY r.redeemed_at DESC), '[]'::jsonb) INTO recent
  FROM (SELECT * FROM public.tt_redemptions WHERE event_id = ev.id ORDER BY redeemed_at DESC LIMIT 30) r
  LEFT JOIN public.tt_guest_passes p ON p.id = r.guest_pass_id;

  RETURN jsonb_build_object('ok', true, 'event', to_jsonb(ev), 'pending', pending, 'recent', recent);
END $$;

GRANT EXECUTE ON FUNCTION public.tt_seed_demo() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tt_reset_demo() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tt_set_mode(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tt_add_units(uuid, int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tt_get_pass_state(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tt_create_intent(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tt_cancel_intent(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tt_tap_station(text, text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tt_confirm_intent(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tt_reject_intent(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tt_redeem_qr(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tt_redeem_manual(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.tt_get_bartender_state(text) TO anon, authenticated;
