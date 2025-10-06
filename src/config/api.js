import { env } from './env';
// API configuration
export const API_CONFIG = {
    BASE_URL: env.VITE_SUPABASE_URL,
    ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/v1/token?grant_type=password',
            LOGOUT: '/auth/v1/logout',
            SIGNUP: '/auth/v1/signup',
            RESET_PASSWORD: '/auth/v1/recover',
        },
        FUNCTIONS: {
            BASE: '/functions/v1',
            PRICING: '/pricing',
            ADMIN: '/admin',
            GUEST: '/guest',
        },
    },
};
// External URLs
export const EXTERNAL_URLS = {
    AREEBA_PRIVACY: 'https://www.areeba.com/english/privacy-and-security',
    AREEBA_WEBSITE: 'https://www.areeba.com',
    SUPABASE_DASHBOARD: (projectId) => `https://supabase.com/dashboard/project/${projectId}/functions`,
};
