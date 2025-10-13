# Clean Architecture Guidelines

## 🏗️ **Architecture Overview**

This document provides comprehensive guidelines for implementing Clean Architecture in the Areeba Pricing Simulator.

## 📚 **Layer Responsibilities**

### **Domain Layer** (`src/core/domain/`)
- **Purpose**: Contains business entities, value objects, and business rules
- **Dependencies**: NONE (pure business logic)
- **Key Principles**:
  - No external dependencies (no React, no Supabase, no API calls)
  - Rich domain models with business logic
  - Immutable objects with validation
  - Self-contained business rules

### **Application Layer** (`src/core/application/`)
- **Purpose**: Contains use cases, DTOs, and application services
- **Dependencies**: Domain layer only
- **Key Principles**:
  - Orchestrates domain logic
  - Handles use case execution
  - Manages data transformation
  - Coordinates between domain and infrastructure

### **Infrastructure Layer** (`src/core/infrastructure/`)
- **Purpose**: External integrations and implementations
- **Dependencies**: Domain and Application layers
- **Key Principles**:
  - Implements domain interfaces
  - Handles external API calls
  - Manages database operations
  - Provides concrete implementations

### **Presentation Layer** (`src/presentation/`)
- **Purpose**: React components and UI logic
- **Dependencies**: Application layer only
- **Key Principles**:
  - Atomic design system
  - Feature-based organization
  - Clean component interfaces
  - Minimal business logic

## 🎯 **Domain Layer Guidelines**

### **Entities**
```typescript
// ✅ Good: Rich domain entity with business logic
export class PricingItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly basePrice: Money,
    // ... other properties
  ) {
    this.validate(); // Business validation
  }

  // Business logic methods
  get totalPrice(): Money {
    return this.basePrice.multiply(this.quantity);
  }

  updateQuantity(quantity: number): PricingItem {
    // Return new instance (immutability)
    return new PricingItem(/* ... */);
  }
}

// ❌ Bad: Anemic domain model (just data)
export interface PricingItem {
  id: string;
  name: string;
  price: number;
  // No business logic
}
```

### **Value Objects**
```typescript
// ✅ Good: Immutable value object with behavior
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    this.validate();
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }
}

// ❌ Bad: Mutable value object
export class Money {
  amount: number; // Mutable!
  currency: string;
}
```

### **Domain Services**
```typescript
// ✅ Good: Domain service with business logic
export class PricingCalculator {
  calculateTotal(items: PricingItem[]): Money {
    return items.reduce((total, item) => 
      total.add(item.totalPrice), Money.zero()
    );
  }
}
```

## 🧪 **Testing Strategy**

### **Domain Entity Testing**
```typescript
describe('PricingItem', () => {
  it('should calculate total correctly', () => {
    const item = new PricingItem(/* ... */);
    expect(item.totalPrice.amount).toBe(expected);
  });

  it('should throw error for invalid input', () => {
    expect(() => {
      new PricingItem('', 'Name', /* ... */);
    }).toThrow('ID is required');
  });
});
```

### **Testing Principles**
1. **Test business rules, not implementation details**
2. **Test validation rules (constructor validation)**
3. **Test business logic (calculations, transformations)**
4. **Test edge cases and error conditions**
5. **Test immutability (new instances returned)**

## 📋 **Development Guidelines**

### **Component Size**
- Maximum 200 lines per component
- Single Responsibility Principle
- Extract complex logic to custom hooks

### **State Management**
- Use Zustand for global state
- No React Context except for theme/i18n
- No props drilling beyond 2 levels

### **Error Handling**
- Domain/Application: Throw descriptive errors
- Presentation: Catch and display user-friendly messages

### **Import Order**
```typescript
// 1. External dependencies
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Core layer (domain → application → infrastructure)
import { PricingItem } from '@/core/domain/pricing/entities/PricingItem';
import { CalculatePricingUseCase } from '@/core/application/pricing/use-cases/CalculatePricingUseCase';

// 3. State layer
import { useAppStore } from '@/state/store';

// 4. Presentation layer
import { Button } from '@/presentation/design-system/atoms/Button';

// 5. Relative imports
import { PricingItemCard } from './PricingItemCard';
```

## 🚫 **Architecture Boundaries**

ESLint enforces these boundaries:
- ❌ Domain cannot import from Infrastructure
- ❌ Domain cannot import from Presentation
- ❌ Application cannot import from Presentation
- ❌ Application cannot import from State

## 📊 **Success Metrics**

### **Code Quality**
- Component size < 200 lines
- Test coverage > 80%
- No circular dependencies
- ESLint boundaries enforced

### **Performance**
- Bundle size < 500KB
- Initial load time < 2s
- No memory leaks
- Proper code splitting

### **Developer Experience**
- Build time < 30s
- Hot reload < 2s
- TypeScript errors = 0
- ESLint errors = 0

## 🔄 **Migration Strategy**

### **Phase 1: Foundation** ✅
- Create Clean Architecture structure
- Setup path aliases
- Add ESLint boundaries
- Create barrel exports

### **Phase 2: State Management** 🔄
- Install Zustand
- Create store configuration
- Migrate from React Context
- Test state management

### **Phase 3: Domain Layer** ⏳
- Create domain entities
- Implement business logic
- Add validation rules
- Write domain tests

### **Phase 4: Application Layer** ⏳
- Create use cases
- Implement DTOs
- Add application services
- Write use case tests

### **Phase 5: Infrastructure Layer** ⏳
- Implement repositories
- Create API clients
- Add external integrations
- Write integration tests

### **Phase 6: Presentation Layer** ⏳
- Migrate components
- Implement design system
- Add feature modules
- Write component tests

## 📚 **Resources**

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [Zustand](https://github.com/pmndrs/zustand)

## 👥 **Team Guidelines**

### **Code Review Checklist**
- [ ] Domain entities have business logic
- [ ] Value objects are immutable
- [ ] No external dependencies in domain
- [ ] Components are under 200 lines
- [ ] Tests cover business rules
- [ ] ESLint boundaries enforced

### **Development Workflow**
1. Create domain entities first
2. Write tests for business logic
3. Implement use cases
4. Create infrastructure implementations
5. Build presentation components
6. Integrate and test

### **Common Pitfalls**
- ❌ Putting business logic in components
- ❌ Making domain entities mutable
- ❌ Adding external dependencies to domain
- ❌ Creating anemic domain models
- ❌ Skipping validation in constructors