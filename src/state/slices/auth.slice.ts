/**
 * Auth Slice
 * 
 * Replaces: src/features/auth/hooks/useAuth.tsx
 * Manages authentication state and actions
 */

import { StateCreator } from 'zustand';
import { AuthState, AuthActions, SignupData } from '../types';

export const createAuthSlice: StateCreator<
  any,
  [],
  [],
  AuthState & AuthActions
> = (set, get) => ({
  // Initial State
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Actions
  login: async (email: string, password: string) => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null,
    }));

    try {
      // TODO: Replace with actual AuthService call
      // const user = await AuthService.login({ email, password });
      
      // Mock implementation for now
      const mockUser = {
        id: '1',
        email,
        full_name: 'Test User',
        role: 'member' as const,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set((state) => ({
        ...state,
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      set((state) => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  },

  logout: async () => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null,
    }));

    try {
      // TODO: Replace with actual AuthService call
      // await AuthService.logout();
      
      set((state) => ({
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      set((state) => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
      throw error;
    }
  },

  signup: async (data: SignupData) => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null,
    }));

    try {
      // TODO: Replace with actual AuthService call
      // const user = await AuthService.signup(data);
      
      // Mock implementation for now
      const mockUser = {
        id: '1',
        email: data.email,
        full_name: `${data.firstName} ${data.lastName}`,
        role: 'member' as const,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set((state) => ({
        ...state,
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      set((state) => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      }));
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    set((state) => ({
      ...state,
      isLoading: true,
      error: null,
    }));

    try {
      // TODO: Replace with actual AuthService call
      // await AuthService.resetPassword(email);
      
      set((state) => ({
        ...state,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      set((state) => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      }));
      throw error;
    }
  },

  setUser: (user) => {
    set((state) => ({
      ...state,
      user,
      isAuthenticated: !!user,
      error: null,
    }));
  },

  setError: (error) => {
    set((state) => ({
      ...state,
      error,
    }));
  },

  clearError: () => {
    set((state) => ({
      ...state,
      error: null,
    }));
  },

  setLoading: (loading) => {
    set((state) => ({
      ...state,
      isLoading: loading,
    }));
  },
});
