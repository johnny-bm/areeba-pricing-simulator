# Architecture Overview

## System Architecture

The Areeba Pricing Simulator follows **Clean Architecture** and **Domain-Driven Design** principles, ensuring maintainable, testable, and scalable code.

## 🏗️ Architecture Layers

### 1. Domain Layer (Core Business Logic)
```
src/core/domain/
├── entities/           # Business entities
├── value-objects/      # Immutable value objects
├── repositories/       # Repository interfaces
└── services/          # Domain services
```

**Responsibilities:**
- Contains pure business logic
- Independent of frameworks and external concerns
- Defines business rules and constraints
- No dependencies on external layers

### 2. Application Layer (Use Cases)
```
src/core/application/
├── use-cases/         # Application use cases
├── services/          # Application services
├── dto/              # Data transfer objects
└── interfaces/       # Application interfaces
```

**Responsibilities:**
- Orchestrates domain logic
- Handles application-specific business rules
- Coordinates between domain and infrastructure
- Manages transactions and workflows

### 3. Infrastructure Layer (External Concerns)
```
src/core/infrastructure/
├── repositories/      # Repository implementations
├── services/         # External service implementations
├── adapters/         # External system adapters
└── persistence/      # Data persistence
```

**Responsibilities:**
- Implements external interfaces
- Handles data persistence
- Manages external service integrations
- Contains framework-specific code

### 4. Presentation Layer (UI)
```
src/presentation/
├── components/       # React components
├── pages/           # Page components
├── hooks/           # Custom React hooks
└── services/        # UI-specific services
```

**Responsibilities:**
- User interface and interaction
- State management for UI
- User input handling
- Presentation logic

## 🔄 Data Flow

### Request Flow
```
User Action → UI Component → Use Case → Domain Service → Repository → Database
```

### Response Flow
```
Database → Repository → Domain Service → Use Case → UI Component → User
```

## 📦 Key Components

### Domain Entities

#### PricingItem
```typescript
interface PricingItem {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  unit: string;
  defaultPrice: number;
  pricingType: PricingType;
  billingCycle?: BillingCycle;
  isActive: boolean;
  tiers?: Tier[];
}
```

#### Category
```typescript
interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  orderIndex: number;
  displayOrder: number;
  isActive: boolean;
}
```

#### Scenario
```typescript
interface Scenario {
  id: string;
  userId?: string;
  config?: Record<string, any>;
  selectedItems: SelectedItem[];
  summary: ScenarioSummary;
  globalDiscount: number;
  globalDiscountType: DiscountType;
  globalDiscountApplication: DiscountApplication;
}
```

### Value Objects

#### Money
```typescript
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'USD'
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }
}
```

#### PricingType
```typescript
enum PricingType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
  PER_UNIT = 'per_unit',
  TIERED = 'tiered'
}
```

### Use Cases

#### CalculatePricingUseCase
```typescript
class CalculatePricingUseCase {
  constructor(
    private pricingRepository: PricingRepository,
    private discountService: DiscountService
  ) {}

  async execute(request: CalculatePricingRequest): Promise<CalculatePricingResponse> {
    // 1. Load pricing items
    const items = await this.pricingRepository.getByIds(request.itemIds);
    
    // 2. Apply discounts
    const discountedItems = await this.discountService.applyDiscounts(items, request.discounts);
    
    // 3. Calculate totals
    const totals = this.calculateTotals(discountedItems);
    
    // 4. Return result
    return {
      items: discountedItems,
      totals,
      savings: this.calculateSavings(items, discountedItems)
    };
  }
}
```

#### ManagePricingItemsUseCase
```typescript
class ManagePricingItemsUseCase {
  constructor(
    private pricingRepository: PricingRepository,
    private auditService: AuditService
  ) {}

  async createItem(request: CreatePricingItemRequest): Promise<PricingItem> {
    // 1. Validate business rules
    this.validatePricingItem(request);
    
    // 2. Create entity
    const item = new PricingItem(request);
    
    // 3. Persist
    const savedItem = await this.pricingRepository.save(item);
    
    // 4. Audit
    await this.auditService.logActivity('pricing_item_created', savedItem.id);
    
    return savedItem;
  }
}
```

## 🔧 Design Patterns

### Repository Pattern
```typescript
interface PricingRepository {
  findById(id: string): Promise<PricingItem | null>;
  findBySimulator(simulatorId: string): Promise<PricingItem[]>;
  save(item: PricingItem): Promise<PricingItem>;
  delete(id: string): Promise<void>;
}

class SupabasePricingRepository implements PricingRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<PricingItem | null> {
    const { data, error } = await this.supabase
      .from('pricing_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw new Error(`Failed to fetch pricing item: ${error.message}`);
    return data;
  }
}
```

### Factory Pattern
```typescript
class PricingItemFactory {
  static create(request: CreatePricingItemRequest): PricingItem {
    return new PricingItem({
      id: generateId(),
      name: request.name,
      description: request.description,
      categoryId: request.categoryId,
      unit: request.unit,
      defaultPrice: request.defaultPrice,
      pricingType: request.pricingType,
      billingCycle: request.billingCycle,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
```

### Strategy Pattern
```typescript
interface PricingStrategy {
  calculate(item: PricingItem, quantity: number): Money;
}

class OneTimePricingStrategy implements PricingStrategy {
  calculate(item: PricingItem, quantity: number): Money {
    return new Money(item.defaultPrice * quantity);
  }
}

class RecurringPricingStrategy implements PricingStrategy {
  calculate(item: PricingItem, quantity: number): Money {
    const basePrice = item.defaultPrice * quantity;
    const cycleMultiplier = this.getCycleMultiplier(item.billingCycle);
    return new Money(basePrice * cycleMultiplier);
  }
}
```

### Observer Pattern
```typescript
interface PricingEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

class PricingEventBus {
  private subscribers: Map<string, Function[]> = new Map();

  subscribe(eventType: string, callback: Function): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(callback);
  }

  publish(event: PricingEvent): void {
    const callbacks = this.subscribers.get(event.type) || [];
    callbacks.forEach(callback => callback(event));
  }
}
```

## 🗄️ Data Architecture

### Database Schema

#### Core Tables
```sql
-- Pricing Items
CREATE TABLE pricing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category UUID REFERENCES categories(id),
  unit VARCHAR(50) NOT NULL,
  default_price DECIMAL(10,2) NOT NULL CHECK (default_price >= 0),
  pricing_type VARCHAR(20) NOT NULL CHECK (pricing_type IN ('one_time', 'recurring', 'per_unit', 'tiered')),
  billing_cycle VARCHAR(20) CHECK (billing_cycle IN ('one_time', 'monthly', 'quarterly', 'yearly')),
  is_active BOOLEAN DEFAULT true,
  tiered_pricing JSONB,
  simulator_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  order_index INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scenarios
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  config JSONB,
  legacy_config JSONB,
  config_definitions JSONB,
  selected_items JSONB NOT NULL,
  categories JSONB,
  tags JSONB,
  summary JSONB NOT NULL,
  global_discount DECIMAL(5,2) DEFAULT 0 CHECK (global_discount >= 0 AND global_discount <= 100),
  global_discount_type VARCHAR(20) DEFAULT 'percentage' CHECK (global_discount_type IN ('percentage', 'fixed')),
  global_discount_application VARCHAR(20) DEFAULT 'none' CHECK (global_discount_application IN ('none', 'both', 'monthly', 'onetime', 'unit', 'total')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Security Policies
```sql
-- Row Level Security
ALTER TABLE pricing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Pricing Items Policies
CREATE POLICY "Users can view pricing items" ON pricing_items
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    (simulator_id IS NULL OR simulator_id IN (
      SELECT simulator_id FROM user_simulators 
      WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Admins can manage pricing items" ON pricing_items
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );
```

### Data Flow Patterns

#### CQRS (Command Query Responsibility Segregation)
```typescript
// Commands (Write Operations)
interface CreatePricingItemCommand {
  name: string;
  description?: string;
  categoryId: string;
  unit: string;
  defaultPrice: number;
  pricingType: PricingType;
}

// Queries (Read Operations)
interface GetPricingItemsQuery {
  simulatorId?: string;
  categoryId?: string;
  isActive?: boolean;
}

// Command Handler
class CreatePricingItemHandler {
  async handle(command: CreatePricingItemCommand): Promise<PricingItem> {
    // Business logic and persistence
  }
}

// Query Handler
class GetPricingItemsHandler {
  async handle(query: GetPricingItemsQuery): Promise<PricingItem[]> {
    // Data retrieval and formatting
  }
}
```

## 🔄 State Management

### Zustand Store Structure
```typescript
interface AppState {
  // Pricing state
  pricing: {
    items: PricingItem[];
    categories: Category[];
    selectedItems: SelectedItem[];
    summary: ScenarioSummary;
  };
  
  // UI state
  ui: {
    loading: boolean;
    error: string | null;
    activeTab: string;
  };
  
  // User state
  user: {
    profile: UserProfile | null;
    isAuthenticated: boolean;
  };
}
```

### State Slices
```typescript
// Pricing slice
export const usePricingStore = create<PricingState>((set, get) => ({
  items: [],
  categories: [],
  selectedItems: [],
  summary: initialSummary,
  
  // Actions
  addItem: (item: PricingItem) => set(state => ({
    selectedItems: [...state.selectedItems, { item, quantity: 1 }]
  })),
  
  removeItem: (itemId: string) => set(state => ({
    selectedItems: state.selectedItems.filter(si => si.item.id !== itemId)
  })),
  
  updateQuantity: (itemId: string, quantity: number) => set(state => ({
    selectedItems: state.selectedItems.map(si => 
      si.item.id === itemId ? { ...si, quantity } : si
    )
  }))
}));
```

## 🧪 Testing Architecture

### Test Structure
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── critical/         # Critical path tests
├── performance/      # Performance tests
└── e2e/             # End-to-end tests
```

### Test Doubles
```typescript
// Mock Repository
class MockPricingRepository implements PricingRepository {
  private items: PricingItem[] = [];

  async findById(id: string): Promise<PricingItem | null> {
    return this.items.find(item => item.id === id) || null;
  }

  async save(item: PricingItem): Promise<PricingItem> {
    this.items.push(item);
    return item;
  }
}

// Test Factory
class TestDataFactory {
  static createPricingItem(overrides: Partial<PricingItem> = {}): PricingItem {
    return {
      id: 'test-id',
      name: 'Test Item',
      defaultPrice: 100,
      pricingType: PricingType.ONE_TIME,
      isActive: true,
      ...overrides
    };
  }
}
```

## 🚀 Performance Architecture

### Code Splitting Strategy
```typescript
// Route-based splitting
const AdminDashboard = lazy(() => import('./features/admin/AdminDashboard'));
const PdfBuilder = lazy(() => import('./features/pdfBuilder/PdfBuilder'));
const Configuration = lazy(() => import('./features/configuration/Configuration'));

// Component-based splitting
const DataTable = lazy(() => import('./components/DataTable'));
const Chart = lazy(() => import('./components/Chart'));

// Feature-based splitting
const adminFeatures = lazy(() => import('./features/admin'));
const pdfFeatures = lazy(() => import('./features/pdfBuilder'));
```

### Caching Strategy
```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Cache keys
export const CACHE_KEYS = {
  PRICING_ITEMS: 'pricing-items',
  CATEGORIES: 'categories',
  SCENARIOS: 'scenarios',
  USER_PROFILE: 'user-profile',
} as const;
```

## 🔒 Security Architecture

### Security Layers
1. **Input Validation**: Zod schemas for all inputs
2. **Authentication**: Supabase Auth with JWT tokens
3. **Authorization**: Role-based access control
4. **Data Protection**: Row Level Security (RLS)
5. **API Security**: Rate limiting and CSRF protection
6. **XSS Protection**: DOMPurify sanitization

### Security Implementation
```typescript
// Input validation
const validatePricingItem = (data: unknown): PricingItem => {
  return pricingItemSchema.parse(data);
};

// Rate limiting
const rateLimiter = createRateLimiter(10, 1000); // 10 requests per second

// CSRF protection
const csrfToken = generateCsrfToken();
headers: {
  'X-CSRF-Token': csrfToken
}
```

## 📊 Monitoring Architecture

### Performance Monitoring
```typescript
// Performance metrics
interface PerformanceMetrics {
  renderTime: number;
  apiResponseTime: number;
  bundleSize: number;
  memoryUsage: number;
}

// Error tracking
interface ErrorEvent {
  type: string;
  message: string;
  stack: string;
  timestamp: Date;
  userId?: string;
}
```

### Audit Logging
```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
  timestamp: Date;
}
```

## 🎯 Best Practices

### 1. Dependency Inversion
- Core business logic independent of frameworks
- Use interfaces for external dependencies
- Inject dependencies through constructors

### 2. Single Responsibility
- Each class/function has one clear purpose
- Separate concerns into different modules
- Keep functions small and focused

### 3. Open/Closed Principle
- Open for extension, closed for modification
- Use interfaces and abstract classes
- Implement new features through composition

### 4. Interface Segregation
- Small, focused interfaces
- Avoid fat interfaces
- Use composition over inheritance

### 5. Dependency Injection
- Inject dependencies through constructors
- Use factory patterns for complex objects
- Mock dependencies in tests

---

**This architecture ensures maintainable, testable, and scalable code while following industry best practices and design patterns.**
