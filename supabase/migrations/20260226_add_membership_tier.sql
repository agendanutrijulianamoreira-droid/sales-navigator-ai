-- Migration: Add Membership Tier
-- Date: 2026-02-26

-- 1. Add membership_tier column to profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'membership_tier') THEN
        ALTER TABLE profiles ADD COLUMN membership_tier TEXT DEFAULT 'free';
    END IF;
END $$;

-- 2. Set the specific user as elite
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT user_id INTO target_user_id FROM profiles WHERE email = 'agendanutrijulianamoreira@gmail.com' LIMIT 1;
    
    IF target_user_id IS NOT NULL THEN
        UPDATE profiles SET membership_tier = 'elite' WHERE user_id = target_user_id;
        RAISE NOTICE 'User agendanutrijulianamoreira@gmail.com is now Elite.';
    END IF;
END $$;
