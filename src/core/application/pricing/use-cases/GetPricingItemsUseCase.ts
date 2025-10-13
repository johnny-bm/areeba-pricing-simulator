/**
 * GetPricingItemsUseCase
 * 
 * Retrieves all available pricing items
 * Priority 2: Query use case
 */

import { IPricingRepository } from '../../../domain/pricing/repositories/IPricingRepository';
import { PricingItem } from '../../../domain/pricing/entities/PricingItem';
import { 
  GetPricingItemsInputDTO, 
  GetPricingItemsOutputDTO 
} from '../dtos/PricingDTOs';
import { PricingMapper } from '../mappers/PricingMapper';
import { ApplicationError, ValidationError } from '../errors/ApplicationError';

export class GetPricingItemsUseCase {
  constructor(
    private readonly repository: IPricingRepository
  ) {}

  /**
   * Execute get pricing items workflow
   */
  async execute(input: GetPricingItemsInputDTO = {}): Promise<GetPricingItemsOutputDTO> {
    // 1. Validate input (don't wrap validation errors)
    this.validateInput(input);

    try {
      // 2. Fetch items from repository
      const items = await this.fetchItems(input);

      // 3. Sort items by category order, then by name
      const sortedItems = this.sortItems(items);

      // 4. Map to DTOs
      const itemDTOs = PricingMapper.toDTOArray(sortedItems);

      // 5. Return result
      return {
        items: itemDTOs,
        total: itemDTOs.length,
      };

    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(`Failed to retrieve pricing items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate input parameters
   */
  private validateInput(input: GetPricingItemsInputDTO): void {
    if (input.categoryId && input.categoryId.trim().length === 0) {
      throw new ValidationError('categoryId', 'Category ID cannot be empty');
    }

    if (input.searchTerm && input.searchTerm.trim().length === 0) {
      throw new ValidationError('searchTerm', 'Search term cannot be empty');
    }

    if (input.searchTerm && input.searchTerm.length > 100) {
      throw new ValidationError('searchTerm', 'Search term cannot exceed 100 characters');
    }
  }

  /**
   * Fetch items from repository based on input filters
   */
  private async fetchItems(input: GetPricingItemsInputDTO): Promise<PricingItem[]> {
    try {
      if (input.categoryId) {
        return await this.repository.findByCategory(input.categoryId);
      }
      
      return await this.repository.findAll();
    } catch (error) {
      throw new ApplicationError(`Failed to fetch items from repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sort items by category order, then by name
   */
  private sortItems(items: PricingItem[]): PricingItem[] {
    return items.sort((a, b) => {
      // First sort by category order
      const categoryOrderDiff = a.category.order - b.category.order;
      if (categoryOrderDiff !== 0) {
        return categoryOrderDiff;
      }
      
      // Then sort by category name
      const categoryNameDiff = a.category.name.localeCompare(b.category.name);
      if (categoryNameDiff !== 0) {
        return categoryNameDiff;
      }
      
      // Finally sort by item name
      return a.name.localeCompare(b.name);
    });
  }
}
