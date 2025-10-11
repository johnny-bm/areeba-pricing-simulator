-- Update user role to admin
-- Replace 'your-email@example.com' with your actual email address

UPDATE public.user_profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, role, is_active 
FROM public.user_profiles 
WHERE email = 'your-email@example.com';
