import { z } from 'zod';

// Common validation schemas
export const requiredStringSchema = z.string().min(1, 'This field is required');
export const optionalStringSchema = z.string().optional();
export const emailSchema = z.string().email('Invalid email address');
export const urlSchema = z.string().url('Invalid URL');
export const positiveNumberSchema = z.number().positive('Must be a positive number');
export const nonNegativeNumberSchema = z.number().min(0, 'Must be a non-negative number');

// Pricing item validation
export const pricingItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: requiredStringSchema.max(100, 'Name must be less than 100 characters'),
  description: requiredStringSchema.max(500, 'Description must be less than 500 characters'),
  category: requiredStringSchema,
  categoryId: z.string().uuid().optional(),
  unit: requiredStringSchema,
  defaultPrice: positiveNumberSchema,
  pricingType: z.enum(['one_time', 'recurring', 'per_unit', 'tiered']),
  billingCycle: z.enum(['one_time', 'monthly', 'quarterly', 'yearly']),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional()
});

// Category validation
export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: requiredStringSchema.max(100, 'Name must be less than 100 characters'),
  description: optionalStringSchema.max(500, 'Description must be less than 500 characters'),
  is_active: z.boolean().optional()
});

// Configuration validation
export const configurationSchema = z.object({
  id: z.string().uuid().optional(),
  name: requiredStringSchema.max(100, 'Name must be less than 100 characters'),
  description: optionalStringSchema.max(500, 'Description must be less than 500 characters'),
  field_type: z.enum(['text', 'number', 'select', 'checkbox', 'textarea']),
  is_required: z.boolean().optional(),
  is_active: z.boolean().optional()
});

// User validation
export const userSchema = z.object({
  id: z.string().uuid().optional(),
  email: emailSchema,
  name: requiredStringSchema.max(100, 'Name must be less than 100 characters'),
  role: z.enum(['admin', 'user']).optional()
});

// Generic validation function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    throw error;
  }
}

// Form validation helper
export function validateForm<T>(schema: z.ZodSchema<T>, formData: unknown): {
  isValid: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const validatedData = schema.parse(formData);
    return { isValid: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Validation failed' } };
  }
}

// Common validation rules
export const validationRules = {
  required: (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return true;
  },
  
  minLength: (min: number) => (value: string) => {
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return true;
  },
  
  maxLength: (max: number) => (value: string) => {
    if (value.length > max) {
      return `Must be less than ${max} characters`;
    }
    return true;
  },
  
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Invalid email address';
    }
    return true;
  },
  
  positiveNumber: (value: number) => {
    if (value <= 0) {
      return 'Must be a positive number';
    }
    return true;
  },
  
  url: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return 'Invalid URL';
    }
  }
};
