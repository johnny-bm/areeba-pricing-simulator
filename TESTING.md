# Testing & Validation Guide

## 🧪 Testing Strategy

This guide outlines the comprehensive testing strategy implemented for the Areeba Pricing Simulator, ensuring production-ready quality and reliability.

## 📊 Testing Pyramid

### 1. Unit Tests (70%)
- **Purpose**: Test individual functions and components in isolation
- **Coverage**: Business logic, utilities, hooks, and pure functions
- **Tools**: Vitest, React Testing Library
- **Location**: `src/**/*.test.ts`, `src/**/*.test.tsx`

### 2. Integration Tests (20%)
- **Purpose**: Test API endpoints and data flow
- **Coverage**: API calls, database interactions, external services
- **Tools**: Vitest, Mock Service Worker
- **Location**: `tests/integration/`

### 3. Critical Path Tests (5%)
- **Purpose**: Test essential user journeys
- **Coverage**: Core user flows, critical business logic
- **Tools**: Vitest, React Testing Library
- **Location**: `tests/critical/`

### 4. Performance Tests (3%)
- **Purpose**: Test performance under various conditions
- **Coverage**: Load times, memory usage, scalability
- **Tools**: Vitest, Performance API
- **Location**: `tests/performance/`

### 5. E2E Tests (2%)
- **Purpose**: Test complete user workflows
- **Coverage**: Full application flows, cross-browser compatibility
- **Tools**: Playwright
- **Location**: `tests/e2e/`

## 🚀 Test Commands

### Basic Testing
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Specialized Testing
```bash
# Run integration tests
npm run test:integration

# Run critical path tests
npm run test:critical

# Run performance tests
npm run test:performance

# Run E2E tests
npm run test:e2e

# Run all test suites
npm run test:all
```

## 📋 Test Categories

### Unit Tests

#### Component Tests
```typescript
// Example: PricingSimulator.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingSimulator } from '../PricingSimulator';

describe('PricingSimulator', () => {
  it('should render pricing items', () => {
    render(<PricingSimulator />);
    expect(screen.getByText('Pricing Items')).toBeInTheDocument();
  });

  it('should handle item selection', () => {
    render(<PricingSimulator />);
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    expect(screen.getByText('Item added')).toBeInTheDocument();
  });
});
```

#### Hook Tests
```typescript
// Example: usePricingItems.test.ts
import { renderHook, act } from '@testing-library/react';
import { usePricingItems } from '../usePricingItems';

describe('usePricingItems', () => {
  it('should load pricing items', async () => {
    const { result } = renderHook(() => usePricingItems());
    
    act(() => {
      result.current.loadItems();
    });
    
    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });
  });
});
```

#### Utility Tests
```typescript
// Example: validationSchemas.test.ts
import { validatePricingItems, pricingItemSchema } from '../validationSchemas';

describe('Validation Schemas', () => {
  it('should validate pricing items', () => {
    const validItem = {
      id: '1',
      name: 'Test Item',
      defaultPrice: 100,
      // ... other required fields
    };
    
    expect(() => validatePricingItems([validItem])).not.toThrow();
  });

  it('should reject invalid pricing items', () => {
    const invalidItem = {
      id: '1',
      name: '', // Invalid: empty name
      defaultPrice: -100, // Invalid: negative price
    };
    
    expect(() => validatePricingItems([invalidItem])).toThrow();
  });
});
```

### Integration Tests

#### API Tests
```typescript
// Example: API.test.ts
import { api } from '../utils/api';

describe('API Integration', () => {
  it('should load pricing items', async () => {
    const items = await api.loadPricingItems('simulator-1');
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
  });

  it('should handle API errors', async () => {
    // Mock API error
    vi.mocked(api.loadPricingItems).mockRejectedValue(new Error('API Error'));
    
    await expect(api.loadPricingItems('simulator-1')).rejects.toThrow('API Error');
  });
});
```

#### Database Tests
```typescript
// Example: Database.test.ts
import { supabase } from '../utils/supabase/client';

describe('Database Integration', () => {
  it('should connect to database', async () => {
    const { data, error } = await supabase
      .from('pricing_items')
      .select('id')
      .limit(1);
    
    expect(error).toBeNull();
  });
});
```

### Critical Path Tests

#### User Flow Tests
```typescript
// Example: UserFlows.test.tsx
describe('Critical User Flows', () => {
  it('should complete pricing simulation flow', async () => {
    render(<PricingSimulator />);
    
    // Load data
    await waitFor(() => {
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });
    
    // Add items
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);
    
    // Verify selection
    expect(screen.getByText('Selected Items')).toBeInTheDocument();
    
    // Calculate totals
    expect(screen.getByText('$150')).toBeInTheDocument();
  });
});
```

### Performance Tests

#### Load Time Tests
```typescript
// Example: Performance.test.ts
describe('Performance Tests', () => {
  it('should render within acceptable time', async () => {
    const startTime = performance.now();
    
    render(<PricingSimulator />);
    
    await waitFor(() => {
      expect(screen.getByText('Pricing Items')).toBeInTheDocument();
    });
    
    const renderTime = performance.now() - startTime;
    expect(renderTime).toBeLessThan(100); // 100ms
  });
});
```

#### Memory Tests
```typescript
// Example: Memory.test.ts
describe('Memory Tests', () => {
  it('should not leak memory', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Render component multiple times
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(<PricingSimulator />);
      unmount();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
  });
});
```

## 🔧 Test Configuration

### Vitest Configuration
```typescript
// config/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
}));

// Mock Supabase client
vi.mock('./utils/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));
```

## 📊 Test Coverage

### Coverage Targets
- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

### Coverage Reports
```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/index.html
```

## 🚨 Error Handling Tests

### Error Boundary Tests
```typescript
// Example: ErrorBoundary.test.tsx
import { ErrorBoundary } from '../ErrorBoundary';

describe('ErrorBoundary', () => {
  it('should catch and display errors', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
```

### API Error Tests
```typescript
// Example: APIErrorHandling.test.ts
describe('API Error Handling', () => {
  it('should handle network errors', async () => {
    vi.mocked(api.loadPricingItems).mockRejectedValue(new Error('Network error'));
    
    render(<PricingSimulator />);
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

## 🔍 Validation Tests

### Runtime Validation
```typescript
// Example: Validation.test.ts
import { validatePricingItems, pricingItemSchema } from '../validationSchemas';

describe('Runtime Validation', () => {
  it('should validate pricing items at runtime', () => {
    const validData = [{
      id: '1',
      name: 'Test Item',
      defaultPrice: 100,
      // ... other fields
    }];
    
    expect(() => validatePricingItems(validData)).not.toThrow();
  });

  it('should reject invalid data', () => {
    const invalidData = [{
      id: '1',
      name: '', // Invalid: empty name
      defaultPrice: -100, // Invalid: negative price
    }];
    
    expect(() => validatePricingItems(invalidData)).toThrow();
  });
});
```

## 📈 Performance Testing

### Load Testing
```typescript
// Example: LoadTesting.test.ts
describe('Load Testing', () => {
  it('should handle large datasets', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: `item-${i}`,
      name: `Item ${i}`,
      // ... other fields
    }));
    
    vi.mocked(api.loadPricingItems).mockResolvedValue(largeDataset);
    
    const startTime = performance.now();
    render(<PricingSimulator />);
    
    await waitFor(() => {
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });
    
    const loadTime = performance.now() - startTime;
    expect(loadTime).toBeLessThan(2000); // 2 seconds
  });
});
```

### Memory Testing
```typescript
// Example: MemoryTesting.test.ts
describe('Memory Testing', () => {
  it('should not leak memory with repeated renders', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(<PricingSimulator />);
      unmount();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
  });
});
```

## 🎯 Test Best Practices

### 1. Test Structure
- **Arrange**: Set up test data and mocks
- **Act**: Execute the code being tested
- **Assert**: Verify the expected outcome

### 2. Test Naming
- Use descriptive test names
- Include the scenario being tested
- Use "should" statements

### 3. Test Isolation
- Each test should be independent
- Use proper setup and teardown
- Mock external dependencies

### 4. Test Data
- Use realistic test data
- Create reusable test fixtures
- Avoid hardcoded values

### 5. Assertions
- Use specific assertions
- Test both positive and negative cases
- Verify error conditions

## 📋 Testing Checklist

### Pre-commit Testing
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Critical path tests pass
- [ ] Performance tests pass
- [ ] Code coverage meets targets
- [ ] No linting errors

### Pre-deployment Testing
- [ ] All test suites pass
- [ ] E2E tests pass
- [ ] Performance benchmarks met
- [ ] Security tests pass
- [ ] Load testing completed

### Continuous Testing
- [ ] Automated test execution
- [ ] Test result monitoring
- [ ] Performance regression detection
- [ ] Coverage trend analysis

## 🚀 Test Automation

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:all
      - run: npm run test:coverage
```

### Test Monitoring
- Set up test result dashboards
- Monitor test execution times
- Track coverage trends
- Alert on test failures

---

**Remember: Testing is an ongoing process. Regular test maintenance and updates are essential for maintaining code quality and reliability.**
