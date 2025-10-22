/**
 * Comprehensive validation schemas using Zod
 * Provides runtime validation for all data types and API responses
 */

import { z } from 'zod';

// Base schemas for common types
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const emailSchema = z.string().email('Invalid email format');
export const urlSchema = z.string().url('Invalid URL format');
export const positiveNumberSchema = z.number().positive('Must be a positive number');
export const nonEmptyStringSchema = z.string().min(1, 'Cannot be empty');

// User and authentication schemas
export const userRoleSchema = z.enum(['owner', 'admin', 'member'], {
  errorMap: () => ({ message: 'Invalid user role' })
});

export const userSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  full_name: nonEmptyStringSchema,
  role: userRoleSchema,
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const authStateSchema = z.object({
  user: userSchema.nullable(),
  isAuthenticated: z.boolean(),
  isLoading: z.boolean(),
  error: z.string().optional(),
});

// Pricing and business logic schemas
export const pricingTypeSchema = z.enum(['one_time', 'recurring', 'per_unit', 'tiered'], {
  errorMap: () => ({ message: 'Invalid pricing type' })
});

export const billingCycleSchema = z.enum(['one_time', 'monthly', 'quarterly', 'yearly'], {
  errorMap: () => ({ message: 'Invalid billing cycle' })
});

export const discountTypeSchema = z.enum(['percentage', 'fixed'], {
  errorMap: () => ({ message: 'Invalid discount type' })
});

export const discountApplicationSchema = z.enum(['none', 'both', 'monthly', 'onetime', 'unit', 'total'], {
  errorMap: () => ({ message: 'Invalid discount application' })
});

export const tierSchema = z.object({
  min: positiveNumberSchema,
  max: positiveNumberSchema.optional(),
  price: positiveNumberSchema,
  type: z.enum(['fixed', 'percentage']),
});

export const tieredPricingSchema = z.object({
  type: z.literal('tiered'),
  tiers: z.array(tierSchema).min(1, 'At least one tier is required'),
  original_pricing_type: pricingTypeSchema,
});

export const pricingItemSchema = z.object({
  id: uuidSchema,
  name: nonEmptyStringSchema.max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  categoryId: uuidSchema,
  unit: nonEmptyStringSchema.max(50, 'Unit too long'),
  defaultPrice: positiveNumberSchema.max(999999.99, 'Price too high'),
  pricingType: pricingTypeSchema,
  billingCycle: billingCycleSchema.optional(),
  is_active: z.boolean(),
  tiers: z.array(tierSchema).optional(),
  tiered_pricing: tieredPricingSchema.optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const categorySchema = z.object({
  id: uuidSchema,
  name: nonEmptyStringSchema.max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  order_index: z.number().int().min(0, 'Order index must be non-negative'),
  display_order: z.number().int().min(0, 'Display order must be non-negative'),
  is_active: z.boolean(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const tagSchema = z.object({
  id: uuidSchema,
  name: nonEmptyStringSchema.max(50, 'Tag name too long'),
  is_active: z.boolean(),
  usage_count: z.number().int().min(0, 'Usage count must be non-negative'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Configuration schemas
export const configFieldTypeSchema = z.enum(['text', 'number', 'boolean', 'select', 'multi-select'], {
  errorMap: () => ({ message: 'Invalid config field type' })
});

export const configFieldSchema = z.object({
  id: uuidSchema,
  name: nonEmptyStringSchema.max(100, 'Field name too long'),
  type: configFieldTypeSchema,
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
});

export const configurationSchema = z.object({
  id: uuidSchema,
  name: nonEmptyStringSchema.max(100, 'Configuration name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  fields: z.array(configFieldSchema).min(1, 'At least one field is required'),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0, 'Sort order must be non-negative'),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Scenario and submission schemas
export const selectedItemSchema = z.object({
  id: uuidSchema,
  item: pricingItemSchema,
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: positiveNumberSchema,
  discount: z.number().min(0, 'Discount cannot be negative').max(100, 'Discount cannot exceed 100%'),
  discountType: discountTypeSchema,
  discountApplication: discountApplicationSchema,
  isFree: z.boolean(),
});

export const scenarioSummarySchema = z.object({
  oneTimeTotal: z.number().min(0, 'Total cannot be negative'),
  monthlyTotal: z.number().min(0, 'Total cannot be negative'),
  yearlyTotal: z.number().min(0, 'Total cannot be negative'),
  totalProjectCost: z.number().min(0, 'Total cannot be negative'),
  itemCount: z.number().int().min(0, 'Item count cannot be negative'),
  savings: z.object({
    totalSavings: z.number().min(0, 'Savings cannot be negative'),
    discountSavings: z.number().min(0, 'Discount savings cannot be negative'),
    freeSavings: z.number().min(0, 'Free savings cannot be negative'),
    originalPrice: z.number().min(0, 'Original price cannot be negative'),
    savingsRate: z.number().min(0, 'Savings rate cannot be negative').max(100, 'Savings rate cannot exceed 100%'),
  }),
});

export const scenarioDataSchema = z.object({
  id: uuidSchema.optional(),
  userId: uuidSchema.optional(),
  config: z.record(z.any()).optional(),
  legacyConfig: z.record(z.any()).optional(),
  configDefinitions: z.array(configurationSchema).optional(),
  selectedItems: z.array(selectedItemSchema),
  categories: z.array(categorySchema).optional(),
  tags: z.array(tagSchema).optional(),
  summary: scenarioSummarySchema,
  globalDiscount: z.number().min(0, 'Global discount cannot be negative').max(100, 'Global discount cannot exceed 100%'),
  globalDiscountType: discountTypeSchema,
  globalDiscountApplication: discountApplicationSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// API response schemas
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const paginatedResponseSchema = z.object({
  data: z.array(z.any()),
  total: z.number().int().min(0, 'Total must be non-negative'),
  page: z.number().int().min(1, 'Page must be at least 1'),
  limit: z.number().int().min(1, 'Limit must be at least 1'),
  hasMore: z.boolean(),
});

// Form validation schemas
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerFormSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  inviteCode: z.string().optional(),
});

export const pricingItemFormSchema = z.object({
  name: nonEmptyStringSchema.max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  categoryId: uuidSchema,
  unit: nonEmptyStringSchema.max(50, 'Unit too long'),
  defaultPrice: positiveNumberSchema.max(999999.99, 'Price too high'),
  pricingType: pricingTypeSchema,
  billingCycle: billingCycleSchema.optional(),
  is_active: z.boolean(),
  tags: z.array(z.string()).optional(),
});

export const categoryFormSchema = z.object({
  name: nonEmptyStringSchema.max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  order_index: z.number().int().min(0, 'Order index must be non-negative'),
  display_order: z.number().int().min(0, 'Display order must be non-negative'),
  is_active: z.boolean(),
});

// Validation helper functions
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    throw error;
  }
};

export const validateDataSafe = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      return { success: false, error: errorMessages };
    }
    return { success: false, error: 'Unknown validation error' };
  }
};

// Schema validation for API responses
export const validateApiResponse = (data: unknown) => validateData(apiResponseSchema, data);
export const validatePricingItems = (data: unknown) => validateData(z.array(pricingItemSchema), data);
export const validateCategories = (data: unknown) => validateData(z.array(categorySchema), data);
export const validateScenarioData = (data: unknown) => validateData(scenarioDataSchema, data);
export const validateUser = (data: unknown) => validateData(userSchema, data);
export const validateAuthState = (data: unknown) => validateData(authStateSchema, data);

// Form validation helpers
export const validateLoginForm = (data: unknown) => validateData(loginFormSchema, data);
export const validateRegisterForm = (data: unknown) => validateData(registerFormSchema, data);
export const validatePricingItemForm = (data: unknown) => validateData(pricingItemFormSchema, data);
export const validateCategoryForm = (data: unknown) => validateData(categoryFormSchema, data);

// Type exports for TypeScript
export type User = z.infer<typeof userSchema>;
export type AuthState = z.infer<typeof authStateSchema>;
export type PricingItem = z.infer<typeof pricingItemSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Configuration = z.infer<typeof configurationSchema>;
export type SelectedItem = z.infer<typeof selectedItemSchema>;
export type ScenarioData = z.infer<typeof scenarioDataSchema>;
export type ScenarioSummary = z.infer<typeof scenarioSummarySchema>;
export type LoginForm = z.infer<typeof loginFormSchema>;
export type RegisterForm = z.infer<typeof registerFormSchema>;
export type PricingItemForm = z.infer<typeof pricingItemFormSchema>;
export type CategoryForm = z.infer<typeof categoryFormSchema>;
