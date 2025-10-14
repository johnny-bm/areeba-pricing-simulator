-- Fix simulator URL slugs
-- Run this in your Supabase SQL editor

-- First, let's see what we have
SELECT id, name, title, url_slug, is_active 
FROM simulators 
ORDER BY sort_order;

-- Check for the specific issue
SELECT 
  id, 
  name, 
  title, 
  url_slug,
  CASE 
    WHEN name ILIKE '%acquiring%' AND url_slug != 'acquiring' THEN 'NEEDS_FIX'
    WHEN name ILIKE '%issuing%' AND url_slug != 'issuing' THEN 'NEEDS_FIX'
    ELSE 'OK'
  END as status
FROM simulators 
WHERE is_active = true;

-- Fix Acquiring simulator if it has wrong slug
UPDATE simulators 
SET url_slug = 'acquiring' 
WHERE (name ILIKE '%acquiring%' OR title ILIKE '%acquiring%') 
  AND url_slug != 'acquiring';

-- Fix Issuing simulator if it has wrong slug  
UPDATE simulators 
SET url_slug = 'issuing' 
WHERE (name ILIKE '%issuing%' OR title ILIKE '%issuing%') 
  AND url_slug != 'issuing';

-- Verify the fix
SELECT id, name, title, url_slug 
FROM simulators 
WHERE is_active = true 
ORDER BY sort_order;
