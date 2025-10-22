// Optimized data loading with caching and parallel requests
import { routeCache, CACHE_KEYS } from './routeCache';
import { api } from './api';
import { SimulatorApi } from './simulatorApi';
import { PricingItem, Category } from '../types/domain';

interface DataLoaderOptions {
  useCache?: boolean;
  timeout?: number;
  retries?: number;
}

export class OptimizedDataLoader {
  private static loadingPromises = new Map<string, Promise<any>>();

  // Load simulators with caching
  static async loadSimulators(options: DataLoaderOptions = {}): Promise<any[]> {
    const { useCache = true, timeout = 10000 } = options;
    const cacheKey = CACHE_KEYS.SIMULATORS;

    // Check cache first
    if (useCache && routeCache.has(cacheKey)) {
      return routeCache.get(cacheKey);
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }
    // Create loading promise
    const loadingPromise = this.loadWithTimeout(
      () => SimulatorApi.loadSimulators(),
      timeout
    ).then(data => {
      if (useCache) {
        routeCache.set(cacheKey, data);
      }
      this.loadingPromises.delete(cacheKey);
      return data;
    }).catch(error => {
      this.loadingPromises.delete(cacheKey);
      console.error('❌ Failed to load simulators:', error);
      throw error;
    });

    this.loadingPromises.set(cacheKey, loadingPromise);
    return loadingPromise;
  }

  // Load simulator data with caching
  static async loadSimulatorData(
    simulatorId: string, 
    options: DataLoaderOptions = {}
  ): Promise<{
    services: PricingItem[];
    categories: Category[];
    configurations: any[];
    pricingTypes: any[];
    billingCycles: any[];
  }> {
    const { useCache = true, timeout = 15000 } = options;
    const servicesKey = CACHE_KEYS.SERVICES(simulatorId);
    const categoriesKey = CACHE_KEYS.CATEGORIES(simulatorId);
    const configKey = CACHE_KEYS.CONFIGURATIONS(simulatorId);
    const pricingTypesKey = 'pricing_types_global';
    const billingCyclesKey = 'billing_cycles_global';

    // Check cache for all data
    if (useCache && 
        routeCache.has(servicesKey) && 
        routeCache.has(categoriesKey) && 
        routeCache.has(configKey) &&
        routeCache.has(pricingTypesKey) &&
        routeCache.has(billingCyclesKey)) {
      return {
        services: routeCache.get(servicesKey),
        categories: routeCache.get(categoriesKey),
        configurations: routeCache.get(configKey),
        pricingTypes: routeCache.get(pricingTypesKey),
        billingCycles: routeCache.get(billingCyclesKey)
      };
    }

    // Check if already loading
    const loadingKey = `simulator_${simulatorId}`;
    if (this.loadingPromises.has(loadingKey)) {
      return this.loadingPromises.get(loadingKey);
    }
    // Load data in parallel without individual timeouts
    const promises = [
      api.loadPricingItems(simulatorId),
      api.loadCategories(simulatorId),
      api.loadConfigurations(simulatorId),
      api.loadPricingTypes(),
      api.loadPricingCycles()
    ];

    const loadingPromise = this.loadWithTimeout(
      () => Promise.all(promises),
      timeout
    ).then(([services, categories, configurations, pricingTypes, billingCycles]) => {
      // Cache the results
      if (useCache) {
        routeCache.set(servicesKey, services);
        routeCache.set(categoriesKey, categories);
        routeCache.set(configKey, configurations);
        routeCache.set(pricingTypesKey, pricingTypes);
        routeCache.set(billingCyclesKey, billingCycles);
      }
      
      this.loadingPromises.delete(loadingKey);
      return { services, categories, configurations, pricingTypes, billingCycles };
    }).catch(error => {
      this.loadingPromises.delete(loadingKey);
      console.error('❌ Failed to load simulator data:', error);
      throw error;
    });

    this.loadingPromises.set(loadingKey, loadingPromise);
    return loadingPromise;
  }

  // Load data with timeout
  private static async loadWithTimeout<T>(
    loader: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Data loading timeout after ${timeout}ms`)), timeout)
    );

    return Promise.race([loader(), timeoutPromise]);
  }

  // Clear cache for specific simulator
  static clearSimulatorCache(simulatorId: string): void {
    routeCache.clearPattern(`services_${simulatorId}`);
    routeCache.clearPattern(`categories_${simulatorId}`);
  }

  // Clear all cache
  static clearAllCache(): void {
    routeCache.clear();
  }
}
