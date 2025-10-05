// Guest feature constants
export const GUEST_LIMITS = {
  MAX_SUBMISSIONS_PER_HOUR: 5,
  MAX_SUBMISSIONS_PER_DAY: 20,
  MAX_SESSION_DURATION: 60, // minutes
} as const;

export const GUEST_ERRORS = {
  EMAIL_REQUIRED: 'Email address is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PHONE_REQUIRED: 'Phone number is required',
  PHONE_INVALID: 'Please enter a valid phone number',
  FIRST_NAME_REQUIRED: 'First name is required',
  LAST_NAME_REQUIRED: 'Last name is required',
  COMPANY_REQUIRED: 'Company name is required',
  SUBMISSION_LIMIT_EXCEEDED: 'You have exceeded the submission limit. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired. Please start over.',
  INVALID_SESSION: 'Invalid session. Please refresh the page.',
} as const;

export const GUEST_VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  MIN_NAME_LENGTH: 1,
  MAX_NAME_LENGTH: 50,
  MIN_COMPANY_LENGTH: 1,
  MAX_COMPANY_LENGTH: 100,
} as const;

export const GUEST_STORAGE_KEYS = {
  SESSION_ID: 'guest_session_id',
  CONTACT_INFO: 'guest_contact_info',
  SCENARIO_DATA: 'guest_scenario_data',
  SUBMISSION_COUNT: 'guest_submission_count',
  LAST_SUBMISSION: 'guest_last_submission',
} as const;

export const GUEST_MESSAGES = {
  WELCOME: 'Welcome! Create your pricing scenario below.',
  CONTACT_REQUIRED: 'Please provide your contact information to receive your quote.',
  SUBMISSION_SUCCESS: 'Thank you! Your quote has been submitted successfully.',
  SUBMISSION_ERROR: 'Failed to submit your quote. Please try again.',
  SESSION_WARNING: 'Your session will expire soon. Please save your progress.',
  LIMIT_WARNING: 'You are approaching your submission limit.',
} as const;

export const GUEST_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  SUBMITTED: 'submitted',
  BLOCKED: 'blocked',
} as const;
