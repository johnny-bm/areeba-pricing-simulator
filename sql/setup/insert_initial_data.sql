-- Insert initial simulator data
-- This script creates basic simulators to test the application

-- Insert ISS (IT Services Simulator)
INSERT INTO public.simulators (
  name, title, description, cta_text, icon_name, url_slug, 
  is_active, is_available, coming_soon, sort_order
) VALUES (
  'ISS', 
  'IT Services Simulator', 
  'Comprehensive IT services pricing simulator for infrastructure, support, and consulting services', 
  'Start Simulation', 
  'CreditCard', 
  'iss', 
  true, 
  true, 
  false, 
  1
) ON CONFLICT (url_slug) DO NOTHING;

-- Insert ACQ (Acquisition Simulator) 
INSERT INTO public.simulators (
  name, title, description, cta_text, icon_name, url_slug, 
  is_active, is_available, coming_soon, sort_order
) VALUES (
  'ACQ', 
  'Acquisition Simulator', 
  'Financial acquisition and merger pricing simulator for business transactions', 
  'Start Simulation', 
  'TrendingUp', 
  'acq', 
  true, 
  true, 
  false, 
  2
) ON CONFLICT (url_slug) DO NOTHING;

-- Insert a coming soon simulator
INSERT INTO public.simulators (
  name, title, description, cta_text, icon_name, url_slug, 
  is_active, is_available, coming_soon, sort_order
) VALUES (
  'COMING_SOON', 
  'More Simulators Coming Soon', 
  'Additional specialized pricing simulators will be available soon', 
  'Coming Soon', 
  'Clock', 
  'coming-soon', 
  true, 
  false, 
  true, 
  3
) ON CONFLICT (url_slug) DO NOTHING;
