-- ============================================
-- COMPLETE FIX FOR ADMIN AUTHENTICATION
-- ============================================
-- This script fixes:
-- 1. Infinite recursion in profiles RLS policies
-- 2. JWT role sync trigger
-- 3. Ensures admin users can access /admin
--
-- RUN THIS ENTIRE SCRIPT IN SUPABASE SQL EDITOR
-- ============================================

-- ============================================
-- STEP 1: FIX PROFILES RLS POLICIES
-- ============================================
-- The infinite recursion happens when a policy tries to check the user's role
-- by querying the profiles table, which triggers the same policy again.

-- First, disable RLS temporarily to fix policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles to start fresh
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- These policies only use auth.uid() which doesn't query any table

-- Policy for SELECT: Users can only see their own profile
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy for UPDATE: Users can only update their own profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy for INSERT: Users can only insert their own profile
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow service role to bypass RLS (for admin operations via service key)
-- This is already default behavior, but let's be explicit
GRANT ALL ON profiles TO service_role;

-- ============================================
-- STEP 2: CREATE JWT ROLE SYNC TRIGGER
-- ============================================
-- This ensures the user's role is included in the JWT token

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS sync_role_to_jwt_on_insert ON profiles;
DROP TRIGGER IF EXISTS sync_role_to_jwt_on_update ON profiles;
DROP FUNCTION IF EXISTS sync_role_to_jwt();

-- Create the sync function
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

-- Create trigger for INSERT
CREATE TRIGGER sync_role_to_jwt_on_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_jwt();

-- Create trigger for UPDATE on role column
CREATE TRIGGER sync_role_to_jwt_on_update
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION sync_role_to_jwt();

-- ============================================
-- STEP 3: BACKFILL EXISTING USERS
-- ============================================
-- Update all existing users to have their role in JWT

UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', p.role)
FROM profiles p
WHERE auth.users.id = p.id;

-- ============================================
-- STEP 4: SET YOUR USER AS SUPER_ADMIN
-- ============================================
-- Replace 'alexffb32@gmail.com' with your email if different

UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'alexffb32@gmail.com';

-- Also update the JWT for your user
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', 'super_admin')
WHERE email = 'alexffb32@gmail.com';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check that RLS policies are correct (should see 3 simple policies)
SELECT 
  policyname, 
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check your user's role in both tables
SELECT 
  u.email,
  u.raw_app_meta_data->>'role' as jwt_role,
  p.role as profile_role,
  CASE 
    WHEN u.raw_app_meta_data->>'role' = p.role THEN '✓ SYNCED'
    ELSE '✗ NOT SYNCED'
  END as status
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'alexffb32@gmail.com';

-- Check that the trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- ============================================
-- EXPECTED RESULTS AFTER RUNNING THIS SCRIPT:
-- ============================================
-- 1. profiles table has 3 simple RLS policies (select, update, insert)
-- 2. Your user shows jwt_role = 'super_admin' and profile_role = 'super_admin'
-- 3. Triggers sync_role_to_jwt_on_insert and sync_role_to_jwt_on_update exist
--
-- After running this, you MUST:
-- 1. Clear your browser cookies (or logout and login again)
-- 2. Login again to get a fresh JWT with the role
-- 3. Navigate to /admin - it should work now!
-- ============================================
