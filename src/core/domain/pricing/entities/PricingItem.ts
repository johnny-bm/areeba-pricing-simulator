/**
 * PricingItem Entity
 * 
 * Represents a pricing item with business rules and calculations
 * Immutable entity following DDD principles
 */

import { Money } from '../value-objects/Money';
import { Percentage } from '../value-objects/Percentage';
import { Category } from './Category';
import { PricingItemData } from '../types';

export class PricingItem {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly basePrice: Money;
  public readonly category: Category;
  public readonly quantity: number;

  constructor(
    id: string,
    name: string,
    description: string,
    basePrice: Money,
    category: Category,
    quantity: number = 1
  ) {
    this.validateId(id);
    this.validateName(name);
    this.validateQuantity(quantity);
    
    this.id = id;
    this.name = name;
    this.description = description;
    this.basePrice = basePrice;
    this.category = category;
    this.quantity = quantity;
  }

  private validateId(id: string): void {
    if (!id || typeof id !== 'string') {
      throw new Error('Pricing item ID is required');
    }
    
    if (id.trim().length === 0) {
      throw new Error('Pricing item ID cannot be empty');
    }
    
    if (id.length > 50) {
      throw new Error('Pricing item ID cannot exceed 50 characters');
    }
  }

  private validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Pricing item name is required');
    }
    
    if (name.trim().length === 0) {
      throw new Error('Pricing item name cannot be empty');
    }
    
    if (name.length > 100) {
      throw new Error('Pricing item name cannot exceed 100 characters');
    }
  }

  private validateQuantity(quantity: number): void {
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      throw new Error('Quantity must be a valid number');
    }
    
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    
    if (!Number.isInteger(quantity)) {
      throw new Error('Quantity must be an integer');
    }
    
    if (quantity > 10000) {
      throw new Error('Quantity cannot exceed 10,000');
    }
  }

  /**
   * Get total price for this item (base price × quantity)
   */
  getTotalPrice(): Money {
    return this.basePrice.multiply(this.quantity);
  }

  /**
   * Update quantity and return new instance
   */
  updateQuantity(quantity: number): PricingItem {
    return new PricingItem(
      this.id,
      this.name,
      this.description,
      this.basePrice,
      this.category,
      quantity
    );
  }

  /**
   * Apply discount and return new instance with discounted price
   */
  applyDiscount(discount: Percentage): Money {
    return discount.calculateRemaining(this.getTotalPrice());
  }

  /**
   * Calculate discount amount
   */
  calculateDiscountAmount(discount: Percentage): Money {
    return discount.calculateDiscount(this.getTotalPrice());
  }

  /**
   * Get unit price (base price per unit)
   */
  getUnitPrice(): Money {
    return this.basePrice;
  }

  /**
   * Check if item is free (base price is zero)
   */
  isFree(): boolean {
    return this.basePrice.isZero();
  }

  /**
   * Check if item has description
   */
  hasDescription(): boolean {
    return this.description.trim().length > 0;
  }

  /**
   * Get display name with quantity
   */
  getDisplayName(): string {
    if (this.quantity > 1) {
      return `${this.name} (${this.quantity}x)`;
    }
    return this.name;
  }

  /**
   * Get formatted total price
   */
  getFormattedTotalPrice(): string {
    return this.getTotalPrice().format();
  }

  /**
   * Get formatted unit price
   */
  getFormattedUnitPrice(): string {
    return this.basePrice.format();
  }

  /**
   * Check if this item belongs to a specific category
   */
  belongsToCategory(categoryId: string): boolean {
    return this.category.id === categoryId;
  }

  /**
   * Check if this item equals another
   */
  equals(other: PricingItem): boolean {
    if (!(other instanceof PricingItem)) {
      return false;
    }
    
    return this.id === other.id;
  }

  /**
   * Check if this item has the same base price as another
   */
  hasSamePrice(other: PricingItem): boolean {
    return this.basePrice.equals(other.basePrice);
  }

  /**
   * Check if this item is more expensive than another
   */
  isMoreExpensiveThan(other: PricingItem): boolean {
    return this.basePrice.isGreaterThan(other.basePrice);
  }

  /**
   * Check if this item is less expensive than another
   */
  isLessExpensiveThan(other: PricingItem): boolean {
    return this.basePrice.isLessThan(other.basePrice);
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): PricingItemData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      basePrice: this.basePrice.amount,
      currency: this.basePrice.currency,
      categoryId: this.category.id,
      categoryName: this.category.name,
      quantity: this.quantity,
    };
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data: PricingItemData): PricingItem {
    const basePrice = new Money(data.basePrice, data.currency);
    const category = new Category(data.categoryId, data.categoryName);
    
    return new PricingItem(
      data.id,
      data.name,
      data.description || '',
      basePrice,
      category,
      data.quantity || 1
    );
  }

  /**
   * Create a new pricing item
   */
  static create(data: {
    id: string;
    name: string;
    description?: string;
    basePrice: Money;
    category: Category;
    quantity?: number;
  }): PricingItem {
    return new PricingItem(
      data.id,
      data.name,
      data.description || '',
      data.basePrice,
      data.category,
      data.quantity || 1
    );
  }

  /**
   * Create a pricing item with auto-generated ID
   */
  static createWithId(
    name: string,
    basePrice: Money,
    category: Category,
    description?: string,
    quantity?: number
  ): PricingItem {
    const id = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return new PricingItem(id, name, description || '', basePrice, category, quantity || 1);
  }
}
