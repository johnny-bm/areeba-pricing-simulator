import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../api/adminService';
import { AdminStats } from '../types';
import { adminCache, AdminCache } from '../../../utils/adminCache';

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (forceRefresh = false) => {
    // Check cache first unless forcing refresh
    if (!forceRefresh && adminCache.has(AdminCache.KEYS.ADMIN_STATS)) {
      const cachedStats = adminCache.get<AdminStats>(AdminCache.KEYS.ADMIN_STATS);
      if (cachedStats) {
        setStats(cachedStats);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await AdminService.getStats();
      setStats(data);
      
      // Cache the results for 5 minutes
      adminCache.set(AdminCache.KEYS.ADMIN_STATS, data, 5 * 60 * 1000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshStats = useCallback(() => {
    fetchStats(true); // Force refresh
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refreshStats,
  };
}
