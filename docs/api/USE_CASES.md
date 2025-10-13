# Use Cases Documentation

## Overview

Use cases represent the application layer of Clean Architecture. They orchestrate domain logic and coordinate between different layers.

## Core Use Cases

### CalculatePricingUseCase

**Purpose**: Calculate total pricing for a scenario

**Input**:
```typescript
interface CalculatePricingRequest {
  scenarioId: string;
  items: PricingItemInput[];
}
```

**Output**:
```typescript
interface CalculatePricingResponse {
  total: Money;
  breakdown: PricingBreakdown[];
  summary: PricingSummary;
}
```

**Implementation**:
```typescript
class CalculatePricingUseCase {
  async execute(request: CalculatePricingRequest): Promise<CalculatePricingResponse> {
    // 1. Validate input
    // 2. Load scenario
    // 3. Apply pricing rules
    // 4. Calculate totals
    // 5. Return results
  }
}
```

### CreatePricingScenarioUseCase

**Purpose**: Create a new pricing scenario

**Input**:
```typescript
interface CreatePricingScenarioRequest {
  name: string;
  description?: string;
  items: PricingItemInput[];
}
```

**Output**:
```typescript
interface CreatePricingScenarioResponse {
  scenarioId: string;
  scenario: PricingScenario;
}
```

### UpdatePricingItemUseCase

**Purpose**: Update an existing pricing item

**Input**:
```typescript
interface UpdatePricingItemRequest {
  scenarioId: string;
  itemId: string;
  updates: Partial<PricingItemInput>;
}
```

**Output**:
```typescript
interface UpdatePricingItemResponse {
  item: PricingItem;
  updatedScenario: PricingScenario;
}
```

### DeletePricingItemUseCase

**Purpose**: Remove a pricing item from a scenario

**Input**:
```typescript
interface DeletePricingItemRequest {
  scenarioId: string;
  itemId: string;
}
```

**Output**:
```typescript
interface DeletePricingItemResponse {
  success: boolean;
  updatedScenario: PricingScenario;
}
```

## User Management Use Cases

### AuthenticateUserUseCase

**Purpose**: Authenticate user login

**Input**:
```typescript
interface AuthenticateUserRequest {
  email: string;
  password: string;
}
```

**Output**:
```typescript
interface AuthenticateUserResponse {
  user: User;
  token: string;
}
```

### CreateUserUseCase

**Purpose**: Register new user

**Input**:
```typescript
interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}
```

**Output**:
```typescript
interface CreateUserResponse {
  user: User;
  token: string;
}
```

## Admin Use Cases

### ManageUsersUseCase

**Purpose**: Admin user management

**Input**:
```typescript
interface ManageUsersRequest {
  action: 'create' | 'update' | 'delete';
  userId?: string;
  userData?: UserInput;
}
```

### SystemConfigurationUseCase

**Purpose**: Manage system configuration

**Input**:
```typescript
interface SystemConfigurationRequest {
  featureFlags: FeatureFlags;
  systemSettings: SystemSettings;
}
```

## Error Handling

All use cases follow consistent error handling:

```typescript
class UseCaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
  }
}

// Specific error types
class ValidationError extends UseCaseError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

class NotFoundError extends UseCaseError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND');
  }
}
```

## Use Case Dependencies

Use cases depend on:

- **Repositories**: For data access
- **Domain Services**: For business logic
- **External Services**: For integrations
- **Event Publishers**: For domain events

## Testing Use Cases

```typescript
describe('CalculatePricingUseCase', () => {
  let useCase: CalculatePricingUseCase;
  let mockRepository: MockPricingRepository;
  let mockCalculationService: MockPricingCalculationService;

  beforeEach(() => {
    mockRepository = new MockPricingRepository();
    mockCalculationService = new MockPricingCalculationService();
    useCase = new CalculatePricingUseCase(mockRepository, mockCalculationService);
  });

  it('should calculate pricing correctly', async () => {
    // Arrange
    const request = { scenarioId: '1', items: [] };
    mockRepository.findById.mockResolvedValue(mockScenario);

    // Act
    const result = await useCase.execute(request);

    // Assert
    expect(result.total.amount).toBe(100);
  });
});
```
