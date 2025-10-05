import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../api/adminService';
import { AdminUser, AdminFilters } from '../types';

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (filters?: AdminFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await AdminService.getUsers(filters);
      setUsers(data);
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
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const refreshUsers = useCallback(() => {
    fetchUsers();
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
