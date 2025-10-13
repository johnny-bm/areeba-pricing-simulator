/**
 * PricingItem Database Mapper
 * 
 * Converts between database rows and domain entities
 * Pure conversion logic - no business rules
 */

import { PricingItem } from '../../../domain/pricing/entities/PricingItem';
import { Category } from '../../../domain/pricing/entities/Category';
import { Money } from '../../../domain/pricing/value-objects/Money';
import { PricingItemWithCategoryRow, PricingItemRow, CategoryRow } from '../types/database.types';
import { DatabaseValidationError } from '../errors/InfrastructureError';

export class PricingItemDbMapper {
  /**
   * Convert database row to domain entity
   */
  static toDomain(row: PricingItemWithCategoryRow): PricingItem {
    this.validateRow(row);
    
    const basePrice = new Money(row.base_price, row.currency);
    const category = CategoryDbMapper.toDomain(row.categories);
    
    return new PricingItem(
      row.id,
      row.name,
      row.description || '',
      basePrice,
      category,
      1 // Default quantity for retrieved items
    );
  }

  /**
   * Convert domain entity to database row
   */
  static toDatabase(item: PricingItem): PricingItemRow {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      base_price: item.basePrice.amount,
      currency: item.basePrice.currency,
      category_id: item.category.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Convert array of database rows to domain entities
   */
  static toDomainArray(rows: PricingItemWithCategoryRow[]): PricingItem[] {
    return rows.map(row => this.toDomain(row));
  }

  /**
   * Convert array of domain entities to database rows
   */
  static toDatabaseArray(items: PricingItem[]): PricingItemRow[] {
    return items.map(item => this.toDatabase(item));
  }

  /**
   * Validate database row structure
   */
  private static validateRow(row: PricingItemWithCategoryRow): void {
    if (!row.id || typeof row.id !== 'string') {
      throw new DatabaseValidationError('id', 'ID must be a non-empty string');
    }
    
    if (!row.name || typeof row.name !== 'string') {
      throw new DatabaseValidationError('name', 'Name must be a non-empty string');
    }
    
    if (typeof row.base_price !== 'number' || row.base_price < 0) {
      throw new DatabaseValidationError('base_price', 'Base price must be a non-negative number');
    }
    
    if (!row.currency || typeof row.currency !== 'string') {
      throw new DatabaseValidationError('currency', 'Currency must be a non-empty string');
    }
    
    if (!row.category_id || typeof row.category_id !== 'string') {
      throw new DatabaseValidationError('category_id', 'Category ID must be a non-empty string');
    }
    
    if (!row.categories) {
      throw new DatabaseValidationError('categories', 'Category data is required');
    }
  }
}

export class CategoryDbMapper {
  /**
   * Convert database row to domain entity
   */
  static toDomain(row: CategoryRow): Category {
    this.validateRow(row);
    
    return new Category(
      row.id,
      row.name,
      row.description || '',
      row.order
    );
  }

  /**
   * Convert domain entity to database row
   */
  static toDatabase(category: Category): CategoryRow {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      order: category.order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Convert array of database rows to domain entities
   */
  static toDomainArray(rows: CategoryRow[]): Category[] {
    return rows.map(row => this.toDomain(row));
  }

  /**
   * Convert array of domain entities to database rows
   */
  static toDatabaseArray(categories: Category[]): CategoryRow[] {
    return categories.map(category => this.toDatabase(category));
  }

  /**
   * Validate database row structure
   */
  private static validateRow(row: CategoryRow): void {
    if (!row.id || typeof row.id !== 'string') {
      throw new DatabaseValidationError('id', 'ID must be a non-empty string');
    }
    
    if (!row.name || typeof row.name !== 'string') {
      throw new DatabaseValidationError('name', 'Name must be a non-empty string');
    }
    
    if (typeof row.order !== 'number' || row.order < 0) {
      throw new DatabaseValidationError('order', 'Order must be a non-negative number');
    }
  }
}
