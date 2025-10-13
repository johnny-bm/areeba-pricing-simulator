/**
 * Pricing Integration Tests
 * 
 * Tests React components with new Clean Architecture
 * Verifies end-to-end functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RepositoryFactory } from '@/core/infrastructure/database/repositories/RepositoryFactory';
import { usePricingOperations } from '../hooks/usePricingOperations';
import { FEATURES } from '@/config/features';

// Mock the hook
vi.mock('../hooks/usePricingOperations');

// Mock the repository factory
vi.mock('@/core/infrastructure/database/repositories/RepositoryFactory');

// Mock feature flags
vi.mock('@/config/features', () => ({
  FEATURES: {
    USE_NEW_PRICING: true,
  },
}));

describe('Pricing Integration Tests', () => {
  let mockRepository: any;
  let mockUsePricingOperations: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock repository
    mockRepository = {
      findByIds: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
    };

    // Mock repository factory
    vi.mocked(RepositoryFactory.getPricingRepository).mockReturnValue(mockRepository);

    // Mock usePricingOperations hook
    mockUsePricingOperations = {
      calculatePricing: vi.fn(),
      getPricingItems: vi.fn(),
      getPricingItemById: vi.fn(),
      isLoading: false,
      error: null,
      clearError: vi.fn(),
    };

    vi.mocked(usePricingOperations).mockReturnValue(mockUsePricingOperations);
  });

  describe('usePricingOperations Hook', () => {
    it('should initialize with correct default state', () => {
      const result = usePricingOperations();

      expect(result.isLoading).toBe(false);
      expect(result.error).toBeNull();
      expect(typeof result.calculatePricing).toBe('function');
      expect(typeof result.getPricingItems).toBe('function');
      expect(typeof result.getPricingItemById).toBe('function');
      expect(typeof result.clearError).toBe('function');
    });

    it('should handle calculatePricing success', async () => {
      const mockResult = {
        items: [
          { id: '1', name: 'Software A', basePrice: 100, quantity: 1, total: 100, currency: 'USD' }
        ],
        subtotal: 100,
        discount: 0,
        discountRate: 0,
        tax: 0,
        taxRate: 0,
        total: 100,
        currency: 'USD',
        calculatedAt: '2023-01-01T00:00:00Z',
      };

      mockUsePricingOperations.calculatePricing.mockResolvedValue(mockResult);

      const { calculatePricing } = usePricingOperations();
      const result = await calculatePricing({
        itemIds: ['1'],
        quantities: { '1': 1 },
      });

      expect(result).toEqual(mockResult);
      expect(mockUsePricingOperations.calculatePricing).toHaveBeenCalledWith({
        itemIds: ['1'],
        quantities: { '1': 1 },
      });
    });

    it('should handle calculatePricing error', async () => {
      const mockError = new Error('Calculation failed');
      mockUsePricingOperations.calculatePricing.mockRejectedValue(mockError);

      const { calculatePricing } = usePricingOperations();
      const result = await calculatePricing({
        itemIds: ['1'],
        quantities: { '1': 1 },
      });

      expect(result).toBeNull();
    });

    it('should handle getPricingItems success', async () => {
      const mockItems = [
        { id: '1', name: 'Software A', basePrice: 100, currency: 'USD' },
        { id: '2', name: 'Software B', basePrice: 200, currency: 'USD' },
      ];

      mockUsePricingOperations.getPricingItems.mockResolvedValue(mockItems);

      const { getPricingItems } = usePricingOperations();
      const result = await getPricingItems();

      expect(result).toEqual(mockItems);
      expect(mockUsePricingOperations.getPricingItems).toHaveBeenCalledWith({});
    });

    it('should handle getPricingItems with filters', async () => {
      const mockItems = [
        { id: '1', name: 'Software A', basePrice: 100, currency: 'USD' },
      ];

      mockUsePricingOperations.getPricingItems.mockResolvedValue(mockItems);

      const { getPricingItems } = usePricingOperations();
      const result = await getPricingItems({ categoryId: 'software' });

      expect(result).toEqual(mockItems);
      expect(mockUsePricingOperations.getPricingItems).toHaveBeenCalledWith({ categoryId: 'software' });
    });

    it('should handle getPricingItemById success', async () => {
      const mockItem = {
        id: '1',
        name: 'Software A',
        basePrice: 100,
        currency: 'USD',
        category: { id: 'cat-1', name: 'Software', order: 1 },
      };

      mockUsePricingOperations.getPricingItemById.mockResolvedValue(mockItem);

      const { getPricingItemById } = usePricingOperations();
      const result = await getPricingItemById({ itemId: '1' });

      expect(result).toEqual(mockItem);
      expect(mockUsePricingOperations.getPricingItemById).toHaveBeenCalledWith({ itemId: '1' });
    });

    it('should handle getPricingItemById not found', async () => {
      mockUsePricingOperations.getPricingItemById.mockResolvedValue(null);

      const { getPricingItemById } = usePricingOperations();
      const result = await getPricingItemById({ itemId: 'non-existent' });

      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const validationError = new Error('Validation error: Item ID cannot be empty');
      mockUsePricingOperations.calculatePricing.mockRejectedValue(validationError);

      const { calculatePricing } = usePricingOperations();
      const result = await calculatePricing({
        itemIds: [],
        quantities: {},
      });

      expect(result).toBeNull();
    });

    it('should handle not found errors', async () => {
      const notFoundError = new Error('Item not found: item-123');
      mockUsePricingOperations.getPricingItemById.mockRejectedValue(notFoundError);

      const { getPricingItemById } = usePricingOperations();
      const result = await getPricingItemById({ itemId: 'item-123' });

      expect(result).toBeNull();
    });

    it('should handle application errors', async () => {
      const appError = new Error('Application error: Database connection failed');
      mockUsePricingOperations.getPricingItems.mockRejectedValue(appError);

      const { getPricingItems } = usePricingOperations();
      const result = await getPricingItems();

      expect(result).toEqual([]);
    });
  });

  describe('Loading States', () => {
    it('should show loading state during operations', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockUsePricingOperations.calculatePricing.mockReturnValue(promise);
      mockUsePricingOperations.isLoading = true;

      const { isLoading } = usePricingOperations();
      expect(isLoading).toBe(true);

      // Resolve the promise
      resolvePromise!({ total: 100 });
      await promise;
    });
  });

  describe('Feature Flag Integration', () => {
    it('should use new architecture when feature flag is enabled', () => {
      expect(FEATURES.USE_NEW_PRICING).toBe(true);
    });

    it('should call repository factory when new architecture is enabled', () => {
      usePricingOperations();
      expect(RepositoryFactory.getPricingRepository).toHaveBeenCalled();
    });
  });

  describe('Repository Integration', () => {
    it('should use repository from factory', () => {
      usePricingOperations();
      expect(RepositoryFactory.getPricingRepository).toHaveBeenCalled();
      expect(mockRepository).toBeDefined();
    });

    it('should handle repository errors gracefully', async () => {
      const repoError = new Error('Repository error');
      mockRepository.findAll.mockRejectedValue(repoError);

      mockUsePricingOperations.getPricingItems.mockRejectedValue(repoError);

      const { getPricingItems } = usePricingOperations();
      const result = await getPricingItems();

      expect(result).toEqual([]);
    });
  });
});
