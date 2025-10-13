# Repository Interfaces Documentation

## Overview

Repository interfaces define the contracts for data access in the Clean Architecture. They abstract the data layer from the domain and application layers.

## Core Repository Interfaces

### PricingRepository

**Purpose**: Manages pricing scenarios and items

**Interface**:
```typescript
interface PricingRepository {
  save(scenario: PricingScenario): Promise<void>;
  findById(id: PricingScenarioId): Promise<PricingScenario | null>;
  findAll(): Promise<PricingScenario[]>;
  findByUserId(userId: UserId): Promise<PricingScenario[]>;
  delete(id: PricingScenarioId): Promise<void>;
  update(scenario: PricingScenario): Promise<void>;
}
```

**Methods**:

#### save(scenario: PricingScenario): Promise<void>
- **Purpose**: Persist a new pricing scenario
- **Parameters**: Complete pricing scenario object
- **Returns**: Promise that resolves when saved
- **Throws**: RepositoryError if save fails

#### findById(id: PricingScenarioId): Promise<PricingScenario | null>
- **Purpose**: Retrieve scenario by ID
- **Parameters**: Unique scenario identifier
- **Returns**: Scenario object or null if not found
- **Throws**: RepositoryError if query fails

#### findAll(): Promise<PricingScenario[]>
- **Purpose**: Retrieve all pricing scenarios
- **Returns**: Array of all scenarios
- **Throws**: RepositoryError if query fails

#### findByUserId(userId: UserId): Promise<PricingScenario[]>
- **Purpose**: Retrieve scenarios for specific user
- **Parameters**: User identifier
- **Returns**: Array of user's scenarios
- **Throws**: RepositoryError if query fails

### UserRepository

**Purpose**: Manages user accounts and authentication

**Interface**:
```typescript
interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
  findAll(): Promise<User[]>;
}
```

**Methods**:

#### save(user: User): Promise<void>
- **Purpose**: Create new user account
- **Parameters**: Complete user object
- **Returns**: Promise that resolves when saved
- **Throws**: RepositoryError if save fails

#### findByEmail(email: string): Promise<User | null>
- **Purpose**: Find user by email address
- **Parameters**: Email address string
- **Returns**: User object or null if not found
- **Throws**: RepositoryError if query fails

### PricingItemRepository

**Purpose**: Manages individual pricing items

**Interface**:
```typescript
interface PricingItemRepository {
  save(item: PricingItem): Promise<void>;
  findById(id: PricingItemId): Promise<PricingItem | null>;
  findByScenarioId(scenarioId: PricingScenarioId): Promise<PricingItem[]>;
  update(item: PricingItem): Promise<void>;
  delete(id: PricingItemId): Promise<void>;
}
```

## Specialized Repository Interfaces

### AuditRepository

**Purpose**: Tracks changes and audit trails

**Interface**:
```typescript
interface AuditRepository {
  logEvent(event: DomainEvent): Promise<void>;
  getEvents(entityId: string, entityType: string): Promise<DomainEvent[]>;
  getEventsByUser(userId: UserId): Promise<DomainEvent[]>;
  getEventsByDateRange(start: Date, end: Date): Promise<DomainEvent[]>;
}
```

### ConfigurationRepository

**Purpose**: Manages system configuration

**Interface**:
```typescript
interface ConfigurationRepository {
  getFeatureFlags(): Promise<FeatureFlags>;
  updateFeatureFlags(flags: FeatureFlags): Promise<void>;
  getSystemSettings(): Promise<SystemSettings>;
  updateSystemSettings(settings: SystemSettings): Promise<void>;
}
```

## Repository Error Handling

### RepositoryError

**Base error class for repository operations**:

```typescript
abstract class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly entityType: string,
    public readonly originalError?: Error
  ) {
    super(message);
  }
}
```

### Specific Error Types

```typescript
class ConnectionError extends RepositoryError {
  constructor(originalError: Error) {
    super(
      'Database connection failed',
      'CONNECT',
      'DATABASE',
      originalError
    );
  }
}

class NotFoundError extends RepositoryError {
  constructor(entityType: string, id: string) {
    super(
      `${entityType} with id ${id} not found`,
      'FIND',
      entityType
    );
  }
}

class ValidationError extends RepositoryError {
  constructor(message: string, entityType: string) {
    super(
      `Validation failed: ${message}`,
      'VALIDATE',
      entityType
    );
  }
}
```

## Repository Implementation Guidelines

### Database Implementation

```typescript
class SupabasePricingRepository implements PricingRepository {
  constructor(private client: SupabaseClient) {}
  
  async save(scenario: PricingScenario): Promise<void> {
    try {
      const { error } = await this.client
        .from('pricing_scenarios')
        .insert(this.toDatabaseFormat(scenario));
        
      if (error) {
        throw new ConnectionError(error);
      }
    } catch (error) {
      throw new RepositoryError(
        'Failed to save pricing scenario',
        'SAVE',
        'PricingScenario',
        error
      );
    }
  }
  
  private toDatabaseFormat(scenario: PricingScenario): any {
    return {
      id: scenario.id.value,
      name: scenario.name,
      description: scenario.description,
      created_by: scenario.createdBy.value,
      created_at: scenario.createdAt.toISOString(),
      updated_at: scenario.updatedAt.toISOString()
    };
  }
}
```

### In-Memory Implementation (Testing)

```typescript
class InMemoryPricingRepository implements PricingRepository {
  private scenarios: Map<string, PricingScenario> = new Map();
  
  async save(scenario: PricingScenario): Promise<void> {
    this.scenarios.set(scenario.id.value, scenario);
  }
  
  async findById(id: PricingScenarioId): Promise<PricingScenario | null> {
    return this.scenarios.get(id.value) || null;
  }
  
  async findAll(): Promise<PricingScenario[]> {
    return Array.from(this.scenarios.values());
  }
}
```

## Repository Testing

### Unit Testing

```typescript
describe('PricingRepository', () => {
  let repository: PricingRepository;
  let mockClient: MockSupabaseClient;
  
  beforeEach(() => {
    mockClient = new MockSupabaseClient();
    repository = new SupabasePricingRepository(mockClient);
  });
  
  it('should save pricing scenario', async () => {
    // Arrange
    const scenario = createMockScenario();
    mockClient.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null })
    });
    
    // Act
    await repository.save(scenario);
    
    // Assert
    expect(mockClient.from).toHaveBeenCalledWith('pricing_scenarios');
  });
  
  it('should handle save errors', async () => {
    // Arrange
    const scenario = createMockScenario();
    const error = new Error('Database error');
    mockClient.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error })
    });
    
    // Act & Assert
    await expect(repository.save(scenario)).rejects.toThrow(RepositoryError);
  });
});
```

### Integration Testing

```typescript
describe('PricingRepository Integration', () => {
  let repository: PricingRepository;
  let testDb: TestDatabase;
  
  beforeAll(async () => {
    testDb = await TestDatabase.create();
    repository = new SupabasePricingRepository(testDb.client);
  });
  
  afterAll(async () => {
    await testDb.cleanup();
  });
  
  it('should persist and retrieve pricing scenario', async () => {
    // Arrange
    const scenario = createTestScenario();
    
    // Act
    await repository.save(scenario);
    const retrieved = await repository.findById(scenario.id);
    
    // Assert
    expect(retrieved).toEqual(scenario);
  });
});
```

## Repository Patterns

### Unit of Work Pattern

```typescript
interface UnitOfWork {
  pricingRepository: PricingRepository;
  userRepository: UserRepository;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
```

### Repository Factory

```typescript
class RepositoryFactory {
  static createPricingRepository(): PricingRepository {
    if (process.env.NODE_ENV === 'test') {
      return new InMemoryPricingRepository();
    }
    return new SupabasePricingRepository(createSupabaseClient());
  }
}
```

## Performance Considerations

### Caching Strategy

```typescript
class CachedPricingRepository implements PricingRepository {
  constructor(
    private baseRepository: PricingRepository,
    private cache: Cache
  ) {}
  
  async findById(id: PricingScenarioId): Promise<PricingScenario | null> {
    const cacheKey = `scenario:${id.value}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const scenario = await this.baseRepository.findById(id);
    if (scenario) {
      await this.cache.set(cacheKey, scenario, 300); // 5 minutes
    }
    
    return scenario;
  }
}
```

### Batch Operations

```typescript
interface BatchPricingRepository extends PricingRepository {
  saveBatch(scenarios: PricingScenario[]): Promise<void>;
  findByIds(ids: PricingScenarioId[]): Promise<PricingScenario[]>;
}
```
