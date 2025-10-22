// Admin data caching utility to prevent repeated API calls
import { AdminStats } from '../types/domain';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class AdminCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Admin-specific cache keys
  static readonly KEYS = {
    ADMIN_STATS: 'admin_stats',
    ADMIN_USERS: 'admin_users',
    ADMIN_SCENARIOS: 'admin_scenarios',
    ADMIN_GUEST_SUBMISSIONS: 'admin_guest_submissions',
    ADMIN_INVITES: 'admin_invites'
  } as const;
}

export const adminCache = new AdminCache();

// Export the AdminCache class for type checking
export { AdminCache };

// Clean up expired entries every 10 minutes
setInterval(() => {
  adminCache.clearExpired();
}, 10 * 60 * 1000);
