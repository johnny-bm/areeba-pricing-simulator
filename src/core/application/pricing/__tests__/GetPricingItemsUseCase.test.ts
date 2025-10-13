/**
 * GetPricingItemsUseCase Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetPricingItemsUseCase } from '../use-cases/GetPricingItemsUseCase';
import { IPricingRepository } from '../../../domain/pricing/repositories/IPricingRepository';
import { PricingItem } from '../../../domain/pricing/entities/PricingItem';
import { Category } from '../../../domain/pricing/entities/Category';
import { Money } from '../../../domain/pricing/value-objects/Money';
import { GetPricingItemsInputDTO } from '../dtos/PricingDTOs';
import { ValidationError, ApplicationError } from '../errors/ApplicationError';

describe('GetPricingItemsUseCase', () => {
  let useCase: GetPricingItemsUseCase;
  let mockRepository: any;

  // Test data
  const category1 = new Category('cat-1', 'Software', 'Software products', 1);
  const category2 = new Category('cat-2', 'Hardware', 'Hardware products', 2);
  const basePrice = new Money(100, 'USD');
  
  const item1 = new PricingItem('item-1', 'Software A', 'Description A', basePrice, category1, 1);
  const item2 = new PricingItem('item-2', 'Hardware B', 'Description B', basePrice, category2, 1);
  const item3 = new PricingItem('item-3', 'Software C', 'Description C', basePrice, category1, 1);

  beforeEach(() => {
    mockRepository = {
      findByIds: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      findByCategory: vi.fn(),
      findByName: vi.fn(),
      findByPriceRange: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      count: vi.fn(),
      countByCategory: vi.fn(),
    };
    useCase = new GetPricingItemsUseCase(mockRepository);
  });

  describe('Happy Path', () => {
    it('should retrieve all items when no filters provided', async () => {
      // Arrange
      const input: GetPricingItemsInputDTO = {};
      mockRepository.findAll.mockResolvedValue([item1, item2, item3]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should retrieve items by category', async () => {
      // Arrange
      const input: GetPricingItemsInputDTO = {
        categoryId: 'cat-1',
      };
      mockRepository.findByCategory.mockResolvedValue([item1, item3]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockRepository.findByCategory).toHaveBeenCalledWith('cat-1');
    });

    it('should return empty array when no items found', async () => {
      // Arrange
      const input: GetPricingItemsInputDTO = {};
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should work without input parameters', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([item1]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('Input Validation', () => {
    it('should throw ValidationError for empty categoryId', async () => {
      const input: GetPricingItemsInputDTO = {
        categoryId: '',
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty searchTerm', async () => {
      const input: GetPricingItemsInputDTO = {
        searchTerm: '',
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for searchTerm too long', async () => {
      const input: GetPricingItemsInputDTO = {
        searchTerm: 'a'.repeat(101),
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('Sorting', () => {
    it('should sort items by category order, then by name', async () => {
      // Arrange
      const input: GetPricingItemsInputDTO = {};
      mockRepository.findAll.mockResolvedValue([item2, item3, item1]); // Unsorted

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.items).toHaveLength(3);
      // Should be sorted by category order (cat-1 first), then by name
      expect(result.items[0].id).toBe('item-1'); // cat-1, Software A
      expect(result.items[1].id).toBe('item-3'); // cat-1, Software C
      expect(result.items[2].id).toBe('item-2'); // cat-2, Hardware B
    });

    it('should sort items with same category by name', async () => {
      // Arrange
      const input: GetPricingItemsInputDTO = {};
      mockRepository.findAll.mockResolvedValue([item3, item1]); // Same category, unsorted

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.items[0].id).toBe('item-1'); // Software A
      expect(result.items[1].id).toBe('item-3'); // Software C
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      const input: GetPricingItemsInputDTO = {};
      mockRepository.findAll.mockRejectedValue(new Error('Database connection failed'));

      await expect(useCase.execute(input))
        .rejects.toThrow(ApplicationError);
    });

    it('should handle findByCategory errors gracefully', async () => {
      const input: GetPricingItemsInputDTO = {
        categoryId: 'cat-1',
      };
      mockRepository.findByCategory.mockRejectedValue(new Error('Category not found'));

      await expect(useCase.execute(input))
        .rejects.toThrow(ApplicationError);
    });
  });

  describe('DTO Mapping', () => {
    it('should return correctly formatted DTOs', async () => {
      const input: GetPricingItemsInputDTO = {};
      mockRepository.findAll.mockResolvedValue([item1]);

      const result = await useCase.execute(input);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toHaveProperty('id');
      expect(result.items[0]).toHaveProperty('name');
      expect(result.items[0]).toHaveProperty('description');
      expect(result.items[0]).toHaveProperty('basePrice');
      expect(result.items[0]).toHaveProperty('currency');
      expect(result.items[0]).toHaveProperty('category');
      expect(result.items[0].category).toHaveProperty('id');
      expect(result.items[0].category).toHaveProperty('name');
      expect(result.items[0].category).toHaveProperty('order');
    });

    it('should include total count', async () => {
      const input: GetPricingItemsInputDTO = {};
      mockRepository.findAll.mockResolvedValue([item1, item2]);

      const result = await useCase.execute(input);

      expect(result.total).toBe(2);
    });
  });
});
