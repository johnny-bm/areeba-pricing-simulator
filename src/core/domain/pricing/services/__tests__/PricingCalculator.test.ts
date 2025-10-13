/**
 * PricingCalculator Service Tests
 */

import { describe, it, expect } from 'vitest';
import { PricingCalculator } from '../PricingCalculator';
import { PricingItem } from '../../entities/PricingItem';
import { Money } from '../../value-objects/Money';
import { Percentage } from '../../value-objects/Percentage';
import { Category } from '../../entities/Category';

describe('PricingCalculator Service', () => {
  // Test data setup
  const category = new Category('cat-1', 'Software', 'Software products', 1);
  const item1 = new PricingItem('item-1', 'Software A', 'Description', new Money(100, 'USD'), category, 2);
  const item2 = new PricingItem('item-2', 'Software B', 'Description', new Money(50, 'USD'), category, 3);
  const items = [item1, item2];

  describe('Basic Calculations', () => {
    it('should calculate total for multiple items', () => {
      const total = PricingCalculator.calculateTotal(items);
      
      expect(total.amount).toBe(350); // (100 * 2) + (50 * 3)
    });

    it('should return zero for empty items array', () => {
      const total = PricingCalculator.calculateTotal([]);
      
      expect(total.amount).toBe(0);
    });

    it('should calculate subtotal correctly', () => {
      const subtotal = PricingCalculator.calculateSubtotal(items);
      
      expect(subtotal.amount).toBe(350);
    });

    it('should calculate average price', () => {
      const average = PricingCalculator.calculateAveragePrice(items);
      
      expect(average.amount).toBe(175); // 350 / 2 items
    });

    it('should calculate total quantity', () => {
      const totalQuantity = PricingCalculator.calculateTotalQuantity(items);
      
      expect(totalQuantity).toBe(5); // 2 + 3
    });
  });

  describe('Discount Calculations', () => {
    it('should apply discount to total', () => {
      const total = new Money(100, 'USD');
      const discount = new Percentage(20);
      const discountedTotal = PricingCalculator.applyDiscount(total, discount);
      
      expect(discountedTotal.amount).toBe(80);
    });

    it('should calculate discount amount', () => {
      const total = new Money(200, 'USD');
      const discount = new Percentage(15);
      const discountAmount = PricingCalculator.calculateDiscountAmount(total, discount);
      
      expect(discountAmount.amount).toBe(30);
    });

    it('should calculate bulk savings', () => {
      const bulkDiscount = new Percentage(10);
      const savings = PricingCalculator.calculateBulkSavings(items, bulkDiscount);
      
      expect(savings.amount).toBe(35); // 10% of 350
    });
  });

  describe('Tax Calculations', () => {
    it('should calculate tax on subtotal', () => {
      const subtotal = new Money(100, 'USD');
      const taxRate = new Percentage(8.5);
      const tax = PricingCalculator.calculateTax(subtotal, taxRate);
      
      expect(tax.amount).toBe(8.5);
    });

    it('should calculate total with tax', () => {
      const subtotal = new Money(100, 'USD');
      const taxRate = new Percentage(10);
      const totalWithTax = PricingCalculator.calculateTotalWithTax(subtotal, taxRate);
      
      expect(totalWithTax.amount).toBe(110);
    });
  });

  describe('Comprehensive Pricing', () => {
    it('should calculate complete pricing with discount and tax', () => {
      const discount = new Percentage(20);
      const taxRate = new Percentage(8.5);
      const result = PricingCalculator.calculatePricing(items, discount, taxRate);
      
      expect(result.subtotal.amount).toBe(350);
      expect(result.totalDiscount.amount).toBe(70); // 20% of 350
      expect(result.total.amount).toBe(303.8); // (350 - 70) + (280 * 0.085)
      expect(result.savings.amount).toBe(70);
      expect(result.savingsRate).toBe(20);
    });

    it('should calculate pricing without discount and tax', () => {
      const result = PricingCalculator.calculatePricing(items);
      
      expect(result.subtotal.amount).toBe(350);
      expect(result.totalDiscount.amount).toBe(0);
      expect(result.total.amount).toBe(350);
      expect(result.savings.amount).toBe(0);
      expect(result.savingsRate).toBe(0);
    });
  });

  describe('Item-Level Calculations', () => {
    it('should calculate item pricing with individual discounts', () => {
      const itemDiscounts = new Map<string, Percentage>();
      itemDiscounts.set('item-1', new Percentage(10));
      itemDiscounts.set('item-2', new Percentage(20));
      
      const results = PricingCalculator.calculateItemPricing(items, itemDiscounts);
      
      expect(results).toHaveLength(2);
      expect(results[0].subtotal.amount).toBe(200); // 100 * 2
      expect(results[0].discount.amount).toBe(20); // 10% of 200
      expect(results[0].total.amount).toBe(180);
      
      expect(results[1].subtotal.amount).toBe(150); // 50 * 3
      expect(results[1].discount.amount).toBe(30); // 20% of 150
      expect(results[1].total.amount).toBe(120);
    });

    it('should calculate price per unit', () => {
      const unitPrice = PricingCalculator.calculatePricePerUnit(item1);
      
      expect(unitPrice.amount).toBe(100);
    });

    it('should calculate total cost for specific quantity', () => {
      const totalCost = PricingCalculator.calculateItemTotalCost(item1, 5);
      
      expect(totalCost.amount).toBe(500); // 100 * 5
    });

    it('should throw error for zero quantity', () => {
      expect(() => {
        PricingCalculator.calculateItemTotalCost(item1, 0);
      }).toThrow('Quantity must be greater than zero');
    });
  });

  describe('Percentage Calculations', () => {
    it('should calculate item percentages', () => {
      const percentages = PricingCalculator.calculateItemPercentages(items);
      
      expect(percentages.get('item-1')).toBeCloseTo(57.14, 2); // 200/350 * 100
      expect(percentages.get('item-2')).toBeCloseTo(42.86, 2); // 150/350 * 100
    });

    it('should return empty map for zero total', () => {
      const freeItems = [
        new PricingItem('item-1', 'Free', 'Description', Money.zero(), category),
        new PricingItem('item-2', 'Free', 'Description', Money.zero(), category),
      ];
      
      const percentages = PricingCalculator.calculateItemPercentages(freeItems);
      
      expect(percentages.size).toBe(0);
    });
  });

  describe('Advanced Calculations', () => {
    it('should calculate total savings from multiple discounts', () => {
      const discounts = [new Percentage(10), new Percentage(5)];
      const savings = PricingCalculator.calculateTotalSavings(items, discounts);
      
      expect(savings.amount).toBe(52.5); // 15% of 350
    });

    it('should cap total discount at 100%', () => {
      const discounts = [new Percentage(60), new Percentage(50)]; // 110% total
      const savings = PricingCalculator.calculateTotalSavings(items, discounts);
      
      expect(savings.amount).toBe(350); // 100% of 350
    });

    it('should calculate break-even point', () => {
      const fixedCosts = new Money(1000, 'USD');
      const variableCost = new Money(10, 'USD');
      const sellingPrice = new Money(25, 'USD');
      
      const breakEven = PricingCalculator.calculateBreakEvenPoint(fixedCosts, variableCost, sellingPrice);
      
      expect(breakEven).toBe(67); // 1000 / (25 - 10) = 66.67, rounded up
    });

    it('should throw error for invalid break-even calculation', () => {
      const fixedCosts = new Money(1000, 'USD');
      const variableCost = new Money(30, 'USD');
      const sellingPrice = new Money(25, 'USD'); // Less than variable cost
      
      expect(() => {
        PricingCalculator.calculateBreakEvenPoint(fixedCosts, variableCost, sellingPrice);
      }).toThrow('Selling price must be greater than variable cost');
    });

    it('should calculate profit margin', () => {
      const sellingPrice = new Money(100, 'USD');
      const cost = new Money(60, 'USD');
      const margin = PricingCalculator.calculateProfitMargin(sellingPrice, cost);
      
      expect(margin.value).toBe(40); // (100 - 60) / 100 * 100
    });

    it('should return zero margin for break-even', () => {
      const sellingPrice = new Money(100, 'USD');
      const cost = new Money(100, 'USD');
      const margin = PricingCalculator.calculateProfitMargin(sellingPrice, cost);
      
      expect(margin.value).toBe(0);
    });

    it('should return zero margin for loss', () => {
      const sellingPrice = new Money(80, 'USD');
      const cost = new Money(100, 'USD');
      const margin = PricingCalculator.calculateProfitMargin(sellingPrice, cost);
      
      expect(margin.value).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amounts', () => {
      const zeroItems = [
        new PricingItem('item-1', 'Free', 'Description', Money.zero(), category),
      ];
      
      const total = PricingCalculator.calculateTotal(zeroItems);
      expect(total.amount).toBe(0);
    });

    it('should handle single item', () => {
      const singleItem = [item1];
      const total = PricingCalculator.calculateTotal(singleItem);
      
      expect(total.amount).toBe(200);
    });

    it('should handle 100% discount', () => {
      const total = new Money(100, 'USD');
      const discount = new Percentage(100);
      const discountedTotal = PricingCalculator.applyDiscount(total, discount);
      
      expect(discountedTotal.amount).toBe(0);
    });
  });
});
