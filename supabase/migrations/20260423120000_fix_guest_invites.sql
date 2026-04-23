-- Fix: allow inviting guests before they have accounts

-- 1. Allow guest_id to be nullable
ALTER TABLE public.event_guests
  ALTER COLUMN guest_id DROP NOT NULL;

-- 2. Backfill guest_id where a matching profile already exists
UPDATE public.event_guests eg
SET guest_id = p.id
FROM public.profiles p
WHERE eg.guest_id IS NULL
  AND p.email IS NOT NULL
  AND lower(trim(p.email)) = lower(trim(eg.invited_email));

-- 3. Update handle_new_user trigger to auto-link invites by email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');

  -- Link any existing invitations for this email
  UPDATE public.event_guests
  SET guest_id = new.id
  WHERE guest_id IS NULL
    AND lower(trim(invited_email)) = lower(trim(new.email));

  RETURN new;
END;
$$;
