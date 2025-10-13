# Domain Models Documentation

## Overview

Domain models represent the core business entities and their relationships. They encapsulate business logic and enforce domain rules.

## Core Entities

### PricingItem

**Purpose**: Represents a single item in a pricing scenario

**Properties**:
```typescript
class PricingItem {
  readonly id: PricingItemId;
  readonly name: string;
  readonly basePrice: Money;
  readonly quantity: Quantity;
  readonly category?: Category;
  readonly metadata: PricingItemMetadata;
}
```

**Business Rules**:
- Name cannot be empty
- Base price must be positive
- Quantity must be greater than zero
- Total is calculated as basePrice × quantity

**Methods**:
```typescript
class PricingItem {
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
}
```

### PricingScenario

**Purpose**: Represents a complete pricing scenario with multiple items

**Properties**:
```typescript
class PricingScenario {
  readonly id: PricingScenarioId;
  readonly name: string;
  readonly description?: string;
  readonly items: PricingItem[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: UserId;
}
```

**Business Rules**:
- Must have at least one item
- Name cannot be empty
- Items are immutable (use add/remove methods)
- Total is sum of all item totals

**Methods**:
```typescript
class PricingScenario {
  get total(): Money {
    return this.items.reduce((sum, item) => 
      sum.add(item.total), Money.zero()
    );
  }
  
  addItem(item: PricingItem): PricingScenario {
    return new PricingScenario(
      this.id,
      this.name,
      this.description,
      [...this.items, item],
      this.createdAt,
      new Date(),
      this.createdBy
    );
  }
  
  removeItem(itemId: PricingItemId): PricingScenario {
    return new PricingScenario(
      this.id,
      this.name,
      this.description,
      this.items.filter(item => !item.id.equals(itemId)),
      this.createdAt,
      new Date(),
      this.createdBy
    );
  }
}
```

## Value Objects

### Money

**Purpose**: Represents monetary values with currency

**Properties**:
```typescript
class Money {
  readonly amount: number;
  readonly currency: Currency;
}
```

**Business Rules**:
- Amount must be non-negative
- Currency must be valid
- Operations only allowed between same currency

**Methods**:
```typescript
class Money {
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
}
```

### Quantity

**Purpose**: Represents item quantities with validation

**Properties**:
```typescript
class Quantity {
  readonly value: number;
  readonly unit: Unit;
}
```

**Business Rules**:
- Value must be positive
- Unit must be valid
- Supports different units (pieces, hours, etc.)

### PricingItemId

**Purpose**: Unique identifier for pricing items

**Properties**:
```typescript
class PricingItemId {
  readonly value: string;
}
```

**Methods**:
```typescript
class PricingItemId {
  static generate(): PricingItemId {
    return new PricingItemId(crypto.randomUUID());
  }
  
  equals(other: PricingItemId): boolean {
    return this.value === other.value;
  }
}
```

## Enums

### Currency

```typescript
enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD'
}
```

### Unit

```typescript
enum Unit {
  PIECES = 'pieces',
  HOURS = 'hours',
  DAYS = 'days',
  MONTHS = 'months',
  UNITS = 'units'
}
```

### Category

```typescript
enum Category {
  HOSTING = 'hosting',
  SOFTWARE = 'software',
  SERVICES = 'services',
  HARDWARE = 'hardware',
  CONSULTING = 'consulting'
}
```

## Domain Events

### PricingCalculatedEvent

**Purpose**: Published when pricing is calculated

**Properties**:
```typescript
class PricingCalculatedEvent {
  readonly scenarioId: PricingScenarioId;
  readonly total: Money;
  readonly itemCount: number;
  readonly timestamp: Date;
  readonly calculatedBy: UserId;
}
```

### PricingItemAddedEvent

**Purpose**: Published when item is added to scenario

**Properties**:
```typescript
class PricingItemAddedEvent {
  readonly scenarioId: PricingScenarioId;
  readonly itemId: PricingItemId;
  readonly itemName: string;
  readonly timestamp: Date;
  readonly addedBy: UserId;
}
```

## Domain Services

### PricingCalculationService

**Purpose**: Handles complex pricing calculations

**Methods**:
```typescript
class PricingCalculationService {
  calculateTotal(items: PricingItem[]): Money {
    return items.reduce((total, item) => 
      total.add(item.total), Money.zero()
    );
  }
  
  calculateWithDiscounts(
    items: PricingItem[], 
    discounts: Discount[]
  ): Money {
    const subtotal = this.calculateTotal(items);
    const discountAmount = this.calculateDiscountAmount(subtotal, discounts);
    return subtotal.subtract(discountAmount);
  }
  
  calculateTaxes(subtotal: Money, taxRate: number): Money {
    return subtotal.multiply(taxRate / 100);
  }
}
```

## Validation Rules

### PricingItem Validation

```typescript
class PricingItemValidator {
  static validate(item: PricingItem): ValidationResult {
    const errors: string[] = [];
    
    if (!item.name || item.name.trim().length === 0) {
      errors.push('Name is required');
    }
    
    if (item.basePrice.amount <= 0) {
      errors.push('Base price must be positive');
    }
    
    if (item.quantity.value <= 0) {
      errors.push('Quantity must be positive');
    }
    
    return new ValidationResult(errors.length === 0, errors);
  }
}
```

## Factory Methods

### PricingItemFactory

```typescript
class PricingItemFactory {
  static create(
    name: string, 
    price: number, 
    quantity: number, 
    currency: Currency = Currency.USD
  ): PricingItem {
    return new PricingItem(
      PricingItemId.generate(),
      name,
      new Money(price, currency),
      new Quantity(quantity, Unit.PIECES)
    );
  }
}
```

## Testing Domain Models

```typescript
describe('PricingItem', () => {
  it('should calculate total correctly', () => {
    const item = PricingItemFactory.create('Service', 100, 2);
    expect(item.total.amount).toBe(200);
  });
  
  it('should not allow negative prices', () => {
    expect(() => {
      new PricingItem(
        PricingItemId.generate(),
        'Service',
        new Money(-100, Currency.USD),
        new Quantity(1, Unit.PIECES)
      );
    }).toThrow('Price must be positive');
  });
});
```
