-- ============================================================
-- Migration 00015: Normalise lead source values
-- Old values: 'property_page', 'contact_page'
-- New values: 'property', 'contact'
-- ============================================================

-- Backfill old source values to new canonical values
UPDATE leads
SET source = 'property'
WHERE source = 'property_page';

UPDATE leads
SET source = 'contact'
WHERE source IN ('contact_page', 'contact_form', 'homepage_sell_wizard', 'other')
  AND property_id IS NULL;

-- Add a comment documenting valid source values (informational only)
COMMENT ON COLUMN leads.source IS
  'Lead origin. Valid values: property (from a property page), contact (from the contact page), '
  'phone, email, referral, sell_wizard, other';
