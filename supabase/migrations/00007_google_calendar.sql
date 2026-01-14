-- Google Calendar Integration
-- Migration: 00007_google_calendar.sql

-- Create google_tokens table for storing OAuth tokens
CREATE TABLE IF NOT EXISTS google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  scope TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add index for faster lookups
CREATE INDEX idx_google_tokens_user_id ON google_tokens(user_id);
CREATE INDEX idx_google_tokens_expires_at ON google_tokens(expires_at);

-- Enable RLS
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access tokens (server-side only)
-- No direct user access to tokens for security
CREATE POLICY "Service role can manage google tokens"
  ON google_tokens
  FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- Revoke all access from anon and authenticated roles
REVOKE ALL ON google_tokens FROM anon, authenticated;

-- Grant access only to service role
GRANT ALL ON google_tokens TO service_role;

-- Add google_event_id column to visits table for tracking calendar events
ALTER TABLE visits ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- Add updated_at trigger for google_tokens
CREATE OR REPLACE FUNCTION update_google_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER google_tokens_updated_at
  BEFORE UPDATE ON google_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_google_tokens_updated_at();
