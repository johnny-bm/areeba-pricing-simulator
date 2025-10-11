-- Update admin structure to support simulator-specific data
-- Run this SQL to prepare the database for the new admin structure

-- 1. Add simulator_id to simulator_submissions table (scenarios)
ALTER TABLE simulator_submissions ADD COLUMN simulator_id UUID REFERENCES simulators(id);

-- 2. Add simulator_id to configurations table (client fields)
ALTER TABLE configurations ADD COLUMN simulator_id UUID REFERENCES simulators(id);

-- 3. Add simulator_id to categories table
ALTER TABLE categories ADD COLUMN simulator_id UUID REFERENCES simulators(id);

-- 4. Add simulator_id to services table
ALTER TABLE services ADD COLUMN simulator_id UUID REFERENCES simulators(id);

-- 5. Add simulator_id to tags table
ALTER TABLE tags ADD COLUMN simulator_id UUID REFERENCES simulators(id);

-- 6. Update existing records to point to default simulator (issuing-processing)
UPDATE simulator_submissions 
SET simulator_id = (SELECT id FROM simulators WHERE url_slug = 'issuing-processing' LIMIT 1)
WHERE simulator_id IS NULL;

UPDATE configurations 
SET simulator_id = (SELECT id FROM simulators WHERE url_slug = 'issuing-processing' LIMIT 1)
WHERE simulator_id IS NULL;

UPDATE categories 
SET simulator_id = (SELECT id FROM simulators WHERE url_slug = 'issuing-processing' LIMIT 1)
WHERE simulator_id IS NULL;

UPDATE services 
SET simulator_id = (SELECT id FROM simulators WHERE url_slug = 'issuing-processing' LIMIT 1)
WHERE simulator_id IS NULL;

UPDATE tags 
SET simulator_id = (SELECT id FROM simulators WHERE url_slug = 'issuing-processing' LIMIT 1)
WHERE simulator_id IS NULL;

-- 7. Add indexes for performance
CREATE INDEX idx_simulator_submissions_simulator_id ON simulator_submissions(simulator_id);
CREATE INDEX idx_configurations_simulator_id ON configurations(simulator_id);
CREATE INDEX idx_categories_simulator_id ON categories(simulator_id);
CREATE INDEX idx_services_simulator_id ON services(simulator_id);
CREATE INDEX idx_tags_simulator_id ON tags(simulator_id);

-- 8. Add RLS policies for simulator-specific data
-- Simulator submissions (scenarios)
CREATE POLICY "Users can access simulator submissions for their accessible simulators" ON simulator_submissions
FOR ALL USING (
  simulator_id IN (
    SELECT s.id FROM simulators s 
    WHERE s.is_active = true 
    AND (auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('admin', 'owner')))
  )
);

-- Configurations
CREATE POLICY "Users can access configurations for their accessible simulators" ON configurations
FOR ALL USING (
  simulator_id IN (
    SELECT s.id FROM simulators s 
    WHERE s.is_active = true 
    AND (auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('admin', 'owner')))
  )
);

-- Categories
CREATE POLICY "Users can access categories for their accessible simulators" ON categories
FOR ALL USING (
  simulator_id IN (
    SELECT s.id FROM simulators s 
    WHERE s.is_active = true 
    AND (auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('admin', 'owner')))
  )
);

-- Services
CREATE POLICY "Users can access services for their accessible simulators" ON services
FOR ALL USING (
  simulator_id IN (
    SELECT s.id FROM simulators s 
    WHERE s.is_active = true 
    AND (auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('admin', 'owner')))
  )
);

-- Tags
CREATE POLICY "Users can access tags for their accessible simulators" ON tags
FOR ALL USING (
  simulator_id IN (
    SELECT s.id FROM simulators s 
    WHERE s.is_active = true 
    AND (auth.uid() IN (SELECT id FROM user_profiles WHERE role IN ('admin', 'owner')))
  )
);
