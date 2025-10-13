/**
 * EXAMPLE: Money Value Object
 * 
 * This is a template showing Value Object best practices for the team.
 * 
 * 🎯 Key principles demonstrated:
 * 1. Immutability (no setters, return new instances) - thread-safe, predictable
 * 2. Value equality (equals method, not reference) - correct comparisons
 * 3. No external dependencies (pure TypeScript) - testable, portable
 * 4. Rich behavior (methods, not just data) - encapsulates business rules
 * 5. Validation in constructors (fail fast) - prevents invalid objects
 * 6. Business rules encapsulated (currency operations) - domain logic here
 * 
 * 📚 For full Clean Architecture guidelines, see:
 * docs/ARCHITECTURE.md#domain-layer
 * 
 * 🧪 For testing examples, see:
 * Money.example.test.ts
 * 
 * 👥 Team Notes:
 * - Value objects are immutable (no setters)
 * - Equality based on value, not reference
 * - Always validate in constructors
 * - Use factory methods for complex creation
 * - Test business rules, not implementation details
 */

/**
 * Money Value Object
 * 
 * Represents monetary values with currency support.
 * Provides business logic for:
 * - Currency validation
 * - Arithmetic operations
 * - Formatting
 * - Comparison
 */
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'USD'
  ) {
    this.validate();
  }

  /**
   * Business validation rules
   */
  private validate(): void {
    if (this.amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    
    if (!this.currency || this.currency.trim() === '') {
      throw new Error('Currency is required');
    }
    
    if (this.currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code (e.g., USD, EUR)');
    }
    
    if (!Number.isFinite(this.amount)) {
      throw new Error('Money amount must be a finite number');
    }
  }

  /**
   * Add two money values
   * Throws error if currencies don't match
   */
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract two money values
   * Throws error if currencies don't match
   */
  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  /**
   * Multiply by a factor
   */
  multiply(factor: number): Money {
    if (!Number.isFinite(factor)) {
      throw new Error('Multiplication factor must be a finite number');
    }
    
    return new Money(this.amount * factor, this.currency);
  }

  /**
   * Divide by a factor
   */
  divide(factor: number): Money {
    if (!Number.isFinite(factor)) {
      throw new Error('Division factor must be a finite number');
    }
    
    if (factor === 0) {
      throw new Error('Cannot divide by zero');
    }
    
    return new Money(this.amount / factor, this.currency);
  }

  /**
   * Check if this money is greater than other
   */
  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount > other.amount;
  }

  /**
   * Check if this money is less than other
   */
  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  /**
   * Check if this money equals other
   */
  equals(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount;
  }

  /**
   * Check if this money is zero
   */
  get isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Check if this money is positive
   */
  get isPositive(): boolean {
    return this.amount > 0;
  }

  /**
   * Check if this money is negative
   */
  get isNegative(): boolean {
    return this.amount < 0;
  }

  /**
   * Get absolute value
   */
  get absolute(): Money {
    return new Money(Math.abs(this.amount), this.currency);
  }

  /**
   * Round to specified decimal places
   */
  round(decimals: number = 2): Money {
    if (decimals < 0) {
      throw new Error('Decimal places cannot be negative');
    }
    
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(this.amount * factor) / factor;
    return new Money(rounded, this.currency);
  }

  /**
   * Format for display
   */
  format(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  /**
   * Convert to JSON
   */
  toJSON(): MoneyJSON {
    return {
      amount: this.amount,
      currency: this.currency
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(data: MoneyJSON): Money {
    return new Money(data.amount, data.currency);
  }

  /**
   * Create zero money
   */
  static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }

  /**
   * Create from string (e.g., "100.50 USD")
   */
  static fromString(moneyString: string): Money {
    const parts = moneyString.trim().split(' ');
    if (parts.length !== 2) {
      throw new Error('Money string must be in format "amount currency" (e.g., "100.50 USD")');
    }
    
    const amount = parseFloat(parts[0]);
    const currency = parts[1];
    
    if (isNaN(amount)) {
      throw new Error('Invalid amount in money string');
    }
    
    return new Money(amount, currency);
  }

  /**
   * Assert that currencies match
   */
  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot operate on different currencies: ${this.currency} and ${other.currency}`);
    }
  }
}

/**
 * JSON representation
 */
export interface MoneyJSON {
  amount: number;
  currency: string;
}
