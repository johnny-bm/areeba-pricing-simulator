# API Documentation

## Overview

This document describes the API services and their usage in the Areeba Pricing Simulator application.

## Authentication API

### AuthService

The `AuthService` class provides centralized authentication functionality.

#### Methods

##### `login(credentials: LoginCredentials): Promise<User>`
Authenticates a user with email and password.

**Parameters:**
- `credentials.email: string` - User's email address
- `credentials.password: string` - User's password

**Returns:** `Promise<User>` - User object on success

**Throws:** `Error` - Authentication failed

**Example:**
```typescript
import { AuthService } from '../features/auth/api/authService';

try {
  const user = await AuthService.login({
    email: 'user@example.com',
    password: 'password123'
  });
  console.log('Logged in:', user);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

##### `signup(data: SignupData): Promise<User>`
Registers a new user with invite code.

**Parameters:**
- `data.email: string` - User's email address
- `data.password: string` - User's password
- `data.firstName?: string` - User's first name
- `data.lastName?: string` - User's last name
- `data.inviteCode: string` - Invite code

**Returns:** `Promise<User>` - User object on success

**Throws:** `Error` - Signup failed

##### `logout(): Promise<void>`
Signs out the current user.

**Returns:** `Promise<void>`

**Throws:** `Error` - Logout failed

##### `resetPassword(email: string): Promise<void>`
Sends password reset email.

**Parameters:**
- `email: string` - User's email address

**Returns:** `Promise<void>`

**Throws:** `Error` - Reset failed

##### `getCurrentUser(): Promise<User | null>`
Gets the current authenticated user.

**Returns:** `Promise<User | null>` - User object or null

##### `storeUserData(user: User): void`
Stores user data in localStorage.

**Parameters:**
- `user: User` - User object to store

##### `getUserData(): User | null`
Gets user data from localStorage.

**Returns:** `User | null` - User object or null

##### `clearUserData(): void`
Clears user data from localStorage.

## Pricing API

### PricingService

The `PricingService` class provides pricing-related functionality.

#### Methods

##### `getPricingItems(filters?: PricingFilters, sort?: PricingSortOptions): Promise<PricingItem[]>`
Gets pricing items with optional filtering and sorting.

**Parameters:**
- `filters?: PricingFilters` - Optional filters
- `sort?: PricingSortOptions` - Optional sorting

**Returns:** `Promise<PricingItem[]>` - Array of pricing items

**Example:**
```typescript
import { PricingService } from '../features/pricing/api/pricingService';

// Get all items
const items = await PricingService.getPricingItems();

// Get filtered items
const filteredItems = await PricingService.getPricingItems({
  categoryId: 'setup',
  searchTerm: 'card'
});

// Get sorted items
const sortedItems = await PricingService.getPricingItems(
  undefined,
  { field: 'name', direction: 'asc' }
);
```

##### `createPricingItem(item: Omit<PricingItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingItem>`
Creates a new pricing item.

**Parameters:**
- `item: Omit<PricingItem, 'id' | 'createdAt' | 'updatedAt'>` - Pricing item data

**Returns:** `Promise<PricingItem>` - Created pricing item

##### `updatePricingItem(id: string, updates: Partial<PricingItem>): Promise<PricingItem>`
Updates an existing pricing item.

**Parameters:**
- `id: string` - Pricing item ID
- `updates: Partial<PricingItem>` - Updates to apply

**Returns:** `Promise<PricingItem>` - Updated pricing item

##### `deletePricingItem(id: string): Promise<void>`
Deletes a pricing item.

**Parameters:**
- `id: string` - Pricing item ID

**Returns:** `Promise<void>`

##### `calculatePricing(selectedItems: SelectedItem[]): ScenarioSummary`
Calculates pricing for selected items.

**Parameters:**
- `selectedItems: SelectedItem[]` - Array of selected items

**Returns:** `ScenarioSummary` - Pricing calculation results

## Admin API

### AdminService

The `AdminService` class provides administrative functionality.

#### Methods

##### `getStats(): Promise<AdminStats>`
Gets admin statistics.

**Returns:** `Promise<AdminStats>` - Admin statistics

##### `getUsers(filters?: AdminFilters): Promise<AdminUser[]>`
Gets users with optional filtering.

**Parameters:**
- `filters?: AdminFilters` - Optional filters

**Returns:** `Promise<AdminUser[]>` - Array of users

##### `updateUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser>`
Updates a user.

**Parameters:**
- `id: string` - User ID
- `updates: Partial<AdminUser>` - Updates to apply

**Returns:** `Promise<AdminUser>` - Updated user

##### `deleteUser(id: string): Promise<void>`
Deletes a user.

**Parameters:**
- `id: string` - User ID

**Returns:** `Promise<void>`

##### `hasPermission(userRole: string, permission: string): boolean`
Checks if user has permission.

**Parameters:**
- `userRole: string` - User role
- `permission: string` - Permission to check

**Returns:** `boolean` - True if user has permission

## Guest API

### GuestService

The `GuestService` class provides guest functionality.

#### Methods

##### `createSession(): GuestSession`
Creates a new guest session.

**Returns:** `GuestSession` - Guest session object

##### `getCurrentSession(): GuestSession | null`
Gets the current guest session.

**Returns:** `GuestSession | null` - Session object or null

##### `updateSession(updates: Partial<GuestSession>): void`
Updates the guest session.

**Parameters:**
- `updates: Partial<GuestSession>` - Updates to apply

##### `clearSession(): void`
Clears the guest session.

##### `submitScenario(contactInfo: GuestContactInfo, scenarioData: GuestScenarioData): Promise<GuestSubmission>`
Submits a guest scenario.

**Parameters:**
- `contactInfo: GuestContactInfo` - Contact information
- `scenarioData: GuestScenarioData` - Scenario data

**Returns:** `Promise<GuestSubmission>` - Submission result

##### `validateContactInfo(contactInfo: GuestContactInfo): { isValid: boolean; errors: Record<string, string> }`
Validates contact information.

**Parameters:**
- `contactInfo: GuestContactInfo` - Contact information to validate

**Returns:** `{ isValid: boolean; errors: Record<string, string> }` - Validation result

## Error Handling

All API methods throw errors with descriptive messages. Common error patterns:

```typescript
try {
  const result = await SomeService.someMethod();
  // Handle success
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error
}
```

## Type Definitions

### Core Types

```typescript
interface User {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: 'member' | 'admin' | 'owner';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PricingItem {
  id: string;
  name: string;
  description?: string;
  pricingType: 'fixed' | 'tiered';
  defaultPrice: number;
  categoryId: string;
  tags?: string[];
  isActive: boolean;
  isArchived: boolean;
}

interface SelectedItem {
  id: string;
  item: PricingItem;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountApplication: 'total' | 'unit';
  isFree: boolean;
}
```

### Filter Types

```typescript
interface PricingFilters {
  categoryId?: string;
  tags?: string[];
  searchTerm?: string;
  showArchived?: boolean;
}

interface AdminFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  userRole?: string;
  status?: string;
  searchTerm?: string;
}
```

## Usage Examples

### Authentication Flow

```typescript
import { useAuth } from '../features/auth/hooks/useAuth';

function LoginComponent() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      // Redirect to dashboard
    } catch (error) {
      // Handle error
    }
  };

  return (
    // Login form JSX
  );
}
```

### Pricing Management

```typescript
import { usePricingItems } from '../features/pricing/hooks/usePricingItems';

function PricingManager() {
  const { items, createItem, updateItem, deleteItem } = usePricingItems();

  const handleCreateItem = async (itemData) => {
    try {
      await createItem(itemData);
      // Show success message
    } catch (error) {
      // Handle error
    }
  };

  return (
    // Pricing management JSX
  );
}
```

### Admin Dashboard

```typescript
import { useAdminStats } from '../features/admin/hooks/useAdminStats';

function AdminDashboard() {
  const { stats, isLoading, error } = useAdminStats();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    // Dashboard JSX
  );
}
```

## Best Practices

1. **Always handle errors** - Wrap API calls in try-catch blocks
2. **Use TypeScript** - Leverage type safety for better development experience
3. **Validate input** - Validate data before sending to API
4. **Handle loading states** - Show loading indicators during API calls
5. **Cache results** - Use hooks to cache API results when appropriate
6. **Error boundaries** - Use error boundaries to catch and handle errors gracefully
