// Auth-related constants
export const AUTH_STORAGE_KEYS = {
  USER: 'user',
  SESSION: 'session',
} as const;

export const AUTH_ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin',
  OWNER: 'owner',
} as const;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_REQUIRED: 'Please enter your email address',
  PASSWORD_REQUIRED: 'Please enter your password',
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  SIGNUP_FAILED: 'Signup failed. Please try again.',
  LOGIN_FAILED: 'Login failed. Please try again.',
  LOGOUT_FAILED: 'Logout failed. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
} as const;

export const AUTH_VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
