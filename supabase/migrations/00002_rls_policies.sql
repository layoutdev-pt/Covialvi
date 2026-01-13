-- Covialvi Real Estate RLS Policies
-- Migration: 00002_rls_policies.sql

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_floor_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'super_admin'
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- PROFILES POLICIES
-- =====================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin());

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Super admins can update any profile
CREATE POLICY "Super admins can update any profile"
    ON profiles FOR UPDATE
    USING (is_super_admin());

-- =====================
-- PROPERTIES POLICIES
-- =====================

-- Anyone can view published properties
CREATE POLICY "Anyone can view published properties"
    ON properties FOR SELECT
    USING (status = 'published');

-- Admins can view all properties
CREATE POLICY "Admins can view all properties"
    ON properties FOR SELECT
    USING (is_admin());

-- Admins can insert properties
CREATE POLICY "Admins can insert properties"
    ON properties FOR INSERT
    WITH CHECK (is_admin());

-- Admins can update properties
CREATE POLICY "Admins can update properties"
    ON properties FOR UPDATE
    USING (is_admin());

-- Super admins can delete properties
CREATE POLICY "Super admins can delete properties"
    ON properties FOR DELETE
    USING (is_super_admin());

-- =====================
-- PROPERTY IMAGES POLICIES
-- =====================

-- Anyone can view images of published properties
CREATE POLICY "Anyone can view images of published properties"
    ON property_images FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM properties
            WHERE properties.id = property_images.property_id
            AND properties.status = 'published'
        )
    );

-- Admins can view all images
CREATE POLICY "Admins can view all images"
    ON property_images FOR SELECT
    USING (is_admin());

-- Admins can manage images
CREATE POLICY "Admins can insert images"
    ON property_images FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update images"
    ON property_images FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete images"
    ON property_images FOR DELETE
    USING (is_admin());

-- =====================
-- PROPERTY FLOOR PLANS POLICIES
-- =====================

-- Anyone can view floor plans of published properties
CREATE POLICY "Anyone can view floor plans of published properties"
    ON property_floor_plans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM properties
            WHERE properties.id = property_floor_plans.property_id
            AND properties.status = 'published'
        )
    );

-- Admins can view all floor plans
CREATE POLICY "Admins can view all floor plans"
    ON property_floor_plans FOR SELECT
    USING (is_admin());

-- Admins can manage floor plans
CREATE POLICY "Admins can insert floor plans"
    ON property_floor_plans FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update floor plans"
    ON property_floor_plans FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete floor plans"
    ON property_floor_plans FOR DELETE
    USING (is_admin());

-- =====================
-- FAVORITES POLICIES
-- =====================

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can remove own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can view all favorites
CREATE POLICY "Admins can view all favorites"
    ON favorites FOR SELECT
    USING (is_admin());

-- =====================
-- LEADS POLICIES
-- =====================

-- Admins can view all leads
CREATE POLICY "Admins can view all leads"
    ON leads FOR SELECT
    USING (is_admin());

-- Anyone can create leads (contact forms)
CREATE POLICY "Anyone can create leads"
    ON leads FOR INSERT
    WITH CHECK (TRUE);

-- Admins can update leads
CREATE POLICY "Admins can update leads"
    ON leads FOR UPDATE
    USING (is_admin());

-- Super admins can delete leads
CREATE POLICY "Super admins can delete leads"
    ON leads FOR DELETE
    USING (is_super_admin());

-- =====================
-- VISITS POLICIES
-- =====================

-- Users can view their own visits
CREATE POLICY "Users can view own visits"
    ON visits FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all visits
CREATE POLICY "Admins can view all visits"
    ON visits FOR SELECT
    USING (is_admin());

-- Authenticated users can create visits
CREATE POLICY "Authenticated users can create visits"
    ON visits FOR INSERT
    WITH CHECK (auth.uid() = user_id OR is_admin());

-- Users can update their own pending visits
CREATE POLICY "Users can update own pending visits"
    ON visits FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- Admins can update any visit
CREATE POLICY "Admins can update any visit"
    ON visits FOR UPDATE
    USING (is_admin());

-- Admins can delete visits
CREATE POLICY "Admins can delete visits"
    ON visits FOR DELETE
    USING (is_admin());

-- =====================
-- CRM NOTES POLICIES
-- =====================

-- Admins can view all CRM notes
CREATE POLICY "Admins can view all CRM notes"
    ON crm_notes FOR SELECT
    USING (is_admin());

-- Admins can create CRM notes
CREATE POLICY "Admins can create CRM notes"
    ON crm_notes FOR INSERT
    WITH CHECK (is_admin() AND auth.uid() = author_id);

-- Authors can update their own notes
CREATE POLICY "Authors can update own notes"
    ON crm_notes FOR UPDATE
    USING (auth.uid() = author_id);

-- Super admins can delete notes
CREATE POLICY "Super admins can delete notes"
    ON crm_notes FOR DELETE
    USING (is_super_admin());

-- =====================
-- AUDIT LOGS POLICIES
-- =====================

-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin());

-- No one can modify audit logs (immutable)
-- Insert is handled by the log_audit_event function with SECURITY DEFINER

-- =====================
-- USER SESSIONS POLICIES
-- =====================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
    ON user_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- Users can delete their own sessions (logout)
CREATE POLICY "Users can delete own sessions"
    ON user_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
    ON user_sessions FOR SELECT
    USING (is_admin());

-- =====================
-- SAVED SEARCHES POLICIES
-- =====================

-- Users can view their own saved searches
CREATE POLICY "Users can view own saved searches"
    ON saved_searches FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create saved searches
CREATE POLICY "Users can create saved searches"
    ON saved_searches FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own saved searches
CREATE POLICY "Users can update own saved searches"
    ON saved_searches FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own saved searches
CREATE POLICY "Users can delete own saved searches"
    ON saved_searches FOR DELETE
    USING (auth.uid() = user_id);

-- =====================
-- STORAGE POLICIES
-- =====================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('property-documents', 'property-documents', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for property-images bucket
CREATE POLICY "Anyone can view property images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'property-images');

CREATE POLICY "Admins can upload property images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'property-images' AND is_admin());

CREATE POLICY "Admins can update property images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'property-images' AND is_admin());

CREATE POLICY "Admins can delete property images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'property-images' AND is_admin());

-- Storage policies for property-documents bucket
CREATE POLICY "Anyone can view property documents"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'property-documents');

CREATE POLICY "Admins can upload property documents"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'property-documents' AND is_admin());

CREATE POLICY "Admins can delete property documents"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'property-documents' AND is_admin());

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
