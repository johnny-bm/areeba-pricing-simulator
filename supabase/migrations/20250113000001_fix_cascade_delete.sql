-- Fix cascade delete behavior for service_tags table
-- This ensures proper cleanup when services or tags are deleted

-- Drop existing foreign key constraints
ALTER TABLE public.service_tags 
DROP CONSTRAINT IF EXISTS service_tags_service_id_fkey;

ALTER TABLE public.service_tags 
DROP CONSTRAINT IF EXISTS service_tags_tag_id_fkey;

-- Recreate with proper CASCADE rules
ALTER TABLE public.service_tags 
ADD CONSTRAINT service_tags_service_id_fkey 
FOREIGN KEY (service_id) 
REFERENCES public.services(id) 
ON DELETE CASCADE;  -- When service is deleted, delete its tag associations

ALTER TABLE public.service_tags 
ADD CONSTRAINT service_tags_tag_id_fkey 
FOREIGN KEY (tag_id) 
REFERENCES public.tags(id) 
ON DELETE RESTRICT;  -- Prevent deletion of tags that are in use

-- Add comment explaining the behavior
COMMENT ON CONSTRAINT service_tags_service_id_fkey ON public.service_tags IS 
'CASCADE: When a service is deleted, automatically delete its tag associations';

COMMENT ON CONSTRAINT service_tags_tag_id_fkey ON public.service_tags IS 
'RESTRICT: Prevent deletion of tags that are still in use by services';
