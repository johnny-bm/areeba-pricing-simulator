export interface Category {
  id: string;
  name: string;
  description: string;
  order_index: number;
}

export interface PricingTier {
  id: string;
  name: string; // e.g., "Tier 1", "Tier 2"
  minQuantity: number;
  maxQuantity: number | null; // null means unlimited
  unitPrice: number;
  // Config-based tier enhancements
  configReference?: keyof ClientConfig; // Which config field this tier is based on
  description?: string; // Human readable description of the tier
}

export interface PricingItem {
  id: string;
  name: string;
  description: string;
  default_price: number; // Normalized schema uses snake_case
  category_id: string; // References Category.id
  category_name: string; // Denormalized for easier display
  category_order: number; // For sorting
  unit: string; // e.g., "per card", "per transaction", "monthly"
  pricing_type: 'simple' | 'tiered'; // Default: 'simple'
  
  // Normalized arrays from view (no JSON parsing needed)
  tags: string[]; // Array of tag names
  auto_add_trigger_fields: string[]; // Config field IDs that trigger auto-add
  quantity_source_fields: string[]; // Config field IDs that determine quantity
  
  // Legacy fields for backward compatibility
  defaultPrice?: number; // Computed from default_price
  category?: string; // Computed from category_id
  pricingType?: 'simple' | 'tiered'; // Computed from pricing_type
  quantitySourceFields?: (keyof ClientConfig)[]; // Legacy config field references
  quantityMultiplier?: number; // Multiply the sum by this (default: 1)
  autoAddServices?: string[]; // Legacy auto-add services
  
  // Tiered pricing (fetched separately when needed)
  tiers?: PricingTier[]; // For tiered pricing
  tiered_pricing?: any; // Raw tiered pricing data from services table
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface SelectedItem {
  id: string;
  item: PricingItem;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage 0-100 or fixed amount
  discountType: 'percentage' | 'fixed';
  discountApplication: 'unit' | 'total'; // Whether discount applies to unit price or total price
  isFree: boolean;
  // For tiered pricing
  activeTiers?: {
    tierId: string;
    tierName: string;
    tierQuantity: number;
    tierUnitPrice: number;
    tierTotal: number;
  }[];
}

export interface ClientConfig {
  clientName: string;
  projectName: string;
  preparedBy: string;
  // Card type selections
  hasDebitCards: boolean; // Debit/Prepaid/Virtual Cards
  hasCreditCards: boolean; // Credit Cards
  // Volumes
  debitCards: number; // Debit/Prepaid/Virtual Cards count
  creditCards: number; // Credit Cards count
  monthlyAuthorizations: number;
  monthlySettlements: number;
  monthly3DS: number;
  monthlySMS: number;
  monthlyNotifications: number;
  monthlyDeliveries: number;
}

export interface FeeSummary {
  oneTimeTotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
  totalDiscount: number;
}

export interface ScenarioData {
  scenarioId?: string;
  createdAt?: string;
  config: ClientConfig;
  selectedItems: SelectedItem[];
  globalDiscount: number;
  globalDiscountType: 'percentage' | 'fixed';
  summary: {
    oneTimeTotal: number;
    monthlyTotal: number;
    yearlyTotal: number;
    totalProjectCost: number;
  };
  metadata?: {
    version: string;
    userAgent: string;
    source: string;
  };
}

export interface ScenarioSummary {
  scenarioId: string;
  submissionCode?: string;
  createdAt: string;
  clientName: string;
  projectName: string;
  preparedBy: string;
  itemCount: number;
  oneTimeTotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
  totalProjectCost: number;
  globalDiscount?: number;
  globalDiscountType?: 'percentage' | 'fixed';
  globalDiscountApplication?: 'none' | 'both' | 'monthly' | 'onetime';
}

export interface ServiceMapping {
  serviceId: string;
  configField: keyof ClientConfig;
  triggerCondition: 'boolean' | 'number';
  autoAdd: boolean;
  syncQuantity: boolean;
}

export interface ConfigFieldDescriptor {
  key: keyof ClientConfig;
  label: string;
  type: 'boolean' | 'number' | 'string';
  description: string;
}

// Dynamic Configuration System
export interface ConfigurationField {
  id: string;
  name?: string;  // Legacy support
  label?: string; // Current field name
  type: 'number' | 'boolean' | 'string';
  defaultValue: number | boolean | string;
  required?: boolean;
  order: number;
  description?: string;
  // For number fields
  min?: number;
  max?: number;
  step?: number;
}

export interface ConfigurationDefinition {
  id: string;
  name: string;
  description: string;
  order: number;
  fields: ConfigurationField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicClientConfig {
  // Core fields (always present)
  clientName: string;
  projectName: string;
  preparedBy: string;
  
  // Dynamic configuration values (key-value pairs)
  configValues: Record<string, number | boolean | string>;
}

// Enhanced pricing item to work with dynamic configs
export interface EnhancedPricingItem extends Omit<PricingItem, 'autoQuantitySource' | 'configMapping'> {
  // Dynamic configuration mapping
  dynamicConfigMapping?: {
    quantityFieldId?: string; // Which dynamic config field determines quantity
    quantityMultiplier?: number; // Multiply config value by this (default: 1)
    triggerFieldId?: string; // Which field triggers auto-add
    triggerCondition?: 'boolean' | 'number'; // What type of condition triggers auto-add
    autoAdd?: boolean; // Whether to auto-add when config condition is met
    syncQuantity?: boolean; // Whether quantity changes should sync back to config
  };
}