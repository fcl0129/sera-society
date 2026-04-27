-- Fix recursive/cross-recursive RLS around events/event_guests and related event-owned tables.
-- This migration introduces SECURITY DEFINER authorization helpers and rewires policies to use them.

-- -----------------------------------------------------------------------------
-- Authorization helper functions (RLS-safe)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_host_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN _user_id IS NULL THEN false
      ELSE EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = _user_id
          AND p.role::text IN ('host_admin', 'admin')
      )
    END;
$$;

CREATE OR REPLACE FUNCTION public.is_event_organizer(_event_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN _user_id IS NULL OR _event_id IS NULL THEN false
      ELSE EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = _event_id
          AND (
            e.organizer_id = _user_id
            OR public.is_host_admin(_user_id)
          )
      )
    END;
$$;

CREATE OR REPLACE FUNCTION public.is_event_guest(_event_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN _user_id IS NULL OR _event_id IS NULL THEN false
      ELSE EXISTS (
        SELECT 1
        FROM public.event_guests eg
        WHERE eg.event_id = _event_id
          AND eg.guest_id = _user_id
      )
    END;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_event(_event_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN _user_id IS NULL OR _event_id IS NULL THEN false
      ELSE public.is_event_organizer(_event_id, _user_id)
    END;
$$;

CREATE OR REPLACE FUNCTION public.can_view_event(_event_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN _user_id IS NULL OR _event_id IS NULL THEN false
      ELSE (
        public.can_manage_event(_event_id, _user_id)
        OR public.is_event_guest(_event_id, _user_id)
        OR EXISTS (
          SELECT 1
          FROM public.events e
          WHERE e.id = _event_id
            AND e.status = 'published'
            AND public.has_role(_user_id, 'bartender'::public.app_role)
        )
      )
    END;
$$;

-- -----------------------------------------------------------------------------
-- RLS policy rewiring for event-centered tables
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF to_regclass('public.events') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Events: organizer manage" ON public.events;
    DROP POLICY IF EXISTS "Events: guests view own" ON public.events;
    DROP POLICY IF EXISTS "Events: bartenders view active" ON public.events;

    CREATE POLICY "Events: organizer manage" ON public.events
      FOR ALL TO authenticated
      USING (public.can_manage_event(id, auth.uid()))
      WITH CHECK (
        (auth.uid() IS NOT NULL AND organizer_id = auth.uid())
        OR public.is_host_admin(auth.uid())
      );

    CREATE POLICY "Events: guests view own" ON public.events
      FOR SELECT TO authenticated
      USING (public.can_view_event(id, auth.uid()));

    CREATE POLICY "Events: bartenders view active" ON public.events
      FOR SELECT TO authenticated
      USING (
        public.has_role(auth.uid(), 'bartender'::public.app_role)
        AND status = 'published'
      );
  END IF;

  IF to_regclass('public.event_guests') IS NOT NULL THEN
    DROP POLICY IF EXISTS "EventGuests: organizer manage" ON public.event_guests;
    DROP POLICY IF EXISTS "EventGuests: guest view self" ON public.event_guests;
    DROP POLICY IF EXISTS "EventGuests: bartender view" ON public.event_guests;

    CREATE POLICY "EventGuests: organizer manage" ON public.event_guests
      FOR ALL TO authenticated
      USING (public.can_manage_event(event_id, auth.uid()))
      WITH CHECK (public.can_manage_event(event_id, auth.uid()));

    CREATE POLICY "EventGuests: guest view self" ON public.event_guests
      FOR SELECT TO authenticated
      USING (guest_id = auth.uid());

    CREATE POLICY "EventGuests: bartender view" ON public.event_guests
      FOR SELECT TO authenticated
      USING (
        public.has_role(auth.uid(), 'bartender'::public.app_role)
        AND public.can_view_event(event_id, auth.uid())
      );
  END IF;

  IF to_regclass('public.drink_tickets') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Tickets: organizer manage" ON public.drink_tickets;
    DROP POLICY IF EXISTS "Tickets: guest view self" ON public.drink_tickets;
    DROP POLICY IF EXISTS "Tickets: bartender view" ON public.drink_tickets;

    CREATE POLICY "Tickets: organizer manage" ON public.drink_tickets
      FOR ALL TO authenticated
      USING (public.can_manage_event(event_id, auth.uid()))
      WITH CHECK (public.can_manage_event(event_id, auth.uid()));

    CREATE POLICY "Tickets: guest view self" ON public.drink_tickets
      FOR SELECT TO authenticated
      USING (
        guest_id = auth.uid()
        OR (
          event_guest_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM public.event_guests eg
            WHERE eg.id = public.drink_tickets.event_guest_id
              AND eg.guest_id = auth.uid()
          )
        )
      );

    CREATE POLICY "Tickets: bartender view" ON public.drink_tickets
      FOR SELECT TO authenticated
      USING (
        public.has_role(auth.uid(), 'bartender'::public.app_role)
        AND public.can_view_event(event_id, auth.uid())
      );
  END IF;

  IF to_regclass('public.nfc_tags') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Tags: organizer manage" ON public.nfc_tags;
    DROP POLICY IF EXISTS "Tags: guest view" ON public.nfc_tags;
    DROP POLICY IF EXISTS "Tags: bartender view" ON public.nfc_tags;

    CREATE POLICY "Tags: organizer manage" ON public.nfc_tags
      FOR ALL TO authenticated
      USING (public.can_manage_event(event_id, auth.uid()))
      WITH CHECK (public.can_manage_event(event_id, auth.uid()));

    CREATE POLICY "Tags: guest view" ON public.nfc_tags
      FOR SELECT TO authenticated
      USING (
        active
        AND public.is_event_guest(event_id, auth.uid())
      );

    CREATE POLICY "Tags: bartender view" ON public.nfc_tags
      FOR SELECT TO authenticated
      USING (
        public.has_role(auth.uid(), 'bartender'::public.app_role)
        AND public.can_view_event(event_id, auth.uid())
      );
  END IF;

  IF to_regclass('public.ticket_redemptions') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Redemptions: organizer view" ON public.ticket_redemptions;
    DROP POLICY IF EXISTS "Redemptions: guest view self" ON public.ticket_redemptions;
    DROP POLICY IF EXISTS "Redemptions: bartender view" ON public.ticket_redemptions;

    CREATE POLICY "Redemptions: organizer view" ON public.ticket_redemptions
      FOR SELECT TO authenticated
      USING (public.can_manage_event(event_id, auth.uid()));

    CREATE POLICY "Redemptions: guest view self" ON public.ticket_redemptions
      FOR SELECT TO authenticated
      USING (guest_id = auth.uid());

    CREATE POLICY "Redemptions: bartender view" ON public.ticket_redemptions
      FOR SELECT TO authenticated
      USING (
        public.has_role(auth.uid(), 'bartender'::public.app_role)
        AND public.can_view_event(event_id, auth.uid())
      );
  END IF;

  IF to_regclass('public.checkins') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Chk: organizer manage" ON public.checkins;
    DROP POLICY IF EXISTS "Chk: bartender read" ON public.checkins;

    CREATE POLICY "Chk: organizer manage" ON public.checkins
      FOR ALL TO authenticated
      USING (public.can_manage_event(event_id, auth.uid()))
      WITH CHECK (public.can_manage_event(event_id, auth.uid()));

    CREATE POLICY "Chk: bartender read" ON public.checkins
      FOR SELECT TO authenticated
      USING (
        public.has_role(auth.uid(), 'bartender'::public.app_role)
        AND public.can_view_event(event_id, auth.uid())
      );
  END IF;

  IF to_regclass('public.seating_tables') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Seat: organizer manage" ON public.seating_tables;

    CREATE POLICY "Seat: organizer manage" ON public.seating_tables
      FOR ALL TO authenticated
      USING (public.can_manage_event(event_id, auth.uid()))
      WITH CHECK (public.can_manage_event(event_id, auth.uid()));
  END IF;

  IF to_regclass('public.seating_assignments') IS NOT NULL THEN
    DROP POLICY IF EXISTS "SeatA: organizer manage" ON public.seating_assignments;

    CREATE POLICY "SeatA: organizer manage" ON public.seating_assignments
      FOR ALL TO authenticated
      USING (public.can_manage_event(event_id, auth.uid()))
      WITH CHECK (public.can_manage_event(event_id, auth.uid()));
  END IF;

  IF to_regclass('public.event_messages') IS NOT NULL THEN
    DROP POLICY IF EXISTS "EvMsg: organizer manage" ON public.event_messages;

    CREATE POLICY "EvMsg: organizer manage" ON public.event_messages
      FOR ALL TO authenticated
      USING (public.can_manage_event(event_id, auth.uid()))
      WITH CHECK (public.can_manage_event(event_id, auth.uid()));
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- Manual smoke checklist (post-migration)
-- 1) authenticated organizer can create event
-- 2) organizer can select own event immediately after insert
-- 3) organizer can add guest
-- 4) guest can RSVP via token
-- 5) /pass/:token loads without auth via get_guest_pass_by_token
-- 6) organizer can issue drink ticket to accepted accountless guest
-- 7) bartender can redeem ticket once
-- 8) second redemption returns already_redeemed
-- -----------------------------------------------------------------------------
