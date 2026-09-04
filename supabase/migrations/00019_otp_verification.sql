-- Migration: 00019_otp_verification.sql
-- Creates the email_otps table for form submission verification

CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  form_type TEXT NOT NULL,           -- 'contact' | 'property' | 'visit' | 'evaluation'
  used BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by email
CREATE INDEX IF NOT EXISTS email_otps_email_idx ON public.email_otps (email);

-- Index for cleanup of expired records
CREATE INDEX IF NOT EXISTS email_otps_expires_idx ON public.email_otps (expires_at);

-- No RLS needed: accessed only via service role key from server-side APIs
-- Automatically delete expired OTPs (housekeeping)
-- This runs as a cleanup function triggered periodically or on insert
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.email_otps WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
