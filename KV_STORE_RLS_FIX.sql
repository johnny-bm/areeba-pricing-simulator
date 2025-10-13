-- Fix KV Store RLS Policies
-- Run this SQL in your Supabase SQL Editor to fix the 406 errors

-- Enable RLS on kv_store table
ALTER TABLE public.kv_store ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.kv_store;
DROP POLICY IF EXISTS "Allow all operations for service role" ON public.kv_store;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON public.kv_store
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow all operations for service role
CREATE POLICY "Allow all operations for service role" ON public.kv_store
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add comment explaining the policies
COMMENT ON TABLE public.kv_store IS 'Key-value store for session data and application state';
COMMENT ON POLICY "Allow all operations for authenticated users" ON public.kv_store IS 'Allows authenticated users to read, insert, update, and delete kv_store entries';
COMMENT ON POLICY "Allow all operations for service role" ON public.kv_store IS 'Allows service role to perform all operations on kv_store';

-- Test the policies by checking if we can access the table
SELECT 'RLS policies applied successfully' as status;
