// E2E test for admin flow
import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@example.com');
    await page.fill('[data-testid="password"]', 'admin123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('admin can view user management', async ({ page }) => {
    // Navigate to admin panel
    await page.click('[data-testid="admin-link"]');
    await expect(page).toHaveURL('/admin');

    // Verify user management is visible
    await expect(page.locator('[data-testid="user-management"]')).toBeVisible();
  });

  test('admin can view system configuration', async ({ page }) => {
    // Navigate to admin panel
    await page.click('[data-testid="admin-link"]');
    
    // Navigate to system configuration
    await page.click('[data-testid="system-config"]');
    
    // Verify configuration options
    await expect(page.locator('[data-testid="feature-flags"]')).toBeVisible();
    await expect(page.locator('[data-testid="system-settings"]')).toBeVisible();
  });

  test('admin can manage feature flags', async ({ page }) => {
    // Navigate to feature flags
    await page.goto('/admin/features');
    
    // Toggle feature flag
    await page.click('[data-testid="toggle-new-architecture"]');
    await page.click('[data-testid="save-features"]');
    
    // Verify change was saved
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Features updated');
  });

  test('admin can view system metrics', async ({ page }) => {
    // Navigate to metrics
    await page.goto('/admin/metrics');
    
    // Verify metrics are displayed
    await expect(page.locator('[data-testid="user-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="scenario-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-rate"]')).toBeVisible();
  });
});
