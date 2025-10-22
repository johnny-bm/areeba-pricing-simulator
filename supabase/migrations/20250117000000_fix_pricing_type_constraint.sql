-- Fix pricing_type constraint to allow all pricing types
-- This migration updates the services table constraint to allow the full range of pricing types

-- First, update any existing 'simple' values to 'one_time' to maintain consistency
UPDATE public.services 
SET pricing_type = 'one_time' 
WHERE pricing_type = 'simple';

-- Drop the existing constraint
ALTER TABLE public.services 
DROP CONSTRAINT IF EXISTS services_pricing_type_check;

-- Add the new constraint that allows all pricing types
ALTER TABLE public.services 
ADD CONSTRAINT services_pricing_type_check 
CHECK (pricing_type::text = ANY (ARRAY[
  'one_time'::character varying, 
  'recurring'::character varying, 
  'per_unit'::character varying, 
  'tiered'::character varying
]::text[]));

-- Update the default value
ALTER TABLE public.services 
ALTER COLUMN pricing_type SET DEFAULT 'one_time';
