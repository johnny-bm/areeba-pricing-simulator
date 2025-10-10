-- PDF Builder System Database Schema
-- This file creates the complete database schema for the PDF builder system
-- Includes tables for content sections, templates, and generated PDFs

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for section types
CREATE TYPE section_type AS ENUM (
  'title',
  'description', 
  'image',
  'table',
  'bullet_list',
  'callout'
);

-- Create content_sections table - Reusable content blocks
CREATE TABLE content_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  section_type section_type NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create pdf_templates table - Template definitions mapped to simulators
CREATE TABLE pdf_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name TEXT NOT NULL,
  simulator_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create template_sections table - Junction table linking templates to sections with ordering
CREATE TABLE template_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES pdf_templates(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES content_sections(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, section_id)
);

-- Create generated_pdfs table - History of generated PDFs
CREATE TABLE generated_pdfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES pdf_templates(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  simulator_type TEXT NOT NULL,
  pricing_data JSONB NOT NULL DEFAULT '{}',
  pdf_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_content_sections_type ON content_sections(section_type);
CREATE INDEX idx_content_sections_created_by ON content_sections(created_by);
CREATE INDEX idx_content_sections_created_at ON content_sections(created_at);

CREATE INDEX idx_pdf_templates_simulator_type ON pdf_templates(simulator_type);
CREATE INDEX idx_pdf_templates_is_active ON pdf_templates(is_active);
CREATE INDEX idx_pdf_templates_created_by ON pdf_templates(created_by);
CREATE INDEX idx_pdf_templates_created_at ON pdf_templates(created_at);

CREATE INDEX idx_template_sections_template_id ON template_sections(template_id);
CREATE INDEX idx_template_sections_section_id ON template_sections(section_id);
CREATE INDEX idx_template_sections_position ON template_sections(template_id, position);

CREATE INDEX idx_generated_pdfs_template_id ON generated_pdfs(template_id);
CREATE INDEX idx_generated_pdfs_simulator_type ON generated_pdfs(simulator_type);
CREATE INDEX idx_generated_pdfs_generated_by ON generated_pdfs(generated_by);
CREATE INDEX idx_generated_pdfs_generated_at ON generated_pdfs(generated_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_content_sections_updated_at 
  BEFORE UPDATE ON content_sections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdf_templates_updated_at 
  BEFORE UPDATE ON pdf_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_pdfs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM user_profiles 
  WHERE id = user_id;
  
  RETURN COALESCE(user_role, 'member');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT get_user_role(user_id) INTO user_role;
  RETURN user_role IN ('owner', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Content sections policies
CREATE POLICY "Users can view all content sections" ON content_sections
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert content sections" ON content_sections
  FOR INSERT WITH CHECK (is_admin_user(auth.uid()));

CREATE POLICY "Admins can update content sections" ON content_sections
  FOR UPDATE USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete content sections" ON content_sections
  FOR DELETE USING (is_admin_user(auth.uid()));

-- PDF templates policies
CREATE POLICY "Users can view all pdf templates" ON pdf_templates
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert pdf templates" ON pdf_templates
  FOR INSERT WITH CHECK (is_admin_user(auth.uid()));

CREATE POLICY "Admins can update pdf templates" ON pdf_templates
  FOR UPDATE USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete pdf templates" ON pdf_templates
  FOR DELETE USING (is_admin_user(auth.uid()));

-- Template sections policies
CREATE POLICY "Users can view all template sections" ON template_sections
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert template sections" ON template_sections
  FOR INSERT WITH CHECK (is_admin_user(auth.uid()));

CREATE POLICY "Admins can update template sections" ON template_sections
  FOR UPDATE USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete template sections" ON template_sections
  FOR DELETE USING (is_admin_user(auth.uid()));

-- Generated PDFs policies
CREATE POLICY "Users can view all generated pdfs" ON generated_pdfs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert generated pdfs" ON generated_pdfs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update generated pdfs" ON generated_pdfs
  FOR UPDATE USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can delete generated pdfs" ON generated_pdfs
  FOR DELETE USING (is_admin_user(auth.uid()));

-- Create Supabase Storage bucket for PDF section images
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-section-images', 'pdf-section-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for PDF section images
CREATE POLICY "Public can view PDF section images" ON storage.objects
  FOR SELECT USING (bucket_id = 'pdf-section-images');

CREATE POLICY "Authenticated users can upload PDF section images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'pdf-section-images' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Admins can update PDF section images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'pdf-section-images' 
    AND is_admin_user(auth.uid())
  );

CREATE POLICY "Admins can delete PDF section images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'pdf-section-images' 
    AND is_admin_user(auth.uid())
  );

-- Create function to automatically set version numbers for templates
CREATE OR REPLACE FUNCTION set_template_version()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a new template, set version to 1
  IF TG_OP = 'INSERT' THEN
    NEW.version_number = 1;
  END IF;
  
  -- If this is an update and is_active is being set to true, increment version
  IF TG_OP = 'UPDATE' AND OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
    -- Get the highest version number for this simulator type
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO NEW.version_number
    FROM pdf_templates 
    WHERE simulator_type = NEW.simulator_type;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for automatic version numbering
CREATE TRIGGER set_template_version_trigger
  BEFORE INSERT OR UPDATE ON pdf_templates
  FOR EACH ROW EXECUTE FUNCTION set_template_version();

-- Create function to ensure only one active template per simulator type
CREATE OR REPLACE FUNCTION ensure_single_active_template()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a template as active, deactivate all others for the same simulator type
  IF NEW.is_active = TRUE THEN
    UPDATE pdf_templates 
    SET is_active = FALSE 
    WHERE simulator_type = NEW.simulator_type 
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to ensure only one active template per simulator type
CREATE TRIGGER ensure_single_active_template_trigger
  BEFORE UPDATE ON pdf_templates
  FOR EACH ROW EXECUTE FUNCTION ensure_single_active_template();

-- Create view for template sections with section details
CREATE VIEW template_sections_with_details AS
SELECT 
  ts.id,
  ts.template_id,
  ts.section_id,
  ts.position,
  ts.created_at,
  cs.title as section_title,
  cs.section_type,
  cs.content,
  cs.image_url
FROM template_sections ts
JOIN content_sections cs ON ts.section_id = cs.id
ORDER BY ts.template_id, ts.position;

-- Create view for active templates with section counts
CREATE VIEW active_templates_with_sections AS
SELECT 
  pt.id,
  pt.template_name,
  pt.simulator_type,
  pt.version_number,
  pt.created_at,
  pt.updated_at,
  pt.created_by,
  COUNT(ts.id) as section_count
FROM pdf_templates pt
LEFT JOIN template_sections ts ON pt.id = ts.template_id
WHERE pt.is_active = TRUE
GROUP BY pt.id, pt.template_name, pt.simulator_type, pt.version_number, pt.created_at, pt.updated_at, pt.created_by;

-- Create function to duplicate a template
CREATE OR REPLACE FUNCTION duplicate_template(
  source_template_id UUID,
  new_template_name TEXT,
  new_created_by UUID
)
RETURNS UUID AS $$
DECLARE
  new_template_id UUID;
  section_record RECORD;
BEGIN
  -- Create new template
  INSERT INTO pdf_templates (template_name, simulator_type, is_active, created_by)
  SELECT new_template_name, simulator_type, FALSE, new_created_by
  FROM pdf_templates 
  WHERE id = source_template_id
  RETURNING id INTO new_template_id;
  
  -- Copy all sections with their positions
  FOR section_record IN 
    SELECT section_id, position 
    FROM template_sections 
    WHERE template_id = source_template_id 
    ORDER BY position
  LOOP
    INSERT INTO template_sections (template_id, section_id, position)
    VALUES (new_template_id, section_record.section_id, section_record.position);
  END LOOP;
  
  RETURN new_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get template hierarchy for a simulator type
CREATE OR REPLACE FUNCTION get_template_hierarchy(simulator_type_param TEXT)
RETURNS TABLE (
  template_id UUID,
  template_name TEXT,
  version_number INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  section_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.id,
    pt.template_name,
    pt.version_number,
    pt.is_active,
    pt.created_at,
    COUNT(ts.id) as section_count
  FROM pdf_templates pt
  LEFT JOIN template_sections ts ON pt.id = ts.template_id
  WHERE pt.simulator_type = simulator_type_param
  GROUP BY pt.id, pt.template_name, pt.version_number, pt.is_active, pt.created_at
  ORDER BY pt.version_number DESC, pt.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON TABLE content_sections IS 'Reusable content blocks for PDF templates';
COMMENT ON TABLE pdf_templates IS 'Template definitions mapped to simulators';
COMMENT ON TABLE template_sections IS 'Junction table linking templates to sections with ordering';
COMMENT ON TABLE generated_pdfs IS 'History of generated PDFs with metadata';

COMMENT ON COLUMN content_sections.section_type IS 'Type of content section: title, description, image, table, bullet_list, callout';
COMMENT ON COLUMN content_sections.content IS 'Flexible JSON structure based on section_type';
COMMENT ON COLUMN pdf_templates.is_active IS 'Flag indicating the current active version for the simulator type';
COMMENT ON COLUMN pdf_templates.version_number IS 'Auto-incremented version number for template versions';
COMMENT ON COLUMN template_sections.position IS 'Ordering position of section within template';
COMMENT ON COLUMN generated_pdfs.pricing_data IS 'Captured pricing data from simulator at generation time';
