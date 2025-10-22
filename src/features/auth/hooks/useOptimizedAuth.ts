// Optimized authentication hook with caching and faster initialization
import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../api/authService';
import { User } from '../../../types/domain';
import { LoginCredentials, SignupData, AuthState } from '../types';
import { AUTH_ERRORS } from '../constants';
import { routeCache, CACHE_KEYS } from '../../../utils/routeCache';

export function useOptimizedAuth(): AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
} {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state with caching
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check cache first for faster initialization
        const cachedUser = routeCache.get<User>(CACHE_KEYS.USER_PROFILE);
        if (cachedUser) {
          setState(prev => ({
            ...prev,
            user: cachedUser,
            isAuthenticated: true,
            isLoading: false,
          }));
          return;
        }

        // Reduced timeout for faster failure detection
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Authentication timeout')), 5000)
        );
        
        const userPromise = AuthService.getCurrentUser();
        const user = await Promise.race([userPromise, timeoutPromise]);
        
        if (user) {
          // Cache user data for faster subsequent loads
          routeCache.set(CACHE_KEYS.USER_PROFILE, user, 10 * 60 * 1000); // 10 minutes
          AuthService.storeUserData(user);
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.warn('Auth initialization failed:', error);
        setState(prev => ({
          ...prev,
          error: (error as Error).message,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const user = await AuthService.login(credentials);
      
      // Cache user data
      routeCache.set(CACHE_KEYS.USER_PROFILE, user, 10 * 60 * 1000);
      AuthService.storeUserData(user);
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: (error as Error).message,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
      
      // Clear all caches
      routeCache.clearAllCache();
      
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Logout error:', error);
      // Clear state even if logout fails
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const user = await AuthService.signup(data);
      
      // Cache user data
      routeCache.set(CACHE_KEYS.USER_PROFILE, user, 10 * 60 * 1000);
      AuthService.storeUserData(user);
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: (error as Error).message,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await AuthService.resetPassword(email);
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: (error as Error).message,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    logout,
    signup,
    resetPassword,
    clearError,
  };
}
