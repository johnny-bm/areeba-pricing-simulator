-- Seed Config Tables with Initial Data
-- This migration populates the global config tables with default values

-- Insert default pricing units
INSERT INTO public.config_pricing_units (id, name, value, description, category, display_order, is_active, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Per Hour', 'per_hour', 'Charged per hour of work', 'one-time', 1, true, now(), now()),
  (gen_random_uuid(), 'Per Day', 'per_day', 'Charged per day of work', 'one-time', 2, true, now(), now()),
  (gen_random_uuid(), 'Per Month', 'per_month', 'Monthly recurring charge', 'monthly-recurring', 3, true, now(), now()),
  (gen_random_uuid(), 'Per User', 'per_user', 'Charged per user', 'transaction-based', 4, true, now(), now()),
  (gen_random_uuid(), 'Per Transaction', 'per_transaction', 'Charged per transaction', 'transaction-based', 5, true, now(), now()),
  (gen_random_uuid(), 'Per Event', 'per_event', 'Charged per event or activity', 'event-activity-based', 6, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert default pricing types
INSERT INTO public.config_pricing_types (id, name, value, description, supports_recurring, supports_tiered, display_order, is_active, created_at, updated_at) VALUES
  (gen_random_uuid(), 'One Time', 'one_time', 'Single payment for the service', false, false, 1, true, now(), now()),
  (gen_random_uuid(), 'Recurring', 'recurring', 'Regular recurring payments', true, false, 2, true, now(), now()),
  (gen_random_uuid(), 'Per Unit', 'per_unit', 'Charged based on quantity or usage', false, false, 3, true, now(), now()),
  (gen_random_uuid(), 'Tiered', 'tiered', 'Pricing with multiple tiers based on volume', false, true, 4, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert default billing cycles
INSERT INTO public.config_pricing_cycles (id, name, value, description, months, display_order, is_active, created_at, updated_at) VALUES
  (gen_random_uuid(), 'One Time', 'one_time', 'Single payment, no recurring charges', null, 1, true, now(), now()),
  (gen_random_uuid(), 'Monthly', 'monthly', 'Charged every month', 1, 2, true, now(), now()),
  (gen_random_uuid(), 'Quarterly', 'quarterly', 'Charged every 3 months', 3, 3, true, now(), now()),
  (gen_random_uuid(), 'Semi-Annually', 'semi_annually', 'Charged every 6 months', 6, 4, true, now(), now()),
  (gen_random_uuid(), 'Annually', 'annually', 'Charged once per year', 12, 5, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert default tiered templates
INSERT INTO public.config_pricing_templates (id, name, description, tiers, display_order, is_active, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Standard Volume Discount', 'Common volume-based pricing with decreasing rates', 
   '[{"min": 1, "max": 10, "price": 100, "unit": "per unit"}, {"min": 11, "max": 50, "price": 90, "unit": "per unit"}, {"min": 51, "max": 100, "price": 80, "unit": "per unit"}, {"min": 101, "max": null, "price": 70, "unit": "per unit"}]'::jsonb, 1, true, now(), now()),
  (gen_random_uuid(), 'User-Based Pricing', 'Pricing based on number of users', 
   '[{"min": 1, "max": 5, "price": 50, "unit": "per user/month"}, {"min": 6, "max": 25, "price": 45, "unit": "per user/month"}, {"min": 26, "max": 100, "price": 40, "unit": "per user/month"}, {"min": 101, "max": null, "price": 35, "unit": "per user/month"}]'::jsonb, 2, true, now(), now()),
  (gen_random_uuid(), 'Storage-Based Pricing', 'Pricing based on storage usage', 
   '[{"min": 1, "max": 100, "price": 10, "unit": "per GB/month"}, {"min": 101, "max": 1000, "price": 8, "unit": "per GB/month"}, {"min": 1001, "max": null, "price": 5, "unit": "per GB/month"}]'::jsonb, 3, true, now(), now())
ON CONFLICT (id) DO NOTHING;
