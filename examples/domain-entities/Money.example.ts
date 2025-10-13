// Example: Value object pattern implementation
// This shows how to create immutable value objects

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    this.validate();
  }

  add(other: Money): Money {
    this.validateSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.validateSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!this.currency || this.currency.length !== 3) {
      throw new Error('Currency must be a 3-letter code');
    }
  }

  private validateSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error('Cannot operate on different currencies');
    }
  }
}

// Example usage:
// const price1 = new Money(100, 'USD');
// const price2 = new Money(50, 'USD');
// const total = price1.add(price2);
// console.log(total.amount); // 150
