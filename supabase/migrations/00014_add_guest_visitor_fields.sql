-- Add guest visitor fields to visits table
-- This allows scheduling visits without requiring user authentication

ALTER TABLE visits
ADD COLUMN IF NOT EXISTS visitor_name TEXT,
ADD COLUMN IF NOT EXISTS visitor_email TEXT,
ADD COLUMN IF NOT EXISTS visitor_phone TEXT;

-- Make user_id optional (already nullable, but ensure it)
-- Visits can now be created by guests with contact info instead of user_id

-- Update RLS policy to allow guest visit creation
DROP POLICY IF EXISTS "Anyone can create visits" ON visits;
CREATE POLICY "Anyone can create visits" ON visits
    FOR INSERT
    WITH CHECK (true);

-- Admins can view all visits
DROP POLICY IF EXISTS "Admins can view all visits" ON visits;
CREATE POLICY "Admins can view all visits" ON visits
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Users can view their own visits
DROP POLICY IF EXISTS "Users can view own visits" ON visits;
CREATE POLICY "Users can view own visits" ON visits
    FOR SELECT
    USING (user_id = auth.uid());
