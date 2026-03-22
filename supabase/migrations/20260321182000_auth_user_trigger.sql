-- Migration: Auth User Trigger to public.account
-- Created: 2026-03-21
-- Description: Trigger that automatically inserts a row into public.account when a new user signs up in auth.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.account (account_id, email, is_admin)
  VALUES (new.id, new.email, false)
  ON CONFLICT (account_id) DO NOTHING;
  
  -- Optionally create profile
  INSERT INTO public.account_profile (account_id, display_name)
  VALUES (new.id, 'New User')
  ON CONFLICT (account_id) DO NOTHING;

  -- Create notification setting default
  INSERT INTO public.notification_setting (account_id)
  VALUES (new.id)
  ON CONFLICT (account_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
