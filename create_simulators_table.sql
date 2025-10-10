-- Create simulators table for managing simulator configurations
CREATE TABLE IF NOT EXISTS simulators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  cta_text VARCHAR(100) NOT NULL DEFAULT 'Start Simulation',
  icon_name VARCHAR(50) NOT NULL DEFAULT 'CreditCard', -- Lucide icon name
  url_slug VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_available BOOLEAN NOT NULL DEFAULT true,
  coming_soon BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create index for URL slug lookups
CREATE INDEX IF NOT EXISTS idx_simulators_url_slug ON simulators(url_slug);
CREATE INDEX IF NOT EXISTS idx_simulators_active ON simulators(is_active);
CREATE INDEX IF NOT EXISTS idx_simulators_sort_order ON simulators(sort_order);

-- Create function to generate URL slug from name
CREATE OR REPLACE FUNCTION generate_url_slug(input_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(input_name, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_simulators_updated_at
  BEFORE UPDATE ON simulators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default simulators
INSERT INTO simulators (name, title, description, cta_text, icon_name, url_slug, is_active, is_available, sort_order) VALUES
(
  'Issuing & Processing',
  'Issuing & Processing',
  'Calculate costs for card issuing, payment processing, hosting, and transaction fees with detailed configuration options.',
  'Start Simulation',
  'CreditCard',
  'issuing-processing',
  true,
  true,
  1
),
(
  'Acquiring Solutions',
  'Acquiring Solutions',
  'Price merchant acquisition services, payment acceptance, and settlement solutions.',
  'Coming Soon',
  'Calculator',
  'acquiring-solutions',
  true,
  false,
  2
),
(
  'Digital Banking',
  'Digital Banking',
  'Estimate costs for digital banking platform implementation and ongoing operations.',
  'Coming Soon',
  'Zap',
  'digital-banking',
  true,
  false,
  3
) ON CONFLICT (url_slug) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE simulators ENABLE ROW LEVEL SECURITY;

-- Create policies for simulators
-- Allow authenticated users to read active simulators
CREATE POLICY "Allow authenticated users to read active simulators" ON simulators
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Allow admins and owners to manage simulators
CREATE POLICY "Allow admins to manage simulators" ON simulators
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('admin', 'owner')
    )
  );
