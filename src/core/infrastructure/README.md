# Infrastructure Layer

## 🎯 Overview

The Infrastructure Layer implements the external dependencies of our Clean Architecture. It provides concrete implementations of domain interfaces, connecting our business logic to external services like Supabase, APIs, and file storage.

## 🏗️ Infrastructure Layer Structure

```
src/core/infrastructure/
├── database/                    # Database implementations
│   ├── repositories/           # Repository implementations
│   │   ├── SupabasePricingRepository.ts
│   │   ├── RepositoryFactory.ts
│   │   └── __tests__/          # Repository tests
│   ├── mappers/                # Database ↔ Domain mappers
│   │   └── PricingItemDbMapper.ts
│   ├── types/                  # Database type definitions
│   │   └── database.types.ts
│   ├── supabase/               # Supabase configuration
│   │   └── client.ts
│   ├── scripts/                # Database utilities
│   │   └── verifySchema.ts
│   └── errors/                 # Infrastructure errors
│       └── InfrastructureError.ts
├── api/                        # External API clients
└── storage/                    # File storage implementations
```

## 📋 Key Components

### **1. Repository Implementations**

#### **SupabasePricingRepository**
Implements the `IPricingRepository` interface using Supabase as the data source.

**Key Features:**
- ✅ Implements ALL methods from domain interface
- ✅ Proper error handling for database operations
- ✅ Type-safe database queries
- ✅ Domain entity conversion
- ✅ No business logic (pure data access)

**Methods Implemented:**
```typescript
interface IPricingRepository {
  findById(id: string): Promise<PricingItem | null>;
  findByIds(ids: string[]): Promise<PricingItem[]>;
  findAll(): Promise<PricingItem[]>;
  findByCategory(categoryId: string): Promise<PricingItem[]>;
  findByName(name: string): Promise<PricingItem[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<PricingItem[]>;
  save(item: PricingItem): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  count(): Promise<number>;
  countByCategory(categoryId: string): Promise<number>;
}
```

### **2. Database Mappers**

#### **PricingItemDbMapper**
Converts between database rows and domain entities.

**Key Features:**
- ✅ Bidirectional conversion (Domain ↔ Database)
- ✅ Validation of database row structure
- ✅ Proper handling of nested relationships
- ✅ Type-safe conversions

**Conversion Examples:**
```typescript
// Database Row (flat)
const dbRow = {
  id: 'item-1',
  name: 'Software A',
  base_price: 100,
  currency: 'USD',
  category_id: 'cat-1',
  categories: {
    id: 'cat-1',
    name: 'Software',
    order: 1
  }
};

// Domain Entity (rich)
const domainEntity = new PricingItem(
  'item-1',
  'Software A',
  'Description',
  new Money(100, 'USD'),
  new Category('cat-1', 'Software', 'Description', 1),
  1
);
```

### **3. Supabase Client Configuration**

#### **Client Setup**
Centralized Supabase client with proper typing and configuration.

**Features:**
- ✅ Environment variable validation
- ✅ Proper TypeScript typing
- ✅ Connection health checks
- ✅ Error handling

### **4. Error Handling**

#### **Infrastructure Error Hierarchy**
```typescript
InfrastructureError (base)
├── DatabaseConnectionError
├── DatabaseQueryError
├── DatabaseNotFoundError
└── DatabaseValidationError
```

**Error Handling Pattern:**
```typescript
try {
  const { data, error } = await this.supabase
    .from('pricing_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new DatabaseQueryError(`findById(${id})`, error);
  }

  return data ? this.toDomain(data) : null;
} catch (error) {
  if (error instanceof InfrastructureError) throw error;
  throw new InfrastructureError(`Failed to find item: ${error.message}`);
}
```

## 🧪 Testing Strategy

### **Unit Tests (Mocked Supabase)**
- Test repository logic with mocked Supabase client
- Verify error handling
- Test conversion logic
- Mock all database operations

### **Integration Tests (Real Database)**
- Test against actual Supabase database
- Use test database with seeded data
- Test real database operations
- Clean up test data after tests

### **Test Structure:**
```typescript
describe('SupabasePricingRepository', () => {
  // Unit tests with mocked Supabase
  describe('Unit Tests', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Connection failed' }
      });
      
      await expect(repository.findById('test'))
        .rejects.toThrow(InfrastructureError);
    });
  });

  // Integration tests with real database
  describe('Integration Tests', () => {
    it('should create and retrieve item', async () => {
      const item = new PricingItem(/*...*/);
      await repository.save(item);
      
      const retrieved = await repository.findById(item.id);
      expect(retrieved).toEqual(item);
    });
  });
});
```

## 🔧 Database Schema

### **Required Tables:**

#### **Categories Table:**
```sql
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Pricing Items Table:**
```sql
CREATE TABLE pricing_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  category_id TEXT REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Schema Verification:**
Use the `verifySchema.ts` script to ensure database schema is correct:
```typescript
import { verifyDatabaseSchema } from './scripts/verifySchema';

const result = await verifyDatabaseSchema();
if (!result.success) {
  console.error('Database schema issues:', result.errors);
}
```

## 🚀 Usage Examples

### **Repository Factory Pattern:**
```typescript
import { getPricingRepository } from '@/core/infrastructure/database/repositories/RepositoryFactory';

// Get repository instance
const repository = getPricingRepository();

// Use in use cases
const useCase = new CalculatePricingUseCase(repository);
```

### **Direct Repository Usage:**
```typescript
import { SupabasePricingRepository } from '@/core/infrastructure/database/repositories/SupabasePricingRepository';
import { supabase } from '@/core/infrastructure/database/supabase/client';

const repository = new SupabasePricingRepository(supabase);

// Find item
const item = await repository.findById('item-1');

// Save item
const newItem = new PricingItem(/*...*/);
await repository.save(newItem);
```

### **Error Handling:**
```typescript
try {
  const item = await repository.findById('item-1');
  // Handle success
} catch (error) {
  if (error instanceof DatabaseNotFoundError) {
    // Handle not found
  } else if (error instanceof DatabaseConnectionError) {
    // Handle connection issues
  } else {
    // Handle other errors
  }
}
```

## 📊 Performance Considerations

### **Query Optimization:**
- Use proper indexes on frequently queried columns
- Limit result sets with `.limit()`
- Use `.select()` to fetch only needed columns
- Implement pagination for large datasets

### **Connection Management:**
- Supabase client handles connection pooling
- Use singleton pattern for repository instances
- Monitor connection health with health checks

### **Caching Strategy:**
- Consider caching frequently accessed data
- Implement cache invalidation on updates
- Use Redis or similar for production caching

## 🔒 Security Considerations

### **Database Security:**
- Use Row Level Security (RLS) in Supabase
- Implement proper authentication
- Validate all inputs before database operations
- Use parameterized queries (Supabase handles this)

### **Environment Variables:**
- Never commit database credentials
- Use environment variables for configuration
- Validate required environment variables at startup

## 🚀 Deployment Considerations

### **Environment Setup:**
```bash
# Required environment variables
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Database Migrations:**
- Use Supabase migrations for schema changes
- Test migrations on staging environment
- Backup database before major changes

### **Health Monitoring:**
```typescript
import { healthCheck } from '@/core/infrastructure/database/repositories/RepositoryFactory';

const health = await healthCheck();
console.log('Repository health:', health);
```

## 🔄 Migration from Legacy API

### **Feature Flag Strategy:**
```typescript
// config/features.ts
export const FEATURES = {
  USE_NEW_REPOSITORY: import.meta.env.VITE_USE_NEW_REPOSITORY === 'true',
};

// In use case instantiation
const repository = FEATURES.USE_NEW_REPOSITORY
  ? getPricingRepository()
  : legacyApiWrapper;
```

### **Migration Steps:**
1. ✅ Implement new repository
2. ✅ Add feature flag
3. ✅ Test with new repository
4. ✅ Gradually roll out to users
5. ✅ Remove old API code
6. ✅ Remove feature flag

## 📈 Monitoring and Debugging

### **Database Query Logging:**
```typescript
// Enable query logging in development
if (import.meta.env.DEV) {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
  });
}
```

### **Error Tracking:**
- Log all infrastructure errors
- Monitor database connection health
- Track query performance
- Alert on critical failures

This infrastructure layer provides a robust, type-safe, and well-tested foundation for data access while maintaining Clean Architecture principles.
