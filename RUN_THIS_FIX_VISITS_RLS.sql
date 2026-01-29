-- Add guest visitor fields to visits table
ALTER TABLE visits
ADD COLUMN IF NOT EXISTS visitor_name TEXT,
ADD COLUMN IF NOT EXISTS visitor_email TEXT,
ADD COLUMN IF NOT EXISTS visitor_phone TEXT;

-- Drop known existing policies (safe, idempotent)
DROP POLICY IF EXISTS "Anyone can create visits" ON visits;
DROP POLICY IF EXISTS "Admins can view all visits" ON visits;
DROP POLICY IF EXISTS "Users can view own visits" ON visits;
DROP POLICY IF EXISTS "Users can create visits" ON visits;
DROP POLICY IF EXISTS "Authenticated users can create visits" ON visits;
DROP POLICY IF EXISTS "Admins can delete visits" ON visits;
DROP POLICY IF EXISTS "Admins can update visits" ON visits;
DROP POLICY IF EXISTS "View visits" ON visits;
DROP POLICY IF EXISTS "Update visits" ON visits;

-- Create new policy to allow ANYONE (including guests) to create visits
CREATE POLICY "Anyone can create visits" ON visits
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all visits
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
CREATE POLICY "Users can view own visits" ON visits
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can update visits
CREATE POLICY "Admins can update visits" ON visits
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can delete visits
CREATE POLICY "Admins can delete visits" ON visits
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
  );