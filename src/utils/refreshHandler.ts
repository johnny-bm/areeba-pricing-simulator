// Handle refresh issues and cache management
import { routeCache, CACHE_KEYS } from './routeCache';
import { OptimizedDataLoader } from './optimizedDataLoader';

export class RefreshHandler {
  // Clear cache on refresh to ensure fresh data
  static clearCacheOnRefresh(): void {
    // Clear all cached data except user profile
    routeCache.clearPattern('services_');
    routeCache.clearPattern('categories_');
    routeCache.clearPattern('configurations_');
    routeCache.clearPattern('simulators');
  }

  // Handle page refresh with cache invalidation
  static async handleRefresh(simulatorId?: string): Promise<void> {
    try {
      // Clear relevant cache entries
      if (simulatorId) {
        OptimizedDataLoader.clearSimulatorCache(simulatorId);
      } else {
        this.clearCacheOnRefresh();
      }

      // Force reload of critical data
      await this.reloadCriticalData(simulatorId);
    } catch (error) {
      console.error('Failed to handle refresh:', error);
      // Clear all cache as fallback
      routeCache.clear();
    }
  }

  // Reload critical data after refresh
  private static async reloadCriticalData(simulatorId?: string): Promise<void> {
    try {
      // Reload simulators
      await OptimizedDataLoader.loadSimulators({ useCache: false });
      
      // Reload simulator-specific data if provided
      if (simulatorId) {
        await OptimizedDataLoader.loadSimulatorData(simulatorId, { useCache: false });
      }
    } catch (error) {
      console.error('Failed to reload critical data:', error);
    }
  }

  // Check if data is stale and needs refresh
  static isDataStale(key: string, maxAge: number = 5 * 60 * 1000): boolean {
    const entry = routeCache.get(key);
    if (!entry) return true;
    
    return Date.now() - entry.timestamp > maxAge;
  }

  // Force refresh of specific data
  static async forceRefresh(key: string): Promise<void> {
    routeCache.clearPattern(key);
    
    // Reload based on key type
    if (key === 'simulators') {
      await OptimizedDataLoader.loadSimulators({ useCache: false });
    }
  }
}

// Auto-handle refresh on page load
if (typeof window !== 'undefined') {
  // Clear cache on page refresh
  window.addEventListener('beforeunload', () => {
    RefreshHandler.clearCacheOnRefresh();
  });

  // Handle page visibility change (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Check if data is stale and refresh if needed
      const simulatorsStale = RefreshHandler.isDataStale(CACHE_KEYS.SIMULATORS);
      if (simulatorsStale) {
        RefreshHandler.forceRefresh('simulators');
      }
    }
  });
}
