import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../api/authService';
import { User } from '../../../types/domain';
import { LoginCredentials, SignupData, AuthState } from '../types';
import { AUTH_ERRORS } from '../constants';

export function useAuth(): AuthState & {
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

  // Initialize auth state with better error handling
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check localStorage first for faster initialization
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

        // If no stored user, try to get from server with shorter timeout
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Authentication timeout')), 5000)
        );
        
        const userPromise = AuthService.getCurrentUser();
        const user = await Promise.race([userPromise, timeoutPromise]);
        
        if (user) {
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
        // Don't set error state, just continue without auth
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await AuthService.login(credentials);
      AuthService.storeUserData(user);
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
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
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await AuthService.logout();
      AuthService.clearUserData();
      
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      // Still logout locally even if API call fails
      AuthService.clearUserData();
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: (error as Error).message,
      }));
    }
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await AuthService.signup(data);
      AuthService.storeUserData(user);
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
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
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await AuthService.resetPassword(email);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
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
