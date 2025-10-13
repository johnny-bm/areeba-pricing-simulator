/**
 * Auth Slice Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { create } from 'zustand';
import { createAuthSlice } from '../auth.slice';
import { AuthState, AuthActions } from '../../types';

type AuthStore = AuthState & AuthActions;

const createAuthStore = () => create<AuthStore>()((...args) => createAuthSlice(...args));

describe('Auth Slice', () => {
  let store: ReturnType<typeof createAuthStore>;

  beforeEach(() => {
    store = createAuthStore();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState();
      
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('Sync Actions', () => {
    it('should set user correctly', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'member' as const,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      store.getState().setUser(mockUser);
      
      const state = store.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set error correctly', () => {
      const errorMessage = 'Test error';
      store.getState().setError(errorMessage);
      
      const state = store.getState();
      expect(state.error).toBe(errorMessage);
    });

    it('should clear error correctly', () => {
      store.getState().setError('Test error');
      store.getState().clearError();
      
      const state = store.getState();
      expect(state.error).toBeNull();
    });

    it('should set loading state correctly', () => {
      store.getState().setLoading(false);
      
      const state = store.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('Async Actions', () => {
    it('should handle login success', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      await store.getState().login(email, password);
      
      const state = store.getState();
      expect(state.user).toBeTruthy();
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle logout success', async () => {
      // First login
      await store.getState().login('test@example.com', 'password123');
      
      // Then logout
      await store.getState().logout();
      
      const state = store.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('should handle signup success', async () => {
      const signupData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };
      
      await store.getState().signup(signupData);
      
      const state = store.getState();
      expect(state.user).toBeTruthy();
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should handle reset password success', async () => {
      const email = 'test@example.com';
      
      await store.getState().resetPassword(email);
      
      const state = store.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('State Immutability', () => {
    it('should not mutate original state when setting user', () => {
      const initialState = store.getState();
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'member' as const,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      store.getState().setUser(mockUser);
      
      // Original state should be unchanged
      expect(initialState.user).toBeNull();
      expect(initialState.isAuthenticated).toBe(false);
      
      // New state should be updated
      const newState = store.getState();
      expect(newState.user).toEqual(mockUser);
      expect(newState.isAuthenticated).toBe(true);
    });
  });
});
