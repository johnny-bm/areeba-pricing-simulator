import { test, expect } from '@playwright/test';

test.describe('Critical Workflows', () => {
  test('User can login and logout', async ({ page }) => {
    await page.goto('/');
    
    // Check if login form is visible
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    
    // Fill login form (assuming test credentials)
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    
    // Click login button
    await page.click('[data-testid="login-button"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard|.*admin/);
    
    // Check if user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Should be redirected back to login
    await expect(page).toHaveURL('/');
  });

  test('User can create pricing item with categoryId', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to pricing management
    await page.click('[data-testid="pricing-tab"]');
    
    // Click "Add Item" button
    await page.click('[data-testid="add-item-button"]');
    
    // Fill the pricing item form
    await page.fill('[data-testid="item-name"]', 'Test Service');
    await page.fill('[data-testid="item-description"]', 'Test service description');
    await page.selectOption('[data-testid="category-select"]', 'test-category-id');
    await page.fill('[data-testid="default-price"]', '100');
    await page.selectOption('[data-testid="pricing-type"]', 'fixed');
    await page.fill('[data-testid="unit"]', 'per month');
    
    // Submit the form
    await page.click('[data-testid="save-item-button"]');
    
    // Verify item appears in the list
    await expect(page.locator('[data-testid="item-list"]')).toContainText('Test Service');
  });

  test('User can edit existing pricing item', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to pricing management
    await page.click('[data-testid="pricing-tab"]');
    
    // Find and click edit button for first item
    await page.click('[data-testid="edit-item-button"]:first-of-type');
    
    // Update the item
    await page.fill('[data-testid="item-name"]', 'Updated Service Name');
    await page.fill('[data-testid="default-price"]', '150');
    
    // Save changes
    await page.click('[data-testid="save-item-button"]');
    
    // Verify changes are reflected
    await expect(page.locator('[data-testid="item-list"]')).toContainText('Updated Service Name');
  });

  test('User can generate PDF from template', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to PDF builder
    await page.click('[data-testid="pdf-builder-tab"]');
    
    // Create a new template
    await page.click('[data-testid="new-template-button"]');
    
    // Add some content to the template
    await page.fill('[data-testid="template-title"]', 'Test Proposal');
    await page.fill('[data-testid="template-content"]', 'This is a test proposal content.');
    
    // Save template
    await page.click('[data-testid="save-template-button"]');
    
    // Generate PDF
    await page.click('[data-testid="generate-pdf-button"]');
    
    // Wait for PDF generation
    await expect(page.locator('[data-testid="pdf-preview"]')).toBeVisible();
    
    // Download PDF
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-pdf-button"]');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('Admin can manage categories', async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'adminpassword');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to admin panel
    await page.click('[data-testid="admin-tab"]');
    
    // Go to categories management
    await page.click('[data-testid="categories-tab"]');
    
    // Create new category
    await page.click('[data-testid="add-category-button"]');
    await page.fill('[data-testid="category-name"]', 'New Category');
    await page.fill('[data-testid="category-description"]', 'Category description');
    await page.click('[data-testid="save-category-button"]');
    
    // Verify category appears
    await expect(page.locator('[data-testid="category-list"]')).toContainText('New Category');
    
    // Edit category
    await page.click('[data-testid="edit-category-button"]:first-of-type');
    await page.fill('[data-testid="category-name"]', 'Updated Category');
    await page.click('[data-testid="save-category-button"]');
    
    // Verify changes
    await expect(page.locator('[data-testid="category-list"]')).toContainText('Updated Category');
  });

  test('Admin can manage user roles', async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('[data-testid="email-input"]', 'admin@example.com');
    await page.fill('[data-testid="password-input"]', 'adminpassword');
    await page.click('[data-testid="login-button"]');
    
    // Navigate to admin panel
    await page.click('[data-testid="admin-tab"]');
    
    // Go to user management
    await page.click('[data-testid="users-tab"]');
    
    // Find a user and change their role
    await page.click('[data-testid="edit-user-button"]:first-of-type');
    await page.selectOption('[data-testid="user-role-select"]', 'admin');
    await page.click('[data-testid="save-user-button"]');
    
    // Verify role change
    await expect(page.locator('[data-testid="user-list"]')).toContainText('admin');
  });

  test('Guest user can submit pricing scenario', async ({ page }) => {
    // Go to guest pricing simulator
    await page.goto('/');
    
    // Fill client configuration
    await page.fill('[data-testid="client-name"]', 'Test Client');
    await page.fill('[data-testid="project-name"]', 'Test Project');
    await page.fill('[data-testid="prepared-by"]', 'Test User');
    
    // Configure card types
    await page.check('[data-testid="has-debit-cards"]');
    await page.check('[data-testid="has-credit-cards"]');
    await page.fill('[data-testid="debit-cards-count"]', '100');
    await page.fill('[data-testid="credit-cards-count"]', '50');
    
    // Add some pricing items
    await page.click('[data-testid="add-item-button"]');
    await page.selectOption('[data-testid="service-select"]', 'test-service-id');
    await page.fill('[data-testid="quantity"]', '10');
    
    // Submit the scenario
    await page.click('[data-testid="submit-scenario-button"]');
    
    // Fill contact information
    await page.fill('[data-testid="contact-email"]', 'guest@example.com');
    await page.fill('[data-testid="contact-name"]', 'Guest User');
    await page.fill('[data-testid="contact-company"]', 'Guest Company');
    
    // Submit contact form
    await page.click('[data-testid="submit-contact-button"]');
    
    // Verify submission success
    await expect(page.locator('[data-testid="submission-success"]')).toBeVisible();
  });
});
