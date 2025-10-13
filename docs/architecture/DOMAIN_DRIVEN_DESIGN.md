# Domain-Driven Design Implementation

## Overview

This project implements Domain-Driven Design (DDD) principles within a Clean Architecture framework.

## Domain Model

### Core Entities

#### PricingItem
```typescript
class PricingItem {
  constructor(
    public readonly id: PricingItemId,
    public readonly name: string,
    public readonly basePrice: Money,
    public readonly quantity: Quantity
  ) {}
  
  get total(): Money {
    return this.basePrice.multiply(this.quantity.value);
  }
}
```

#### Money Value Object
```typescript
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency
  ) {}
  
  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }
}
```

### Value Objects

- **Money**: Represents monetary values with currency
- **Quantity**: Represents item quantities with validation
- **PricingItemId**: Unique identifier for pricing items

### Aggregates

- **PricingScenario**: Root aggregate for pricing calculations
- **PricingItem**: Entity within PricingScenario aggregate

## Domain Services

### PricingCalculationService
```typescript
class PricingCalculationService {
  calculateTotal(items: PricingItem[]): Money {
    return items.reduce((total, item) => 
      total.add(item.total), Money.zero()
    );
  }
}
```

## Repository Interfaces

### PricingRepository
```typescript
interface PricingRepository {
  save(scenario: PricingScenario): Promise<void>;
  findById(id: PricingScenarioId): Promise<PricingScenario | null>;
  findAll(): Promise<PricingScenario[]>;
}
```

## Use Cases

### CalculatePricingUseCase
```typescript
class CalculatePricingUseCase {
  constructor(
    private pricingRepository: PricingRepository,
    private calculationService: PricingCalculationService
  ) {}
  
  async execute(request: CalculatePricingRequest): Promise<CalculatePricingResponse> {
    const scenario = await this.pricingRepository.findById(request.scenarioId);
    if (!scenario) {
      throw new ScenarioNotFoundError();
    }
    
    const total = this.calculationService.calculateTotal(scenario.items);
    return new CalculatePricingResponse(total);
  }
}
```

## Domain Events

### PricingCalculatedEvent
```typescript
class PricingCalculatedEvent {
  constructor(
    public readonly scenarioId: PricingScenarioId,
    public readonly total: Money,
    public readonly timestamp: Date
  ) {}
}
```

## Bounded Contexts

### Pricing Context
- Handles pricing calculations
- Manages pricing items and scenarios
- Enforces pricing rules and constraints

### User Context
- Manages user authentication
- Handles user preferences
- Controls access to pricing features

## Implementation Patterns

### Factory Pattern
```typescript
class PricingItemFactory {
  static create(name: string, price: number, quantity: number): PricingItem {
    return new PricingItem(
      PricingItemId.generate(),
      name,
      new Money(price, Currency.USD),
      new Quantity(quantity)
    );
  }
}
```

### Specification Pattern
```typescript
class HighValuePricingSpecification {
  isSatisfiedBy(item: PricingItem): boolean {
    return item.total.amount > 1000;
  }
}
```

## Benefits

- **Clear Domain Model**: Business logic is explicit and testable
- **Type Safety**: Strong typing prevents invalid states
- **Testability**: Domain logic is isolated and easily tested
- **Maintainability**: Changes to business rules are localized
- **Extensibility**: New features can be added without breaking existing code
