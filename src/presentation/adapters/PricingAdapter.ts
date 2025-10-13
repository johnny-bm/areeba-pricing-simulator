/**
 * Pricing Adapter
 * 
 * Provides smooth transition from legacy API to new architecture
 * Uses feature flags to determine which implementation to use
 */

import { FEATURES } from '@/config/features';
import { RepositoryFactory } from '@/core/infrastructure/database/repositories/RepositoryFactory';
import { GetPricingItemsUseCase } from '@/core/application/pricing/use-cases/GetPricingItemsUseCase';
import { CalculatePricingUseCase } from '@/core/application/pricing/use-cases/CalculatePricingUseCase';
import { GetPricingItemByIdUseCase } from '@/core/application/pricing/use-cases/GetPricingItemByIdUseCase';
import type { 
  CalculatePricingInputDTO, 
  CalculatePricingOutputDTO,
  GetPricingItemsInputDTO,
  GetPricingItemsOutputDTO,
  GetPricingItemByIdInputDTO,
  GetPricingItemByIdOutputDTO,
  PricingItemDTO
} from '@/core/application/pricing/dtos/PricingDTOs';

/**
 * Legacy API interface for fallback
 */
interface LegacyPricingAPI {
  getPricingItems(): Promise<any[]>;
  calculatePricing(input: any): Promise<any>;
  getPricingItemById(id: string): Promise<any>;
}

/**
 * Pricing Adapter Class
 * 
 * Provides unified interface that switches between new and legacy implementations
 */
export class PricingAdapter {
  private static legacyAPI: LegacyPricingAPI | null = null;

  /**
   * Set legacy API for fallback
   */
  static setLegacyAPI(api: LegacyPricingAPI): void {
    this.legacyAPI = api;
  }

  /**
   * Get all pricing items
   */
  static async getPricingItems(input: GetPricingItemsInputDTO = {}): Promise<PricingItemDTO[]> {
    if (FEATURES.USE_NEW_PRICING) {
      // New architecture
      try {
        const repository = RepositoryFactory.getPricingRepository();
        const useCase = new GetPricingItemsUseCase(repository);
        const result = await useCase.execute(input);
        return result.items;
      } catch (error) {
        console.error('New architecture failed, falling back to legacy:', error);
        // Fall through to legacy
      }
    }

    // Legacy fallback
    if (this.legacyAPI) {
      const legacyItems = await this.legacyAPI.getPricingItems();
      return this.convertLegacyItems(legacyItems);
    }

    throw new Error('No pricing implementation available');
  }

  /**
   * Calculate pricing
   */
  static async calculatePricing(input: CalculatePricingInputDTO): Promise<CalculatePricingOutputDTO> {
    if (FEATURES.USE_NEW_PRICING) {
      // New architecture
      try {
        const repository = RepositoryFactory.getPricingRepository();
        const useCase = new CalculatePricingUseCase(repository);
        return await useCase.execute(input);
      } catch (error) {
        console.error('New architecture failed, falling back to legacy:', error);
        // Fall through to legacy
      }
    }

    // Legacy fallback
    if (this.legacyAPI) {
      const legacyResult = await this.legacyAPI.calculatePricing(input);
      return this.convertLegacyCalculation(legacyResult);
    }

    throw new Error('No pricing implementation available');
  }

  /**
   * Get pricing item by ID
   */
  static async getPricingItemById(input: GetPricingItemByIdInputDTO): Promise<PricingItemDTO | null> {
    if (FEATURES.USE_NEW_PRICING) {
      // New architecture
      try {
        const repository = RepositoryFactory.getPricingRepository();
        const useCase = new GetPricingItemByIdUseCase(repository);
        const result = await useCase.execute(input);
        return result.item;
      } catch (error) {
        console.error('New architecture failed, falling back to legacy:', error);
        // Fall through to legacy
      }
    }

    // Legacy fallback
    if (this.legacyAPI) {
      const legacyItem = await this.legacyAPI.getPricingItemById(input.itemId);
      return legacyItem ? this.convertLegacyItem(legacyItem) : null;
    }

    throw new Error('No pricing implementation available');
  }

  /**
   * Check if new architecture is enabled
   */
  static isNewArchitectureEnabled(): boolean {
    return FEATURES.USE_NEW_PRICING;
  }

  /**
   * Get current implementation info
   */
  static getImplementationInfo() {
    return {
      newArchitecture: FEATURES.USE_NEW_PRICING,
      hasLegacyFallback: !!this.legacyAPI,
      repositoryAvailable: !!RepositoryFactory.getPricingRepository(),
    };
  }

  /**
   * Convert legacy items to new format
   */
  private static convertLegacyItems(legacyItems: any[]): PricingItemDTO[] {
    return legacyItems.map(item => this.convertLegacyItem(item));
  }

  /**
   * Convert legacy item to new format
   */
  private static convertLegacyItem(legacyItem: any): PricingItemDTO {
    return {
      id: legacyItem.id,
      name: legacyItem.name,
      description: legacyItem.description || '',
      basePrice: legacyItem.basePrice || legacyItem.price || 0,
      currency: legacyItem.currency || 'USD',
      category: {
        id: legacyItem.categoryId || legacyItem.category?.id || 'default',
        name: legacyItem.categoryName || legacyItem.category?.name || 'Default',
        description: legacyItem.categoryDescription || legacyItem.category?.description,
        order: legacyItem.categoryOrder || legacyItem.category?.order || 0,
      },
      quantity: legacyItem.quantity || 1,
    };
  }

  /**
   * Convert legacy calculation result to new format
   */
  private static convertLegacyCalculation(legacyResult: any): CalculatePricingOutputDTO {
    return {
      items: legacyResult.items?.map((item: any) => ({
        id: item.id,
        name: item.name,
        basePrice: item.basePrice || item.price,
        quantity: item.quantity || 1,
        total: item.total || (item.basePrice || item.price) * (item.quantity || 1),
        currency: item.currency || 'USD',
      })) || [],
      subtotal: legacyResult.subtotal || 0,
      discount: legacyResult.discount || 0,
      discountRate: legacyResult.discountRate || 0,
      tax: legacyResult.tax || 0,
      taxRate: legacyResult.taxRate || 0,
      total: legacyResult.total || 0,
      currency: legacyResult.currency || 'USD',
      calculatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Convenience functions for direct usage
 */
export const getPricingItems = (input?: GetPricingItemsInputDTO) => 
  PricingAdapter.getPricingItems(input);

export const calculatePricing = (input: CalculatePricingInputDTO) => 
  PricingAdapter.calculatePricing(input);

export const getPricingItemById = (input: GetPricingItemByIdInputDTO) => 
  PricingAdapter.getPricingItemById(input);

export const isNewArchitectureEnabled = () => 
  PricingAdapter.isNewArchitectureEnabled();

export const getImplementationInfo = () => 
  PricingAdapter.getImplementationInfo();
