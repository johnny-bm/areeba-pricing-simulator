/**
 * Supabase Client Configuration
 * 
 * Centralized Supabase client setup with proper typing
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';
import { DatabaseConnectionError } from '../errors/InfrastructureError';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new DatabaseConnectionError(
    'Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

// Create Supabase client with proper typing
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'areeba-pricing-simulator',
      },
    },
  }
);

// Export typed client type
export type SupabaseClientType = typeof supabase;

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pricing_items')
      .select('id')
      .limit(1);
    
    if (error) {
      // // console.error('Database connection check failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    // // console.error('Database connection check failed:', error);
    return false;
  }
}
