import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../api/adminService';
import { AdminUser, AdminFilters } from '../types';
import { adminCache, AdminCache } from '../../../utils/adminCache';

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (filters?: AdminFilters, forceRefresh = false) => {
    // Check cache first unless forcing refresh
    if (!forceRefresh && adminCache.has(AdminCache.KEYS.ADMIN_USERS)) {
      const cachedUsers = adminCache.get<AdminUser[]>(AdminCache.KEYS.ADMIN_USERS);
      if (cachedUsers) {
        setUsers(cachedUsers);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await AdminService.getUsers(filters);
      setUsers(data);
      
      // Cache the results for 3 minutes
      adminCache.set(AdminCache.KEYS.ADMIN_USERS, data, 3 * 60 * 1000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<AdminUser>) => {
    try {
      const updatedUser = await AdminService.updateUser(id, updates);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      
      // Update cache
      const cachedUsers = adminCache.get<AdminUser[]>(AdminCache.KEYS.ADMIN_USERS);
      if (cachedUsers) {
        const updatedCache = cachedUsers.map(user => user.id === id ? updatedUser : user);
        adminCache.set(AdminCache.KEYS.ADMIN_USERS, updatedCache, 3 * 60 * 1000);
      }
      
      return updatedUser;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await AdminService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      
      // Update cache
      const cachedUsers = adminCache.get<AdminUser[]>(AdminCache.KEYS.ADMIN_USERS);
      if (cachedUsers) {
        const updatedCache = cachedUsers.filter(user => user.id !== id);
        adminCache.set(AdminCache.KEYS.ADMIN_USERS, updatedCache, 3 * 60 * 1000);
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const refreshUsers = useCallback(() => {
    fetchUsers(undefined, true); // Force refresh
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUser,
    deleteUser,
    refreshUsers,
  };
}
