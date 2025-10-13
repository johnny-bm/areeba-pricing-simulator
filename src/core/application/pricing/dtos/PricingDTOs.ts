/**
 * Data Transfer Objects (DTOs) for Pricing Application Layer
 * 
 * DTOs are flat, serializable objects for data transfer between layers
 */

export interface PricingItemDTO {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currency: string;
  category: CategoryDTO;
  quantity?: number;
}

export interface CategoryDTO {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface CalculatePricingInputDTO {
  itemIds: string[];
  quantities: Record<string, number>; // itemId -> quantity
  discountCode?: string;
  taxRate?: number; // 0-100
}

export interface CalculatePricingOutputDTO {
  items: Array<{
    id: string;
    name: string;
    basePrice: number;
    quantity: number;
    total: number;
    currency: string;
  }>;
  subtotal: number;
  discount: number;
  discountRate: number;
  tax: number;
  taxRate: number;
  total: number;
  currency: string;
  calculatedAt: string; // ISO date string
}

export interface GetPricingItemsInputDTO {
  categoryId?: string;
  searchTerm?: string;
}

export interface GetPricingItemsOutputDTO {
  items: PricingItemDTO[];
  total: number;
}

export interface GetPricingItemByIdInputDTO {
  itemId: string;
}

export interface GetPricingItemByIdOutputDTO {
  item: PricingItemDTO | null;
}
