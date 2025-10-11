-- Function to create storage bucket for PDF Builder
-- This function can be called from the frontend to create the storage bucket

CREATE OR REPLACE FUNCTION create_storage_bucket(
  bucket_name TEXT,
  is_public BOOLEAN DEFAULT true
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Try to create the bucket
  INSERT INTO storage.buckets (id, name, public)
  VALUES (bucket_name, bucket_name, is_public)
  ON CONFLICT (id) DO NOTHING;
  
  -- Return success result
  result := json_build_object(
    'success', true,
    'bucket_name', bucket_name,
    'message', 'Storage bucket created successfully'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Return error result
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Failed to create storage bucket'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_storage_bucket(TEXT, BOOLEAN) TO authenticated;

-- Test the function (optional)
-- SELECT create_storage_bucket('pdf-section-images', true);
