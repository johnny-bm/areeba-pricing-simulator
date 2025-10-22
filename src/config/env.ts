// Centralized environment variable validation
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

// Security-related environment variables
const securityEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

export function validateEnvironment(): void {
  const missing = requiredEnvVars.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Security validation
  validateSecurityEnvironment();
}

export function validateSecurityEnvironment(): void {
  // Check for hardcoded credentials (security risk)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error('Invalid Supabase URL format');
  }

  // Check for development credentials in production
  if (import.meta.env.PROD) {
    if (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1')) {
      throw new Error('Development credentials detected in production');
    }
  }
}

export const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  features: {
    useNewArchitecture: import.meta.env.VITE_USE_NEW_ARCHITECTURE === 'true',
    useNewPricing: import.meta.env.VITE_USE_NEW_PRICING === 'true',
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;