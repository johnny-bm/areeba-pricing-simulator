# Clean Architecture Structure

This directory follows Clean Architecture and Domain-Driven Design principles.

## 📁 Directory Structure

```
src/
├── core/                    # Business logic (domain-driven)
│   ├── domain/             # Entities, value objects, business rules
│   │   ├── pricing/        # Pricing domain
│   │   ├── user/          # User domain
│   │   └── document/      # Document domain
│   ├── application/        # Use cases, DTOs, services
│   │   ├── pricing/        # Pricing use cases
│   │   ├── user/          # User use cases
│   │   └── document/      # Document use cases
│   └── infrastructure/      # External integrations
│       ├── database/      # Database implementations
│       ├── api/           # API clients
│       └── storage/       # Storage implementations
├── presentation/          # React components
│   ├── design-system/     # Atomic design components
│   │   ├── atoms/         # Basic UI elements
│   │   ├── molecules/    # Simple combinations
│   │   └── organisms/     # Complex components
│   ├── features/          # Feature modules
│   │   ├── pricing/       # Pricing feature
│   │   ├── admin/         # Admin feature
│   │   ├── auth/          # Auth feature
│   │   └── documents/     # Documents feature
│   └── shared/            # Shared UI utilities
├── state/                 # Zustand store & slices
├── routing/               # Routes & guards
├── config/                # Configuration
└── types/                 # Global TypeScript types
```

## 🏗️ Architecture Principles

### 1. Dependency Rule
- **Domain** ← Application ← Presentation
- **Domain** ← Infrastructure
- **Domain** has NO external dependencies

### 2. Layer Responsibilities

#### Core Layer
- **Domain**: Business entities, value objects, business rules
- **Application**: Use cases, DTOs, application services
- **Infrastructure**: External integrations (Supabase, APIs)

#### Presentation Layer
- **Design System**: Reusable UI components (atomic design)
- **Features**: Feature-specific components and pages
- **Shared**: Common UI utilities and helpers

#### State Layer
- **Zustand Store**: Global state management
- **Slices**: Feature-specific state slices

## 📋 Import Guidelines

### Path Aliases
```typescript
// Core layer
import { PricingItem } from '@/core/domain/pricing/entities/PricingItem';
import { CalculatePricingUseCase } from '@/core/application/pricing/use-cases/CalculatePricingUseCase';

// Presentation layer
import { Button } from '@/presentation/design-system/atoms/Button';
import { PricingPage } from '@/presentation/features/pricing/pages/PricingPage';

// State layer
import { useAppStore } from '@/state/store';

// Config
import { API_CONFIG } from '@/config/api';
```

### Import Order
1. External dependencies
2. Core layer (domain → application → infrastructure)
3. State layer
4. Presentation layer
5. Relative imports

## 🚫 Architecture Boundaries

ESLint enforces these boundaries:

- ❌ Domain cannot import from Infrastructure
- ❌ Domain cannot import from Presentation
- ❌ Application cannot import from Presentation
- ❌ Application cannot import from State

## 🧪 Testing Strategy

### Unit Tests
- **Domain**: Test entities and business rules
- **Application**: Test use cases
- **Infrastructure**: Test repository implementations

### Integration Tests
- **Presentation**: Test component interactions
- **State**: Test state management

### Component Tests
- **Design System**: Test atomic components
- **Features**: Test feature components

## 📝 Development Guidelines

### Component Size
- Maximum 200 lines per component
- Single Responsibility Principle
- Extract complex logic to custom hooks

### State Management
- Use Zustand for global state
- No React Context except for theme/i18n
- No props drilling beyond 2 levels

### Error Handling
- Domain/Application: Throw descriptive errors
- Presentation: Catch and display user-friendly messages

## 🔄 Migration Strategy

### Phase 1: Foundation
- ✅ Create directory structure
- ✅ Setup path aliases
- ✅ Add ESLint boundaries
- ✅ Create barrel exports

### Phase 2: Domain Migration
- Create domain entities
- Implement use cases
- Create repository interfaces

### Phase 3: Infrastructure
- Implement repository classes
- Create API clients
- Add external integrations

### Phase 4: Presentation
- Migrate components
- Implement design system
- Add feature modules

### Phase 5: State Management
- Setup Zustand store
- Create state slices
- Migrate from Context

## 📚 Resources

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [Zustand](https://github.com/pmndrs/zustand)
