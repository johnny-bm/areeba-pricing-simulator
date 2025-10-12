import { z } from 'zod';

// User validation schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  full_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: z.enum(['member', 'admin', 'owner']),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  invite_id: z.string().optional(),
  expires_at: z.string().optional(),
});

// Pricing item validation schemas
export const PricingItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  pricingType: z.enum(['fixed', 'tiered']),
  defaultPrice: z.number().min(0),
  categoryId: z.string(),
  unit: z.string(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isArchived: z.boolean(),
  autoAddServices: z.array(z.object({
    configFieldId: z.string(),
    triggerCondition: z.string(),
    triggerValue: z.any(),
  })).optional(),
  quantitySourceFields: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Category validation schemas
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  order: z.number().optional(),
  order_index: z.number().optional(),
  isActive: z.boolean().optional(),
  color: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Tag validation schemas
export const TagSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  color: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Selected item validation schemas
export const SelectedItemSchema = z.object({
  id: z.string(),
  item: PricingItemSchema,
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  discount: z.number().min(0),
  discountType: z.enum(['percentage', 'fixed']),
  discountApplication: z.enum(['total', 'unit']),
  isFree: z.boolean(),
});

// Scenario summary validation schemas
export const ScenarioSummarySchema = z.object({
  oneTimeTotal: z.number(),
  monthlyTotal: z.number(),
  yearlyTotal: z.number(),
  totalProjectCost: z.number(),
  savings: z.object({
    totalSavings: z.number(),
    discountSavings: z.number(),
    freeSavings: z.number(),
    originalPrice: z.number(),
    savingsRate: z.number(),
  }),
  scenarioId: z.string().optional(),
  clientName: z.string().optional(),
  projectName: z.string().optional(),
  preparedBy: z.string().optional(),
  createdAt: z.string().optional(),
  itemCount: z.number().optional(),
});

// Client config validation schemas
export const ClientConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['text', 'number', 'boolean', 'select', 'string']),
    label: z.string(),
    placeholder: z.string().optional(),
    defaultValue: z.any(),
    required: z.boolean().optional(),
    options: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).optional(),
    validation: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
    }).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    order: z.number().optional(),
    description: z.string().optional(),
  })),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Dynamic client config validation schemas
export const DynamicClientConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  configValues: z.record(z.string(), z.any()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Scenario data validation schemas
export const ScenarioDataSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  config: ClientConfigSchema,
  legacyConfig: ClientConfigSchema,
  configDefinitions: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    fields: z.array(z.any()),
    order: z.number().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })),
  selectedItems: z.array(SelectedItemSchema),
  categories: z.array(CategorySchema),
  tags: z.array(TagSchema),
  summary: ScenarioSummarySchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Guest scenario validation schemas
export const GuestScenarioSchema = z.object({
  id: z.string().optional(),
  sessionId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  scenarioData: ScenarioDataSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Admin validation schemas
export const AdminUserSchema = UserSchema.extend({
  lastLogin: z.string().optional(),
  loginCount: z.number().optional(),
});

export const AdminInviteSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: z.enum(['member', 'admin', 'owner']),
  invite_code: z.string(),
  created_by: z.string(),
  expires_at: z.string(),
  used_at: z.string().optional(),
  created_at: z.string(),
});

export const AdminScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']),
  total_price: z.number(),
  user_id: z.string().nullable(),
});

export const AdminGuestSubmissionSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  company_name: z.string(),
  scenario_name: z.string(),
  total_price: z.number(),
  status: z.enum(['submitted', 'contacted', 'converted', 'archived']),
  created_at: z.string(),
});

export const AdminStatsSchema = z.object({
  totalUsers: z.number(),
  totalScenarios: z.number(),
  totalGuestSubmissions: z.number(),
  totalRevenue: z.number(),
  recentActivity: z.array(z.any()),
});

export const AdminFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

// Pricing validation schemas
export const PricingFiltersSchema = z.object({
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  searchTerm: z.string().optional(),
  showArchived: z.boolean().optional(),
});

export const PricingSortOptionsSchema = z.object({
  field: z.enum(['name', 'price', 'category', 'createdAt']),
  direction: z.enum(['asc', 'desc']),
});

// Export types
export type User = z.infer<typeof UserSchema>;
export type PricingItem = z.infer<typeof PricingItemSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Tag = z.infer<typeof TagSchema>;
export type SelectedItem = z.infer<typeof SelectedItemSchema>;
export type ScenarioSummary = z.infer<typeof ScenarioSummarySchema>;
export type ClientConfig = z.infer<typeof ClientConfigSchema>;
export type DynamicClientConfig = z.infer<typeof DynamicClientConfigSchema>;
export type ScenarioData = z.infer<typeof ScenarioDataSchema>;
export type GuestScenario = z.infer<typeof GuestScenarioSchema>;
export type AdminUser = z.infer<typeof AdminUserSchema>;
export type AdminInvite = z.infer<typeof AdminInviteSchema>;
export type AdminScenario = z.infer<typeof AdminScenarioSchema>;
export type AdminGuestSubmission = z.infer<typeof AdminGuestSubmissionSchema>;
export type AdminStats = z.infer<typeof AdminStatsSchema>;
export type AdminFilters = z.infer<typeof AdminFiltersSchema>;
export type PricingFilters = z.infer<typeof PricingFiltersSchema>;
export type PricingSortOptions = z.infer<typeof PricingSortOptionsSchema>;
