/**
 * Percentage Value Object
 * 
 * Represents percentage values (0-100)
 * Immutable value object following DDD principles
 */

import { Money } from './Money';
import { PercentageData } from '../types';

export class Percentage {
  public readonly value: number;

  constructor(value: number) {
    this.validateValue(value);
    this.value = Math.round(value * 100) / 100; // Round to 2 decimal places
  }

  private validateValue(value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Percentage value must be a valid number');
    }
    
    if (!isFinite(value)) {
      throw new Error('Percentage must be finite');
    }
    
    if (value < 0) {
      throw new Error('Percentage cannot be negative');
    }
    
    if (value > 100) {
      throw new Error('Percentage cannot exceed 100%');
    }
  }

  /**
   * Apply percentage to a money amount
   */
  applyTo(amount: Money): Money {
    return amount.multiply(this.toDecimal());
  }

  /**
   * Calculate discount amount from a money value
   */
  calculateDiscount(amount: Money): Money {
    return amount.multiply(this.toDecimal());
  }

  /**
   * Calculate remaining amount after discount
   */
  calculateRemaining(amount: Money): Money {
    const discount = this.calculateDiscount(amount);
    return amount.subtract(discount);
  }

  /**
   * Convert to decimal (e.g., 15% → 0.15)
   */
  toDecimal(): number {
    return this.value / 100;
  }

  /**
   * Format as percentage string
   */
  format(): string {
    return `${this.value}%`;
  }

  /**
   * Format with decimal places
   */
  formatWithDecimals(decimals: number = 2): string {
    return `${this.value.toFixed(decimals)}%`;
  }

  /**
   * Check if percentage is zero
   */
  isZero(): boolean {
    return this.value === 0;
  }

  /**
   * Check if percentage is 100%
   */
  isFull(): boolean {
    return this.value === 100;
  }

  /**
   * Add another percentage
   */
  add(other: Percentage): Percentage {
    const newValue = this.value + other.value;
    if (newValue > 100) {
      throw new Error('Combined percentage cannot exceed 100%');
    }
    return new Percentage(newValue);
  }

  /**
   * Subtract another percentage
   */
  subtract(other: Percentage): Percentage {
    const newValue = this.value - other.value;
    if (newValue < 0) {
      throw new Error('Result cannot be negative');
    }
    return new Percentage(newValue);
  }

  /**
   * Check if this percentage equals another
   */
  equals(other: Percentage): boolean {
    if (!(other instanceof Percentage)) {
      return false;
    }
    
    return this.value === other.value;
  }

  /**
   * Check if this percentage is greater than another
   */
  isGreaterThan(other: Percentage): boolean {
    return this.value > other.value;
  }

  /**
   * Check if this percentage is less than another
   */
  isLessThan(other: Percentage): boolean {
    return this.value < other.value;
  }

  /**
   * Convert to JSON representation
   */
  toJSON(): PercentageData {
    return {
      value: this.value,
    };
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data: PercentageData): Percentage {
    return new Percentage(data.value);
  }

  /**
   * Create from decimal (e.g., 0.15 → 15%)
   */
  static fromDecimal(decimal: number): Percentage {
    return new Percentage(decimal * 100);
  }

  /**
   * Create zero percentage
   */
  static zero(): Percentage {
    return new Percentage(0);
  }

  /**
   * Create 100% percentage
   */
  static full(): Percentage {
    return new Percentage(100);
  }

  /**
   * Create from fraction (e.g., 1/4 → 25%)
   */
  static fromFraction(numerator: number, denominator: number): Percentage {
    if (denominator === 0) {
      throw new Error('Denominator cannot be zero');
    }
    
    return new Percentage((numerator / denominator) * 100);
  }
}
