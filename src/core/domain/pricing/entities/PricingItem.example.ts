/**
 * EXAMPLE: PricingItem Entity
 * 
 * This is a template showing Domain Entity best practices for the team.
 * 
 * 🎯 Key principles demonstrated:
 * 1. Validation in constructor (fail fast) - prevents invalid objects
 * 2. Immutability (readonly properties, return new instances) - thread-safe, predictable
 * 3. Business logic in domain (calculateTotal, applyDiscount) - not in UI or API
 * 4. No framework dependencies (pure TypeScript) - testable, portable
 * 5. Rich domain models (methods, not just data) - encapsulates business rules
 * 6. Self-validating (throws errors for invalid state) - prevents bugs
 * 
 * 📚 For full Clean Architecture guidelines, see:
 * docs/ARCHITECTURE.md#domain-layer
 * 
 * 🧪 For testing examples, see:
 * PricingItem.example.test.ts
 * 
 * 👥 Team Notes:
 * - Always validate input in constructors
 * - Use readonly properties for immutability
 * - Return new instances for updates (don't mutate)
 * - Keep business logic in domain, not in components
 * - Test business rules, not implementation details
 */

import { Money } from '../value-objects/Money';
import { Category } from '../value-objects/Category';

/**
 * PricingItem Entity
 * 
 * Represents a pricing item in the system with business logic for:
 * - Price calculations
 * - Quantity management
 * - Discount applications
 * - Validation rules
 */
export class PricingItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly basePrice: Money,
    public readonly category: Category,
    public readonly unit: string,
    public readonly isActive: boolean = true,
    public readonly tags: string[] = [],
    private _quantity: number = 1,
    private _discount: number = 0,
    private _discountType: 'percentage' | 'fixed' = 'percentage'
  ) {
    this.validate();
  }

  /**
   * Business validation rules
   * Domain entities should validate their own state
   */
  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('Pricing item ID is required');
    }
    
    if (!this.name || this.name.trim() === '') {
      throw new Error('Pricing item name is required');
    }
    
    if (this._quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    
    if (this._discount < 0) {
      throw new Error('Discount cannot be negative');
    }
    
    if (this._discountType === 'percentage' && this._discount > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }
  }

  /**
   * Get current quantity
   */
  get quantity(): number {
    return this._quantity;
  }

  /**
   * Get current discount
   */
  get discount(): number {
    return this._discount;
  }

  /**
   * Get discount type
   */
  get discountType(): 'percentage' | 'fixed' {
    return this._discountType;
  }

  /**
   * Calculate total price before discount
   */
  get subtotal(): Money {
    return this.basePrice.multiply(this._quantity);
  }

  /**
   * Calculate discount amount
   */
  get discountAmount(): Money {
    if (this._discountType === 'percentage') {
      return this.subtotal.multiply(this._discount / 100);
    } else {
      return new Money(this._discount, this.basePrice.currency);
    }
  }

  /**
   * Calculate total price after discount
   */
  get totalPrice(): Money {
    return this.subtotal.subtract(this.discountAmount);
  }

  /**
   * Check if item is free (after discount)
   */
  get isFree(): boolean {
    return this.totalPrice.amount <= 0;
  }

  /**
   * Update quantity with validation
   * Returns new instance (immutable)
   */
  updateQuantity(quantity: number): PricingItem {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    
    return new PricingItem(
      this.id,
      this.name,
      this.description,
      this.basePrice,
      this.category,
      this.unit,
      this.isActive,
      this.tags,
      quantity,
      this._discount,
      this._discountType
    );
  }

  /**
   * Apply discount with validation
   * Returns new instance (immutable)
   */
  applyDiscount(discount: number, type: 'percentage' | 'fixed' = 'percentage'): PricingItem {
    if (discount < 0) {
      throw new Error('Discount cannot be negative');
    }
    
    if (type === 'percentage' && discount > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }
    
    return new PricingItem(
      this.id,
      this.name,
      this.description,
      this.basePrice,
      this.category,
      this.unit,
      this.isActive,
      this.tags,
      this._quantity,
      discount,
      type
    );
  }

  /**
   * Remove discount
   * Returns new instance (immutable)
   */
  removeDiscount(): PricingItem {
    return new PricingItem(
      this.id,
      this.name,
      this.description,
      this.basePrice,
      this.category,
      this.unit,
      this.isActive,
      this.tags,
      this._quantity,
      0,
      'percentage'
    );
  }

  /**
   * Check if item has discount
   */
  get hasDiscount(): boolean {
    return this._discount > 0;
  }

  /**
   * Get savings amount
   */
  get savings(): Money {
    return this.discountAmount;
  }

  /**
   * Get savings percentage
   */
  get savingsPercentage(): number {
    if (this.subtotal.amount === 0) return 0;
    return (this.savings.amount / this.subtotal.amount) * 100;
  }

  /**
   * Convert to JSON for API/Database
   * Domain entities should know how to serialize themselves
   */
  toJSON(): PricingItemJSON {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      basePrice: this.basePrice.toJSON(),
      category: this.category.toJSON(),
      unit: this.unit,
      isActive: this.isActive,
      tags: this.tags,
      quantity: this._quantity,
      discount: this._discount,
      discountType: this._discountType,
      subtotal: this.subtotal.toJSON(),
      discountAmount: this.discountAmount.toJSON(),
      totalPrice: this.totalPrice.toJSON(),
      isFree: this.isFree,
      hasDiscount: this.hasDiscount,
      savings: this.savings.toJSON(),
      savingsPercentage: this.savingsPercentage
    };
  }

  /**
   * Create from JSON (factory method)
   * Useful for deserializing from API/Database
   */
  static fromJSON(data: PricingItemJSON): PricingItem {
    return new PricingItem(
      data.id,
      data.name,
      data.description,
      Money.fromJSON(data.basePrice),
      Category.fromJSON(data.category),
      data.unit,
      data.isActive,
      data.tags,
      data.quantity,
      data.discount,
      data.discountType
    );
  }

  /**
   * Create new instance with updated properties
   * Useful for partial updates
   */
  update(updates: Partial<PricingItemUpdate>): PricingItem {
    return new PricingItem(
      updates.id ?? this.id,
      updates.name ?? this.name,
      updates.description ?? this.description,
      updates.basePrice ?? this.basePrice,
      updates.category ?? this.category,
      updates.unit ?? this.unit,
      updates.isActive ?? this.isActive,
      updates.tags ?? this.tags,
      updates.quantity ?? this._quantity,
      updates.discount ?? this._discount,
      updates.discountType ?? this._discountType
    );
  }
}

/**
 * JSON representation for API/Database
 */
export interface PricingItemJSON {
  id: string;
  name: string;
  description: string;
  basePrice: MoneyJSON;
  category: CategoryJSON;
  unit: string;
  isActive: boolean;
  tags: string[];
  quantity: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  subtotal: MoneyJSON;
  discountAmount: MoneyJSON;
  totalPrice: MoneyJSON;
  isFree: boolean;
  hasDiscount: boolean;
  savings: MoneyJSON;
  savingsPercentage: number;
}

/**
 * Update interface for partial updates
 */
export interface PricingItemUpdate {
  id?: string;
  name?: string;
  description?: string;
  basePrice?: Money;
  category?: Category;
  unit?: string;
  isActive?: boolean;
  tags?: string[];
  quantity?: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
}

/**
 * Money JSON interface (from value object)
 */
export interface MoneyJSON {
  amount: number;
  currency: string;
}

/**
 * Category JSON interface (from value object)
 */
export interface CategoryJSON {
  id: string;
  name: string;
  color?: string;
}
