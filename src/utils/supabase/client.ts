import { createClient } from '@supabase/supabase-js';

// Create singleton instance - only create once
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    try {
      // Get environment variables with fallback
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
    
    // Safe URL parsing for storage key
    let projectId = 'areeba-pricing';
    try {
      if (supabaseUrl.includes('//')) {
        const urlParts = supabaseUrl.split('//')[1];
        if (urlParts && urlParts.includes('.')) {
          projectId = urlParts.split('.')[0];
        }
      }
    } catch (error) {
      // Use default project ID
    }
    
    supabaseInstance = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          storageKey: `areeba-pricing-auth-${projectId}`,
          flowType: 'pkce',
          debug: false
        },
        global: {
          headers: {
            'X-Client-Info': 'areeba-pricing-simulator'
          }
        }
      }
    );
    
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      throw error;
    }
  }
  
  return supabaseInstance;
})();