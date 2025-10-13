/**
 * IPricingRepository Interface
 * 
 * Repository interface for pricing domain
 * Implementation will be in infrastructure layer
 */

import { PricingItem } from '../entities/PricingItem';
import { Category } from '../entities/Category';

export interface IPricingRepository {
  /**
   * Find pricing item by ID
   */
  findById(id: string): Promise<PricingItem | null>;

  /**
   * Find multiple pricing items by IDs
   */
  findByIds(ids: string[]): Promise<PricingItem[]>;

  /**
   * Find all pricing items
   */
  findAll(): Promise<PricingItem[]>;

  /**
   * Find pricing items by category
   */
  findByCategory(categoryId: string): Promise<PricingItem[]>;

  /**
   * Find pricing items by name (partial match)
   */
  findByName(name: string): Promise<PricingItem[]>;

  /**
   * Find pricing items within price range
   */
  findByPriceRange(minPrice: number, maxPrice: number, currency: string): Promise<PricingItem[]>;

  /**
   * Save pricing item (create or update)
   */
  save(item: PricingItem): Promise<void>;

  /**
   * Delete pricing item by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if pricing item exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Count total pricing items
   */
  count(): Promise<number>;

  /**
   * Count pricing items by category
   */
  countByCategory(categoryId: string): Promise<number>;
}

export interface ICategoryRepository {
  /**
   * Find category by ID
   */
  findById(id: string): Promise<Category | null>;

  /**
   * Find all categories
   */
  findAll(): Promise<Category[]>;

  /**
   * Find categories by name (partial match)
   */
  findByName(name: string): Promise<Category[]>;

  /**
   * Save category (create or update)
   */
  save(category: Category): Promise<void>;

  /**
   * Delete category by ID
   */
  delete(id: string): Promise<void>;

  /**
   * Check if category exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Check if category name is unique
   */
  isNameUnique(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Count total categories
   */
  count(): Promise<number>;
}
