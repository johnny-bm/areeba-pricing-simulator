# API Reference

## Overview

The Areeba Pricing Simulator API provides comprehensive endpoints for pricing management, user administration, and data operations. All endpoints are built on Supabase with Row Level Security (RLS) for data protection.

## Base Configuration

```typescript
const API_BASE = 'https://your-project.supabase.co'
const API_KEY = 'your-anon-key'
```

## Authentication

All API calls require authentication via Supabase Auth. Include the session token in the Authorization header:

```typescript
headers: {
  'Authorization': `Bearer ${sessionToken}`,
  'apikey': API_KEY
}
```

## Core Endpoints

### Pricing Items

#### Get Pricing Items
```typescript
GET /rest/v1/pricing_items
```

**Query Parameters:**
- `simulator_id` (optional): Filter by simulator
- `is_active` (optional): Filter by active status
- `category_id` (optional): Filter by category

**Response:**
```typescript
interface PricingItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  default_price: number;
  pricing_type: 'one_time' | 'recurring' | 'per_unit' | 'tiered';
  billing_cycle?: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  is_active: boolean;
  tiered_pricing?: TieredPricing;
  created_at: string;
  updated_at: string;
}
```

#### Create/Update Pricing Items
```typescript
POST /rest/v1/pricing_items
```

**Request Body:**
```typescript
interface CreatePricingItemRequest {
  name: string;
  description?: string;
  category: string;
  unit: string;
  default_price: number;
  pricing_type: 'one_time' | 'recurring' | 'per_unit' | 'tiered';
  billing_cycle?: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  is_active?: boolean;
  tiered_pricing?: TieredPricing;
  simulator_id?: string;
}
```

#### Update Pricing Item
```typescript
PATCH /rest/v1/pricing_items?id=eq.{id}
```

#### Delete Pricing Item
```typescript
DELETE /rest/v1/pricing_items?id=eq.{id}
```

### Categories

#### Get Categories
```typescript
GET /rest/v1/categories
```

**Response:**
```typescript
interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  order_index: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Create/Update Categories
```typescript
POST /rest/v1/categories
PATCH /rest/v1/categories?id=eq.{id}
```

### Scenarios

#### Get Scenarios
```typescript
GET /rest/v1/scenarios
```

**Query Parameters:**
- `user_id` (optional): Filter by user
- `simulator_id` (optional): Filter by simulator

**Response:**
```typescript
interface Scenario {
  id: string;
  user_id?: string;
  config?: Record<string, any>;
  legacy_config?: Record<string, any>;
  config_definitions?: Configuration[];
  selected_items: SelectedItem[];
  categories?: Category[];
  tags?: Tag[];
  summary: ScenarioSummary;
  global_discount: number;
  global_discount_type: 'percentage' | 'fixed';
  global_discount_application: 'none' | 'both' | 'monthly' | 'onetime' | 'unit' | 'total';
  created_at: string;
  updated_at: string;
}
```

#### Save Scenario
```typescript
POST /rest/v1/scenarios
```

### User Management

#### Get Users
```typescript
GET /rest/v1/user_profiles
```

**Response:**
```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'member';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

#### Update User
```typescript
PATCH /rest/v1/user_profiles?id=eq.{id}
```

### Audit Logging

#### Get Audit Logs
```typescript
GET /rest/v1/admin_audit_log
```

**Query Parameters:**
- `user_id` (optional): Filter by user
- `action` (optional): Filter by action type
- `resource_type` (optional): Filter by resource type
- `created_at` (optional): Filter by date range

**Response:**
```typescript
interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details?: Record<string, any>;
  success: boolean;
  error_message?: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}
```

## Data Types

### Tiered Pricing
```typescript
interface TieredPricing {
  type: 'tiered';
  tiers: Tier[];
  original_pricing_type: string;
}

interface Tier {
  min: number;
  max?: number;
  price: number;
  type: 'fixed' | 'percentage';
}
```

### Selected Item
```typescript
interface SelectedItem {
  id: string;
  item: PricingItem;
  quantity: number;
  unit_price: number;
  discount: number;
  discount_type: 'percentage' | 'fixed';
  discount_application: 'none' | 'both' | 'monthly' | 'onetime' | 'unit' | 'total';
  is_free: boolean;
}
```

### Scenario Summary
```typescript
interface ScenarioSummary {
  one_time_total: number;
  monthly_total: number;
  yearly_total: number;
  total_project_cost: number;
  item_count: number;
  savings: {
    total_savings: number;
    discount_savings: number;
    free_savings: number;
    original_price: number;
    savings_rate: number;
  };
}
```

### Configuration
```typescript
interface Configuration {
  id: string;
  name: string;
  description?: string;
  fields: ConfigField[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface ConfigField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multi-select';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}
```

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}
```

### Common Error Codes
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `422`: Unprocessable Entity - Validation error
- `500`: Internal Server Error - Server error

### Error Handling Example
```typescript
try {
  const response = await fetch('/rest/v1/pricing_items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': API_KEY
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.message}`);
  }

  const result = await response.json();
  return result;
} catch (error) {
  console.error('API call failed:', error);
  throw error;
}
```

## Rate Limiting

API calls are rate limited to prevent abuse:

- **General API**: 10 requests per second
- **Mutations**: 5 requests per second
- **Authentication**: 3 requests per 5 seconds
- **File Uploads**: 2 requests per 10 seconds

### Rate Limit Headers
```typescript
interface RateLimitHeaders {
  'X-RateLimit-Limit': string;
  'X-RateLimit-Remaining': string;
  'X-RateLimit-Reset': string;
}
```

## Security

### Row Level Security (RLS)
All tables have RLS policies that enforce data access based on user roles:

- **Owners**: Full access to all data
- **Admins**: Access to assigned simulators
- **Members**: Read-only access to assigned simulators

### Input Validation
All input data is validated using Zod schemas:

```typescript
import { validatePricingItems, validateCategories } from '../utils/validationSchemas';

// Validate before API call
const validatedData = validatePricingItems(data);
```

### CSRF Protection
All mutation requests require CSRF tokens:

```typescript
headers: {
  'X-CSRF-Token': csrfToken,
  'Content-Type': 'application/json'
}
```

## Real-time Subscriptions

### Subscribe to Changes
```typescript
import { supabase } from './supabase/client';

// Subscribe to pricing items changes
const subscription = supabase
  .channel('pricing_items')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'pricing_items'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

### Unsubscribe
```typescript
subscription.unsubscribe();
```

## Examples

### Complete Pricing Item CRUD
```typescript
import { supabase } from './supabase/client';

class PricingItemAPI {
  // Create
  async create(item: CreatePricingItemRequest) {
    const { data, error } = await supabase
      .from('pricing_items')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Read
  async getAll(simulatorId?: string) {
    let query = supabase
      .from('pricing_items')
      .select('*')
      .eq('is_active', true);
    
    if (simulatorId) {
      query = query.eq('simulator_id', simulatorId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Update
  async update(id: string, updates: Partial<PricingItem>) {
    const { data, error } = await supabase
      .from('pricing_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Delete
  async delete(id: string) {
    const { error } = await supabase
      .from('pricing_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}
```

### Batch Operations
```typescript
// Batch create pricing items
async createBatch(items: CreatePricingItemRequest[]) {
  const { data, error } = await supabase
    .from('pricing_items')
    .insert(items)
    .select();
  
  if (error) throw error;
  return data;
}

// Batch update pricing items
async updateBatch(updates: Array<{ id: string; updates: Partial<PricingItem> }>) {
  const promises = updates.map(({ id, updates }) =>
    supabase
      .from('pricing_items')
      .update(updates)
      .eq('id', id)
  );
  
  const results = await Promise.all(promises);
  const errors = results.filter(result => result.error);
  
  if (errors.length > 0) {
    throw new Error(`Batch update failed: ${errors.length} errors`);
  }
  
  return results;
}
```

## SDK Usage

### TypeScript SDK
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(API_BASE, API_KEY);

// Use with TypeScript types
interface Database {
  public: {
    Tables: {
      pricing_items: {
        Row: PricingItem;
        Insert: CreatePricingItemRequest;
        Update: Partial<PricingItem>;
      };
      categories: {
        Row: Category;
        Insert: CreateCategoryRequest;
        Update: Partial<Category>;
      };
    };
  };
}

const typedSupabase = createClient<Database>(API_BASE, API_KEY);
```

### React Hooks
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query hook
export const usePricingItems = (simulatorId?: string) => {
  return useQuery({
    queryKey: ['pricing-items', simulatorId],
    queryFn: () => api.getPricingItems(simulatorId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation hook
export const useCreatePricingItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createPricingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-items'] });
    },
  });
};
```

## Best Practices

### 1. Error Handling
- Always handle API errors gracefully
- Provide user-friendly error messages
- Log errors for debugging

### 2. Caching
- Use appropriate cache times for different data types
- Invalidate cache on mutations
- Use optimistic updates where appropriate

### 3. Performance
- Use pagination for large datasets
- Implement proper loading states
- Debounce search and filter operations

### 4. Security
- Validate all input data
- Use proper authentication
- Implement rate limiting
- Log security events

### 5. Real-time Updates
- Subscribe to relevant data changes
- Handle connection state changes
- Implement proper cleanup

---

**For more detailed examples and advanced usage patterns, see the [API Examples](./API_EXAMPLES.md) documentation.**
