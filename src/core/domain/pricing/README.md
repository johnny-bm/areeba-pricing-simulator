# Pricing Domain

## 🎯 Overview

The Pricing Domain contains the core business logic for pricing calculations, item management, and financial operations. This domain follows Clean Architecture principles and Domain-Driven Design (DDD) patterns.

## 🏗️ Domain Structure

```
src/core/domain/pricing/
├── entities/                    # Business entities
│   ├── PricingItem.ts          # Pricing item entity
│   ├── Category.ts             # Category entity
│   └── __tests__/              # Entity tests
├── value-objects/              # Immutable value objects
│   ├── Money.ts                # Monetary values
│   ├── Percentage.ts           # Percentage calculations
│   ├── DateRange.ts            # Date range operations
│   └── __tests__/              # Value object tests
├── services/                   # Domain services
│   ├── PricingCalculator.ts    # Pricing calculations
│   └── __tests__/              # Service tests
├── repositories/                # Repository interfaces
│   └── IPricingRepository.ts   # Data access contracts
├── types.ts                     # Domain type definitions
└── README.md                    # This file
```

## 📋 Entities

### **PricingItem Entity**

Represents a pricing item with business rules and calculations.

**Properties:**
- `id: string` - Unique identifier (readonly)
- `name: string` - Item name (readonly)
- `description: string` - Item description (readonly)
- `basePrice: Money` - Base price per unit (readonly)
- `category: Category` - Item category (readonly)
- `quantity: number` - Item quantity (readonly)

**Business Rules:**
- ID cannot be empty or exceed 50 characters
- Name must be 1-100 characters
- Quantity must be 1-10,000 (integer)
- Base price must be positive

**Key Methods:**
```typescript
// Calculations
getTotalPrice(): Money                    // basePrice × quantity
getUnitPrice(): Money                     // basePrice per unit
applyDiscount(discount: Percentage): Money // Apply discount to total

// Updates (return new instances)
updateQuantity(quantity: number): PricingItem

// Queries
isFree(): boolean                        // Check if base price is zero
hasDescription(): boolean                // Check if description exists
belongsToCategory(categoryId: string): boolean

// Display
getDisplayName(): string                 // Name with quantity
getFormattedTotalPrice(): string         // Formatted currency string
```

### **Category Entity**

Represents a pricing category with ordering and display rules.

**Properties:**
- `id: string` - Unique identifier (readonly)
- `name: string` - Category name (readonly)
- `description: string` - Category description (readonly)
- `order: number` - Display order (readonly)

**Business Rules:**
- ID cannot be empty or exceed 50 characters
- Name must be 1-100 characters
- Order must be non-negative integer

**Key Methods:**
```typescript
// Updates (return new instances)
updateName(name: string): Category
updateDescription(description: string): Category
updateOrder(order: number): Category

// Queries
hasDescription(): boolean
getDisplayName(): string                 // Name with order prefix
comesBefore(other: Category): boolean
comesAfter(other: Category): boolean
```

## 💰 Value Objects

### **Money Value Object**

Represents monetary values with currency support and arithmetic operations.

**Properties:**
- `amount: number` - Monetary amount (readonly)
- `currency: string` - ISO currency code (readonly)

**Business Rules:**
- Amount cannot be negative
- Currency must be valid ISO 4217 code
- Amount is rounded to 2 decimal places

**Key Methods:**
```typescript
// Arithmetic
add(other: Money): Money
subtract(other: Money): Money
multiply(factor: number): Money
divide(factor: number): Money

// Comparisons
isGreaterThan(other: Money): boolean
isLessThan(other: Money): boolean
equals(other: Money): boolean
isZero(): boolean

// Formatting
format(): string                         // "$1,234.56"
toCents(): number                        // Convert to cents

// Factory methods
static zero(currency: string): Money
static fromCents(cents: number, currency: string): Money
```

### **Percentage Value Object**

Represents percentage values (0-100) with money operations.

**Properties:**
- `value: number` - Percentage value (readonly)

**Business Rules:**
- Must be between 0 and 100
- Represents percentage (e.g., 15 = 15%)

**Key Methods:**
```typescript
// Money operations
applyTo(amount: Money): Money            // Apply percentage to amount
calculateDiscount(amount: Money): Money  // Calculate discount amount
calculateRemaining(amount: Money): Money // Calculate remaining after discount

// Conversions
toDecimal(): number                      // 15% → 0.15
format(): string                         // "15%"

// Arithmetic
add(other: Percentage): Percentage
subtract(other: Percentage): Percentage

// Factory methods
static fromDecimal(decimal: number): Percentage
static fromFraction(numerator: number, denominator: number): Percentage
```

### **DateRange Value Object**

Represents date ranges with validation and operations.

**Properties:**
- `startDate: Date` - Start date (readonly)
- `endDate: Date | null` - End date, null for open-ended (readonly)

**Business Rules:**
- Start date cannot be in the past
- End date must be after start date (if provided)

**Key Methods:**
```typescript
// Queries
contains(date: Date): boolean           // Check if date is in range
isActive(): boolean                      // Check if range is currently active
hasEnded(): boolean                      // Check if range has ended
hasStarted(): boolean                    // Check if range has started

// Calculations
getDurationDays(): number               // Duration in days
getDurationMonths(): number             // Duration in months

// Operations
overlaps(other: DateRange): boolean     // Check overlap
getIntersection(other: DateRange): DateRange | null

// Formatting
format(): string                         // "From 1/1/2024 to 12/31/2024"
formatISO(): string                      // "2024-01-01/2024-12-31"
```

## 🧮 Domain Services

### **PricingCalculator Service**

Contains pure business logic for pricing calculations with no external dependencies.

**Key Methods:**
```typescript
// Basic calculations
static calculateTotal(items: PricingItem[]): Money
static calculateSubtotal(items: PricingItem[]): Money
static calculateAveragePrice(items: PricingItem[]): Money

// Discount operations
static applyDiscount(total: Money, discount: Percentage): Money
static calculateDiscountAmount(total: Money, discount: Percentage): Money
static calculateBulkSavings(items: PricingItem[], discount: Percentage): Money

// Tax calculations
static calculateTax(subtotal: Money, taxRate: Percentage): Money
static calculateTotalWithTax(subtotal: Money, taxRate: Percentage): Money

// Comprehensive pricing
static calculatePricing(
  items: PricingItem[],
  discount?: Percentage,
  taxRate?: Percentage
): PricingCalculationResult

// Advanced calculations
static calculateBreakEvenPoint(fixedCosts: Money, variableCost: Money, sellingPrice: Money): number
static calculateProfitMargin(sellingPrice: Money, cost: Money): Percentage
```

## 🔌 Repository Interfaces

### **IPricingRepository Interface**

Defines contracts for data access without implementation details.

```typescript
interface IPricingRepository {
  findById(id: string): Promise<PricingItem | null>
  findByIds(ids: string[]): Promise<PricingItem[]>
  findAll(): Promise<PricingItem[]>
  findByCategory(categoryId: string): Promise<PricingItem[]>
  findByName(name: string): Promise<PricingItem[]>
  findByPriceRange(minPrice: number, maxPrice: number, currency: string): Promise<PricingItem[]>
  save(item: PricingItem): Promise<void>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
  count(): Promise<number>
  countByCategory(categoryId: string): Promise<number>
}
```

## 📏 Business Rules

### **Validation Rules**

1. **PricingItem:**
   - ID: Required, 1-50 characters
   - Name: Required, 1-100 characters
   - Quantity: 1-10,000 (integer)
   - Base price: Must be positive

2. **Category:**
   - ID: Required, 1-50 characters
   - Name: Required, 1-100 characters
   - Order: Non-negative integer

3. **Money:**
   - Amount: Non-negative, finite number
   - Currency: Valid ISO 4217 code
   - Precision: 2 decimal places

4. **Percentage:**
   - Value: 0-100 range
   - Precision: 2 decimal places

5. **DateRange:**
   - Start date: Valid date
   - End date: After start date (if provided)

### **Calculation Rules**

1. **Pricing:**
   - Total = Base Price × Quantity
   - Discount = Total × Percentage
   - Final = Total - Discount
   - Tax = Final × Tax Rate
   - Grand Total = Final + Tax

2. **Currency Operations:**
   - All operations require same currency
   - Results rounded to 2 decimal places
   - Negative results throw errors

3. **Percentage Operations:**
   - Combined percentages capped at 100%
   - Decimal conversion: value / 100

## 🧪 Usage Examples

### **Creating Entities**

```typescript
// Create value objects
const basePrice = new Money(100, 'USD');
const category = new Category('cat-1', 'Software', 'Software products', 1);

// Create pricing item
const item = new PricingItem(
  'item-1',
  'Software License',
  'Annual software license',
  basePrice,
  category,
  2
);

// Calculate total
const total = item.getTotalPrice(); // $200.00
```

### **Applying Discounts**

```typescript
const discount = new Percentage(20);
const discountedPrice = item.applyDiscount(discount); // $160.00
const savings = item.calculateDiscountAmount(discount); // $40.00
```

### **Pricing Calculations**

```typescript
const items = [item1, item2, item3];
const discount = new Percentage(15);
const taxRate = new Percentage(8.5);

const result = PricingCalculator.calculatePricing(items, discount, taxRate);

console.log(`Subtotal: ${result.subtotal.format()}`);
console.log(`Discount: ${result.totalDiscount.format()}`);
console.log(`Tax: ${result.tax.format()}`);
console.log(`Total: ${result.total.format()}`);
```

### **Category Management**

```typescript
const category = new Category('cat-1', 'Software', 'Software products', 1);
const updatedCategory = category.updateOrder(2);
const displayName = updatedCategory.getDisplayName(); // "2. Software"
```

## 🧪 Testing Guide

### **Testing Entities**

```typescript
describe('PricingItem', () => {
  it('should calculate total price correctly', () => {
    const item = new PricingItem('id', 'Name', 'Desc', new Money(100, 'USD'), category, 2);
    expect(item.getTotalPrice().amount).toBe(200);
  });

  it('should throw error for invalid quantity', () => {
    expect(() => {
      new PricingItem('id', 'Name', 'Desc', new Money(100, 'USD'), category, 0);
    }).toThrow('Quantity must be at least 1');
  });
});
```

### **Testing Value Objects**

```typescript
describe('Money', () => {
  it('should add amounts correctly', () => {
    const money1 = new Money(100, 'USD');
    const money2 = new Money(50, 'USD');
    const result = money1.add(money2);
    expect(result.amount).toBe(150);
  });

  it('should throw error for currency mismatch', () => {
    const usd = new Money(100, 'USD');
    const eur = new Money(50, 'EUR');
    expect(() => usd.add(eur)).toThrow('Currency mismatch');
  });
});
```

### **Testing Services**

```typescript
describe('PricingCalculator', () => {
  it('should calculate total for multiple items', () => {
    const items = [item1, item2, item3];
    const total = PricingCalculator.calculateTotal(items);
    expect(total.amount).toBe(expectedTotal);
  });
});
```

## 🎯 Best Practices

### **Do's ✅**

- Use entities for business logic and validation
- Use value objects for immutable data
- Keep domain services pure (no side effects)
- Validate all inputs in constructors
- Return new instances for updates (immutability)
- Test business rules, not implementation details
- Use factory methods for complex creation

### **Don'ts ❌**

- Don't add external dependencies to domain
- Don't make entities mutable
- Don't skip validation in constructors
- Don't use `any` types
- Don't put UI logic in domain
- Don't access infrastructure from domain

## 🔄 Integration with Other Layers

### **Application Layer**
- Use cases orchestrate domain entities
- DTOs convert between domain and external formats
- Application services coordinate domain operations

### **Infrastructure Layer**
- Repository implementations handle data persistence
- External services integrate with domain through interfaces
- Database mappings convert domain objects to/from storage

### **Presentation Layer**
- Components use domain entities through application layer
- UI displays domain data through DTOs
- User interactions trigger domain operations via use cases

## 📊 Domain Model Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Pricing Domain                           │
├─────────────────────────────────────────────────────────────┤
│  Entities:                                                 │
│  ┌─────────────┐    ┌─────────────┐                       │
│  │PricingItem  │    │Category     │                       │
│  │- id         │    │- id         │                       │
│  │- name       │    │- name       │                       │
│  │- basePrice  │    │- order      │                       │
│  │- category   │    │- description│                       │
│  │- quantity   │    └─────────────┘                       │
│  └─────────────┘                                           │
├─────────────────────────────────────────────────────────────┤
│  Value Objects:                                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  │Money        │    │Percentage    │    │DateRange    │   │
│  │- amount     │    │- value       │    │- startDate  │   │
│  │- currency   │    │- 0-100       │    │- endDate    │   │
│  └─────────────┘    └─────────────┘    └─────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Services:                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │PricingCalculator                                    │   │
│  │- calculateTotal()                                   │   │
│  │- applyDiscount()                                    │   │
│  │- calculateTax()                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

This domain provides a solid foundation for pricing operations while maintaining clean architecture principles and business rule enforcement.
