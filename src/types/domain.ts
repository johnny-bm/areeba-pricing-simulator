// Unified domain types
// Consolidates duplicate types across the application

export interface User {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: 'member' | 'admin' | 'owner';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  invite_id?: string;
  expires_at?: string;
}

/**
 * Canonical PricingItem interface - single source of truth
 * Consolidates all PricingItem definitions from across the application
 */
export interface PricingTier {
  id: string;
  minQuantity: number;
  maxQuantity?: number | null;
  unitPrice: number;
  description?: string;
  name?: string;
  configReference?: string;
}

export interface PricingItem {
  id: string;
  name: string;
  description?: string;
  pricingType: 'one_time' | 'recurring' | 'per_unit' | 'tiered';
  billingCycle?: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  defaultPrice: number;
  categoryId: string;
  unit: string;
  tags?: string[];
  is_active?: boolean;
  isArchived?: boolean;
  autoAddServices?: { configFieldId: string; triggerCondition: string; triggerValue: any }[];
  quantitySourceFields?: string[];
  quantityMultiplier?: number;
  autoQuantitySources?: string[];
  auto_add_trigger_fields?: string[];
  tiers?: PricingTier[];
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  display_order?: number;
  order_index?: number;
  is_active?: boolean;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
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
  // Additional properties for compatibility
  submissionCode?: string;
  globalDiscount?: number;
  globalDiscountType?: 'percentage' | 'fixed';
  globalDiscountApplication?: 'none' | 'both' | 'monthly' | 'onetime';
}

export interface PricingCalculation {
  subtotal: number;
  discount: number;
  total: number;
  savings: number;
  savingsRate: number;
}

export interface ClientConfig {
  id?: string;
  name?: string;
  description?: string;
  fields?: ConfigurationField[];
  createdAt?: string;
  updatedAt?: string;
  // Legacy properties for backward compatibility
  clientName?: string;
  projectName?: string;
  preparedBy?: string;
  hasDebitCards?: boolean;
  hasCreditCards?: boolean;
  debitCards?: number;
  creditCards?: number;
  monthlyAuthorizations?: number;
  monthlySettlements?: number;
  monthly3DS?: number;
  monthlySMS?: number;
  monthlyNotifications?: number;
  monthlyDeliveries?: number;
  hasPrepaidCards?: boolean;
  prepaidCards?: number;
}

export interface DynamicClientConfig {
  id?: string;
  name?: string;
  description?: string;
  configValues: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  // Legacy properties for backward compatibility
  clientName?: string;
  projectName?: string;
  preparedBy?: string;
}

export interface ConfigurationField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'string';
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
  min?: number;
  max?: number;
  step?: number;
  display_order?: number;
  description?: string;
}

export interface ConfigurationDefinition {
  id: string;
  name: string;
  description?: string;
  fields: ConfigurationField[];
  simulator_id: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ScenarioData {
  id?: string;
  userId: string;
  config: ClientConfig;
  legacyConfig: ClientConfig;
  configDefinitions: ConfigurationDefinition[];
  selectedItems: SelectedItem[];
  categories: Category[];
  tags: Tag[];
  summary: ScenarioSummary;
  globalDiscount?: number;
  globalDiscountType?: string;
  globalDiscountApplication?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestScenario {
  id?: string;
  sessionId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  scenarioData: ScenarioData;
  createdAt?: string;
  updatedAt?: string;
}

// Admin types
export interface AdminUser extends User {
  lastLogin?: string;
  loginCount?: number;
}

export interface AdminInvite {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'member' | 'admin' | 'owner';
  invite_code: string;
  created_by: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

export interface AdminScenario {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  total_price: number;
  user_id: string | null;
}

export interface AdminGuestSubmission {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  scenario_name: string;
  total_price: number;
  status: 'submitted' | 'contacted' | 'converted' | 'archived';
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  totalScenarios: number;
  totalGuestSubmissions: number;
  totalRevenue: number;
  recentActivity: any[];
  activeUsers: number;
  averageScenarioValue: number;
}

export interface AdminFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  search?: string;
  role?: string;
  is_active?: boolean;
}

export interface PricingFilters {
  categoryId?: string;
  tags?: string[];
  searchTerm?: string;
  showArchived?: boolean;
}

export interface PricingSortOptions {
  field: 'name' | 'price' | 'category' | 'created_at';
  direction: 'asc' | 'desc';
}
