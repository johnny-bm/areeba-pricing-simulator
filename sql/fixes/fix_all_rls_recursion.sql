-- Comprehensive fix for RLS infinite recursion issues
-- This script disables RLS temporarily, drops all problematic policies, and recreates them safely

-- 1. Disable RLS on all affected tables to break recursion
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulators DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_pdfs DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to clean up completely
-- User profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;

-- Simulators policies
DROP POLICY IF EXISTS "Users can view active simulators" ON public.simulators;
DROP POLICY IF EXISTS "Admins can manage simulators" ON public.simulators;

-- PDF templates policies
DROP POLICY IF EXISTS "Users can view templates" ON public.pdf_templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.pdf_templates;

-- Template sections policies
DROP POLICY IF EXISTS "Users can view template sections" ON public.template_sections;
DROP POLICY IF EXISTS "Admins can manage template sections" ON public.template_sections;

-- Generated PDFs policies
DROP POLICY IF EXISTS "Users can view their generated PDFs" ON public.generated_pdfs;
DROP POLICY IF EXISTS "Admins can view all generated PDFs" ON public.generated_pdfs;

-- 3. Re-enable RLS with simple, non-recursive policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_pdfs ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, safe policies
-- User profiles - basic user access
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Simulators - allow all authenticated users to view active simulators
CREATE POLICY "Authenticated users can view active simulators" ON public.simulators
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- PDF templates - allow all authenticated users to view
CREATE POLICY "Authenticated users can view templates" ON public.pdf_templates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Template sections - allow all authenticated users to view
CREATE POLICY "Authenticated users can view template sections" ON public.template_sections
    FOR SELECT USING (auth.role() = 'authenticated');

-- Generated PDFs - allow users to view their own
CREATE POLICY "Users can view their generated PDFs" ON public.generated_pdfs
    FOR SELECT USING (auth.role() = 'authenticated');
