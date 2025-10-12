-- Restore Original Database Schema
-- This migration restores the database to its original state

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS auto_add_rules_id_seq;
CREATE SEQUENCE IF NOT EXISTS quantity_rules_id_seq;
CREATE SEQUENCE IF NOT EXISTS service_tags_id_seq;

-- Create enum types
DO $$ BEGIN
    CREATE TYPE section_type AS ENUM (
        'title',
        'description', 
        'image',
        'table',
        'bullet_list',
        'callout'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User Profiles Table
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  role text NOT NULL DEFAULT 'member'::text CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  first_name text,
  last_name text,
  deleted_at timestamp with time zone,
  deleted_by uuid,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id)
);

-- Admin Audit Log Table
CREATE TABLE public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT admin_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);

-- Simulators Table
CREATE TABLE public.simulators (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  cta_text character varying NOT NULL DEFAULT 'Start Simulation'::character varying,
  icon_name character varying NOT NULL DEFAULT 'CreditCard'::character varying,
  url_slug character varying NOT NULL UNIQUE CHECK (url_slug::text ~* '^[a-z0-9-]+$'::text),
  is_active boolean NOT NULL DEFAULT true CHECK (is_active = ANY (ARRAY[true, false])),
  is_available boolean NOT NULL DEFAULT true CHECK (is_available = ANY (ARRAY[true, false])),
  coming_soon boolean NOT NULL DEFAULT false CHECK (coming_soon = ANY (ARRAY[true, false])),
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  deleted_by uuid,
  CONSTRAINT simulators_pkey PRIMARY KEY (id),
  CONSTRAINT simulators_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id),
  CONSTRAINT simulators_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT simulators_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id)
);

-- Categories Table
CREATE TABLE public.categories (
  id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  color text NOT NULL DEFAULT '#6B7280'::text,
  order_index integer NOT NULL DEFAULT 1 CHECK (order_index >= 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  deleted_at timestamp with time zone,
  simulator_id uuid NOT NULL,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT categories_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id),
  CONSTRAINT categories_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id),
  CONSTRAINT categories_simulator_id_fkey FOREIGN KEY (simulator_id) REFERENCES public.simulators(id)
);

-- Services Table
CREATE TABLE public.services (
  id text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  unit text NOT NULL,
  default_price numeric NOT NULL CHECK (default_price >= 0::numeric),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  tiered_pricing jsonb DEFAULT '{"type": "simple", "tiers": []}'::jsonb CHECK (tiered_pricing IS NULL OR jsonb_typeof(tiered_pricing) = 'object'::text AND tiered_pricing ? 'tiers'::text AND jsonb_typeof(tiered_pricing -> 'tiers'::text) = 'array'::text),
  pricing_type character varying DEFAULT 'simple'::character varying CHECK (pricing_type::text = ANY (ARRAY['simple'::character varying, 'tiered'::character varying]::text[])),
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  deleted_at timestamp with time zone,
  simulator_id uuid NOT NULL,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT services_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id),
  CONSTRAINT services_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id),
  CONSTRAINT services_category_fkey FOREIGN KEY (category) REFERENCES public.categories(id),
  CONSTRAINT services_simulator_id_fkey FOREIGN KEY (simulator_id) REFERENCES public.simulators(id)
);

-- Tags Table
CREATE TABLE public.tags (
  id text NOT NULL DEFAULT (gen_random_uuid())::text,
  name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  usage_count integer DEFAULT 0 CHECK (usage_count >= 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  used_in_items ARRAY DEFAULT '{}'::text[],
  deleted_at timestamp with time zone,
  simulator_id uuid NOT NULL,
  created_by uuid,
  updated_by uuid,
  deleted_by uuid,
  CONSTRAINT tags_pkey PRIMARY KEY (id),
  CONSTRAINT tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT tags_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id),
  CONSTRAINT tags_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id),
  CONSTRAINT tags_simulator_id_fkey FOREIGN KEY (simulator_id) REFERENCES public.simulators(id)
);

-- Configurations Table
CREATE TABLE public.configurations (
  id text NOT NULL,
  name text NOT NULL,
  description text,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (fields IS NULL OR jsonb_typeof(fields) = 'array'::text AND jsonb_array_length(fields) >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  sort_order numeric CHECK (sort_order >= 0::numeric),
  display_order integer DEFAULT 0,
  simulator_id uuid NOT NULL,
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  deleted_by uuid,
  CONSTRAINT configurations_pkey PRIMARY KEY (id),
  CONSTRAINT configurations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT configurations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id),
  CONSTRAINT configurations_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id),
  CONSTRAINT configurations_simulator_id_fkey FOREIGN KEY (simulator_id) REFERENCES public.simulators(id)
);

-- PDF Templates Table
CREATE TABLE public.pdf_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  template_name text NOT NULL,
  simulator_type text NOT NULL,
  is_active boolean DEFAULT false CHECK (is_active = ANY (ARRAY[true, false])),
  version_number integer NOT NULL DEFAULT 1 CHECK (version_number > 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  is_archived boolean DEFAULT false CHECK (is_archived = ANY (ARRAY[true, false])),
  archived_at timestamp with time zone,
  CONSTRAINT pdf_templates_pkey PRIMARY KEY (id),
  CONSTRAINT pdf_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);

-- Content Sections Table
CREATE TABLE public.content_sections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  section_type section_type NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (content IS NULL OR jsonb_typeof(content) = 'object'::text),
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT content_sections_pkey PRIMARY KEY (id),
  CONSTRAINT content_sections_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);

-- Generated PDFs Table
CREATE TABLE public.generated_pdfs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  template_id uuid NOT NULL,
  client_name text NOT NULL,
  project_name text NOT NULL,
  simulator_type text NOT NULL,
  pricing_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  pdf_url text,
  generated_at timestamp with time zone DEFAULT now(),
  generated_by uuid,
  CONSTRAINT generated_pdfs_pkey PRIMARY KEY (id),
  CONSTRAINT generated_pdfs_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.pdf_templates(id),
  CONSTRAINT generated_pdfs_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.user_profiles(id)
);

-- Guest Scenarios Table
CREATE TABLE public.guest_scenarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  email text NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  phone_number text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company_name text NOT NULL,
  scenario_name text NOT NULL,
  scenario_data jsonb NOT NULL,
  total_price numeric,
  ip_address text,
  user_agent text,
  referrer_url text,
  status text DEFAULT 'submitted'::text CHECK (status = ANY (ARRAY['submitted'::text, 'contacted'::text, 'converted'::text, 'archived'::text])),
  submission_code text NOT NULL UNIQUE,
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  deleted_by uuid,
  CONSTRAINT guest_scenarios_pkey PRIMARY KEY (id),
  CONSTRAINT guest_scenarios_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT guest_scenarios_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id),
  CONSTRAINT guest_scenarios_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id)
);

-- Simulator Submissions Table
CREATE TABLE public.simulator_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  configuration_id text,
  configuration_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  services_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  fee_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  submission_name text,
  notes text,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  submitted_at timestamp with time zone,
  client_name text,
  project_name text,
  prepared_by text,
  client_configuration jsonb,
  selected_services jsonb,
  global_discount numeric DEFAULT 0,
  global_discount_type text DEFAULT 'percentage'::text,
  global_discount_application text DEFAULT 'none'::text,
  cost_summary jsonb,
  simulator_type text DEFAULT 'ISS'::text CHECK (simulator_type = ANY (ARRAY['ISS'::text, 'ACQ'::text])),
  submission_code text NOT NULL UNIQUE,
  simulator_id uuid NOT NULL,
  created_by uuid,
  updated_by uuid,
  deleted_at timestamp with time zone,
  deleted_by uuid,
  CONSTRAINT simulator_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT simulator_submissions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT simulator_submissions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id),
  CONSTRAINT simulator_submissions_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id),
  CONSTRAINT simulator_submissions_configuration_id_fkey FOREIGN KEY (configuration_id) REFERENCES public.configurations(id),
  CONSTRAINT simulator_submissions_simulator_id_fkey FOREIGN KEY (simulator_id) REFERENCES public.simulators(id),
  CONSTRAINT simulator_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);

-- Auto Add Rules Table
CREATE TABLE public.auto_add_rules (
  id bigint NOT NULL DEFAULT nextval('auto_add_rules_id_seq'::regclass),
  service_id text NOT NULL,
  config_field_id text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  deleted_by uuid,
  simulator_id uuid NOT NULL,
  CONSTRAINT auto_add_rules_pkey PRIMARY KEY (id),
  CONSTRAINT auto_add_rules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT auto_add_rules_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id),
  CONSTRAINT auto_add_rules_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id),
  CONSTRAINT auto_add_rules_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT auto_add_rules_simulator_id_fkey FOREIGN KEY (simulator_id) REFERENCES public.simulators(id)
);

-- Quantity Rules Table
CREATE TABLE public.quantity_rules (
  id bigint NOT NULL DEFAULT nextval('quantity_rules_id_seq'::regclass),
  service_id text NOT NULL,
  config_field_id text NOT NULL,
  multiplier numeric DEFAULT 1.0 CHECK (multiplier > 0::numeric),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  deleted_by uuid,
  simulator_id uuid NOT NULL,
  CONSTRAINT quantity_rules_pkey PRIMARY KEY (id),
  CONSTRAINT quantity_rules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT quantity_rules_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id),
  CONSTRAINT quantity_rules_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id),
  CONSTRAINT quantity_rules_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT quantity_rules_simulator_id_fkey FOREIGN KEY (simulator_id) REFERENCES public.simulators(id)
);

-- Service Tags Table
CREATE TABLE public.service_tags (
  id bigint NOT NULL DEFAULT nextval('service_tags_id_seq'::regclass),
  service_id text NOT NULL,
  tag_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  deleted_by uuid,
  CONSTRAINT service_tags_pkey PRIMARY KEY (id),
  CONSTRAINT service_tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT service_tags_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.user_profiles(id),
  CONSTRAINT service_tags_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id),
  CONSTRAINT service_tags_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT service_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);

-- Template Sections Table
CREATE TABLE public.template_sections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  template_id uuid NOT NULL,
  section_id uuid,
  position integer NOT NULL DEFAULT 0 CHECK ("position" >= 0),
  created_at timestamp with time zone DEFAULT now(),
  section_type character varying DEFAULT 'custom'::character varying,
  predefined_section character varying,
  CONSTRAINT template_sections_pkey PRIMARY KEY (id),
  CONSTRAINT template_sections_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.pdf_templates(id),
  CONSTRAINT template_sections_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.content_sections(id)
);

-- User Invites Table
CREATE TABLE public.user_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  first_name text,
  last_name text,
  role text NOT NULL CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text])),
  invite_code text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'::text) UNIQUE,
  created_by uuid,
  expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_invites_pkey PRIMARY KEY (id),
  CONSTRAINT user_invites_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);

-- KV Store Tables
CREATE TABLE public.kv_store (
  key text NOT NULL,
  value jsonb NOT NULL,
  CONSTRAINT kv_store_pkey PRIMARY KEY (key)
);

CREATE TABLE public.kv_store_228aa219 (
  key text NOT NULL,
  value jsonb NOT NULL,
  CONSTRAINT kv_store_228aa219_pkey PRIMARY KEY (key)
);
