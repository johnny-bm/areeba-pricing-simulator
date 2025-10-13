/**
 * Pricing Mapper
 * 
 * Handles conversion between domain entities and DTOs
 */

import { PricingItem } from '../../../domain/pricing/entities/PricingItem';
import { Category } from '../../../domain/pricing/entities/Category';
import { Money } from '../../../domain/pricing/value-objects/Money';
import { PricingItemDTO, CategoryDTO } from '../dtos/PricingDTOs';

export class PricingMapper {
  /**
   * Convert PricingItem entity to DTO
   */
  static toDTO(entity: PricingItem): PricingItemDTO {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      basePrice: entity.basePrice.amount,
      currency: entity.basePrice.currency,
      category: CategoryMapper.toDTO(entity.category),
      quantity: entity.quantity,
    };
  }

  /**
   * Convert PricingItem DTO to entity
   */
  static toDomain(dto: PricingItemDTO): PricingItem {
    const basePrice = new Money(dto.basePrice, dto.currency);
    const category = CategoryMapper.toDomain(dto.category);
    
    return new PricingItem(
      dto.id,
      dto.name,
      dto.description,
      basePrice,
      category,
      dto.quantity || 1
    );
  }

  /**
   * Convert array of entities to DTOs
   */
  static toDTOArray(entities: PricingItem[]): PricingItemDTO[] {
    return entities.map(entity => this.toDTO(entity));
  }

  /**
   * Convert array of DTOs to entities
   */
  static toDomainArray(dtos: PricingItemDTO[]): PricingItem[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}

export class CategoryMapper {
  /**
   * Convert Category entity to DTO
   */
  static toDTO(entity: Category): CategoryDTO {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      order: entity.order,
    };
  }

  /**
   * Convert Category DTO to entity
   */
  static toDomain(dto: CategoryDTO): Category {
    return new Category(
      dto.id,
      dto.name,
      dto.description || '',
      dto.order
    );
  }

  /**
   * Convert array of entities to DTOs
   */
  static toDTOArray(entities: Category[]): CategoryDTO[] {
    return entities.map(entity => this.toDTO(entity));
  }

  /**
   * Convert array of DTOs to entities
   */
  static toDomainArray(dtos: CategoryDTO[]): Category[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}
