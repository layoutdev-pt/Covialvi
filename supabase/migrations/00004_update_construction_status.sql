-- Update construction_status enum to include more options
-- Migration: 00004_update_construction_status.sql

-- First, create new enum type with all options
CREATE TYPE construction_status_new AS ENUM (
  'new', 
  'used', 
  'under_construction', 
  'to_recover', 
  'renovated',
  'sold',
  'recovered',
  'in_project'
);

-- Update the column to use the new enum
ALTER TABLE properties 
ALTER COLUMN construction_status TYPE construction_status_new 
USING construction_status::text::construction_status_new;

-- Drop the old enum type
DROP TYPE construction_status;

-- Rename the new enum type
ALTER TYPE construction_status_new RENAME TO construction_status;
