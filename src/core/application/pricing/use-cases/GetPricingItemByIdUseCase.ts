/**
 * GetPricingItemByIdUseCase
 * 
 * Retrieves a single pricing item by ID
 * Priority 3: Single item query
 */

import { IPricingRepository } from '../../../domain/pricing/repositories/IPricingRepository';
import { PricingItem } from '../../../domain/pricing/entities/PricingItem';
import { 
  GetPricingItemByIdInputDTO, 
  GetPricingItemByIdOutputDTO 
} from '../dtos/PricingDTOs';
import { PricingMapper } from '../mappers/PricingMapper';
import { ApplicationError, ValidationError, NotFoundError } from '../errors/ApplicationError';

export class GetPricingItemByIdUseCase {
  constructor(
    private readonly repository: IPricingRepository
  ) {}

  /**
   * Execute get pricing item by ID workflow
   */
  async execute(input: GetPricingItemByIdInputDTO): Promise<GetPricingItemByIdOutputDTO> {
    try {
      // 1. Validate input
      this.validateInput(input);

      // 2. Fetch item from repository
      const item = await this.fetchItem(input.itemId);

      // 3. Map to DTO
      const itemDTO = item ? PricingMapper.toDTO(item) : null;

      // 4. Return result
      return {
        item: itemDTO,
      };

    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }
      throw new ApplicationError(`Failed to retrieve pricing item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate input parameters
   */
  private validateInput(input: GetPricingItemByIdInputDTO): void {
    if (!input.itemId || input.itemId.trim().length === 0) {
      throw new ValidationError('itemId', 'Item ID is required');
    }

    if (input.itemId.length > 50) {
      throw new ValidationError('itemId', 'Item ID cannot exceed 50 characters');
    }
  }

  /**
   * Fetch item from repository by ID
   */
  private async fetchItem(itemId: string): Promise<PricingItem | null> {
    try {
      return await this.repository.findById(itemId);
    } catch (error) {
      throw new ApplicationError(`Failed to fetch item from repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
