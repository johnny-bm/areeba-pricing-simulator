// config/database.ts
// Central configuration file mapping database structure to frontend

/**
 * Database Table Names
 * Use these constants instead of hardcoding table names throughout the application
 */
export const TABLES = {
  // User Management
  USER_PROFILES: 'user_profiles',
  ADMIN_USERS: 'admin_users',
  ADMIN_AUDIT_LOG: 'admin_audit_log',
  
  // Core Business Data
  SERVICES: 'services',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  CONFIGURATIONS: 'configurations',
  SIMULATOR_SUBMISSIONS: 'simulator_submissions',
  
  // Relationships & Rules
  SERVICE_TAGS: 'service_tags',
  AUTO_ADD_RULES: 'auto_add_rules',
  QUANTITY_RULES: 'quantity_rules',
  
  // Utility
  KV_STORE: 'kv_store',
  
  // Views (read-only)
  SERVICES_OVERVIEW: 'services_overview',
  SERVICES_WITH_AUTO_ADD_RULES: 'services_with_auto_add_rules',
  SERVICES_WITH_CATEGORIES: 'services_with_categories',
  SERVICES_WITH_QUANTITY_RULES: 'services_with_quantity_rules',
  SERVICES_WITH_TAGS: 'services_with_tags'
} as const;

/**
 * User Roles
 */
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member'
} as const;

/**
 * Submission Status Options
 */
export const SUBMISSION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;

/**
 * Pricing Types
 */
export const PRICING_TYPES = {
  SIMPLE: 'simple',
  TIERED: 'tiered'
} as const;

/**
 * Discount Types
 */
export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed'
} as const;

/**
 * Discount Application Types
 */
export const DISCOUNT_APPLICATIONS = {
  NONE: 'none',
  BOTH: 'both',
  MONTHLY: 'monthly',
  ONETIME: 'onetime',
  UNIT: 'unit',
  TOTAL: 'total'
} as const;

/**
 * Configuration Field Types
 */
export const CONFIG_FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  SELECT: 'select',
  MULTI_SELECT: 'multi-select'
} as const;

/**
 * Common category identifiers (these should match actual database values)
 */
export const CATEGORY_IDS = {
  SETUP: 'setup',
  HOSTING: 'hosting',
  PROCESSING: 'processing',
  PRODUCTION: 'production',
  DIGITAL: 'digital',
  DELIVERY: 'delivery',
  CARD_HOSTING: 'card_hosting',
  TRANSACTION_PROCESSING: 'transaction_processing',
  CARD_PRODUCTION: 'card_production',
  DIGITAL_SERVICES: 'digital_services',
  DELIVERY_SERVICES: 'delivery_services'
} as const;

/**
 * Common Column Names
 * For frequently used columns across multiple tables
 */
export const COMMON_COLUMNS = {
  ID: 'id',
  NAME: 'name',
  DESCRIPTION: 'description',
  IS_ACTIVE: 'is_active',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
} as const;

/**
 * Table-Specific Column Names
 */
export const COLUMNS = {
  USER_PROFILES: {
    ID: 'id',
    EMAIL: 'email',
    FULL_NAME: 'full_name',
    ROLE: 'role',
    IS_ACTIVE: 'is_active',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  SERVICES: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    CATEGORY: 'category',
    UNIT: 'unit',
    DEFAULT_PRICE: 'default_price',
    PRICING_TYPE: 'pricing_type',
    TIERED_PRICING: 'tiered_pricing',
    IS_ACTIVE: 'is_active',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
    // Note: TAGS are stored in the service_tags junction table, not in services table
    // Note: AUTO_ADD_TRIGGER_FIELDS and QUANTITY_SOURCE_FIELDS are managed by application state, not in database
  },
  
  CATEGORIES: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    COLOR: 'color',
    ORDER_INDEX: 'order_index',
    DISPLAY_ORDER: 'display_order',
    IS_ACTIVE: 'is_active',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  TAGS: {
    ID: 'id',
    NAME: 'name',
    IS_ACTIVE: 'is_active',
    USAGE_COUNT: 'usage_count',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  CONFIGURATIONS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    FIELDS: 'fields',
    IS_ACTIVE: 'is_active',
    SORT_ORDER: 'sort_order',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  
  SIMULATOR_SUBMISSIONS: {
    ID: 'id',
    USER_ID: 'user_id',
    CONFIGURATION_ID: 'configuration_id',
    CONFIGURATION_DATA: 'configuration_data',
    SERVICES_DATA: 'services_data',
    FEE_SUMMARY: 'fee_summary',
    SUBMISSION_NAME: 'submission_name',
    NOTES: 'notes',
    STATUS: 'status',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    SUBMITTED_AT: 'submitted_at'
  },
  
  SERVICE_TAGS: {
    ID: 'id',
    SERVICE_ID: 'service_id',
    TAG_ID: 'tag_id',
    CREATED_AT: 'created_at'
  },
  
  AUTO_ADD_RULES: {
    ID: 'id',
    SERVICE_ID: 'service_id',
    CONFIG_FIELD_ID: 'config_field_id',
    IS_ACTIVE: 'is_active',
    CREATED_AT: 'created_at'
  },
  
  QUANTITY_RULES: {
    ID: 'id',
    SERVICE_ID: 'service_id',
    CONFIG_FIELD_ID: 'config_field_id',
    MULTIPLIER: 'multiplier',
    IS_ACTIVE: 'is_active',
    CREATED_AT: 'created_at'
  },
  
  ADMIN_AUDIT_LOG: {
    ID: 'id',
    USER_ID: 'user_id',
    ACTION: 'action',
    RESOURCE_TYPE: 'resource_type',
    RESOURCE_ID: 'resource_id',
    DETAILS: 'details',
    IP_ADDRESS: 'ip_address',
    USER_AGENT: 'user_agent',
    SUCCESS: 'success',
    ERROR_MESSAGE: 'error_message',
    CREATED_AT: 'created_at'
  },

  KV_STORE: {
    ID: 'id',
    KEY: 'key',
    VALUE: 'value',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  }
} as const;

/**
 * KV Store Keys
 * Standardized keys for the key-value store
 */
export const KV_KEYS = {
  // Client Configuration
  CLIENT_CONFIG: 'client_config',
  SELECTED_ITEMS: 'selected_items',
  GLOBAL_DISCOUNT: 'global_discount',
  GLOBAL_DISCOUNT_TYPE: 'global_discount_type',
  GLOBAL_DISCOUNT_APPLICATION: 'global_discount_application',
  
  // Simulator State
  SIMULATOR_SELECTION: 'simulator_selection',
  SERVICE_MAPPINGS: 'service_mappings',
  AUTO_ADD_CONFIG: 'auto_add_config',
  
  // Scenarios
  SCENARIO_DATA: 'scenario_data',
  SCENARIO_HISTORY: 'scenario_history',
  
  // Application Settings
  APP_VERSION: 'app_version',
  LAST_BACKUP: 'last_backup'
} as const;

/**
 * Scenario Data Keys
 * Keys used for scenario data storage in the database
 */
export const SCENARIO_KEYS = {
  CONFIG: 'config',
  SELECTED_ITEMS: 'selectedItems', 
  CATEGORIES: 'categories',
  GLOBAL_DISCOUNT: 'globalDiscount',
  GLOBAL_DISCOUNT_TYPE: 'globalDiscountType',
  GLOBAL_DISCOUNT_APPLICATION: 'globalDiscountApplication',
  SUMMARY: 'summary',
  CLIENT_NAME: 'clientName',
  PROJECT_NAME: 'projectName',
  PREPARED_BY: 'preparedBy',
  CREATED_AT: 'createdAt',
  SCENARIO_ID: 'scenarioId'
} as const;

/**
 * Type definitions for better type safety
 */
export type TableName = typeof TABLES[keyof typeof TABLES];
export type UserRole = typeof ROLES[keyof typeof ROLES];
export type SubmissionStatus = typeof SUBMISSION_STATUS[keyof typeof SUBMISSION_STATUS];
export type PricingType = typeof PRICING_TYPES[keyof typeof PRICING_TYPES];
export type DiscountType = typeof DISCOUNT_TYPES[keyof typeof DISCOUNT_TYPES];
export type DiscountApplication = typeof DISCOUNT_APPLICATIONS[keyof typeof DISCOUNT_APPLICATIONS];
export type ConfigFieldType = typeof CONFIG_FIELD_TYPES[keyof typeof CONFIG_FIELD_TYPES];
export type CategoryId = typeof CATEGORY_IDS[keyof typeof CATEGORY_IDS];
export type KvKey = typeof KV_KEYS[keyof typeof KV_KEYS];
export type ScenarioKey = typeof SCENARIO_KEYS[keyof typeof SCENARIO_KEYS];

/**
 * Helper function to check if user has admin access
 */
export const hasAdminAccess = (role: string): boolean => {
  return role === ROLES.OWNER || role === ROLES.ADMIN;
};

/**
 * Helper function to check if user is owner
 */
export const isOwner = (role: string): boolean => {
  return role === ROLES.OWNER;
};

/**
 * Helper function to get all admin roles
 */
export const getAdminRoles = (): string[] => {
  return [ROLES.OWNER, ROLES.ADMIN];
};

/**
 * Helper function to validate table name
 */
export const isValidTableName = (tableName: string): tableName is TableName => {
  return Object.values(TABLES).includes(tableName as TableName);
};

/**
 * Helper function to validate user role
 */
export const isValidUserRole = (role: string): role is UserRole => {
  return Object.values(ROLES).includes(role as UserRole);
};

/**
 * Helper function to validate pricing type
 */
export const isValidPricingType = (type: string): type is PricingType => {
  return Object.values(PRICING_TYPES).includes(type as PricingType);
};

/**
 * Helper function to validate config field type
 */
export const isValidConfigFieldType = (type: string): type is ConfigFieldType => {
  return Object.values(CONFIG_FIELD_TYPES).includes(type as ConfigFieldType);
};

/**
 * Default values for new records
 */
export const DEFAULTS = {
  CATEGORY_COLOR: '#6B7280',
  PRICING_TYPE: PRICING_TYPES.SIMPLE,
  MULTIPLIER: 1.0,
  SUBMISSION_STATUS: SUBMISSION_STATUS.DRAFT,
  DISCOUNT_TYPE: DISCOUNT_TYPES.PERCENTAGE,
  DISCOUNT_APPLICATION: DISCOUNT_APPLICATIONS.NONE,
  IS_ACTIVE: true,
  ORDER_INDEX: 0
} as const;

/**
 * Database query helper functions
 */
export const DB_HELPERS = {
  /**
   * Generate a standardized KV store key
   */
  kvKey: (baseKey: string, userId?: string): string => {
    return userId ? `${baseKey}_${userId}` : baseKey;
  },

  /**
   * Generate a scenario key with timestamp
   */
  scenarioKey: (clientName: string, timestamp?: number): string => {
    const ts = timestamp || Date.now();
    const sanitizedName = clientName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    return `scenario_${sanitizedName}_${ts}`;
  },

  /**
   * Generate an audit log entry
   */
  auditLogEntry: (
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    details?: Record<string, any>,
    success = true,
    errorMessage?: string
  ) => ({
    [COLUMNS.ADMIN_AUDIT_LOG.USER_ID]: userId,
    [COLUMNS.ADMIN_AUDIT_LOG.ACTION]: action,
    [COLUMNS.ADMIN_AUDIT_LOG.RESOURCE_TYPE]: resourceType,
    [COLUMNS.ADMIN_AUDIT_LOG.RESOURCE_ID]: resourceId,
    [COLUMNS.ADMIN_AUDIT_LOG.DETAILS]: details ? JSON.stringify(details) : null,
    [COLUMNS.ADMIN_AUDIT_LOG.SUCCESS]: success,
    [COLUMNS.ADMIN_AUDIT_LOG.ERROR_MESSAGE]: errorMessage || null,
    [COLUMNS.ADMIN_AUDIT_LOG.CREATED_AT]: new Date().toISOString()
  }),

  /**
   * Generate a service record template
   */
  serviceTemplate: (overrides: Partial<any> = {}) => ({
    [COLUMNS.SERVICES.NAME]: '',
    [COLUMNS.SERVICES.DESCRIPTION]: '',
    [COLUMNS.SERVICES.CATEGORY]: '',
    [COLUMNS.SERVICES.UNIT]: 'each',
    [COLUMNS.SERVICES.DEFAULT_PRICE]: 0,
    [COLUMNS.SERVICES.PRICING_TYPE]: DEFAULTS.PRICING_TYPE,
    [COLUMNS.SERVICES.TIERED_PRICING]: null,
    [COLUMNS.SERVICES.IS_ACTIVE]: DEFAULTS.IS_ACTIVE,
    ...overrides
    // Note: Tags are stored in service_tags junction table
    // Note: Auto-add and quantity fields are managed by application state
  }),

  /**
   * Generate a category record template
   */
  categoryTemplate: (overrides: Partial<any> = {}) => ({
    [COLUMNS.CATEGORIES.NAME]: '',
    [COLUMNS.CATEGORIES.DESCRIPTION]: '',
    [COLUMNS.CATEGORIES.COLOR]: DEFAULTS.CATEGORY_COLOR,
    [COLUMNS.CATEGORIES.ORDER_INDEX]: DEFAULTS.ORDER_INDEX,
    [COLUMNS.CATEGORIES.IS_ACTIVE]: DEFAULTS.IS_ACTIVE,
    ...overrides
  }),

  /**
   * Generate a configuration record template
   */
  configurationTemplate: (overrides: Partial<any> = {}) => ({
    [COLUMNS.CONFIGURATIONS.NAME]: '',
    [COLUMNS.CONFIGURATIONS.DESCRIPTION]: '',
    [COLUMNS.CONFIGURATIONS.FIELDS]: [],
    [COLUMNS.CONFIGURATIONS.IS_ACTIVE]: DEFAULTS.IS_ACTIVE,
    [COLUMNS.CONFIGURATIONS.SORT_ORDER]: DEFAULTS.ORDER_INDEX,
    ...overrides
  })
};

/**
 * Example Usage:
 * 
 * import { TABLES, COLUMNS, ROLES, DB_HELPERS } from './config/database'
 * 
 * // Query services
 * const { data } = await supabase
 *   .from(TABLES.SERVICES)
 *   .select(`${COLUMNS.SERVICES.NAME}, ${COLUMNS.SERVICES.DEFAULT_PRICE}`)
 *   .eq(COLUMNS.SERVICES.IS_ACTIVE, true)
 * 
 * // Check user role
 * if (user.role === ROLES.ADMIN) {
 *   // Admin-only code
 * }
 * 
 * // Create a new service
 * const newService = DB_HELPERS.serviceTemplate({
 *   [COLUMNS.SERVICES.NAME]: 'New Service',
 *   [COLUMNS.SERVICES.CATEGORY]: 'setup'
 * });
 * 
 * // Generate KV key
 * const userConfigKey = DB_HELPERS.kvKey(KV_KEYS.CLIENT_CONFIG, userId);
 */