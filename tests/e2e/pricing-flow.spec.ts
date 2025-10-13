// E2E test for pricing flow
import { test, expect } from '@playwright/test';

test.describe('Pricing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('user can create a pricing scenario', async ({ page }) => {
    // Navigate to pricing page
    await page.click('[data-testid="pricing-link"]');
    await expect(page).toHaveURL('/pricing');

    // Create new scenario
    await page.click('[data-testid="create-scenario"]');
    await page.fill('[data-testid="scenario-name"]', 'Test Scenario');
    await page.fill('[data-testid="scenario-description"]', 'Test Description');
    await page.click('[data-testid="save-scenario"]');

    // Verify scenario was created
    await expect(page.locator('[data-testid="scenario-list"]')).toContainText('Test Scenario');
  });

  test('user can add items to scenario', async ({ page }) => {
    // Navigate to existing scenario
    await page.goto('/pricing/scenario-123');
    
    // Add new item
    await page.click('[data-testid="add-item"]');
    await page.fill('[data-testid="item-name"]', 'Web Hosting');
    await page.fill('[data-testid="item-price"]', '50');
    await page.fill('[data-testid="item-quantity"]', '1');
    await page.click('[data-testid="save-item"]');

    // Verify item was added
    await expect(page.locator('[data-testid="item-list"]')).toContainText('Web Hosting');
    await expect(page.locator('[data-testid="item-list"]')).toContainText('$50');
  });

  test('user can calculate total pricing', async ({ page }) => {
    // Navigate to scenario with items
    await page.goto('/pricing/scenario-123');
    
    // Verify total calculation
    await expect(page.locator('[data-testid="total-price"]')).toContainText('$50');
    
    // Add another item
    await page.click('[data-testid="add-item"]');
    await page.fill('[data-testid="item-name"]', 'Domain');
    await page.fill('[data-testid="item-price"]', '15');
    await page.fill('[data-testid="item-quantity"]', '1');
    await page.click('[data-testid="save-item"]');

    // Verify updated total
    await expect(page.locator('[data-testid="total-price"]')).toContainText('$65');
  });

  test('user can edit existing items', async ({ page }) => {
    // Navigate to scenario
    await page.goto('/pricing/scenario-123');
    
    // Edit first item
    await page.click('[data-testid="edit-item-0"]');
    await page.fill('[data-testid="item-price"]', '75');
    await page.click('[data-testid="save-item"]');

    // Verify price was updated
    await expect(page.locator('[data-testid="item-list"]')).toContainText('$75');
  });

  test('user can delete items', async ({ page }) => {
    // Navigate to scenario
    await page.goto('/pricing/scenario-123');
    
    // Delete first item
    await page.click('[data-testid="delete-item-0"]');
    await page.click('[data-testid="confirm-delete"]');

    // Verify item was removed
    await expect(page.locator('[data-testid="item-list"]')).not.toContainText('Web Hosting');
  });
});