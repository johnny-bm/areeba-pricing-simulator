// Pricing feature types
export interface PricingItem {
  id: string;
  name: string;
  description?: string;
  pricingType: 'fixed' | 'tiered';
  defaultPrice: number;
  categoryId: string;
  unit: string;
  tags?: string[];
  isActive: boolean;
  isArchived: boolean;
  autoAddServices?: { configFieldId: string; triggerCondition: string; triggerValue: any }[];
  quantitySourceFields?: string[];
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
  createdAt?: string;
  updatedAt?: string;
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

export interface PricingCalculation {
  subtotal: number;
  discount: number;
  total: number;
  savings: number;
  savingsRate: number;
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

export interface PricingFilters {
  categoryId?: string;
  tags?: string[];
  searchTerm?: string;
  showArchived?: boolean;
}

export interface PricingSortOptions {
  field: 'name' | 'price' | 'category' | 'createdAt';
  direction: 'asc' | 'desc';
}

export interface ClientConfig {
  id: string;
  name: string;
  description?: string;
  fields: ConfigurationField[];
  createdAt?: string;
  updatedAt?: string;
}

export interface DynamicClientConfig {
  id: string;
  name: string;
  description?: string;
  configValues: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
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
  order?: number;
  description?: string;
}

export interface ConfigurationDefinition {
  id: string;
  name: string;
  description?: string;
  fields: ConfigurationField[];
  order?: number;
  createdAt?: string;
  updatedAt?: string;
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
