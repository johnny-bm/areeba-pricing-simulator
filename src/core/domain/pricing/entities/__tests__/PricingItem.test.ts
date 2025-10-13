/**
 * PricingItem Entity Tests
 */

import { describe, it, expect } from 'vitest';
import { PricingItem } from '../PricingItem';
import { Money } from '../../value-objects/Money';
import { Percentage } from '../../value-objects/Percentage';
import { Category } from '../Category';

describe('PricingItem Entity', () => {
  // Test data setup
  const basePrice = new Money(100, 'USD');
  const category = new Category('cat-1', 'Software', 'Software products', 1);
  
  describe('Constructor Validation', () => {
    it('should create valid pricing item', () => {
      const item = new PricingItem(
        'item-1',
        'Software License',
        'Annual software license',
        basePrice,
        category,
        1
      );
      
      expect(item.id).toBe('item-1');
      expect(item.name).toBe('Software License');
      expect(item.basePrice).toBe(basePrice);
      expect(item.category).toBe(category);
      expect(item.quantity).toBe(1);
    });

    it('should default to quantity 1', () => {
      const item = new PricingItem(
        'item-1',
        'Software License',
        'Description',
        basePrice,
        category
      );
      
      expect(item.quantity).toBe(1);
    });

    it('should throw error for empty ID', () => {
      expect(() => {
        new PricingItem('', 'Name', 'Description', basePrice, category);
      }).toThrow('Pricing item ID is required');
    });

    it('should throw error for empty name', () => {
      expect(() => {
        new PricingItem('item-1', '', 'Description', basePrice, category);
      }).toThrow('Pricing item name is required');
    });

    it('should throw error for negative quantity', () => {
      expect(() => {
        new PricingItem('item-1', 'Name', 'Description', basePrice, category, -1);
      }).toThrow('Quantity must be at least 1');
    });

    it('should throw error for zero quantity', () => {
      expect(() => {
        new PricingItem('item-1', 'Name', 'Description', basePrice, category, 0);
      }).toThrow('Quantity must be at least 1');
    });

    it('should throw error for non-integer quantity', () => {
      expect(() => {
        new PricingItem('item-1', 'Name', 'Description', basePrice, category, 1.5);
      }).toThrow('Quantity must be an integer');
    });

    it('should throw error for excessive quantity', () => {
      expect(() => {
        new PricingItem('item-1', 'Name', 'Description', basePrice, category, 10001);
      }).toThrow('Quantity cannot exceed 10,000');
    });
  });

  describe('Business Logic', () => {
    it('should calculate total price correctly', () => {
      const item = new PricingItem('item-1', 'Software', 'Description', basePrice, category, 3);
      
      expect(item.getTotalPrice().amount).toBe(300);
    });

    it('should get unit price correctly', () => {
      const item = new PricingItem('item-1', 'Software', 'Description', basePrice, category, 5);
      
      expect(item.getUnitPrice()).toBe(basePrice);
    });

    it('should identify free items', () => {
      const freeItem = new PricingItem('item-1', 'Free Software', 'Description', Money.zero(), category);
      const paidItem = new PricingItem('item-2', 'Paid Software', 'Description', basePrice, category);
      
      expect(freeItem.isFree()).toBe(true);
      expect(paidItem.isFree()).toBe(false);
    });

    it('should check for description', () => {
      const itemWithDesc = new PricingItem('item-1', 'Software', 'Has description', basePrice, category);
      const itemWithoutDesc = new PricingItem('item-2', 'Software', '', basePrice, category);
      
      expect(itemWithDesc.hasDescription()).toBe(true);
      expect(itemWithoutDesc.hasDescription()).toBe(false);
    });
  });

  describe('Quantity Updates', () => {
    it('should update quantity and return new instance', () => {
      const originalItem = new PricingItem('item-1', 'Software', 'Description', basePrice, category, 1);
      const updatedItem = originalItem.updateQuantity(5);
      
      // Original should be unchanged
      expect(originalItem.quantity).toBe(1);
      expect(originalItem.getTotalPrice().amount).toBe(100);
      
      // New instance should be updated
      expect(updatedItem.quantity).toBe(5);
      expect(updatedItem.getTotalPrice().amount).toBe(500);
      expect(updatedItem.id).toBe(originalItem.id);
    });

    it('should throw error for invalid quantity update', () => {
      const item = new PricingItem('item-1', 'Software', 'Description', basePrice, category);
      
      expect(() => {
        item.updateQuantity(0);
      }).toThrow('Quantity must be at least 1');
    });
  });

  describe('Discount Operations', () => {
    it('should apply discount correctly', () => {
      const item = new PricingItem('item-1', 'Software', 'Description', basePrice, category, 2);
      const discount = new Percentage(20);
      const discountedPrice = item.applyDiscount(discount);
      
      expect(discountedPrice.amount).toBe(160); // 200 - 20%
    });

    it('should calculate discount amount correctly', () => {
      const item = new PricingItem('item-1', 'Software', 'Description', basePrice, category, 2);
      const discount = new Percentage(15);
      const discountAmount = item.calculateDiscountAmount(discount);
      
      expect(discountAmount.amount).toBe(30); // 15% of 200
    });
  });

  describe('Display Methods', () => {
    it('should get display name with quantity', () => {
      const item = new PricingItem('item-1', 'Software', 'Description', basePrice, category, 3);
      
      expect(item.getDisplayName()).toBe('Software (3x)');
    });

    it('should get display name without quantity for single item', () => {
      const item = new PricingItem('item-1', 'Software', 'Description', basePrice, category, 1);
      
      expect(item.getDisplayName()).toBe('Software');
    });

    it('should format total price', () => {
      const item = new PricingItem('item-1', 'Software', 'Description', basePrice, category, 2);
      
      expect(item.getFormattedTotalPrice()).toBe('$200.00');
    });

    it('should format unit price', () => {
      const item = new PricingItem('item-1', 'Software', 'Description', basePrice, category);
      
      expect(item.getFormattedUnitPrice()).toBe('$100.00');
    });
  });

  describe('Category Operations', () => {
    it('should check category membership', () => {
      const item = new PricingItem('item-1', 'Software', 'Description', basePrice, category);
      
      expect(item.belongsToCategory('cat-1')).toBe(true);
      expect(item.belongsToCategory('cat-2')).toBe(false);
    });
  });

  describe('Comparison Operations', () => {
    it('should compare items correctly', () => {
      const item1 = new PricingItem('item-1', 'Software', 'Description', basePrice, category);
      const item2 = new PricingItem('item-2', 'Hardware', 'Description', basePrice, category);
      const item3 = new PricingItem('item-1', 'Software', 'Description', basePrice, category);
      
      expect(item1.equals(item3)).toBe(true);
      expect(item1.equals(item2)).toBe(false);
    });

    it('should compare prices correctly', () => {
      const expensiveItem = new PricingItem('item-1', 'Expensive', 'Description', new Money(200, 'USD'), category);
      const cheapItem = new PricingItem('item-2', 'Cheap', 'Description', new Money(50, 'USD'), category);
      
      expect(expensiveItem.isMoreExpensiveThan(cheapItem)).toBe(true);
      expect(cheapItem.isLessExpensiveThan(expensiveItem)).toBe(true);
    });

    it('should check for same price', () => {
      const item1 = new PricingItem('item-1', 'Item 1', 'Description', basePrice, category);
      const item2 = new PricingItem('item-2', 'Item 2', 'Description', basePrice, category);
      
      expect(item1.hasSamePrice(item2)).toBe(true);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const item = new PricingItem('item-1', 'Software', 'Description', basePrice, category, 2);
      const json = item.toJSON();
      
      expect(json).toEqual({
        id: 'item-1',
        name: 'Software',
        description: 'Description',
        basePrice: 100,
        currency: 'USD',
        categoryId: 'cat-1',
        categoryName: 'Software',
        quantity: 2,
      });
    });

    it('should deserialize from JSON', () => {
      const json = {
        id: 'item-1',
        name: 'Software',
        description: 'Description',
        basePrice: 100,
        currency: 'USD',
        categoryId: 'cat-1',
        categoryName: 'Software',
        quantity: 2,
      };
      
      const item = PricingItem.fromJSON(json);
      
      expect(item.id).toBe('item-1');
      expect(item.name).toBe('Software');
      expect(item.quantity).toBe(2);
      expect(item.basePrice.amount).toBe(100);
    });
  });

  describe('Factory Methods', () => {
    it('should create with data object', () => {
      const item = PricingItem.create({
        id: 'item-1',
        name: 'Software',
        description: 'Description',
        basePrice,
        category,
        quantity: 2,
      });
      
      expect(item.id).toBe('item-1');
      expect(item.quantity).toBe(2);
    });

    it('should create with auto-generated ID', () => {
      const item = PricingItem.createWithId('Software', basePrice, category, 'Description', 2);
      
      expect(item.name).toBe('Software');
      expect(item.id).toMatch(/^item-\d+-[a-z0-9]+$/);
      expect(item.quantity).toBe(2);
    });
  });

  describe('Immutability', () => {
    it('should not mutate original when updating quantity', () => {
      const originalItem = new PricingItem('item-1', 'Software', 'Description', basePrice, category, 1);
      const updatedItem = originalItem.updateQuantity(5);
      
      expect(originalItem.quantity).toBe(1);
      expect(updatedItem.quantity).toBe(5);
      expect(originalItem).not.toBe(updatedItem);
    });
  });
});
