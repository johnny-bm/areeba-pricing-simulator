import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';
import { AuthService } from '../api/authService';

// Mock the AuthService
vi.mock('../api/authService', () => ({
  AuthService: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn(),
    resetPassword: vi.fn(),
    storeUserData: vi.fn(),
    clearUserData: vi.fn(),
  },
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should set authenticated user on successful initialization', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'member',
      };

      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
      });

      expect(AuthService.storeUserData).toHaveBeenCalledWith(mockUser);
    });

    it('should handle initialization error', async () => {
      const mockError = new Error('Failed to get user');
      vi.mocked(AuthService.getCurrentUser).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe('Failed to get user');
      });
    });
  });

  describe('login', () => {
    it('should successfully login', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'member',
      };

      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(null);
      vi.mocked(AuthService.login).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(AuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(AuthService.storeUserData).toHaveBeenCalledWith(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle login error', async () => {
      const mockError = new Error('Invalid credentials');
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(null);
      vi.mocked(AuthService.login).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.error).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'member',
      };

      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(AuthService.logout).mockResolvedValue();

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await result.current.logout();

      expect(AuthService.logout).toHaveBeenCalled();
      expect(AuthService.clearUserData).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should handle logout error gracefully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'member',
      };

      const mockError = new Error('Logout failed');
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(mockUser);
      vi.mocked(AuthService.logout).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await result.current.logout();

      // Should still logout locally even if API call fails
      expect(AuthService.clearUserData).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('signup', () => {
    it('should successfully signup', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'member',
      };

      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(null);
      vi.mocked(AuthService.signup).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.signup({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        inviteCode: 'invite-123',
      });

      expect(AuthService.signup).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        inviteCode: 'invite-123',
      });

      expect(AuthService.storeUserData).toHaveBeenCalledWith(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle signup error', async () => {
      const mockError = new Error('Signup failed');
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(null);
      vi.mocked(AuthService.signup).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.signup({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          inviteCode: 'invalid-invite',
        })
      ).rejects.toThrow('Signup failed');

      expect(result.current.error).toBe('Signup failed');
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(null);
      vi.mocked(AuthService.resetPassword).mockResolvedValue();

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.resetPassword('test@example.com');

      expect(AuthService.resetPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle reset password error', async () => {
      const mockError = new Error('Reset failed');
      vi.mocked(AuthService.getCurrentUser).mockResolvedValue(null);
      vi.mocked(AuthService.resetPassword).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        result.current.resetPassword('test@example.com')
      ).rejects.toThrow('Reset failed');

      expect(result.current.error).toBe('Reset failed');
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      const mockError = new Error('Test error');
      vi.mocked(AuthService.getCurrentUser).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      result.current.clearError();

      expect(result.current.error).toBeNull();
    });
  });
});
