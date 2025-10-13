/**
 * Domain Types for Pricing
 * 
 * Type definitions for the pricing domain layer
 */

export interface PricingItemData {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  currency?: string;
  categoryId: string;
  categoryName: string;
  quantity?: number;
}

export interface CategoryData {
  id: string;
  name: string;
  description?: string;
  order?: number;
}

export interface MoneyData {
  amount: number;
  currency: string;
}

export interface PercentageData {
  value: number;
}

export interface DateRangeData {
  startDate: string;
  endDate?: string;
}

export interface PricingCalculationData {
  subtotal: MoneyData;
  discount: MoneyData;
  total: MoneyData;
  savings: MoneyData;
  savingsRate: number;
}

export interface PricingItemCalculationData {
  item: PricingItemData;
  quantity: number;
  unitPrice: MoneyData;
  totalPrice: MoneyData;
  discount: MoneyData;
  finalPrice: MoneyData;
}

export interface PricingResultData {
  items: PricingItemCalculationData[];
  subtotal: MoneyData;
  totalDiscount: MoneyData;
  total: MoneyData;
  savings: MoneyData;
  savingsRate: number;
}
