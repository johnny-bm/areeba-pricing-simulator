/**
 * PricingCalculator Domain Service
 * 
 * Contains business logic for pricing calculations
 * Pure business logic with no external dependencies
 */

import { Money } from '../value-objects/Money';
import { Percentage } from '../value-objects/Percentage';
import { PricingItem } from '../entities/PricingItem';

export interface PricingCalculationResult {
  subtotal: Money;
  totalDiscount: Money;
  total: Money;
  savings: Money;
  savingsRate: number;
}

export interface ItemCalculationResult {
  item: PricingItem;
  subtotal: Money;
  discount: Money;
  total: Money;
}

export class PricingCalculator {
  /**
   * Calculate total for a list of pricing items
   */
  static calculateTotal(items: PricingItem[]): Money {
    if (!items || items.length === 0) {
      return Money.zero();
    }

    return items.reduce((total, item) => {
      return total.add(item.getTotalPrice());
    }, Money.zero());
  }

  /**
   * Calculate subtotal for a list of pricing items
   */
  static calculateSubtotal(items: PricingItem[]): Money {
    return this.calculateTotal(items);
  }

  /**
   * Apply discount to a total amount
   */
  static applyDiscount(total: Money, discount: Percentage): Money {
    return discount.calculateRemaining(total);
  }

  /**
   * Calculate discount amount from a total
   */
  static calculateDiscountAmount(total: Money, discount: Percentage): Money {
    return discount.calculateDiscount(total);
  }

  /**
   * Calculate tax on a subtotal
   */
  static calculateTax(subtotal: Money, taxRate: Percentage): Money {
    return taxRate.applyTo(subtotal);
  }

  /**
   * Calculate total with tax
   */
  static calculateTotalWithTax(subtotal: Money, taxRate: Percentage): Money {
    const tax = this.calculateTax(subtotal, taxRate);
    return subtotal.add(tax);
  }

  /**
   * Calculate comprehensive pricing for items with discount
   */
  static calculatePricing(
    items: PricingItem[],
    discount?: Percentage,
    taxRate?: Percentage
  ): PricingCalculationResult {
    const subtotal = this.calculateSubtotal(items);
    const totalDiscount = discount ? this.calculateDiscountAmount(subtotal, discount) : Money.zero();
    const afterDiscount = subtotal.subtract(totalDiscount);
    const tax = taxRate ? this.calculateTax(afterDiscount, taxRate) : Money.zero();
    const total = afterDiscount.add(tax);
    
    const savings = totalDiscount;
    const savingsRate = subtotal.isZero() ? 0 : (savings.amount / subtotal.amount) * 100;

    return {
      subtotal,
      totalDiscount,
      total,
      savings,
      savingsRate,
    };
  }

  /**
   * Calculate pricing for individual items
   */
  static calculateItemPricing(
    items: PricingItem[],
    itemDiscounts?: Map<string, Percentage>
  ): ItemCalculationResult[] {
    return items.map(item => {
      const subtotal = item.getTotalPrice();
      const discount = itemDiscounts?.get(item.id) || Percentage.zero();
      const discountAmount = discount.calculateDiscount(subtotal);
      const total = subtotal.subtract(discountAmount);

      return {
        item,
        subtotal,
        discount: discountAmount,
        total,
      };
    });
  }

  /**
   * Calculate average price per item
   */
  static calculateAveragePrice(items: PricingItem[]): Money {
    if (!items || items.length === 0) {
      return Money.zero();
    }

    const total = this.calculateTotal(items);
    return total.divide(items.length);
  }

  /**
   * Calculate total quantity across all items
   */
  static calculateTotalQuantity(items: PricingItem[]): number {
    return items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Calculate savings from bulk pricing
   */
  static calculateBulkSavings(
    items: PricingItem[],
    bulkDiscount: Percentage
  ): Money {
    const subtotal = this.calculateSubtotal(items);
    return this.calculateDiscountAmount(subtotal, bulkDiscount);
  }

  /**
   * Calculate price per unit for an item
   */
  static calculatePricePerUnit(item: PricingItem): Money {
    return item.getUnitPrice();
  }

  /**
   * Calculate total cost for a specific quantity of an item
   */
  static calculateItemTotalCost(item: PricingItem, quantity: number): Money {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    return item.basePrice.multiply(quantity);
  }

  /**
   * Calculate percentage of total for each item
   */
  static calculateItemPercentages(items: PricingItem[]): Map<string, number> {
    const total = this.calculateTotal(items);
    const percentages = new Map<string, number>();

    if (total.isZero()) {
      return percentages;
    }

    items.forEach(item => {
      const itemTotal = item.getTotalPrice();
      const percentage = (itemTotal.amount / total.amount) * 100;
      percentages.set(item.id, Math.round(percentage * 100) / 100);
    });

    return percentages;
  }

  /**
   * Calculate total savings from multiple discounts
   */
  static calculateTotalSavings(
    items: PricingItem[],
    discounts: Percentage[]
  ): Money {
    const subtotal = this.calculateSubtotal(items);
    
    // Calculate total discount percentage, capping at 100%
    let totalDiscountValue = 0;
    for (const discount of discounts) {
      totalDiscountValue += discount.value;
    }
    
    const cappedDiscountValue = Math.min(totalDiscountValue, 100);
    const cappedDiscount = new Percentage(cappedDiscountValue);

    return this.calculateDiscountAmount(subtotal, cappedDiscount);
  }

  /**
   * Calculate break-even point for pricing
   */
  static calculateBreakEvenPoint(
    fixedCosts: Money,
    variableCostPerUnit: Money,
    sellingPricePerUnit: Money
  ): number {
    if (sellingPricePerUnit.isLessThanOrEqual(variableCostPerUnit)) {
      throw new Error('Selling price must be greater than variable cost');
    }

    const contributionMargin = sellingPricePerUnit.subtract(variableCostPerUnit);
    return Math.ceil(fixedCosts.amount / contributionMargin.amount);
  }

  /**
   * Calculate profit margin percentage
   */
  static calculateProfitMargin(sellingPrice: Money, cost: Money): Percentage {
    if (sellingPrice.isLessThanOrEqual(cost)) {
      return Percentage.zero();
    }

    const profit = sellingPrice.subtract(cost);
    const marginPercentage = (profit.amount / sellingPrice.amount) * 100;
    
    return new Percentage(Math.min(marginPercentage, 100));
  }
}
