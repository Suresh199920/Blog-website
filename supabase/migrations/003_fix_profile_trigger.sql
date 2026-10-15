-- ============================================
-- FIX: profiles backfill trigger
-- ============================================
-- The trigger runs as the role that inserts into auth.users, and
-- profiles has RLS enabled with no INSERT policy. That makes the
-- backfill fail on every signup with
-- "Database error creating new user".
--
-- SECURITY DEFINER runs the insert as the function owner (postgres),
-- which bypasses the table's own RLS. search_path is pinned so the
-- function cannot be hijacked via a temporary schema.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.id::text || '@no-email.local'),
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), '')
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- A profile backfill problem must never block someone's signup.
  RETURN NEW;
END;
$$;