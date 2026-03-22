-- Migration: Gamification (Badges & Stats)
-- Created: 2026-03-21
-- Description: Add level, exp, tier to account_profile and create user_badge table

-- 1. Add columns to account_profile
ALTER TABLE public.account_profile 
ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS exp INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS point INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS tier_name VARCHAR(20) DEFAULT 'BRONZE';

-- 2. Create user_badge table
CREATE TABLE IF NOT EXISTS public.user_badge (
  user_badge_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_id     UUID         NOT NULL REFERENCES public.account,
  badge_id       VARCHAR(50)  NOT NULL,
  achieved_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_badge UNIQUE (account_id, badge_id)
);

-- 3. Enable RLS on user_badge
ALTER TABLE public.user_badge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
  ON public.user_badge FOR SELECT
  USING (auth.uid() = account_id);

-- Update handle_new_user trigger to set default stats
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.account (account_id, email, is_admin)
  VALUES (new.id, new.email, false)
  ON CONFLICT (account_id) DO NOTHING;
  
  INSERT INTO public.account_profile (account_id, display_name, level, exp, point, tier_name)
  VALUES (new.id, split_part(new.email, '@', 1), 1, 0, 0, 'BRONZE')
  ON CONFLICT (account_id) DO NOTHING;

  INSERT INTO public.notification_setting (account_id)
  VALUES (new.id)
  ON CONFLICT (account_id) DO NOTHING;

  -- Starting badge
  INSERT INTO public.user_badge (account_id, badge_id)
  VALUES (new.id, 'pioneer')
  ON CONFLICT (account_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
