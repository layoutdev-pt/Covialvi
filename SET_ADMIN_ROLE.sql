-- ============================================
-- SET YOUR USER AS SUPER ADMIN
-- ============================================
-- Run this in Supabase SQL Editor to grant admin access
-- Replace 'your-email@example.com' with your actual email

UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, role, first_name, last_name, created_at
FROM profiles 
WHERE email = 'your-email@example.com';

-- ============================================
-- ALTERNATIVE: Set by user ID if you know it
-- ============================================
-- UPDATE profiles 
-- SET role = 'super_admin' 
-- WHERE id = 'your-user-uuid-here';
