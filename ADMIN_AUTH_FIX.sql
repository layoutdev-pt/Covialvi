-- ============================================
-- COMPLETE ADMIN AUTHENTICATION FIX
-- ============================================
-- Run this entire script in Supabase SQL Editor to fix admin auth

-- Step 1: Ensure the sync function exists
CREATE OR REPLACE FUNCTION sync_role_to_jwt()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the auth.users app_metadata with the role from profiles
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop existing triggers if they exist (to avoid duplicates)
DROP TRIGGER IF EXISTS sync_role_to_jwt_on_insert ON profiles;
DROP TRIGGER IF EXISTS sync_role_to_jwt_on_update ON profiles;

-- Step 3: Create triggers
CREATE TRIGGER sync_role_to_jwt_on_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_jwt();

CREATE TRIGGER sync_role_to_jwt_on_update
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION sync_role_to_jwt();

-- Step 4: Backfill ALL existing users with their role in JWT
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', profiles.role)
FROM profiles
WHERE auth.users.id = profiles.id;

-- Step 5: Set YOUR user as super_admin (REPLACE WITH YOUR EMAIL)
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';  -- ⚠️ CHANGE THIS TO YOUR EMAIL

-- Step 6: Force sync your user's role to JWT
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', 'super_admin')
WHERE email = 'your-email@example.com';  -- ⚠️ CHANGE THIS TO YOUR EMAIL

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check your user's role in both tables
SELECT 
  u.id,
  u.email,
  u.raw_app_meta_data->>'role' as jwt_role,
  p.role as profile_role,
  CASE 
    WHEN u.raw_app_meta_data->>'role' = p.role THEN '✓ SYNCED'
    ELSE '✗ NOT SYNCED'
  END as status
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';  -- ⚠️ CHANGE THIS TO YOUR EMAIL

-- Check all users with admin roles
SELECT 
  u.id,
  u.email,
  u.raw_app_meta_data->>'role' as jwt_role,
  p.role as profile_role
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.role IN ('admin', 'super_admin')
ORDER BY u.email;

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- After running this script:
-- 1. jwt_role should equal profile_role
-- 2. Your user should show 'super_admin' in both columns
-- 3. Status should show '✓ SYNCED'
--
-- If not, there's an issue with the trigger or permissions
