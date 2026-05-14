
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS builder_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS slug text;

-- Backfill slugs for existing events
UPDATE public.events
SET slug = lower(regexp_replace(coalesce(title, 'event'), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(id::text, 1, 6)
WHERE slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS events_slug_key ON public.events (slug);
