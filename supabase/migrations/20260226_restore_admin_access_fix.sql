-- Migration: Assign Elite/Admin Roles in New System
-- Date: 2026-02-26

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 1. Identify the user ID
    SELECT user_id INTO target_user_id FROM profiles WHERE email = 'agendanutrijulianamoreira@gmail.com' LIMIT 1;
    
    IF target_user_id IS NOT NULL THEN
        -- 2. Ensure legacy role and tier are set (redundancy)
        UPDATE profiles 
        SET role = 'admin', 
            membership_tier = 'elite' 
        WHERE user_id = target_user_id;

        -- 3. Insert into the NEW user_roles table
        -- Insert 'admin' role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;

        -- Insert 'elite' role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'elite')
        ON CONFLICT (user_id, role) DO NOTHING;

        RAISE NOTICE 'User agendanutrijulianamoreira@gmail.com is now Admin and Elite in the new system.';
    ELSE
        RAISE WARNING 'User agendanutrijulianamoreira@gmail.com not found in profiles.';
    END IF;
END $$;
