-- Fix for predefined sections in template_sections table
-- This script adds the necessary columns and constraints to handle predefined sections

-- Add new columns for predefined sections
ALTER TABLE template_sections 
ADD COLUMN IF NOT EXISTS section_type VARCHAR(50) DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS predefined_section VARCHAR(50);

-- Make section_id nullable for predefined sections
ALTER TABLE template_sections 
ALTER COLUMN section_id DROP NOT NULL;

-- Add constraint to ensure either section_id or predefined_section is set
ALTER TABLE template_sections 
DROP CONSTRAINT IF EXISTS template_sections_section_check;

ALTER TABLE template_sections 
ADD CONSTRAINT template_sections_section_check 
CHECK (
  (section_id IS NOT NULL AND predefined_section IS NULL) OR 
  (section_id IS NULL AND predefined_section IS NOT NULL)
);

-- Update existing records to have section_type = 'custom'
UPDATE template_sections 
SET section_type = 'custom' 
WHERE section_type IS NULL;

-- Add comments for the new columns
COMMENT ON COLUMN template_sections.section_type IS 'Type of section: custom or predefined';
COMMENT ON COLUMN template_sections.predefined_section IS 'Predefined section type: cover, pricing, cta';