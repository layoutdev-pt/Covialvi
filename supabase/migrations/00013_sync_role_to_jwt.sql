-- ============================================
-- Sync user role to JWT app_metadata
-- ============================================
-- This migration creates a trigger that automatically syncs the user's role
-- from the profiles table to the auth.users app_metadata, which is included
-- in the JWT token.

-- Function to sync role to JWT app_metadata
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

-- Trigger to sync role on profile insert
CREATE TRIGGER sync_role_to_jwt_on_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_role_to_jwt();

-- Trigger to sync role on profile update
CREATE TRIGGER sync_role_to_jwt_on_update
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW
  WHEN (OLD.role IS DISTINCT FROM NEW.role)
  EXECUTE FUNCTION sync_role_to_jwt();

-- ============================================
-- Backfill existing users
-- ============================================
-- Update all existing users to have their role in app_metadata
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', profiles.role)
FROM profiles
WHERE auth.users.id = profiles.id;

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify roles are synced:
-- SELECT 
--   u.id,
--   u.email,
--   u.raw_app_meta_data->>'role' as jwt_role,
--   p.role as profile_role
-- FROM auth.users u
-- JOIN profiles p ON u.id = p.id
-- LIMIT 10;
