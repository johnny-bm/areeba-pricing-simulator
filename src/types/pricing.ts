// Type definitions for the Areeba Pricing Simulator

export interface PricingItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  defaultPrice: number;
  pricingType: 'fixed' | 'tiered';
  tiers?: PricingTier[];
  tags?: string[];
  isActive?: boolean;
  autoAddServices?: string[];
  quantitySourceFields?: string[];
  quantityMultiplier?: number;
  autoQuantitySources?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingTier {
  id: string;
  minQuantity: number;
  maxQuantity?: number | null;
  unitPrice: number;
  description?: string;
  name?: string;
  configReference?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order?: number;
  order_index?: number;
  isActive?: boolean;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientConfig {
  clientName: string;
  projectName: string;
  preparedBy: string;
  hasDebitCards: boolean;
  hasCreditCards: boolean;
  debitCards: number;
  creditCards: number;
  monthlyAuthorizations: number;
  monthlySettlements: number;
  monthly3DS: number;
  monthlySMS: number;
  monthlyNotifications: number;
  monthlyDeliveries: number;
  [key: string]: any; // Allow additional dynamic fields
}

export interface DynamicClientConfig {
  clientName: string;
  projectName: string;
  preparedBy: string;
  configValues: Record<string, any>;
}

export interface SelectedItem {
  id: string;
  item: PricingItem;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountApplication: 'total' | 'unit';
  isFree: boolean;
}

export interface ConfigurationDefinition {
  id: string;
  name: string;
  description?: string;
  fields: ConfigurationField[];
  isActive: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConfigurationField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  label: string;
  placeholder?: string;
  defaultValue: any;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order?: number;
  description?: string;
}

export interface ScenarioData {
  id?: string;
  userId: string;
  config: ClientConfig;
  selectedItems: SelectedItem[];
  categories: Category[];
  globalDiscount: number;
  globalDiscountType: 'percentage' | 'fixed';
  globalDiscountApplication: 'none' | 'both' | 'monthly' | 'onetime';
  summary: ScenarioSummary;
  createdAt?: string;
  updatedAt?: string;
}

export interface ScenarioSummary {
  oneTimeTotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
  totalProjectCost: number;
  savings: {
    totalSavings: number;
    discountSavings: number;
    freeSavings: number;
    originalPrice: number;
    savingsRate: number;
  };
  scenarioId?: string;
  clientName?: string;
  projectName?: string;
  preparedBy?: string;
  createdAt?: string;
  itemCount?: number;
}

export interface GuestScenario {
  id?: string;
  sessionId: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  companyName: string;
  scenarioName: string;
  config: ClientConfig;
  selectedItems: SelectedItem[];
  categories: Category[];
  globalDiscount: number;
  globalDiscountType: 'percentage' | 'fixed';
  globalDiscountApplication: 'none' | 'both' | 'monthly' | 'onetime';
  summary: ScenarioSummary;
  submissionCode: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'member' | 'admin' | 'owner';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserInvite {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'member' | 'admin' | 'owner';
  invite_code: string;
  expires_at: string;
  created_by: string;
  created_at: string;
  used_at?: string;
}

export interface ServiceFormData {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  defaultPrice: number;
  pricingType: 'fixed' | 'tiered';
  tiers: PricingTier[];
  tags: string[];
  isActive: boolean;
  autoAddServices: string[];
  quantitySourceFields: string[];
  quantityMultiplier: number;
  autoQuantitySources: string[];
}

export interface ItemFormData {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  defaultPrice: number;
  pricingType: 'fixed' | 'tiered';
  tiers: PricingTier[];
  tags: string[];
  isActive: boolean;
  autoAddServices: string[];
  quantitySourceFields: string[];
  quantityMultiplier: number;
  autoQuantitySources: string[];
}

export interface AutoAddConfig {
  autoAddRules: Record<string, string[]>;
  quantityRules: Record<string, { field: string; multiplier?: number }>;
}

export interface ServiceMapping {
  serviceId: string;
  configField: string;
  autoAdd: boolean;
  syncQuantity: boolean;
  triggerCondition: 'boolean' | 'number' | 'string';
  quantityMultiplier?: number;
}

// Utility types
export type DiscountType = 'percentage' | 'fixed';
export type DiscountApplication = 'none' | 'both' | 'monthly' | 'onetime';
export type PricingType = 'fixed' | 'tiered';
export type UserRole = 'member' | 'admin' | 'owner';
export type FieldType = 'text' | 'number' | 'boolean' | 'select';
