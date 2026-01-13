-- Update construction_status enum to use Portuguese values
-- Migration: 00005_update_construction_status_pt.sql

-- First, create new enum type with Portuguese values
CREATE TYPE construction_status_new AS ENUM (
  'usado', 
  'vendido', 
  'renovado',
  'recuperado',
  'por_recuperar',
  'novo',
  'em_projeto',
  'em_construcao'
);

-- Update the column to use the new enum (convert old values to new)
ALTER TABLE properties 
ALTER COLUMN construction_status TYPE TEXT;

UPDATE properties SET construction_status = 
  CASE construction_status
    WHEN 'used' THEN 'usado'
    WHEN 'sold' THEN 'vendido'
    WHEN 'renovated' THEN 'renovado'
    WHEN 'recovered' THEN 'recuperado'
    WHEN 'to_recover' THEN 'por_recuperar'
    WHEN 'new' THEN 'novo'
    WHEN 'in_project' THEN 'em_projeto'
    WHEN 'under_construction' THEN 'em_construcao'
    ELSE 'usado'
  END;

ALTER TABLE properties 
ALTER COLUMN construction_status TYPE construction_status_new 
USING construction_status::construction_status_new;

-- Drop the old enum type if it exists
DROP TYPE IF EXISTS construction_status;

-- Rename the new enum type
ALTER TYPE construction_status_new RENAME TO construction_status;
