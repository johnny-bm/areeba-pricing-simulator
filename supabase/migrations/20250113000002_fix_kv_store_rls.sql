-- Fix RLS policies for kv_store table
-- This migration adds the necessary RLS policies to allow access to the kv_store table

-- Enable RLS on kv_store table
ALTER TABLE public.kv_store ENABLE ROW LEVEL SECURITY;

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
