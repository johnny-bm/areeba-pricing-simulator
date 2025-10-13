/**
 * Money Value Object
 * 
 * Represents monetary values with currency support
 * Immutable value object following DDD principles
 */

import { MoneyData } from '../types';

export class Money {
  public readonly amount: number;
  public readonly currency: string;

  constructor(amount: number, currency: string = 'USD') {
    this.validateAmount(amount);
    this.validateCurrency(currency);
    
    this.amount = Math.round(amount * 100) / 100; // Round to 2 decimal places
    this.currency = currency.toUpperCase();
  }

  private validateAmount(amount: number): void {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Amount must be a valid number');
    }
    
    if (!isFinite(amount)) {
      throw new Error('Amount must be finite');
    }
    
    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }
  }

  private validateCurrency(currency: string): void {
    if (!currency || typeof currency !== 'string') {
      throw new Error('Currency is required');
    }
    
    if (currency.length !== 3) {
      throw new Error('Currency must be a 3-letter ISO code');
    }
    
    // Basic validation for common currencies
    const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY'];
    if (!validCurrencies.includes(currency.toUpperCase())) {
      throw new Error(`Currency ${currency} is not supported`);
    }
  }

  /**
   * Add another money amount
   */
  add(other: Money): Money {
    this.validateSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract another money amount
   */
  subtract(other: Money): Money {
    this.validateSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('Result cannot be negative');
    }
    return new Money(result, this.currency);
  }

  /**
   * Multiply by a factor
   */
  multiply(factor: number): Money {
    if (typeof factor !== 'number' || isNaN(factor)) {
      throw new Error('Factor must be a valid number');
    }
    
    if (factor < 0) {
      throw new Error('Factor cannot be negative');
    }
    
    return new Money(this.amount * factor, this.currency);
  }

  /**
   * Divide by a factor
   */
  divide(factor: number): Money {
    if (typeof factor !== 'number' || isNaN(factor)) {
      throw new Error('Factor must be a valid number');
    }
    
    if (factor <= 0) {
      throw new Error('Factor must be greater than zero');
    }
    
    return new Money(this.amount / factor, this.currency);
  }

  /**
   * Check if this amount is greater than another
   */
  isGreaterThan(other: Money): boolean {
    this.validateSameCurrency(other);
    return this.amount > other.amount;
  }

  /**
   * Check if this amount is less than another
   */
  isLessThan(other: Money): boolean {
    this.validateSameCurrency(other);
    return this.amount < other.amount;
  }

  /**
   * Check if this amount is less than or equal to another
   */
  isLessThanOrEqual(other: Money): boolean {
    this.validateSameCurrency(other);
    return this.amount <= other.amount;
  }

  /**
   * Check if this amount equals another
   */
  equals(other: Money): boolean {
    if (!(other instanceof Money)) {
      return false;
    }
    
    return this.amount === other.amount && this.currency === other.currency;
  }

  /**
   * Check if amount is zero
   */
  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Format as currency string
   */
  format(): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatter.format(this.amount);
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): MoneyData {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data: MoneyData): Money {
    return new Money(data.amount, data.currency);
  }

  /**
   * Create zero amount
   */
  static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }

  /**
   * Create from cents (useful for integer calculations)
   */
  static fromCents(cents: number, currency: string = 'USD'): Money {
    return new Money(cents / 100, currency);
  }

  /**
   * Get amount in cents (useful for integer calculations)
   */
  toCents(): number {
    return Math.round(this.amount * 100);
  }

  private validateSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}
