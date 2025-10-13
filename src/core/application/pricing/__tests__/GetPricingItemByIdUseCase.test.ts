/**
 * GetPricingItemByIdUseCase Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetPricingItemByIdUseCase } from '../use-cases/GetPricingItemByIdUseCase';
import { IPricingRepository } from '../../../domain/pricing/repositories/IPricingRepository';
import { PricingItem } from '../../../domain/pricing/entities/PricingItem';
import { Category } from '../../../domain/pricing/entities/Category';
import { Money } from '../../../domain/pricing/value-objects/Money';
import { GetPricingItemByIdInputDTO } from '../dtos/PricingDTOs';
import { ValidationError, ApplicationError } from '../errors/ApplicationError';

describe('GetPricingItemByIdUseCase', () => {
  let useCase: GetPricingItemByIdUseCase;
  let mockRepository: any;

  // Test data
  const category = new Category('cat-1', 'Software', 'Software products', 1);
  const basePrice = new Money(100, 'USD');
  const item = new PricingItem('item-1', 'Software A', 'Description A', basePrice, category, 1);

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
    useCase = new GetPricingItemByIdUseCase(mockRepository);
  });

  describe('Happy Path', () => {
    it('should retrieve item when found', async () => {
      // Arrange
      const input: GetPricingItemByIdInputDTO = {
        itemId: 'item-1',
      };
      mockRepository.findById.mockResolvedValue(item);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.item).toBeDefined();
      expect(result.item?.id).toBe('item-1');
      expect(result.item?.name).toBe('Software A');
      expect(mockRepository.findById).toHaveBeenCalledWith('item-1');
    });

    it('should return null when item not found', async () => {
      // Arrange
      const input: GetPricingItemByIdInputDTO = {
        itemId: 'non-existent',
      };
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.item).toBeNull();
      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('Input Validation', () => {
    it('should throw ValidationError for empty itemId', async () => {
      const input: GetPricingItemByIdInputDTO = {
        itemId: '',
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for whitespace-only itemId', async () => {
      const input: GetPricingItemByIdInputDTO = {
        itemId: '   ',
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for itemId too long', async () => {
      const input: GetPricingItemByIdInputDTO = {
        itemId: 'a'.repeat(51),
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      const input: GetPricingItemByIdInputDTO = {
        itemId: 'item-1',
      };
      mockRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      await expect(useCase.execute(input))
        .rejects.toThrow(ApplicationError);
    });

    it('should wrap unknown errors in ApplicationError', async () => {
      const input: GetPricingItemByIdInputDTO = {
        itemId: 'item-1',
      };
      mockRepository.findById.mockRejectedValue('Unknown error type');

      await expect(useCase.execute(input))
        .rejects.toThrow(ApplicationError);
    });
  });

  describe('DTO Mapping', () => {
    it('should return correctly formatted DTO when item found', async () => {
      const input: GetPricingItemByIdInputDTO = {
        itemId: 'item-1',
      };
      mockRepository.findById.mockResolvedValue(item);

      const result = await useCase.execute(input);

      expect(result.item).toBeDefined();
      expect(result.item).toHaveProperty('id');
      expect(result.item).toHaveProperty('name');
      expect(result.item).toHaveProperty('description');
      expect(result.item).toHaveProperty('basePrice');
      expect(result.item).toHaveProperty('currency');
      expect(result.item).toHaveProperty('category');
      expect(result.item?.category).toHaveProperty('id');
      expect(result.item?.category).toHaveProperty('name');
      expect(result.item?.category).toHaveProperty('order');
    });

    it('should return null when item not found', async () => {
      const input: GetPricingItemByIdInputDTO = {
        itemId: 'non-existent',
      };
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(input);

      expect(result.item).toBeNull();
    });
  });

  describe('Repository Interaction', () => {
    it('should call repository with correct itemId', async () => {
      const input: GetPricingItemByIdInputDTO = {
        itemId: 'item-1',
      };
      mockRepository.findById.mockResolvedValue(item);

      await useCase.execute(input);

      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockRepository.findById).toHaveBeenCalledWith('item-1');
    });

    it('should not call other repository methods', async () => {
      const input: GetPricingItemByIdInputDTO = {
        itemId: 'item-1',
      };
      mockRepository.findById.mockResolvedValue(item);

      await useCase.execute(input);

      expect(mockRepository.findAll).not.toHaveBeenCalled();
      expect(mockRepository.findByCategory).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
