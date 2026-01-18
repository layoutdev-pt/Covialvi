-- Change default status from 'draft' to 'published'
-- All new properties will be published by default

ALTER TABLE properties 
ALTER COLUMN status SET DEFAULT 'published';
