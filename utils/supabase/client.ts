import { createClient } from '@supabase/supabase-js';

// Create singleton instance - only create once
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    console.log('🔐 Creating Supabase client singleton');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
    
    supabaseInstance = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          storageKey: `areeba-pricing-auth-${supabaseUrl.split('//')[1].split('.')[0]}`,
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
    
    console.log('✅ Supabase client created');
  }
  
  return supabaseInstance;
})();