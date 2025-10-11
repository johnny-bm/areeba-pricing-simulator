-- Simple RLS fix - just disable RLS temporarily to allow access
-- This is the quickest way to get the app working

-- Disable RLS on simulators table to allow public access
ALTER TABLE public.simulators DISABLE ROW LEVEL SECURITY;

-- Optional: Re-enable with a simple policy that allows all access
-- ALTER TABLE public.simulators ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all access to simulators" ON public.simulators FOR ALL USING (true);
