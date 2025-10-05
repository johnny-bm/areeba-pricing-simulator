import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../api/authService';
import { supabase } from '../../../utils/supabase/client';

// Mock the supabase client
vi.mock('../../../utils/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockProfile = { id: 'user-123', email: 'test@example.com', role: 'member' };
      const mockSession = { user: mockUser };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        })),
      }));

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockProfile);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw error for invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      await expect(AuthService.logout()).resolves.toBeUndefined();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error if logout fails', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: { message: 'Logout failed' },
      });

      await expect(AuthService.logout()).rejects.toThrow('Logout failed. Please try again.');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user if session exists', async () => {
      const mockUser = { id: 'user-123' };
      const mockProfile = { id: 'user-123', email: 'test@example.com', role: 'member' };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      });

      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        })),
      }));

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any);

      const result = await AuthService.getCurrentUser();

      expect(result).toEqual(mockProfile);
    });

    it('should return null if no session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await AuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('storeUserData', () => {
    it('should store user data in localStorage', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        full_name: 'Test User',
        first_name: 'Test',
        last_name: 'User',
        role: 'member',
      };

      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

      AuthService.storeUserData(mockUser);

      expect(setItemSpy).toHaveBeenCalledWith(
        'user',
        JSON.stringify({
          id: mockUser.id,
          email: mockUser.email,
          full_name: mockUser.full_name,
          first_name: mockUser.first_name,
          last_name: mockUser.last_name,
          role: mockUser.role,
        })
      );
    });
  });

  describe('getUserData', () => {
    it('should return user data from localStorage', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'member',
      };

      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(mockUser));

      const result = AuthService.getUserData();

      expect(result).toEqual(mockUser);
    });

    it('should return null if no user data', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

      const result = AuthService.getUserData();

      expect(result).toBeNull();
    });

    it('should return null if invalid JSON', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid-json');

      const result = AuthService.getUserData();

      expect(result).toBeNull();
    });
  });

  describe('clearUserData', () => {
    it('should clear user data from localStorage', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

      AuthService.clearUserData();

      expect(removeItemSpy).toHaveBeenCalledWith('user');
    });
  });
});
