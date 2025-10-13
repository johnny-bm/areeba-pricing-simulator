# Testing Guide

## Testing Strategy

This project uses a comprehensive testing approach:

- **Unit Tests**: Individual functions and components
- **Integration Tests**: Component interactions
- **E2E Tests**: Full user workflows

## Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test with UI
npm run test:ui
```

## Test Structure

```
tests/
├── e2e/              # End-to-end tests
├── integration/      # Integration tests
└── setup/           # Test utilities
```

## Writing Tests

### Unit Tests
```typescript
// Example: Domain entity test
describe('PricingItem', () => {
  it('should calculate total correctly', () => {
    const item = new PricingItem('Service', 100, 2);
    expect(item.total).toBe(200);
  });
});
```

### Integration Tests
```typescript
// Example: Repository integration
describe('PricingRepository', () => {
  it('should save and retrieve pricing items', async () => {
    const repository = new PricingRepository();
    const item = new PricingItem('Service', 100, 1);
    
    await repository.save(item);
    const retrieved = await repository.findById(item.id);
    
    expect(retrieved).toEqual(item);
  });
});
```

### E2E Tests
```typescript
// Example: User workflow
test('user can create pricing scenario', async ({ page }) => {
  await page.goto('/pricing');
  await page.click('[data-testid="add-item"]');
  await page.fill('[data-testid="item-name"]', 'Service');
  await page.fill('[data-testid="item-price"]', '100');
  await page.click('[data-testid="save-item"]');
  
  await expect(page.locator('[data-testid="item-list"]')).toContainText('Service');
});
```

## Test Data

- Use factories for test data creation
- Mock external dependencies
- Clean up after each test
- Use realistic test scenarios

## Coverage Requirements

- **Unit Tests**: 100% coverage
- **Integration Tests**: Critical paths
- **E2E Tests**: User workflows

## Debugging Tests

```bash
# Debug specific test
npm test -- --grep "PricingItem"

# Debug with browser
npm run test:ui

# Debug E2E tests
npm run test:e2e -- --debug
```
