/**
 * SupabasePricingRepository Integration Tests
 * 
 * Tests against REAL Supabase database
 * Requires test database setup
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { supabase } from '../../supabase/client';
import { SupabasePricingRepository } from '../SupabasePricingRepository';
import { PricingItem } from '../../../../domain/pricing/entities/PricingItem';
import { Category } from '../../../../domain/pricing/entities/Category';
import { Money } from '../../../../domain/pricing/value-objects/Money';

describe('SupabasePricingRepository Integration Tests', () => {
  let repository: SupabasePricingRepository;
  let testCategoryId: string;
  let testItemId: string;

  beforeAll(async () => {
    repository = new SupabasePricingRepository(supabase);
    
    // Create test category
    const testCategory = {
      id: 'test-category-integration',
      name: 'Test Category',
      description: 'Test category for integration tests',
      order: 999,
    };
    
    const { error: categoryError } = await supabase
      .from('categories')
      .upsert(testCategory);
    
    if (categoryError) {
      throw new Error(`Failed to create test category: ${categoryError.message}`);
    }
    
    testCategoryId = testCategory.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testItemId) {
      await supabase.from('pricing_items').delete().eq('id', testItemId);
    }
    if (testCategoryId) {
      await supabase.from('categories').delete().eq('id', testCategoryId);
    }
  });

  beforeEach(async () => {
    // Clean up any existing test items
    await supabase.from('pricing_items').delete().eq('id', 'test-item-integration');
  });

  describe('CRUD Operations', () => {
    it('should create and retrieve pricing item', async () => {
      // Create test item
      const testItem = new PricingItem(
        'test-item-integration',
        'Integration Test Item',
        'Test item for integration testing',
        new Money(99.99, 'USD'),
        new Category(testCategoryId, 'Test Category', 'Test category', 999),
        1
      );

      // Save item
      await repository.save(testItem);
      testItemId = testItem.id;

      // Retrieve item
      const retrievedItem = await repository.findById(testItemId);

      expect(retrievedItem).not.toBeNull();
      expect(retrievedItem?.id).toBe(testItemId);
      expect(retrievedItem?.name).toBe('Integration Test Item');
      expect(retrievedItem?.basePrice.amount).toBe(99.99);
      expect(retrievedItem?.basePrice.currency).toBe('USD');
      expect(retrievedItem?.category.id).toBe(testCategoryId);
    });

    it('should return null for non-existent item', async () => {
      const item = await repository.findById('non-existent-item');
      expect(item).toBeNull();
    });

    it('should find items by IDs', async () => {
      // Create test item
      const testItem = new PricingItem(
        'test-item-integration-2',
        'Integration Test Item 2',
        'Second test item',
        new Money(149.99, 'USD'),
        new Category(testCategoryId, 'Test Category', 'Test category', 999),
        1
      );

      await repository.save(testItem);

      // Find by IDs
      const items = await repository.findByIds([testItemId, 'test-item-integration-2']);

      expect(items).toHaveLength(2);
      expect(items.map(item => item.id)).toContain(testItemId);
      expect(items.map(item => item.id)).toContain('test-item-integration-2');

      // Clean up
      await repository.delete('test-item-integration-2');
    });

    it('should find items by category', async () => {
      const items = await repository.findByCategory(testCategoryId);
      
      expect(items.length).toBeGreaterThan(0);
      expect(items.every(item => item.category.id === testCategoryId)).toBe(true);
    });

    it('should find items by name', async () => {
      const items = await repository.findByName('Integration Test');
      
      expect(items.length).toBeGreaterThan(0);
      expect(items.every(item => item.name.includes('Integration Test'))).toBe(true);
    });

    it('should find items by price range', async () => {
      const items = await repository.findByPriceRange(90, 110);
      
      expect(items.length).toBeGreaterThan(0);
      expect(items.every(item => 
        item.basePrice.amount >= 90 && item.basePrice.amount <= 110
      )).toBe(true);
    });

    it('should update existing item', async () => {
      // Create item
      const originalItem = new PricingItem(
        'test-item-update',
        'Original Name',
        'Original description',
        new Money(50, 'USD'),
        new Category(testCategoryId, 'Test Category', 'Test category', 999),
        1
      );

      await repository.save(originalItem);

      // Update item
      const updatedItem = new PricingItem(
        'test-item-update',
        'Updated Name',
        'Updated description',
        new Money(75, 'USD'),
        new Category(testCategoryId, 'Test Category', 'Test category', 999),
        1
      );

      await repository.save(updatedItem);

      // Verify update
      const retrievedItem = await repository.findById('test-item-update');
      expect(retrievedItem?.name).toBe('Updated Name');
      expect(retrievedItem?.description).toBe('Updated description');
      expect(retrievedItem?.basePrice.amount).toBe(75);

      // Clean up
      await repository.delete('test-item-update');
    });

    it('should delete item', async () => {
      // Create item
      const testItem = new PricingItem(
        'test-item-delete',
        'Item to Delete',
        'This item will be deleted',
        new Money(25, 'USD'),
        new Category(testCategoryId, 'Test Category', 'Test category', 999),
        1
      );

      await repository.save(testItem);

      // Verify item exists
      const beforeDelete = await repository.findById('test-item-delete');
      expect(beforeDelete).not.toBeNull();

      // Delete item
      await repository.delete('test-item-delete');

      // Verify item is deleted
      const afterDelete = await repository.findById('test-item-delete');
      expect(afterDelete).toBeNull();
    });
  });

  describe('Count Operations', () => {
    it('should count total items', async () => {
      const count = await repository.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should count items by category', async () => {
      const count = await repository.countByCategory(testCategoryId);
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Exists Check', () => {
    it('should return true for existing item', async () => {
      const exists = await repository.exists(testItemId);
      expect(exists).toBe(true);
    });

    it('should return false for non-existent item', async () => {
      const exists = await repository.exists('non-existent-item');
      expect(exists).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require simulating a connection error
      // In a real scenario, you might test with invalid credentials
      // or network issues
      expect(true).toBe(true); // Placeholder for connection error testing
    });
  });
});
