/**
 * Percentage Value Object Tests
 */

import { describe, it, expect } from 'vitest';
import { Percentage } from '../Percentage';
import { Money } from '../Money';

describe('Percentage Value Object', () => {
  describe('Constructor Validation', () => {
    it('should create valid percentage', () => {
      const percentage = new Percentage(15);
      
      expect(percentage.value).toBe(15);
    });

    it('should round to 2 decimal places', () => {
      const percentage = new Percentage(15.123456);
      
      expect(percentage.value).toBe(15.12);
    });

    it('should throw error for negative percentage', () => {
      expect(() => {
        new Percentage(-5);
      }).toThrow('Percentage cannot be negative');
    });

    it('should throw error for percentage over 100%', () => {
      expect(() => {
        new Percentage(150);
      }).toThrow('Percentage cannot exceed 100%');
    });

    it('should throw error for invalid value', () => {
      expect(() => {
        new Percentage(NaN);
      }).toThrow('Percentage value must be a valid number');
    });

    it('should throw error for infinite value', () => {
      expect(() => {
        new Percentage(Infinity);
      }).toThrow('Percentage must be finite');
    });
  });

  describe('Money Operations', () => {
    it('should apply percentage to money', () => {
      const percentage = new Percentage(20);
      const money = new Money(100, 'USD');
      const result = percentage.applyTo(money);
      
      expect(result.amount).toBe(20);
    });

    it('should calculate discount amount', () => {
      const percentage = new Percentage(15);
      const money = new Money(200, 'USD');
      const discount = percentage.calculateDiscount(money);
      
      expect(discount.amount).toBe(30);
    });

    it('should calculate remaining amount after discount', () => {
      const percentage = new Percentage(25);
      const money = new Money(100, 'USD');
      const remaining = percentage.calculateRemaining(money);
      
      expect(remaining.amount).toBe(75);
    });
  });

  describe('Decimal Conversion', () => {
    it('should convert to decimal correctly', () => {
      const percentage = new Percentage(15);
      
      expect(percentage.toDecimal()).toBe(0.15);
    });

    it('should handle zero percentage', () => {
      const percentage = new Percentage(0);
      
      expect(percentage.toDecimal()).toBe(0);
    });

    it('should handle 100% percentage', () => {
      const percentage = new Percentage(100);
      
      expect(percentage.toDecimal()).toBe(1);
    });
  });

  describe('Formatting', () => {
    it('should format as percentage string', () => {
      const percentage = new Percentage(15);
      
      expect(percentage.format()).toBe('15%');
    });

    it('should format with decimal places', () => {
      const percentage = new Percentage(15.75);
      
      expect(percentage.formatWithDecimals(1)).toBe('15.8%');
    });
  });

  describe('State Checks', () => {
    it('should identify zero percentage', () => {
      const zeroPercentage = new Percentage(0);
      const nonZeroPercentage = new Percentage(50);
      
      expect(zeroPercentage.isZero()).toBe(true);
      expect(nonZeroPercentage.isZero()).toBe(false);
    });

    it('should identify full percentage', () => {
      const fullPercentage = new Percentage(100);
      const partialPercentage = new Percentage(50);
      
      expect(fullPercentage.isFull()).toBe(true);
      expect(partialPercentage.isFull()).toBe(false);
    });
  });

  describe('Arithmetic Operations', () => {
    it('should add percentages', () => {
      const p1 = new Percentage(20);
      const p2 = new Percentage(30);
      const result = p1.add(p2);
      
      expect(result.value).toBe(50);
    });

    it('should throw error when adding exceeds 100%', () => {
      const p1 = new Percentage(60);
      const p2 = new Percentage(50);
      
      expect(() => {
        p1.add(p2);
      }).toThrow('Combined percentage cannot exceed 100%');
    });

    it('should subtract percentages', () => {
      const p1 = new Percentage(50);
      const p2 = new Percentage(20);
      const result = p1.subtract(p2);
      
      expect(result.value).toBe(30);
    });

    it('should throw error when subtracting results in negative', () => {
      const p1 = new Percentage(20);
      const p2 = new Percentage(30);
      
      expect(() => {
        p1.subtract(p2);
      }).toThrow('Result cannot be negative');
    });
  });

  describe('Comparison Operations', () => {
    it('should compare percentages correctly', () => {
      const p1 = new Percentage(30);
      const p2 = new Percentage(20);
      const p3 = new Percentage(30);
      
      expect(p1.isGreaterThan(p2)).toBe(true);
      expect(p2.isLessThan(p1)).toBe(true);
      expect(p1.equals(p3)).toBe(true);
    });
  });

  describe('Factory Methods', () => {
    it('should create from decimal', () => {
      const percentage = Percentage.fromDecimal(0.15);
      
      expect(percentage.value).toBe(15);
    });

    it('should create zero percentage', () => {
      const zeroPercentage = Percentage.zero();
      
      expect(zeroPercentage.value).toBe(0);
    });

    it('should create full percentage', () => {
      const fullPercentage = Percentage.full();
      
      expect(fullPercentage.value).toBe(100);
    });

    it('should create from fraction', () => {
      const percentage = Percentage.fromFraction(1, 4);
      
      expect(percentage.value).toBe(25);
    });

    it('should throw error for zero denominator', () => {
      expect(() => {
        Percentage.fromFraction(1, 0);
      }).toThrow('Denominator cannot be zero');
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const percentage = new Percentage(15);
      const json = percentage.toJSON();
      
      expect(json).toEqual({ value: 15 });
    });

    it('should deserialize from JSON', () => {
      const json = { value: 15 };
      const percentage = Percentage.fromJSON(json);
      
      expect(percentage.value).toBe(15);
    });
  });

  describe('Immutability', () => {
    it('should return new instances for operations', () => {
      const original = new Percentage(20);
      const added = original.add(new Percentage(30));
      
      expect(original.value).toBe(20);
      expect(added.value).toBe(50);
      expect(original).not.toBe(added);
    });
  });
});
