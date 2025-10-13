// Type/Schema Validation Utilities
// Prevents type mismatches between frontend types and database schema

/**
 * Validates that a domain object has the correct field names for database insertion
 * This helps catch camelCase vs snake_case mismatches at development time
 */
export function validateDatabaseFields<T extends Record<string, any>>(
  obj: T,
  expectedFields: string[],
  context: string
): void {
  const missingFields = expectedFields.filter(field => !(field in obj));
  
  if (missingFields.length > 0) {
    console.warn(`⚠️ ${context}: Missing database fields:`, missingFields);
    console.warn('Expected fields:', expectedFields);
    console.warn('Actual object keys:', Object.keys(obj));
  }
}

/**
 * Validates that camelCase fields are properly mapped to snake_case
 * Use this in API functions to catch mapping issues early
 */
export function validateFieldMapping<T extends Record<string, any>>(
  original: T,
  mapped: Record<string, any>,
  fieldMappings: Record<string, string>,
  context: string
): void {
  const mappingErrors: string[] = [];
  
  for (const [camelField, snakeField] of Object.entries(fieldMappings)) {
    if (original[camelField] !== undefined && mapped[snakeField] === undefined) {
      mappingErrors.push(`${camelField} -> ${snakeField} mapping failed`);
    }
  }
  
  if (mappingErrors.length > 0) {
    console.error(`❌ ${context}: Field mapping errors:`, mappingErrors);
    console.error('Original object:', original);
    console.error('Mapped object:', mapped);
    console.error('Expected mappings:', fieldMappings);
  }
}

/**
 * Common field mappings for different tables
 * Add new mappings here as you discover them
 */
export const FIELD_MAPPINGS = {
  services: {
    categoryId: 'category',
    defaultPrice: 'default_price',
    pricingType: 'pricing_type',
    is_active: 'is_active'
  },
  guest_scenarios: {
    sessionId: 'session_id',
    firstName: 'first_name',
    lastName: 'last_name',
    companyName: 'company_name',
    phoneNumber: 'phone_number',
    scenarioName: 'scenario_name',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  user_profiles: {
    firstName: 'first_name',
    lastName: 'last_name',
    is_active: 'is_active',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
} as const;

/**
 * Validates service data before database insertion
 */
export function validateServiceData(service: any): void {
  validateDatabaseFields(service, [
    'id', 'name', 'description', 'category', 'unit', 
    'default_price', 'pricing_type', 'is_active', 'simulator_id'
  ], 'Service validation');
  
  validateFieldMapping(service, service, FIELD_MAPPINGS.services, 'Service mapping');
}

/**
 * Validates guest scenario data before database insertion
 */
export function validateGuestScenarioData(data: any): void {
  validateDatabaseFields(data, [
    'submission_code', 'email', 'phone_number', 'first_name', 
    'last_name', 'company_name', 'scenario_name', 'scenario_data',
    'total_price', 'status', 'created_at'
  ], 'Guest scenario validation');
}

/**
 * Development-only validation that can be removed in production
 * Use this to catch type mismatches during development
 */
export function devValidateTypeMapping<T>(
  original: T,
  mapped: any,
  tableName: keyof typeof FIELD_MAPPINGS,
  context: string
): void {
  if (process.env.NODE_ENV === 'development') {
    const mappings = FIELD_MAPPINGS[tableName];
    if (mappings) {
      validateFieldMapping(original, mapped, mappings, context);
    }
  }
}

/**
 * Type-safe field mapping utility
 * Automatically converts camelCase to snake_case for database insertion
 */
export function mapToDatabase<T extends Record<string, any>>(
  obj: T,
  customMappings: Record<string, string> = {}
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Use custom mapping if provided, otherwise convert camelCase to snake_case
    const dbKey = customMappings[key] || key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[dbKey] = value;
  }
  
  return result;
}

/**
 * Type-safe field mapping utility for reading from database
 * Automatically converts snake_case to camelCase for frontend use
 */
export function mapFromDatabase<T extends Record<string, any>>(
  obj: T,
  customMappings: Record<string, string> = {}
): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Use custom mapping if provided, otherwise convert snake_case to camelCase
    const frontendKey = customMappings[key] || key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[frontendKey] = value;
  }
  
  return result;
}
