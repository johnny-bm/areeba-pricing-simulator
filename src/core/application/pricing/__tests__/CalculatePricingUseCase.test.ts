/**
 * CalculatePricingUseCase Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CalculatePricingUseCase } from '../use-cases/CalculatePricingUseCase';
import { IPricingRepository } from '../../../domain/pricing/repositories/IPricingRepository';
import { PricingItem } from '../../../domain/pricing/entities/PricingItem';
import { Category } from '../../../domain/pricing/entities/Category';
import { Money } from '../../../domain/pricing/value-objects/Money';
import { CalculatePricingInputDTO } from '../dtos/PricingDTOs';
import { ValidationError, NotFoundError, ApplicationError } from '../errors/ApplicationError';

describe('CalculatePricingUseCase', () => {
  let useCase: CalculatePricingUseCase;
  let mockRepository: any;

  // Test data
  const category = new Category('cat-1', 'Software', 'Software products', 1);
  const basePrice = new Money(100, 'USD');
  const item1 = new PricingItem('item-1', 'Software A', 'Description A', basePrice, category, 1);
  const item2 = new PricingItem('item-2', 'Software B', 'Description B', basePrice, category, 1);

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
    useCase = new CalculatePricingUseCase(mockRepository);
  });

  describe('Happy Path', () => {
    it('should calculate pricing with items and discount', async () => {
      // Arrange
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1', 'item-2'],
        quantities: { 'item-1': 2, 'item-2': 3 },
        discountCode: 'SAVE10',
        taxRate: 8.5,
      };
      mockRepository.findByIds.mockResolvedValue([item1, item2]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result).toHaveProperty('subtotal');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('items');
      expect(result.items).toHaveLength(2);
      expect(result.currency).toBe('USD');
      expect(result.calculatedAt).toBeDefined();
      expect(mockRepository.findByIds).toHaveBeenCalledWith(['item-1', 'item-2']);
    });

    it('should calculate pricing without discount', async () => {
      // Arrange
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 1 },
      };
      mockRepository.findByIds.mockResolvedValue([item1]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.subtotal).toBe(100);
      expect(result.discount).toBe(0);
      expect(result.discountRate).toBe(0);
    });

    it('should calculate pricing with tax only', async () => {
      // Arrange
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 1 },
        taxRate: 10,
      };
      mockRepository.findByIds.mockResolvedValue([item1]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.taxRate).toBe(10);
      expect(result.tax).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    it('should throw ValidationError for empty itemIds', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: [],
        quantities: {},
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty item ID', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1', ''],
        quantities: {},
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid quantities', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 0 },
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for excessive quantities', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 10001 },
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for non-integer quantities', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 1.5 },
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid tax rate', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 1 },
        taxRate: 150,
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for negative tax rate', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 1 },
        taxRate: -10,
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty discount code', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 1 },
        discountCode: '',
      };

      await expect(useCase.execute(input))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('Business Logic', () => {
    it('should throw NotFoundError when items not found', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 1 },
      };
      mockRepository.findByIds.mockResolvedValue([]);

      await expect(useCase.execute(input))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when some items not found', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1', 'item-2'],
        quantities: { 'item-1': 1, 'item-2': 1 },
      };
      mockRepository.findByIds.mockResolvedValue([item1]); // Only item1 found

      await expect(useCase.execute(input))
        .rejects.toThrow(NotFoundError);
    });

    it('should call repository with correct itemIds', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1', 'item-2'],
        quantities: { 'item-1': 1, 'item-2': 1 },
      };
      mockRepository.findByIds.mockResolvedValue([item1, item2]);

      await useCase.execute(input);

      expect(mockRepository.findByIds).toHaveBeenCalledWith(['item-1', 'item-2']);
    });

    it('should handle repository errors gracefully', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 1 },
      };
      mockRepository.findByIds.mockRejectedValue(new Error('Database connection failed'));

      await expect(useCase.execute(input))
        .rejects.toThrow(ApplicationError);
    });
  });

  describe('DTO Mapping', () => {
    it('should return correctly formatted DTO', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 2 },
      };
      mockRepository.findByIds.mockResolvedValue([item1]);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('subtotal');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('discount');
      expect(result).toHaveProperty('tax');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('calculatedAt');
      expect(result.items).toBeInstanceOf(Array);
      expect(result.items[0]).toHaveProperty('id');
      expect(result.items[0]).toHaveProperty('name');
      expect(result.items[0]).toHaveProperty('basePrice');
      expect(result.items[0]).toHaveProperty('quantity');
      expect(result.items[0]).toHaveProperty('total');
    });

    it('should include calculatedAt timestamp', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 1 },
      };
      mockRepository.findByIds.mockResolvedValue([item1]);

      const result = await useCase.execute(input);

      expect(result.calculatedAt).toBeDefined();
      expect(new Date(result.calculatedAt)).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item correctly', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: { 'item-1': 1 },
      };
      mockRepository.findByIds.mockResolvedValue([item1]);

      const result = await useCase.execute(input);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('item-1');
    });

    it('should handle multiple items with different quantities', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1', 'item-2'],
        quantities: { 'item-1': 2, 'item-2': 3 },
      };
      mockRepository.findByIds.mockResolvedValue([item1, item2]);

      const result = await useCase.execute(input);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].quantity).toBe(2);
      expect(result.items[1].quantity).toBe(3);
    });

    it('should default to quantity 1 when not specified', async () => {
      const input: CalculatePricingInputDTO = {
        itemIds: ['item-1'],
        quantities: {},
      };
      mockRepository.findByIds.mockResolvedValue([item1]);

      const result = await useCase.execute(input);

      expect(result.items[0].quantity).toBe(1);
    });
  });
});
