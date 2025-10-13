/**
 * Money Value Object Tests
 */

import { describe, it, expect } from 'vitest';
import { Money } from '../Money';

describe('Money Value Object', () => {
  describe('Constructor Validation', () => {
    it('should create valid money with amount and currency', () => {
      const money = new Money(100, 'USD');
      
      expect(money.amount).toBe(100);
      expect(money.currency).toBe('USD');
    });

    it('should default to USD currency', () => {
      const money = new Money(100);
      
      expect(money.currency).toBe('USD');
    });

    it('should round to 2 decimal places', () => {
      const money = new Money(100.123456);
      
      expect(money.amount).toBe(100.12);
    });

    it('should throw error for negative amount', () => {
      expect(() => {
        new Money(-10);
      }).toThrow('Amount cannot be negative');
    });

    it('should throw error for invalid amount', () => {
      expect(() => {
        new Money(NaN);
      }).toThrow('Amount must be a valid number');
    });

    it('should throw error for infinite amount', () => {
      expect(() => {
        new Money(Infinity);
      }).toThrow('Amount must be finite');
    });

    it('should throw error for invalid currency', () => {
      expect(() => {
        new Money(100, 'INVALID');
      }).toThrow('Currency must be a 3-letter ISO code');
    });

    it('should throw error for empty currency', () => {
      expect(() => {
        new Money(100, '');
      }).toThrow('Currency is required');
    });
  });

  describe('Arithmetic Operations', () => {
    it('should add money correctly', () => {
      const money1 = new Money(100, 'USD');
      const money2 = new Money(50, 'USD');
      const result = money1.add(money2);
      
      expect(result.amount).toBe(150);
      expect(result.currency).toBe('USD');
    });

    it('should subtract money correctly', () => {
      const money1 = new Money(100, 'USD');
      const money2 = new Money(30, 'USD');
      const result = money1.subtract(money2);
      
      expect(result.amount).toBe(70);
      expect(result.currency).toBe('USD');
    });

    it('should throw error when subtracting more than available', () => {
      const money1 = new Money(50, 'USD');
      const money2 = new Money(100, 'USD');
      
      expect(() => {
        money1.subtract(money2);
      }).toThrow('Result cannot be negative');
    });

    it('should multiply correctly', () => {
      const money = new Money(100, 'USD');
      const result = money.multiply(2.5);
      
      expect(result.amount).toBe(250);
      expect(result.currency).toBe('USD');
    });

    it('should divide correctly', () => {
      const money = new Money(100, 'USD');
      const result = money.divide(4);
      
      expect(result.amount).toBe(25);
      expect(result.currency).toBe('USD');
    });

    it('should throw error for negative multiplication factor', () => {
      const money = new Money(100, 'USD');
      
      expect(() => {
        money.multiply(-2);
      }).toThrow('Factor cannot be negative');
    });

    it('should throw error for zero division', () => {
      const money = new Money(100, 'USD');
      
      expect(() => {
        money.divide(0);
      }).toThrow('Factor must be greater than zero');
    });

    it('should throw error for currency mismatch', () => {
      const money1 = new Money(100, 'USD');
      const money2 = new Money(50, 'EUR');
      
      expect(() => {
        money1.add(money2);
      }).toThrow('Currency mismatch: USD vs EUR');
    });
  });

  describe('Comparison Operations', () => {
    it('should compare amounts correctly', () => {
      const money1 = new Money(100, 'USD');
      const money2 = new Money(50, 'USD');
      const money3 = new Money(100, 'USD');
      
      expect(money1.isGreaterThan(money2)).toBe(true);
      expect(money2.isLessThan(money1)).toBe(true);
      expect(money1.equals(money3)).toBe(true);
    });

    it('should identify zero amounts', () => {
      const zeroMoney = new Money(0, 'USD');
      const nonZeroMoney = new Money(100, 'USD');
      
      expect(zeroMoney.isZero()).toBe(true);
      expect(nonZeroMoney.isZero()).toBe(false);
    });
  });

  describe('Formatting', () => {
    it('should format as currency string', () => {
      const money = new Money(1234.56, 'USD');
      
      expect(money.format()).toBe('$1,234.56');
    });

    it('should format different currencies', () => {
      const usdMoney = new Money(100, 'USD');
      const eurMoney = new Money(100, 'EUR');
      
      expect(usdMoney.format()).toContain('$');
      expect(eurMoney.format()).toContain('€');
    });
  });

  describe('Factory Methods', () => {
    it('should create zero amount', () => {
      const zeroMoney = Money.zero('USD');
      
      expect(zeroMoney.amount).toBe(0);
      expect(zeroMoney.currency).toBe('USD');
    });

    it('should create from cents', () => {
      const money = Money.fromCents(12345, 'USD');
      
      expect(money.amount).toBe(123.45);
      expect(money.currency).toBe('USD');
    });

    it('should convert to cents', () => {
      const money = new Money(123.45, 'USD');
      
      expect(money.toCents()).toBe(12345);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      const money = new Money(100, 'USD');
      const json = money.toJSON();
      
      expect(json).toEqual({
        amount: 100,
        currency: 'USD',
      });
    });

    it('should deserialize from JSON', () => {
      const json = { amount: 100, currency: 'USD' };
      const money = Money.fromJSON(json);
      
      expect(money.amount).toBe(100);
      expect(money.currency).toBe('USD');
    });
  });

  describe('Immutability', () => {
    it('should return new instances for operations', () => {
      const original = new Money(100, 'USD');
      const added = original.add(new Money(50, 'USD'));
      
      expect(original.amount).toBe(100);
      expect(added.amount).toBe(150);
      expect(original).not.toBe(added);
    });
  });
});
