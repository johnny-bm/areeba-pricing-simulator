-- Fix infinite recursion in user_profiles RLS policies
-- Temporarily disable RLS to break the recursion
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to clean up
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;

-- Re-enable RLS with simple, non-recursive policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple policies that don't reference the same table
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());
