import { useState, useEffect, useCallback } from 'react';
import { PricingService } from '../api/pricingService';
import { PricingItem, PricingFilters, PricingSortOptions } from '../types';

export function usePricingItems() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async (filters?: PricingFilters, sort?: PricingSortOptions) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await PricingService.getPricingItems(filters, sort);
      setItems(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createItem = useCallback(async (item: Omit<PricingItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newItem = await PricingService.createPricingItem(item);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<PricingItem>) => {
    try {
      const updatedItem = await PricingService.updatePricingItem(id, updates);
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await PricingService.deletePricingItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const refreshItems = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    isLoading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    refreshItems,
  };
}
