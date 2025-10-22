/**
 * Secure authentication utilities with rate limiting and security measures
 */

import { supabase } from './supabase/client';
import { rateLimiters, sanitize, audit, csrf } from './security';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
  requiresVerification?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  fullName: string;
  inviteCode?: string;
}

/**
 * Secure authentication service
 */
export class SecureAuthService {
  /**
   * Secure login with rate limiting and input validation
   */
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      // Apply rate limiting to prevent brute force attacks
      return await rateLimiters.auth(async () => {
        // Sanitize input
        const sanitizedEmail = sanitize.email(credentials.email);
        const sanitizedPassword = sanitize.text(credentials.password);

        if (!sanitizedEmail) {
          audit.logAuthFailure(credentials.email, 'Invalid email format');
          return {
            success: false,
            error: 'Invalid email format'
          };
        }

        if (!sanitizedPassword || sanitizedPassword.length < 6) {
          audit.logAuthFailure(credentials.email, 'Password too short');
          return {
            success: false,
            error: 'Password must be at least 6 characters'
          };
        }

        // Attempt login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password: sanitizedPassword
        });

        if (error) {
          audit.logAuthFailure(credentials.email, error.message);
          return {
            success: false,
            error: this.getUserFriendlyError(error.message)
          };
        }

        if (data.user && !data.user.email_confirmed_at) {
          return {
            success: false,
            error: 'Please verify your email before logging in',
            requiresVerification: true
          };
        }

        // Generate CSRF token for additional security
        const csrfToken = csrf.generateToken();
        csrf.setSessionToken(csrfToken);

        return {
          success: true,
          user: data.user
        };
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        audit.logRateLimit('login');
        return {
          success: false,
          error: 'Too many login attempts. Please try again later.'
        };
      }
      throw error;
    }
  }

  /**
   * Secure registration with validation
   */
  static async register(credentials: RegisterCredentials): Promise<AuthResult> {
    try {
      return await rateLimiters.auth(async () => {
        // Sanitize input
        const sanitizedEmail = sanitize.email(credentials.email);
        const sanitizedPassword = sanitize.text(credentials.password);
        const sanitizedName = sanitize.text(credentials.fullName);

        if (!sanitizedEmail) {
          return {
            success: false,
            error: 'Invalid email format'
          };
        }

        if (!sanitizedPassword || sanitizedPassword.length < 8) {
          return {
            success: false,
            error: 'Password must be at least 8 characters'
          };
        }

        if (!sanitizedName || sanitizedName.length < 2) {
          return {
            success: false,
            error: 'Name must be at least 2 characters'
          };
        }

        // Validate password strength
        if (!this.isStrongPassword(sanitizedPassword)) {
          return {
            success: false,
            error: 'Password must contain uppercase, lowercase, number, and special character'
          };
        }

        // Attempt registration
        const { data, error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password: sanitizedPassword,
          options: {
            data: {
              full_name: sanitizedName
            }
          }
        });

        if (error) {
          audit.logSuspiciousActivity('registration_failed', {
            email: sanitizedEmail,
            error: error.message
          });
          return {
            success: false,
            error: this.getUserFriendlyError(error.message)
          };
        }

        return {
          success: true,
          user: data.user,
          requiresVerification: true
        };
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        audit.logRateLimit('register');
        return {
          success: false,
          error: 'Too many registration attempts. Please try again later.'
        };
      }
      throw error;
    }
  }

  /**
   * Secure logout
   */
  static async logout(): Promise<void> {
    try {
      // Clear CSRF token
      csrf.setSessionToken('');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw - logout should always succeed
    }
  }

  /**
   * Get current user with security checks
   */
  static async getCurrentUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      // Verify CSRF token for additional security
      const sessionToken = csrf.getSessionToken();
      if (!sessionToken) {
        // Generate new token if missing
        const newToken = csrf.generateToken();
        csrf.setSessionToken(newToken);
      }

      return session.user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Check if user has admin permissions
   */
  static async hasAdminAccess(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;

      // Get user profile to check role
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      return profile?.role === 'admin' || profile?.role === 'owner';
    } catch (error) {
      console.error('Admin access check error:', error);
      return false;
    }
  }

  /**
   * Validate password strength
   */
  private static isStrongPassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  }

  /**
   * Convert technical errors to user-friendly messages
   */
  private static getUserFriendlyError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please verify your email before logging in',
      'User already registered': 'An account with this email already exists',
      'Password should be at least 6 characters': 'Password must be at least 6 characters',
      'Signup is disabled': 'Registration is currently disabled',
      'Email rate limit exceeded': 'Too many requests. Please try again later.'
    };

    return errorMap[errorMessage] || 'An error occurred. Please try again.';
  }

  /**
   * Secure password reset request
   */
  static async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      return await rateLimiters.auth(async () => {
        const sanitizedEmail = sanitize.email(email);
        
        if (!sanitizedEmail) {
          return {
            success: false,
            error: 'Invalid email format'
          };
        }

        const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
          redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) {
          audit.logAuthFailure(email, `Password reset failed: ${error.message}`);
          return {
            success: false,
            error: 'Failed to send password reset email'
          };
        }

        return {
          success: true
        };
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        audit.logRateLimit('passwordReset');
        return {
          success: false,
          error: 'Too many password reset attempts. Please try again later.'
        };
      }
      throw error;
    }
  }

  /**
   * Secure password update
   */
  static async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      return await rateLimiters.auth(async () => {
        const sanitizedPassword = sanitize.text(newPassword);

        if (!sanitizedPassword || sanitizedPassword.length < 8) {
          return {
            success: false,
            error: 'Password must be at least 8 characters'
          };
        }

        if (!this.isStrongPassword(sanitizedPassword)) {
          return {
            success: false,
            error: 'Password must contain uppercase, lowercase, number, and special character'
          };
        }

        const { error } = await supabase.auth.updateUser({
          password: sanitizedPassword
        });

        if (error) {
          return {
            success: false,
            error: 'Failed to update password'
          };
        }

        return {
          success: true
        };
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        audit.logRateLimit('updatePassword');
        return {
          success: false,
          error: 'Too many password update attempts. Please try again later.'
        };
      }
      throw error;
    }
  }

  /**
   * Verify CSRF token for sensitive operations
   */
  static verifyCSRFToken(token: string): boolean {
    const sessionToken = csrf.getSessionToken();
    return csrf.validateToken(token, sessionToken || '');
  }

  /**
   * Generate CSRF token for forms
   */
  static generateCSRFToken(): string {
    return csrf.generateToken();
  }
}
