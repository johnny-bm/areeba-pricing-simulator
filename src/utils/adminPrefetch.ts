// Admin data prefetching utility to load data before navigation
import { adminCache, AdminCache } from './adminCache';
import { AdminService } from '../features/admin/api/adminService';

class AdminPrefetch {
  private prefetchPromises = new Map<string, Promise<any>>();

  /**
   * Prefetch admin stats data
   */
  async prefetchStats(): Promise<void> {
    const cacheKey = AdminCache.KEYS.ADMIN_STATS;
    
    // Don't prefetch if already cached or in progress
    if (adminCache.has(cacheKey) || this.prefetchPromises.has(cacheKey)) {
      return;
    }

    const promise = AdminService.getStats()
      .then(data => {
        adminCache.set(cacheKey, data, 5 * 60 * 1000);
        this.prefetchPromises.delete(cacheKey);
        return data;
      })
      .catch(error => {
        this.prefetchPromises.delete(cacheKey);
        throw error;
      });

    this.prefetchPromises.set(cacheKey, promise);
    await promise;
  }

  /**
   * Prefetch admin users data
   */
  async prefetchUsers(): Promise<void> {
    const cacheKey = AdminCache.KEYS.ADMIN_USERS;
    
    // Don't prefetch if already cached or in progress
    if (adminCache.has(cacheKey) || this.prefetchPromises.has(cacheKey)) {
      return;
    }

    const promise = AdminService.getUsers()
      .then(data => {
        adminCache.set(cacheKey, data, 3 * 60 * 1000);
        this.prefetchPromises.delete(cacheKey);
        return data;
      })
      .catch(error => {
        this.prefetchPromises.delete(cacheKey);
        throw error;
      });

    this.prefetchPromises.set(cacheKey, promise);
    await promise;
  }

  /**
   * Prefetch data for common admin routes
   */
  async prefetchCommonData(): Promise<void> {
    const promises = [
      this.prefetchStats(),
      this.prefetchUsers()
    ];

    // Don't wait for all to complete, just start them
    Promise.allSettled(promises).catch(error => {
      console.warn('Some admin data prefetch failed:', error);
    });
  }

  /**
   * Prefetch data based on route
   */
  async prefetchForRoute(route: string): Promise<void> {
    switch (route) {
      case 'dashboard':
        await this.prefetchStats();
        break;
      case 'users':
        await this.prefetchUsers();
        break;
      case 'simulators':
        // Simulators are already loaded in the main app
        break;
      default:
        // Prefetch common data for unknown routes
        await this.prefetchCommonData();
    }
  }

  /**
   * Clear all prefetch promises
   */
  clearPrefetchPromises(): void {
    this.prefetchPromises.clear();
  }
}

export const adminPrefetch = new AdminPrefetch();
