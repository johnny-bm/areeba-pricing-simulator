/**
 * CalculatePricingUseCase
 * 
 * Orchestrates pricing calculation workflow
 * Priority 1: Most critical use case
 */

import { IPricingRepository } from '../../../domain/pricing/repositories/IPricingRepository';
import { PricingCalculator } from '../../../domain/pricing/services/PricingCalculator';
import { PricingItem } from '../../../domain/pricing/entities/PricingItem';
import { Money } from '../../../domain/pricing/value-objects/Money';
import { Percentage } from '../../../domain/pricing/value-objects/Percentage';
import { 
  CalculatePricingInputDTO, 
  CalculatePricingOutputDTO 
} from '../dtos/PricingDTOs';
import { 
  ApplicationError, 
  ValidationError, 
  NotFoundError 
} from '../errors/ApplicationError';

export class CalculatePricingUseCase {
  constructor(
    private readonly repository: IPricingRepository
  ) {}

  /**
   * Execute pricing calculation workflow
   */
  async execute(input: CalculatePricingInputDTO): Promise<CalculatePricingOutputDTO> {
    // 1. Validate input (don't wrap validation errors)
    this.validateInput(input);

    try {
      // 2. Fetch pricing items from repository
      const items = await this.fetchPricingItems(input.itemIds);

      // 3. Validate all items exist
      this.validateItemsFound(items, input.itemIds);

      // 4. Create PricingItem entities with quantities
      const entities = this.createEntitiesWithQuantities(items, input.quantities);

      // 5. Calculate pricing using domain service
      const result = this.calculatePricing(entities, input);

      // 6. Map to output DTO
      return this.mapToOutputDTO(result, entities, input);

    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(`Pricing calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate input parameters
   */
  private validateInput(input: CalculatePricingInputDTO): void {
    if (!input.itemIds || input.itemIds.length === 0) {
      throw new ValidationError('itemIds', 'At least one item ID is required');
    }

    if (input.itemIds.some(id => !id || id.trim().length === 0)) {
      throw new ValidationError('itemIds', 'All item IDs must be non-empty');
    }

    if (input.quantities) {
      for (const [itemId, quantity] of Object.entries(input.quantities)) {
        if (quantity < 1) {
          throw new ValidationError('quantities', `Quantity for item ${itemId} must be at least 1`);
        }
        if (quantity > 10000) {
          throw new ValidationError('quantities', `Quantity for item ${itemId} cannot exceed 10,000`);
        }
        if (!Number.isInteger(quantity)) {
          throw new ValidationError('quantities', `Quantity for item ${itemId} must be an integer`);
        }
      }
    }

    if (input.taxRate !== undefined) {
      if (input.taxRate < 0 || input.taxRate > 100) {
        throw new ValidationError('taxRate', 'Tax rate must be between 0 and 100');
      }
    }

    if (input.discountCode && input.discountCode.trim().length === 0) {
      throw new ValidationError('discountCode', 'Discount code cannot be empty');
    }
  }

  /**
   * Fetch pricing items from repository
   */
  private async fetchPricingItems(itemIds: string[]): Promise<PricingItem[]> {
    try {
      return await this.repository.findByIds(itemIds);
    } catch (error) {
      throw new ApplicationError(`Failed to fetch pricing items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate that all requested items were found
   */
  private validateItemsFound(items: PricingItem[], requestedIds: string[]): void {
    const foundIds = items.map(item => item.id);
    const missingIds = requestedIds.filter(id => !foundIds.includes(id));
    
    if (missingIds.length > 0) {
      throw new NotFoundError('PricingItem', missingIds.join(', '));
    }
  }

  /**
   * Create PricingItem entities with specified quantities
   */
  private createEntitiesWithQuantities(
    items: PricingItem[], 
    quantities: Record<string, number>
  ): PricingItem[] {
    return items.map(item => {
      const quantity = quantities[item.id] || 1;
      return item.updateQuantity(quantity);
    });
  }

  /**
   * Calculate pricing using domain service
   */
  private calculatePricing(
    entities: PricingItem[], 
    input: CalculatePricingInputDTO
  ) {
    // For now, skip discount code validation (TODO: implement discount service)
    const discount = input.discountCode ? new Percentage(10) : undefined; // Mock 10% discount
    const taxRate = input.taxRate !== undefined ? new Percentage(input.taxRate) : undefined;

    return PricingCalculator.calculatePricing(entities, discount, taxRate);
  }

  /**
   * Map calculation result to output DTO
   */
  private mapToOutputDTO(
    result: any, // PricingCalculationResult from domain service
    entities: PricingItem[],
    input: CalculatePricingInputDTO
  ): CalculatePricingOutputDTO {
    const currency = entities[0]?.basePrice.currency || 'USD';
    
    return {
      items: entities.map(entity => ({
        id: entity.id,
        name: entity.name,
        basePrice: entity.basePrice.amount,
        quantity: entity.quantity,
        total: entity.getTotalPrice().amount,
        currency: entity.basePrice.currency,
      })),
      subtotal: result.subtotal.amount,
      discount: result.totalDiscount.amount,
      discountRate: result.savingsRate || 0,
      tax: result.total.amount - (result.subtotal.amount - result.totalDiscount.amount),
      taxRate: input.taxRate || 0,
      total: result.total.amount,
      currency,
      calculatedAt: new Date().toISOString(),
    };
  }
}
