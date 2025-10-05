// Pricing feature types
export interface PricingItem {
  id: string;
  name: string;
  description?: string;
  pricingType: 'fixed' | 'tiered';
  defaultPrice: number;
  categoryId: string;
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
