-- Migration: Add Admin Role and Infinite Credits
-- Date: 2026-02-26

-- 1. Add role column to profiles if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pf_columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
    END IF;
END $$;

-- 2. Set the specific user as admin
-- Note: We use the email to find the user_id
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT user_id INTO target_user_id FROM profiles WHERE email = 'agendanutrijulianamoreira@gmail.com' LIMIT 1;
    
    IF target_user_id IS NOT NULL THEN
        -- Set role to admin
        UPDATE profiles SET role = 'admin' WHERE user_id = target_user_id;
        
        -- Grant "infinite" credits (set to a very high number)
        INSERT INTO user_credits (user_id, credits)
        VALUES (target_user_id, 999999)
        ON CONFLICT (user_id) DO UPDATE SET credits = 999999, updated_at = NOW();
        
        RAISE NOTICE 'User agendanutrijulianamoreira@gmail.com is now Admin with 999,999 credits.';
    ELSE
        RAISE WARNING 'User agendanutrijulianamoreira@gmail.com not found in profiles table.';
    END IF;
END $$;
