// Route constants with type safety
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ADMIN: '/admin',
  
  // Simulator-specific admin routes
  ADMIN_SIMULATOR_DASHBOARD: (simulator: string) => `/admin/${simulator}/dashboard`,
  ADMIN_SIMULATOR_INFO: (simulator: string) => `/admin/${simulator}/info`,
  ADMIN_SIMULATOR_CLIENT_FIELDS: (simulator: string) => `/admin/${simulator}/client-fields`,
  ADMIN_SIMULATOR_CATEGORIES: (simulator: string) => `/admin/${simulator}/categories`,
  ADMIN_SIMULATOR_SERVICES: (simulator: string) => `/admin/${simulator}/services`,
  ADMIN_SIMULATOR_TAGS: (simulator: string) => `/admin/${simulator}/tags`,
  
  // Global admin routes
  ADMIN_SIMULATORS: '/admin/simulators',
  ADMIN_HISTORY: '/admin/history',
  ADMIN_GUEST_SUBMISSIONS: '/admin/guest-submissions',
  ADMIN_USERS: '/admin/users',
  
  // Legacy routes (for backward compatibility)
  ADMIN_CONFIGURATION: '/admin/configuration',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_TAGS: '/admin/tags',
  ADMIN_SCENARIOS: '/admin/scenarios',
  
  SIMULATOR: '/simulator',
  GUEST: '/guest',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];
