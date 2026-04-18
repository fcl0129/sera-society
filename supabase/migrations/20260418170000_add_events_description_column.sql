-- Ensure legacy projects have the events.description column used by host event creation.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS description TEXT;
