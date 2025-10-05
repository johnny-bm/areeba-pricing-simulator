// Admin feature constants
export const ADMIN_ROLES = {
  MEMBER: 'member',
  ADMIN: 'admin',
  OWNER: 'owner',
} as const;

export const ADMIN_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
} as const;

export const ADMIN_TABLES = {
  USERS: 'users',
  INVITES: 'invites',
  SCENARIOS: 'scenarios',
  GUEST_SUBMISSIONS: 'guest_submissions',
} as const;

export const ADMIN_ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  INVITE: 'invite',
  SUSPEND: 'suspend',
  ACTIVATE: 'activate',
} as const;

export const ADMIN_ERRORS = {
  UNAUTHORIZED: 'You do not have permission to perform this action',
  USER_NOT_FOUND: 'User not found',
  INVITE_NOT_FOUND: 'Invite not found',
  INVITE_EXPIRED: 'Invite has expired',
  INVITE_ALREADY_USED: 'Invite has already been used',
  INVALID_ROLE: 'Invalid role specified',
  CANNOT_DELETE_OWNER: 'Cannot delete the owner account',
  CANNOT_DEMOTE_OWNER: 'Cannot change owner role',
  EMAIL_ALREADY_EXISTS: 'Email address already exists',
  INVALID_EMAIL: 'Invalid email address',
} as const;

export const ADMIN_PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_INVITES: 'manage_invites',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings',
  EXPORT_DATA: 'export_data',
} as const;

export const ADMIN_SORT_OPTIONS = {
  NAME: { field: 'name' as const, direction: 'asc' as const },
  EMAIL: { field: 'email' as const, direction: 'asc' as const },
  ROLE: { field: 'role' as const, direction: 'asc' as const },
  CREATED: { field: 'created_at' as const, direction: 'desc' as const },
  UPDATED: { field: 'updated_at' as const, direction: 'desc' as const },
} as const;

export const ADMIN_DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  LAST_YEAR: 'last_year',
  CUSTOM: 'custom',
} as const;
