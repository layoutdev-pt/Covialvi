-- Migration: Fix RLS performance and security warnings
-- This migration addresses Supabase linter warnings for:
-- 1. RLS policies using auth.uid() without (select auth.uid()) wrapper
-- 2. Multiple permissive policies on same table/action
-- 3. Overly permissive leads INSERT policy
-- 4. Missing foreign key indexes

-- ============================================
-- 1. FIX RLS INITPLAN WARNINGS
-- Wrap auth.uid() calls in (select ...) for better performance
-- ============================================

-- PROFILES TABLE
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = (SELECT auth.uid()));

-- FAVORITES TABLE
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
CREATE POLICY "Users can add favorites" ON favorites
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can remove own favorites" ON favorites;
CREATE POLICY "Users can remove own favorites" ON favorites
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- VISITS TABLE
DROP POLICY IF EXISTS "Users can view own visits" ON visits;
CREATE POLICY "Users can view own visits" ON visits
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create visits" ON visits;
CREATE POLICY "Authenticated users can create visits" ON visits
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own pending visits" ON visits;
CREATE POLICY "Users can update own pending visits" ON visits
  FOR UPDATE USING (user_id = (SELECT auth.uid()) AND status = 'pending');

-- CRM_NOTES TABLE
DROP POLICY IF EXISTS "Admins can create CRM notes" ON crm_notes;
CREATE POLICY "Admins can create CRM notes" ON crm_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND role IN ('admin', 'super_admin')
    )
  );

DROP POLICY IF EXISTS "Authors can update own notes" ON crm_notes;
CREATE POLICY "Authors can update own notes" ON crm_notes
  FOR UPDATE USING (author_id = (SELECT auth.uid()));

-- SAVED_SEARCHES TABLE
DROP POLICY IF EXISTS "Users can view own saved searches" ON saved_searches;
CREATE POLICY "Users can view own saved searches" ON saved_searches
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create saved searches" ON saved_searches;
CREATE POLICY "Users can create saved searches" ON saved_searches
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own saved searches" ON saved_searches;
CREATE POLICY "Users can update own saved searches" ON saved_searches
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own saved searches" ON saved_searches;
CREATE POLICY "Users can delete own saved searches" ON saved_searches
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- ============================================
-- 2. FIX MULTIPLE PERMISSIVE POLICIES
-- Consolidate overlapping policies into single policies with OR conditions
-- ============================================

-- PROFILES: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "View profiles" ON profiles
  FOR SELECT USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = (SELECT auth.uid()) 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- PROFILES: Consolidate UPDATE policies
DROP POLICY IF EXISTS "Super admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Update profiles" ON profiles
  FOR UPDATE USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = (SELECT auth.uid()) 
      AND p.role = 'super_admin'
    )
  );

-- FAVORITES: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all favorites" ON favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "View favorites" ON favorites
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = (SELECT auth.uid()) 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- PROPERTIES: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all properties" ON properties;
DROP POLICY IF EXISTS "Anyone can view published properties" ON properties;
CREATE POLICY "View properties" ON properties
  FOR SELECT USING (
    status = 'published'
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = (SELECT auth.uid()) 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- PROPERTY_IMAGES: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all images" ON property_images;
DROP POLICY IF EXISTS "Anyone can view images of published properties" ON property_images;
CREATE POLICY "View property images" ON property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties pr 
      WHERE pr.id = property_images.property_id 
      AND pr.status = 'published'
    )
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = (SELECT auth.uid()) 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- PROPERTY_FLOOR_PLANS: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all floor plans" ON property_floor_plans;
DROP POLICY IF EXISTS "Anyone can view floor plans of published properties" ON property_floor_plans;
CREATE POLICY "View floor plans" ON property_floor_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties pr 
      WHERE pr.id = property_floor_plans.property_id 
      AND pr.status = 'published'
    )
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = (SELECT auth.uid()) 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- VISITS: Consolidate SELECT policies
DROP POLICY IF EXISTS "Admins can view all visits" ON visits;
DROP POLICY IF EXISTS "Users can view own visits" ON visits;
CREATE POLICY "View visits" ON visits
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = (SELECT auth.uid()) 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- VISITS: Consolidate UPDATE policies
DROP POLICY IF EXISTS "Admins can update any visit" ON visits;
DROP POLICY IF EXISTS "Users can update own pending visits" ON visits;
CREATE POLICY "Update visits" ON visits
  FOR UPDATE USING (
    (user_id = (SELECT auth.uid()) AND status = 'pending')
    OR EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = (SELECT auth.uid()) 
      AND p.role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- 3. FIX OVERLY PERMISSIVE LEADS INSERT POLICY
-- Add basic validation instead of allowing anyone
-- ============================================

DROP POLICY IF EXISTS "Anyone can create leads" ON leads;
CREATE POLICY "Anyone can create leads" ON leads
  FOR INSERT WITH CHECK (
    -- Require at least email or phone to be provided
    (email IS NOT NULL AND email != '') 
    OR (phone IS NOT NULL AND phone != '')
  );

-- ============================================
-- 4. ADD MISSING FOREIGN KEY INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_crm_notes_author_id ON crm_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_leads_property_id ON leads(property_id);
CREATE INDEX IF NOT EXISTS idx_properties_created_by ON properties(created_by);
CREATE INDEX IF NOT EXISTS idx_property_floor_plans_property_id ON property_floor_plans(property_id);
CREATE INDEX IF NOT EXISTS idx_visits_lead_id ON visits(lead_id);

-- ============================================
-- 5. MANUAL ACTION REQUIRED
-- ============================================
-- Enable Leaked Password Protection in Supabase Dashboard:
-- Authentication → Providers → Email → Enable "Leaked Password Protection"
