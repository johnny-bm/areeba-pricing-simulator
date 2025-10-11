-- Create user_invites table for invitation system
CREATE TABLE IF NOT EXISTS user_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    invite_code VARCHAR(255) NOT NULL UNIQUE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    used_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_user_invites_created_by 
        FOREIGN KEY (created_by) 
        REFERENCES user_profiles(id) 
        ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_invites_email ON user_invites(email);
CREATE INDEX IF NOT EXISTS idx_user_invites_invite_code ON user_invites(invite_code);
CREATE INDEX IF NOT EXISTS idx_user_invites_expires_at ON user_invites(expires_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invites they created
CREATE POLICY "Users can view their own invites" ON user_invites
    FOR SELECT USING (created_by = auth.uid());

-- Policy: Users can create invites (admin/owner only)
CREATE POLICY "Admins can create invites" ON user_invites
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Policy: Users can update invites they created
CREATE POLICY "Users can update their own invites" ON user_invites
    FOR UPDATE USING (created_by = auth.uid());

-- Policy: Users can delete invites they created
CREATE POLICY "Users can delete their own invites" ON user_invites
    FOR DELETE USING (created_by = auth.uid());

-- Function to generate invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to create user invite
CREATE OR REPLACE FUNCTION create_user_invite(
    p_email VARCHAR(255),
    p_first_name VARCHAR(100) DEFAULT NULL,
    p_last_name VARCHAR(100) DEFAULT NULL,
    p_role VARCHAR(20) DEFAULT 'member',
    p_created_by UUID DEFAULT auth.uid()
)
RETURNS TABLE (
    id UUID,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20),
    invite_code VARCHAR(255),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_invite_code VARCHAR(255);
    v_invite_id UUID;
BEGIN
    -- Generate unique invite code
    LOOP
        v_invite_code := generate_invite_code();
        BEGIN
            INSERT INTO user_invites (email, first_name, last_name, role, invite_code, created_by)
            VALUES (p_email, p_first_name, p_last_name, p_role, v_invite_code, p_created_by)
            RETURNING user_invites.id INTO v_invite_id;
            EXIT;
        EXCEPTION WHEN unique_violation THEN
            -- Code already exists, try again
            CONTINUE;
        END;
    END LOOP;

    -- Return the created invite
    RETURN QUERY
    SELECT 
        ui.id,
        ui.email,
        ui.first_name,
        ui.last_name,
        ui.role,
        ui.invite_code,
        ui.created_by,
        ui.created_at,
        ui.expires_at
    FROM user_invites ui
    WHERE ui.id = v_invite_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_invites TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_invite TO authenticated;
