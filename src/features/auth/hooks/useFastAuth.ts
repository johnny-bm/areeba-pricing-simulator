// Fast authentication hook that prioritizes speed over completeness
import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../api/authService';
import { User } from '../../../types/domain';
import { LoginCredentials, SignupData, AuthState } from '../types';
import { AUTH_ERRORS } from '../constants';
import { supabase } from '../../../utils/supabase/client';

export function useFastAuth(): AuthState & {
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

  // Fast auth initialization - prioritize localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, try to get user from localStorage (fastest)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            setState(prev => ({
              ...prev,
              user,
              isAuthenticated: true,
              isLoading: false,
            }));
            return;
          } catch (parseError) {
            console.warn('Failed to parse stored user:', parseError);
            localStorage.removeItem('user');
          }
        }

        // If no stored user, try quick session check
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Create minimal user object from session
            const minimalUser = {
              id: session.user.id,
              email: session.user.email || '',
              first_name: session.user.user_metadata?.first_name || '',
              last_name: session.user.user_metadata?.last_name || '',
              role: 'member',
              is_active: true
            };
            
            setState(prev => ({
              ...prev,
              user: minimalUser,
              isAuthenticated: true,
              isLoading: false,
            }));
            return;
          }
        } catch (sessionError) {
          console.warn('Session check failed:', sessionError);
        }

        // If all else fails, just continue without auth
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      } catch (error) {
        console.warn('Fast auth initialization failed:', error);
        setState(prev => ({
          ...prev,
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
      localStorage.removeItem('user');
      
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
