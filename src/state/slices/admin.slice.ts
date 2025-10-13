/**
 * Admin Slice
 * 
 * Manages admin state including users, stats, and admin operations
 */

import { StateCreator } from 'zustand';
import { AdminState, AdminActions, User, AdminStats } from '../types';

export const createAdminSlice: StateCreator<
  any,
  [],
  [],
  AdminState & AdminActions
> = (set, get) => ({
  // Initial State
  users: [],
  stats: null,
  isLoading: false,
  error: null,

  // Actions
  fetchUsers: async () => {
    set((state) => ({
      admin: {
        ...state.admin,
        isLoading: true,
        error: null,
      },
    }));

    try {
      // TODO: Replace with actual AdminService call
      // const users = await AdminService.getUsers();
      
      // Mock implementation for now
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@example.com',
          full_name: 'Admin User',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'user@example.com',
          full_name: 'Regular User',
          role: 'member',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      set((state) => ({
        admin: {
          ...state.admin,
          users: mockUsers,
          isLoading: false,
          error: null,
        },
      }));
    } catch (error) {
      set((state) => ({
        admin: {
          ...state.admin,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch users',
        },
      }));
      throw error;
    }
  },

  fetchStats: async () => {
    set((state) => ({
      admin: {
        ...state.admin,
        isLoading: true,
        error: null,
      },
    }));

    try {
      // TODO: Replace with actual AdminService call
      // const stats = await AdminService.getStats();
      
      // Mock implementation for now
      const mockStats: AdminStats = {
        totalUsers: 150,
        totalScenarios: 1250,
        totalGuestSubmissions: 340,
        totalRevenue: 125000,
        activeUsers: 45,
        averageScenarioValue: 2500,
      };

      set((state) => ({
        admin: {
          ...state.admin,
          stats: mockStats,
          isLoading: false,
          error: null,
        },
      }));
    } catch (error) {
      set((state) => ({
        admin: {
          ...state.admin,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch stats',
        },
      }));
      throw error;
    }
  },

  updateUser: async (userId: string, data: Partial<User>) => {
    set((state) => ({
      admin: {
        ...state.admin,
        isLoading: true,
        error: null,
      },
    }));

    try {
      // TODO: Replace with actual AdminService call
      // const updatedUser = await AdminService.updateUser(userId, data);
      
      // Mock implementation for now
      const updatedUser: User = {
        id: userId,
        email: data.email || 'updated@example.com',
        full_name: data.full_name || 'Updated User',
        role: data.role || 'member',
        is_active: data.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set((state) => ({
        admin: {
          ...state.admin,
          users: state.admin.users.map(user =>
            user.id === userId ? updatedUser : user
          ),
          isLoading: false,
          error: null,
        },
      }));
    } catch (error) {
      set((state) => ({
        admin: {
          ...state.admin,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to update user',
        },
      }));
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    set((state) => ({
      admin: {
        ...state.admin,
        isLoading: true,
        error: null,
      },
    }));

    try {
      // TODO: Replace with actual AdminService call
      // await AdminService.deleteUser(userId);
      
      set((state) => ({
        admin: {
          ...state.admin,
          users: state.admin.users.filter(user => user.id !== userId),
          isLoading: false,
          error: null,
        },
      }));
    } catch (error) {
      set((state) => ({
        admin: {
          ...state.admin,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete user',
        },
      }));
      throw error;
    }
  },

  setUsers: (users: User[]) => {
    set((state) => ({
      admin: {
        ...state.admin,
        users,
      },
    }));
  },

  setStats: (stats: AdminStats | null) => {
    set((state) => ({
      admin: {
        ...state.admin,
        stats,
      },
    }));
  },

  setLoading: (loading: boolean) => {
    set((state) => ({
      admin: {
        ...state.admin,
        isLoading: loading,
      },
    }));
  },

  setError: (error: string | null) => {
    set((state) => ({
      admin: {
        ...state.admin,
        error,
      },
    }));
  },

  reset: () => {
    set((state) => ({
      admin: {
        ...state.admin,
        users: [],
        stats: null,
        isLoading: false,
        error: null,
      },
    }));
  },
});
