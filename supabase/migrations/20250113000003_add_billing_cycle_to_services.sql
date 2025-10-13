-- Add billing_cycle column to services table
-- This migration adds the billing_cycle field to support enhanced service management

-- Add billing_cycle column with default value
ALTER TABLE public.services 
ADD COLUMN billing_cycle VARCHAR(50) DEFAULT 'monthly' 
CHECK (billing_cycle IN ('one_time', 'monthly', 'quarterly', 'yearly'));

-- Add comment for documentation
COMMENT ON COLUMN public.services.billing_cycle IS 'Billing frequency for the service: one_time, monthly, quarterly, or yearly';

-- Update existing services to have proper billing cycle based on their unit
UPDATE public.services 
SET billing_cycle = CASE 
  WHEN unit IN ('one-time', 'per change') THEN 'one_time'
  WHEN unit LIKE '%month%' THEN 'monthly'
  WHEN unit LIKE '%quarter%' THEN 'quarterly'
  WHEN unit LIKE '%year%' THEN 'yearly'
  ELSE 'monthly'
END
WHERE billing_cycle IS NULL;
