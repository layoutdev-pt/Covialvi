-- Add divisions column to properties table for storing room areas
ALTER TABLE properties ADD COLUMN IF NOT EXISTS divisions jsonb DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN properties.divisions IS 'JSON object storing room divisions with their areas, e.g. {"Sala": 25, "Quarto 1": 15}';
