import { createClient } from '@supabase/supabase-js';
// Create singleton instance - only create once
let supabaseInstance = null;
export const supabase = (() => {
    if (!supabaseInstance) {
        console.log('🔐 Creating Supabase client singleton');
        // Get environment variables with fallback
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        console.log('🔍 Environment variables loaded:', {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
            urlLength: supabaseUrl?.length || 0,
            keyLength: supabaseAnonKey?.length || 0
        });
        console.log('🔍 Environment check:', {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
            urlLength: supabaseUrl?.length || 0,
            keyLength: supabaseAnonKey?.length || 0,
            urlValue: supabaseUrl,
            keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'undefined'
        });
        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('❌ Missing Supabase environment variables:', {
                VITE_SUPABASE_URL: supabaseUrl,
                VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '***' : 'undefined'
            });
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
        }
        catch (error) {
            console.warn('⚠️ Could not parse Supabase URL for storage key, using default');
        }
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
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
        });
        console.log('✅ Supabase client created');
    }
    return supabaseInstance;
})();
