# Application Layer - Pricing

## 🎯 Overview

The Application Layer orchestrates domain logic through use cases, handling workflows and data transformation between the domain and presentation layers. This layer follows Clean Architecture principles and maintains proper boundaries.

## 🏗️ Application Layer Structure

```
src/core/application/pricing/
├── use-cases/                    # Business workflows
│   ├── CalculatePricingUseCase.ts
│   ├── GetPricingItemsUseCase.ts
│   └── GetPricingItemByIdUseCase.ts
├── dtos/                        # Data Transfer Objects
│   └── PricingDTOs.ts
├── mappers/                     # Entity ↔ DTO conversion
│   └── PricingMapper.ts
├── errors/                      # Application error hierarchy
│   └── ApplicationError.ts
├── __tests__/                   # Use case tests
│   ├── CalculatePricingUseCase.test.ts
│   ├── GetPricingItemsUseCase.test.ts
│   └── GetPricingItemByIdUseCase.test.ts
└── README.md                    # This file
```

## 📋 Use Cases

### **CalculatePricingUseCase** (Priority 1)

**Purpose:** Orchestrates pricing calculation workflow with discounts and tax.

**Input:**
```typescript
interface CalculatePricingInputDTO {
  itemIds: string[];
  quantities: Record<string, number>;
  discountCode?: string;
  taxRate?: number;
}
```

**Output:**
```typescript
interface CalculatePricingOutputDTO {
  items: Array<{
    id: string;
    name: string;
    basePrice: number;
    quantity: number;
    total: number;
    currency: string;
  }>;
  subtotal: number;
  discount: number;
  discountRate: number;
  tax: number;
  taxRate: number;
  total: number;
  currency: string;
  calculatedAt: string;
}
```

**Business Logic Flow:**
1. Validate input (itemIds, quantities, taxRate)
2. Fetch pricing items from repository
3. Validate all items exist
4. Create PricingItem entities with quantities
5. Use PricingCalculator domain service
6. Map result to output DTO

**Error Handling:**
- `ValidationError` - Invalid input parameters
- `NotFoundError` - Items not found
- `ApplicationError` - Unexpected errors

### **GetPricingItemsUseCase** (Priority 2)

**Purpose:** Retrieves all available pricing items with optional filtering.

**Input:**
```typescript
interface GetPricingItemsInputDTO {
  categoryId?: string;
  searchTerm?: string;
}
```

**Output:**
```typescript
interface GetPricingItemsOutputDTO {
  items: PricingItemDTO[];
  total: number;
}
```

**Business Logic Flow:**
1. Validate input filters
2. Fetch items from repository (all or by category)
3. Sort by category order, then by name
4. Map to DTOs
5. Return result with total count

### **GetPricingItemByIdUseCase** (Priority 3)

**Purpose:** Retrieves a single pricing item by ID.

**Input:**
```typescript
interface GetPricingItemByIdInputDTO {
  itemId: string;
}
```

**Output:**
```typescript
interface GetPricingItemByIdOutputDTO {
  item: PricingItemDTO | null;
}
```

**Business Logic Flow:**
1. Validate itemId
2. Fetch item from repository
3. Map to DTO (or return null if not found)
4. Return result

## 💰 Data Transfer Objects (DTOs)

### **PricingItemDTO**
```typescript
interface PricingItemDTO {
  id: string;
  name: string;
  description: string;
  basePrice: number;        // Flattened from Money value object
  currency: string;         // Flattened from Money value object
  category: CategoryDTO;    // Flattened from Category entity
  quantity?: number;
}
```

### **CategoryDTO**
```typescript
interface CategoryDTO {
  id: string;
  name: string;
  description?: string;
  order: number;
}
```

**Key Design Decisions:**
- DTOs are **flat** (no nested value objects)
- Entities are **rich** (with value objects)
- Mappers handle the transformation
- DTOs are serializable for API responses

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Use Cases (Orchestration)                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │CalculatePricing  │  │GetPricingItems │  │GetItemById  │ │
│  │- Validate input │  │- Filter items  │  │- Find item  │ │
│  │- Fetch entities │  │- Sort results  │  │- Map to DTO │ │
│  │- Use domain svc │  │- Map to DTOs   │  │- Return DTO │ │
│  │- Map to output  │  │- Return array  │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Mappers (Data Transformation)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │PricingMapper                                       │   │
│  │- Entity → DTO (toDTO)                             │   │
│  │- DTO → Entity (toDomain)                          │   │
│  │- Array conversions (toDTOArray, toDomainArray)   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  DTOs (Data Transfer)                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │PricingItemDTO   │  │CategoryDTO      │  │Input/Output │ │
│  │- Flat structure │  │- Flat structure │  │DTOs         │ │
│  │- Serializable   │  │- Serializable   │  │- Validation │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🚨 Error Handling

### **Error Hierarchy**
```
ApplicationError (base)
├── ValidationError (input validation)
├── NotFoundError (entity not found)
├── BusinessRuleError (business rule violation)
└── InfrastructureError (external service failures)
```

### **Error Handling Pattern**
```typescript
async execute(input: InputDTO): Promise<OutputDTO> {
  try {
    this.validateInput(input);           // Throws ValidationError
    const entities = await this.repository.find(); // May throw NotFoundError
    const result = this.calculate(entities);      // May throw BusinessRuleError
    return this.mapToDTO(result);
  } catch (error) {
    if (error instanceof ApplicationError) throw error;
    throw new ApplicationError(`Unexpected error: ${error.message}`);
  }
}
```

## 🧪 Testing Strategy

### **Test Structure for Each Use Case**
```typescript
describe('UseCaseName', () => {
  let useCase: UseCaseName;
  let mockRepository: jest.Mocked<IPricingRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    useCase = new UseCaseName(mockRepository);
  });

  describe('Happy Path', () => {
    it('should execute successfully', async () => {
      // Test main success scenario
    });
  });

  describe('Input Validation', () => {
    it('should throw ValidationError for invalid input', async () => {
      // Test validation errors
    });
  });

  describe('Business Logic', () => {
    it('should handle business rule violations', async () => {
      // Test business logic errors
    });
  });

  describe('DTO Mapping', () => {
    it('should return correctly formatted DTO', async () => {
      // Test DTO structure
    });
  });
});
```

### **Mock Repository Pattern**
```typescript
const mockRepository: jest.Mocked<IPricingRepository> = {
  findByIds: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByCategory: jest.fn(),
  // ... other methods
};

// In tests, mock return values
mockRepository.findByIds.mockResolvedValue([item1, item2]);
```

## 📊 Usage Examples

### **Calculate Pricing**
```typescript
const useCase = new CalculatePricingUseCase(repository);

const input: CalculatePricingInputDTO = {
  itemIds: ['item-1', 'item-2'],
  quantities: { 'item-1': 2, 'item-2': 3 },
  discountCode: 'SAVE10',
  taxRate: 8.5,
};

const result = await useCase.execute(input);
console.log(`Total: ${result.total} ${result.currency}`);
```

### **Get All Items**
```typescript
const useCase = new GetPricingItemsUseCase(repository);

const result = await useCase.execute();
console.log(`Found ${result.total} items`);
```

### **Get Item by ID**
```typescript
const useCase = new GetPricingItemByIdUseCase(repository);

const result = await useCase.execute({ itemId: 'item-1' });
if (result.item) {
  console.log(`Item: ${result.item.name}`);
}
```

## 🎯 Best Practices

### **Do's ✅**
- Validate input before business logic
- Use domain services for calculations
- Map entities to DTOs for output
- Handle errors gracefully
- Test all use cases thoroughly
- Keep use cases focused and single-purpose

### **Don'ts ❌**
- Don't put business logic in use cases
- Don't access infrastructure directly
- Don't skip input validation
- Don't return domain entities to presentation layer
- Don't catch and swallow errors
- Don't use `any` types

## 🔄 Integration with Other Layers

### **Domain Layer**
- Use cases orchestrate domain entities
- Use domain services for business logic
- Respect domain boundaries

### **Infrastructure Layer**
- Use repository interfaces (not implementations)
- Handle infrastructure errors gracefully
- Don't depend on concrete implementations

### **Presentation Layer**
- Return DTOs (not domain entities)
- Handle application errors
- Provide clear error messages

## 📈 Performance Considerations

### **Repository Calls**
- Minimize database round trips
- Use batch operations when possible
- Consider caching for frequently accessed data

### **DTO Mapping**
- Map only necessary fields
- Use efficient mapping strategies
- Consider lazy loading for large datasets

## 🚀 Future Enhancements

### **Planned Features**
- SavePricingScenarioUseCase
- UpdatePricingItemUseCase
- DeletePricingItemUseCase
- Bulk operations for multiple items

### **Potential Optimizations**
- Caching for frequently accessed items
- Batch processing for large datasets
- Async processing for complex calculations

This application layer provides a clean, testable, and maintainable foundation for pricing operations while maintaining Clean Architecture principles.
