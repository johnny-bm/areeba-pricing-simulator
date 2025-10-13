// Example: How to create a domain entity
// This is a reference implementation showing best practices

import { Money } from '@/core/domain/pricing/value-objects/Money';
import { Quantity } from '@/core/domain/pricing/value-objects/Quantity';
import { PricingItemId } from '@/core/domain/pricing/value-objects/PricingItemId';

export class PricingItem {
  constructor(
    public readonly id: PricingItemId,
    public readonly name: string,
    public readonly basePrice: Money,
    public readonly quantity: Quantity,
    public readonly category?: string,
    public readonly metadata?: Record<string, any>
  ) {
    this.validate();
  }

  get total(): Money {
    return this.basePrice.multiply(this.quantity.value);
  }

  updatePrice(newPrice: Money): PricingItem {
    return new PricingItem(
      this.id,
      this.name,
      newPrice,
      this.quantity,
      this.category,
      this.metadata
    );
  }

  updateQuantity(newQuantity: Quantity): PricingItem {
    return new PricingItem(
      this.id,
      this.name,
      this.basePrice,
      newQuantity,
      this.category,
      this.metadata
    );
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (this.basePrice.amount <= 0) {
      throw new Error('Base price must be positive');
    }
    if (this.quantity.value <= 0) {
      throw new Error('Quantity must be positive');
    }
  }
}

// Factory method for easy creation
export class PricingItemFactory {
  static create(
    name: string,
    price: number,
    quantity: number,
    currency: string = 'USD'
  ): PricingItem {
    return new PricingItem(
      PricingItemId.generate(),
      name,
      new Money(price, currency),
      new Quantity(quantity, 'pieces')
    );
  }
}

// Example usage:
// const item = PricingItemFactory.create('Web Hosting', 50, 1);
// // console.log(item.total.amount); // 50
