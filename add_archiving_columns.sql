-- Add archiving columns to existing pdf_templates table
-- Run this if you get the "column does not exist" error

-- Add the missing columns
ALTER TABLE pdf_templates 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Update the trigger function to handle archiving
CREATE OR REPLACE FUNCTION ensure_single_active_template()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a template as active, archive the current active template for the same simulator type
  IF NEW.is_active = TRUE THEN
    UPDATE pdf_templates 
    SET is_active = FALSE, is_archived = TRUE, archived_at = NOW(), updated_at = NOW()
    WHERE simulator_type = NEW.simulator_type 
    AND id != NEW.id
    AND is_active = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the restore function
CREATE OR REPLACE FUNCTION restore_archived_template(template_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  template_record RECORD;
BEGIN
  -- Get the template to restore
  SELECT * INTO template_record 
  FROM pdf_templates 
  WHERE id = template_id AND is_archived = TRUE;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Archive current active template for this simulator type
  UPDATE pdf_templates 
  SET is_active = FALSE, is_archived = TRUE, archived_at = NOW(), updated_at = NOW()
  WHERE simulator_type = template_record.simulator_type 
    AND is_active = TRUE;
  
  -- Restore the archived template
  UPDATE pdf_templates 
  SET is_active = TRUE, is_archived = FALSE, archived_at = NULL, updated_at = NOW()
  WHERE id = template_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for the new columns
COMMENT ON COLUMN pdf_templates.is_archived IS 'Flag indicating if template is archived (replaced by newer version)';
COMMENT ON COLUMN pdf_templates.archived_at IS 'Timestamp when template was archived';
