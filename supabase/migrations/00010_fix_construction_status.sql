-- Migration: 00010_fix_construction_status.sql
-- Purpose: Standardize construction_status to TEXT type with English keys
-- This fixes the enum mismatch between frontend and database

-- Step 1: Convert construction_status from ENUM to TEXT
ALTER TABLE properties 
ALTER COLUMN construction_status TYPE TEXT;

-- Step 2: Normalize any Portuguese values back to English keys
UPDATE properties SET construction_status = 
  CASE construction_status
    WHEN 'usado' THEN 'used'
    WHEN 'vendido' THEN 'used'
    WHEN 'renovado' THEN 'renovated'
    WHEN 'recuperado' THEN 'renovated'
    WHEN 'por_recuperar' THEN 'to_renovate'
    WHEN 'novo' THEN 'new'
    WHEN 'em_projeto' THEN 'under_construction'
    WHEN 'em_construcao' THEN 'under_construction'
    ELSE construction_status
  END
WHERE construction_status IS NOT NULL;

-- Step 3: Add check constraint for valid values
ALTER TABLE properties 
ADD CONSTRAINT chk_construction_status 
CHECK (construction_status IS NULL OR construction_status IN ('new', 'used', 'under_construction', 'renovated', 'to_renovate'));

-- Step 4: Drop old enum types if they exist
DROP TYPE IF EXISTS construction_status CASCADE;
DROP TYPE IF EXISTS construction_status_new CASCADE;

-- Step 5: Add comments for documentation
COMMENT ON COLUMN properties.construction_status IS 'Property construction status: new, used, under_construction, renovated, to_renovate';

