// Admin feature constants
export const ADMIN_ROLES = {
    MEMBER: 'member',
    ADMIN: 'admin',
    OWNER: 'owner',
};
export const ADMIN_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
    SUSPENDED: 'suspended',
};
export const ADMIN_TABLES = {
    USERS: 'users',
    INVITES: 'invites',
    SCENARIOS: 'scenarios',
    GUEST_SUBMISSIONS: 'guest_submissions',
};
export const ADMIN_ACTIONS = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    INVITE: 'invite',
    SUSPEND: 'suspend',
    ACTIVATE: 'activate',
};
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
};
export const ADMIN_PERMISSIONS = {
    MANAGE_USERS: 'manage_users',
    MANAGE_INVITES: 'manage_invites',
    VIEW_ANALYTICS: 'view_analytics',
    MANAGE_SETTINGS: 'manage_settings',
    EXPORT_DATA: 'export_data',
};
export const ADMIN_SORT_OPTIONS = {
    NAME: { field: 'name', direction: 'asc' },
    EMAIL: { field: 'email', direction: 'asc' },
    ROLE: { field: 'role', direction: 'asc' },
    CREATED: { field: 'created_at', direction: 'desc' },
    UPDATED: { field: 'updated_at', direction: 'desc' },
};
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
};
