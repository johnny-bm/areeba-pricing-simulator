-- System Version Management Table
-- This table tracks the current version of the system and automatically increments on updates

CREATE TABLE IF NOT EXISTS system_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(20) NOT NULL UNIQUE,
    major INTEGER NOT NULL,
    minor INTEGER NOT NULL,
    patch INTEGER NOT NULL,
    build_number INTEGER NOT NULL,
    release_notes TEXT,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    deployed_at TIMESTAMP WITH TIME ZONE,
    deployed_by UUID REFERENCES auth.users(id)
);

-- Insert initial version
INSERT INTO system_versions (version, major, minor, patch, build_number, is_current, release_notes)
VALUES ('2.2.0', 2, 2, 0, 1, true, 'Initial version with admin structure and PDF improvements')
ON CONFLICT (version) DO NOTHING;

-- Function to automatically increment version
CREATE OR REPLACE FUNCTION increment_system_version(
    p_major INTEGER DEFAULT NULL,
    p_minor INTEGER DEFAULT NULL,
    p_patch INTEGER DEFAULT NULL,
    p_release_notes TEXT DEFAULT NULL
) RETURNS VARCHAR(20) AS $$
DECLARE
    current_version RECORD;
    new_major INTEGER;
    new_minor INTEGER;
    new_patch INTEGER;
    new_build INTEGER;
    new_version VARCHAR(20);
BEGIN
    -- Get current version
    SELECT * INTO current_version 
    FROM system_versions 
    WHERE is_current = true 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Determine new version numbers
    IF p_major IS NOT NULL THEN
        new_major := p_major;
        new_minor := 0;
        new_patch := 0;
    ELSIF p_minor IS NOT NULL THEN
        new_major := current_version.major;
        new_minor := p_minor;
        new_patch := 0;
    ELSIF p_patch IS NOT NULL THEN
        new_major := current_version.major;
        new_minor := current_version.minor;
        new_patch := p_patch;
    ELSE
        -- Auto-increment patch version
        new_major := current_version.major;
        new_minor := current_version.minor;
        new_patch := current_version.patch + 1;
    END IF;
    
    -- Get next build number
    SELECT COALESCE(MAX(build_number), 0) + 1 INTO new_build
    FROM system_versions;
    
    -- Create new version string
    new_version := new_major || '.' || new_minor || '.' || new_patch;
    
    -- Mark current version as not current
    UPDATE system_versions SET is_current = false WHERE is_current = true;
    
    -- Insert new version
    INSERT INTO system_versions (
        version, 
        major, 
        minor, 
        patch, 
        build_number, 
        is_current, 
        release_notes
    ) VALUES (
        new_version,
        new_major,
        new_minor,
        new_patch,
        new_build,
        true,
        COALESCE(p_release_notes, 'System update')
    );
    
    RETURN new_version;
END;
$$ LANGUAGE plpgsql;

-- Function to get current version
CREATE OR REPLACE FUNCTION get_current_version() RETURNS VARCHAR(20) AS $$
DECLARE
    current_version VARCHAR(20);
BEGIN
    SELECT version INTO current_version 
    FROM system_versions 
    WHERE is_current = true 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    RETURN COALESCE(current_version, '1.0.0');
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE system_versions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read versions
CREATE POLICY "Allow authenticated users to read versions" ON system_versions
    FOR SELECT TO authenticated
    USING (true);

-- Allow admin users to manage versions
CREATE POLICY "Allow admin users to manage versions" ON system_versions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_system_versions_current ON system_versions(is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_system_versions_created_at ON system_versions(created_at DESC);
