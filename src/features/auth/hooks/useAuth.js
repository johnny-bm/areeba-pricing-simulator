import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../api/authService';
export function useAuth() {
    const [state, setState] = useState({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });
    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const user = await AuthService.getCurrentUser();
                if (user) {
                    AuthService.storeUserData(user);
                    setState(prev => ({
                        ...prev,
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    }));
                }
                else {
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                    }));
                }
            }
            catch (error) {
                setState(prev => ({
                    ...prev,
                    error: error.message,
                    isLoading: false,
                }));
            }
        };
        initializeAuth();
    }, []);
    const login = useCallback(async (credentials) => {
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
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                error: error.message,
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
        }
        catch (error) {
            // Still logout locally even if API call fails
            AuthService.clearUserData();
            setState(prev => ({
                ...prev,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: error.message,
            }));
        }
    }, []);
    const signup = useCallback(async (data) => {
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
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                error: error.message,
                isLoading: false,
            }));
            throw error;
        }
    }, []);
    const resetPassword = useCallback(async (email) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            await AuthService.resetPassword(email);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: null,
            }));
        }
        catch (error) {
            setState(prev => ({
                ...prev,
                error: error.message,
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
