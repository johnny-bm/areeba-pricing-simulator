// E2E test for authentication flow
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('/signup');
    
    // Fill signup form
    await page.fill('[data-testid="name"]', 'Test User');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.fill('[data-testid="confirm-password"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="signup-button"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, Test User');
  });

  test('user can login', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('user can logout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Verify redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('user cannot access protected routes without login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Verify redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('user can reset password', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Fill reset form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.click('[data-testid="reset-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Reset email sent');
  });
});
