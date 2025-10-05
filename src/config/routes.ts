// Route constants with type safety
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ADMIN: '/admin',
  SIMULATOR: '/simulator',
  GUEST: '/guest',
} as const;

export type Route = typeof ROUTES[keyof typeof ROUTES];
