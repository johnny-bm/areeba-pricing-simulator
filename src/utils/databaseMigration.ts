/**
 * Database Migration Utilities
 * 
 * This file provides utilities to help migrate existing code to use the centralized
 * database configuration constants instead of hardcoded strings.
 */

import { 
  TABLES, 
  COLUMNS, 
  KV_KEYS, 
  SCENARIO_KEYS,
  PRICING_TYPES,
  DISCOUNT_TYPES,
  DISCOUNT_APPLICATIONS,
  CONFIG_FIELD_TYPES,
  ROLES,
  SUBMISSION_STATUS,
  DB_HELPERS,
  isValidTableName,
  isValidUserRole,
  isValidPricingType,
  isValidConfigFieldType
} from '../config/database';

/**
 * Legacy to New Column Mapping
 * This helps developers migrate from old hardcoded column names to new constants
 */
export const LEGACY_MIGRATION_MAP = {
  // Services table legacy mappings
  // Note: auto_add_trigger_fields and quantity_source_fields are managed by application state, not stored in DB
  'tiered_pricing': COLUMNS.SERVICES.TIERED_PRICING,
  'tieredPricing': COLUMNS.SERVICES.TIERED_PRICING,
  'pricing_type': COLUMNS.SERVICES.PRICING_TYPE,
  'pricingType': COLUMNS.SERVICES.PRICING_TYPE,
  'default_price': COLUMNS.SERVICES.DEFAULT_PRICE,
  'defaultPrice': COLUMNS.SERVICES.DEFAULT_PRICE,
  'is_active': COLUMNS.SERVICES.IS_ACTIVE,
  'isActive': COLUMNS.SERVICES.IS_ACTIVE,
  'created_at': COLUMNS.SERVICES.CREATED_AT,
  'createdAt': COLUMNS.SERVICES.CREATED_AT,
  'updated_at': COLUMNS.SERVICES.UPDATED_AT,
  'updatedAt': COLUMNS.SERVICES.UPDATED_AT,

  // Categories table legacy mappings
  'display_order': COLUMNS.CATEGORIES.ORDER_INDEX,
  'displayOrder': COLUMNS.CATEGORIES.ORDER_INDEX,
  'order_index': COLUMNS.CATEGORIES.ORDER_INDEX,
  'orderIndex': COLUMNS.CATEGORIES.ORDER_INDEX,

  // Configuration table legacy mappings
  'sort_order': COLUMNS.CONFIGURATIONS.SORT_ORDER,
  'sortOrder': COLUMNS.CONFIGURATIONS.SORT_ORDER,

  // KV Store legacy mappings
  'client_config': KV_KEYS.CLIENT_CONFIG,
  'selected_items': KV_KEYS.SELECTED_ITEMS,
  'global_discount': KV_KEYS.GLOBAL_DISCOUNT,
  'simulator_selection': KV_KEYS.SIMULATOR_SELECTION,
  'service_mappings': KV_KEYS.SERVICE_MAPPINGS,
  'auto_add_config': KV_KEYS.AUTO_ADD_CONFIG
} as const;

/**
 * Table name migration helper
 */
export const TABLE_MIGRATION_MAP = {
  'services': TABLES.SERVICES,
  'categories': TABLES.CATEGORIES,
  'tags': TABLES.TAGS,
  'configurations': TABLES.CONFIGURATIONS,
  'kv_store': TABLES.KV_STORE,
  'simulator_submissions': TABLES.SIMULATOR_SUBMISSIONS,
  'service_tags': TABLES.SERVICE_TAGS,
  'auto_add_rules': TABLES.AUTO_ADD_RULES,
  'quantity_rules': TABLES.QUANTITY_RULES,
  'user_profiles': TABLES.USER_PROFILES,
  'admin_audit_log': TABLES.ADMIN_AUDIT_LOG
} as const;

/**
 * Helper function to migrate legacy column references
 */
export function migrateLegacyColumn(legacyColumn: string): string {
  return LEGACY_MIGRATION_MAP[legacyColumn] || legacyColumn;
}

/**
 * Helper function to migrate legacy table references
 */
export function migrateLegacyTable(legacyTable: string): string {
  return TABLE_MIGRATION_MAP[legacyTable] || legacyTable;
}

/**
 * Validation helpers for data integrity
 */
export const VALIDATION_HELPERS = {
  /**
   * Validate a service object has required fields
   */
  validateService: (service: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!service[COLUMNS.SERVICES.ID]) {
      errors.push('Service ID is required');
    }
    
    if (!service[COLUMNS.SERVICES.NAME]) {
      errors.push('Service name is required');
    }
    
    if (!service[COLUMNS.SERVICES.CATEGORY]) {
      errors.push('Service category is required');
    }
    
    if (typeof service[COLUMNS.SERVICES.DEFAULT_PRICE] !== 'number') {
      errors.push('Service default price must be a number');
    }
    
    if (service[COLUMNS.SERVICES.PRICING_TYPE] && !isValidPricingType(service[COLUMNS.SERVICES.PRICING_TYPE])) {
      errors.push(`Invalid pricing type: ${service[COLUMNS.SERVICES.PRICING_TYPE]}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate a category object has required fields
   */
  validateCategory: (category: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!category[COLUMNS.CATEGORIES.ID]) {
      errors.push('Category ID is required');
    }
    
    if (!category[COLUMNS.CATEGORIES.NAME]) {
      errors.push('Category name is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate a configuration object has required fields
   */
  validateConfiguration: (config: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!config[COLUMNS.CONFIGURATIONS.ID]) {
      errors.push('Configuration ID is required');
    }
    
    if (!config[COLUMNS.CONFIGURATIONS.NAME]) {
      errors.push('Configuration name is required');
    }
    
    if (!Array.isArray(config[COLUMNS.CONFIGURATIONS.FIELDS])) {
      errors.push('Configuration fields must be an array');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate user role
   */
  validateUserRole: (role: string): boolean => {
    return isValidUserRole(role);
  },

  /**
   * Validate table name
   */
  validateTableName: (tableName: string): boolean => {
    return isValidTableName(tableName);
  }
};

/**
 * Query builder helpers using database constants
 */
export const QUERY_HELPERS = {
  /**
   * Generate a Supabase select query for services with common fields
   * Note: TAGS, AUTO_ADD_TRIGGER_FIELDS, and QUANTITY_SOURCE_FIELDS are managed by application state
   */
  selectServicesQuery: () => {
    return `${COLUMNS.SERVICES.ID}, ${COLUMNS.SERVICES.NAME}, ${COLUMNS.SERVICES.DESCRIPTION}, ${COLUMNS.SERVICES.CATEGORY}, ${COLUMNS.SERVICES.UNIT}, ${COLUMNS.SERVICES.DEFAULT_PRICE}, ${COLUMNS.SERVICES.PRICING_TYPE}, ${COLUMNS.SERVICES.TIERED_PRICING}, ${COLUMNS.SERVICES.IS_ACTIVE}, ${COLUMNS.SERVICES.CREATED_AT}, ${COLUMNS.SERVICES.UPDATED_AT}`;
  },

  /**
   * Generate a Supabase select query for categories with common fields
   */
  selectCategoriesQuery: () => {
    return `${COLUMNS.CATEGORIES.ID}, ${COLUMNS.CATEGORIES.NAME}, ${COLUMNS.CATEGORIES.DESCRIPTION}, ${COLUMNS.CATEGORIES.COLOR}, ${COLUMNS.CATEGORIES.ORDER_INDEX}, ${COLUMNS.CATEGORIES.IS_ACTIVE}, ${COLUMNS.CATEGORIES.CREATED_AT}, ${COLUMNS.CATEGORIES.UPDATED_AT}`;
  },

  /**
   * Generate a Supabase select query for configurations with common fields
   */
  selectConfigurationsQuery: () => {
    return `${COLUMNS.CONFIGURATIONS.ID}, ${COLUMNS.CONFIGURATIONS.NAME}, ${COLUMNS.CONFIGURATIONS.DESCRIPTION}, ${COLUMNS.CONFIGURATIONS.FIELDS}, ${COLUMNS.CONFIGURATIONS.IS_ACTIVE}, ${COLUMNS.CONFIGURATIONS.SORT_ORDER}, ${COLUMNS.CONFIGURATIONS.CREATED_AT}, ${COLUMNS.CONFIGURATIONS.UPDATED_AT}`;
  }
};

/**
 * Migration checklist for developers
 */
export const MIGRATION_CHECKLIST = {
  apiQueries: [
    'Replace hardcoded table names with TABLES constants',
    'Replace hardcoded column names with COLUMNS constants',
    'Use QUERY_HELPERS for common select queries',
    'Validate data using VALIDATION_HELPERS before saving'
  ],
  
  persistence: [
    'Replace hardcoded KV keys with KV_KEYS constants',
    'Use DB_HELPERS for generating KV keys with proper namespacing',
    'Replace hardcoded scenario keys with SCENARIO_KEYS constants'
  ],
  
  components: [
    'Use PRICING_TYPES instead of hardcoded pricing type strings',
    'Use DISCOUNT_TYPES and DISCOUNT_APPLICATIONS for discount logic',
    'Use CONFIG_FIELD_TYPES for form field validation',
    'Use ROLES for user permission checks'
  ],
  
  validation: [
    'Use isValidTableName() before dynamic queries',
    'Use isValidUserRole() for user permission validation',
    'Use isValidPricingType() for service validation',
    'Use VALIDATION_HELPERS for complete object validation'
  ]
};

/**
 * Example usage patterns
 */
export const USAGE_EXAMPLES = {
  // Query examples
  queryServices: `
    // OLD WAY (hardcoded)
    const { data } = await supabase.from('services').select('name, default_price');
    
    // NEW WAY (using constants)
    const { data } = await supabase
      .from(TABLES.SERVICES)
      .select(\`\${COLUMNS.SERVICES.NAME}, \${COLUMNS.SERVICES.DEFAULT_PRICE}\`);
  `,
  
  // Persistence examples
  kvStorage: `
    // OLD WAY (hardcoded)
    await kv.set('client_config', configData);
    
    // NEW WAY (using constants)
    await kv.set(KV_KEYS.CLIENT_CONFIG, configData);
  `,
  
  // Validation examples
  validation: `
    // OLD WAY (manual checks)
    if (service.pricing_type === 'tiered') { ... }
    
    // NEW WAY (using constants and validation)
    if (service[COLUMNS.SERVICES.PRICING_TYPE] === PRICING_TYPES.TIERED) { ... }
    if (isValidPricingType(pricingType)) { ... }
  `,
  
  // Template generation
  templates: `
    // OLD WAY (manual object creation)
    const newService = { name: '', category: '', default_price: 0, is_active: true };
    
    // NEW WAY (using templates)
    const newService = DB_HELPERS.serviceTemplate({ 
      [COLUMNS.SERVICES.NAME]: 'New Service',
      [COLUMNS.SERVICES.CATEGORY]: 'setup'
    });
  `
};

/**
 * Development console helper to check current migration status
 */
export function checkMigrationStatus() {
  // // console.log('📊 Database Configuration Migration Status');
  // // console.log('==========================================');
  // // console.log('✅ Database constants loaded:', Object.keys(TABLES).length, 'tables');
  // // console.log('✅ Column mappings available:', Object.keys(COLUMNS).length, 'table schemas');
  // // console.log('✅ KV keys standardized:', Object.keys(KV_KEYS).length, 'keys');
  // // console.log('✅ Validation helpers ready:', Object.keys(VALIDATION_HELPERS).length, 'validators');
  // // console.log('✅ Query helpers available:', Object.keys(QUERY_HELPERS).length, 'query builders');
  // // console.log('');
  // // console.log('Next steps:');
  // // console.log('1. Update API queries to use TABLES and COLUMNS constants');
  // // console.log('2. Update persistence logic to use KV_KEYS constants');
  // // console.log('3. Add validation using VALIDATION_HELPERS');
  // // console.log('4. Use DB_HELPERS for generating new records');
  // // console.log('');
  // // console.log('See MIGRATION_CHECKLIST and USAGE_EXAMPLES for detailed guidance.');
}

// Auto-run migration status check in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Only run in browser development environment
  setTimeout(checkMigrationStatus, 1000);
}