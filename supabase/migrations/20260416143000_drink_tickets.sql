-- Drink ticket configuration + redemption model (QR/NFC)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'events'
  ) THEN
    ALTER TABLE public.events
      ADD COLUMN IF NOT EXISTS enable_qr BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS enable_nfc BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.drink_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  ticket_code TEXT NOT NULL UNIQUE,
  nfc_tag TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'redeemed', 'void')),
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.drink_tickets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Organizers can manage drink tickets for own events" ON public.drink_tickets;
  CREATE POLICY "Organizers can manage drink tickets for own events"
    ON public.drink_tickets FOR ALL
    USING (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = drink_tickets.event_id
          AND e.organizer_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.events e
        WHERE e.id = drink_tickets.event_id
          AND e.organizer_id = auth.uid()
      )
    );
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_drink_tickets_event ON public.drink_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_drink_tickets_guest ON public.drink_tickets(guest_id);
CREATE INDEX IF NOT EXISTS idx_drink_tickets_status ON public.drink_tickets(status);
