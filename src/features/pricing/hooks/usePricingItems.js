import { useState, useEffect, useCallback } from 'react';
import { PricingService } from '../api/pricingService';
export function usePricingItems() {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchItems = useCallback(async (filters, sort) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await PricingService.getPricingItems(filters, sort);
            setItems(data);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const createItem = useCallback(async (item) => {
        try {
            const newItem = await PricingService.createPricingItem(item);
            setItems(prev => [...prev, newItem]);
            return newItem;
        }
        catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);
    const updateItem = useCallback(async (id, updates) => {
        try {
            const updatedItem = await PricingService.updatePricingItem(id, updates);
            setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
            return updatedItem;
        }
        catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);
    const deleteItem = useCallback(async (id) => {
        try {
            await PricingService.deletePricingItem(id);
            setItems(prev => prev.filter(item => item.id !== id));
        }
        catch (err) {
            setError(err.message);
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
