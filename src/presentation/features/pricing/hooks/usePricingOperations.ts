/**
 * Pricing Operations Hook
 * 
 * Bridge between React components and use cases
 * Provides clean interface for pricing operations
 */

import { useState, useCallback } from 'react';
import { RepositoryFactory } from '@/core/infrastructure/database/repositories/RepositoryFactory';
import { CalculatePricingUseCase } from '@/core/application/pricing/use-cases/CalculatePricingUseCase';
import { GetPricingItemsUseCase } from '@/core/application/pricing/use-cases/GetPricingItemsUseCase';
import { GetPricingItemByIdUseCase } from '@/core/application/pricing/use-cases/GetPricingItemByIdUseCase';
import type { 
  CalculatePricingInputDTO, 
  CalculatePricingOutputDTO,
  GetPricingItemsInputDTO,
  GetPricingItemsOutputDTO,
  GetPricingItemByIdInputDTO,
  GetPricingItemByIdOutputDTO,
  PricingItemDTO
} from '@/core/application/pricing/dtos/PricingDTOs';
import { ApplicationError, ValidationError, NotFoundError } from '@/core/application/pricing/errors/ApplicationError';

export interface UsePricingOperationsReturn {
  // Operations
  calculatePricing: (input: CalculatePricingInputDTO) => Promise<CalculatePricingOutputDTO | null>;
  getPricingItems: (input?: GetPricingItemsInputDTO) => Promise<PricingItemDTO[]>;
  getPricingItemById: (input: GetPricingItemByIdInputDTO) => Promise<PricingItemDTO | null>;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Utilities
  clearError: () => void;
}

export function usePricingOperations(): UsePricingOperationsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get repository instance
  const repository = RepositoryFactory.getPricingRepository();

  // Clear error utility
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Calculate pricing
  const calculatePricing = useCallback(async (
    input: CalculatePricingInputDTO
  ): Promise<CalculatePricingOutputDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const useCase = new CalculatePricingUseCase(repository);
      const result = await useCase.execute(input);
      return result;
    } catch (err) {
      let errorMessage = 'Failed to calculate pricing';
      
      if (err instanceof ValidationError) {
        errorMessage = `Validation error: ${err.message}`;
      } else if (err instanceof NotFoundError) {
        errorMessage = `Item not found: ${err.message}`;
      } else if (err instanceof ApplicationError) {
        errorMessage = `Application error: ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  // Get all pricing items
  const getPricingItems = useCallback(async (
    input: GetPricingItemsInputDTO = {}
  ): Promise<PricingItemDTO[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const useCase = new GetPricingItemsUseCase(repository);
      const result = await useCase.execute(input);
      return result.items;
    } catch (err) {
      let errorMessage = 'Failed to fetch pricing items';
      
      if (err instanceof ValidationError) {
        errorMessage = `Validation error: ${err.message}`;
      } else if (err instanceof ApplicationError) {
        errorMessage = `Application error: ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  // Get pricing item by ID
  const getPricingItemById = useCallback(async (
    input: GetPricingItemByIdInputDTO
  ): Promise<PricingItemDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const useCase = new GetPricingItemByIdUseCase(repository);
      const result = await useCase.execute(input);
      return result.item;
    } catch (err) {
      let errorMessage = 'Failed to fetch pricing item';
      
      if (err instanceof ValidationError) {
        errorMessage = `Validation error: ${err.message}`;
      } else if (err instanceof NotFoundError) {
        // Not found is not an error state for this operation
        return null;
      } else if (err instanceof ApplicationError) {
        errorMessage = `Application error: ${err.message}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  return {
    calculatePricing,
    getPricingItems,
    getPricingItemById,
    isLoading,
    error,
    clearError,
  };
}
