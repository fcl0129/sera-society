-- Ensure legacy projects have the events.description column used by host event creation.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'events'
  ) THEN
    ALTER TABLE public.events
      ADD COLUMN IF NOT EXISTS description TEXT;
  END IF;
END $$;
