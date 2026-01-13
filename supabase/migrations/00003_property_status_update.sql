-- Update property status enum to include more options
-- Migration: 00003_property_status_update.sql

-- First, create new enum type
CREATE TYPE property_status_new AS ENUM ('draft', 'published', 'archived', 'sold', 'reserved');

-- Update the column to use the new enum
ALTER TABLE properties 
ALTER COLUMN status TYPE property_status_new 
USING status::text::property_status_new;

-- Drop the old enum type
DROP TYPE property_status;

-- Rename the new enum type
ALTER TYPE property_status_new RENAME TO property_status;
