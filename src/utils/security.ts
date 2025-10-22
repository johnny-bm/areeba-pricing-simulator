/**
 * Security utilities for input sanitization, rate limiting, and CSRF protection
 */

import DOMPurify from 'dompurify';

/**
 * Rate limiter implementation
 * Prevents abuse by limiting API calls per time window
 */
export function createRateLimiter(maxCalls: number, timeWindowMs: number) {
  const calls: number[] = [];
  
  return async function<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const recentCalls = calls.filter(time => now - time < timeWindowMs);
    
    if (recentCalls.length >= maxCalls) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    calls.push(now);
    return await fn();
  };
}

/**
 * Default rate limiters for different operations
 */
export const rateLimiters = {
  // API calls: 100 per minute
  api: createRateLimiter(100, 60 * 1000),
  
  // Authentication: 5 per minute
  auth: createRateLimiter(5, 60 * 1000),
  
  // Data mutations: 20 per minute
  mutations: createRateLimiter(20, 60 * 1000),
  
  // File uploads: 10 per minute
  uploads: createRateLimiter(10, 60 * 1000),
};

/**
 * Input sanitization utilities
 */
export const sanitize = {
  /**
   * Sanitize HTML content to prevent XSS attacks
   */
  html: (input: string): string => {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    });
  },

  /**
   * Sanitize text input (remove HTML tags and dangerous characters)
   */
  text: (input: string): string => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .trim()
      .substring(0, 1000); // Limit length
  },

  /**
   * Sanitize numeric input
   */
  number: (input: string | number): number => {
    const num = typeof input === 'string' ? parseFloat(input) : input;
    if (isNaN(num) || !isFinite(num)) return 0;
    return Math.max(0, Math.min(num, Number.MAX_SAFE_INTEGER));
  },

  /**
   * Sanitize email input
   */
  email: (input: string): string => {
    if (typeof input !== 'string') return '';
    const email = input.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : '';
  },

  /**
   * Sanitize UUID input
   */
  uuid: (input: string): string => {
    if (typeof input !== 'string') return '';
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(input) ? input : '';
  },

  /**
   * Sanitize URL input
   */
  url: (input: string): string => {
    if (typeof input !== 'string') return '';
    try {
      const url = new URL(input);
      // Only allow http and https protocols
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return url.toString();
      }
    } catch {
      // Invalid URL
    }
    return '';
  }
};

/**
 * CSRF protection utilities
 */
export const csrf = {
  /**
   * Generate a CSRF token
   */
  generateToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Validate CSRF token
   */
  validateToken: (token: string, sessionToken: string): boolean => {
    if (!token || !sessionToken) return false;
    return token === sessionToken;
  },

  /**
   * Get CSRF token from session storage
   */
  getSessionToken: (): string | null => {
    return sessionStorage.getItem('csrf_token');
  },

  /**
   * Set CSRF token in session storage
   */
  setSessionToken: (token: string): void => {
    sessionStorage.setItem('csrf_token', token);
  }
};

/**
 * Permission checking utilities
 */
export const permissions = {
  /**
   * Check if user has admin access
   */
  hasAdminAccess: (userRole: string): boolean => {
    return ['owner', 'admin'].includes(userRole?.toLowerCase());
  },

  /**
   * Check if user is owner
   */
  isOwner: (userRole: string): boolean => {
    return userRole?.toLowerCase() === 'owner';
  },

  /**
   * Check if user can modify resource
   */
  canModify: (userRole: string, resourceOwnerId?: string, userId?: string): boolean => {
    if (permissions.hasAdminAccess(userRole)) return true;
    if (resourceOwnerId && userId) return resourceOwnerId === userId;
    return false;
  },

  /**
   * Check if user can delete resource
   */
  canDelete: (userRole: string, resourceOwnerId?: string, userId?: string): boolean => {
    return permissions.isOwner(userRole) || permissions.canModify(userRole, resourceOwnerId, userId);
  }
};

/**
 * Security headers for API responses
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
};

/**
 * Input validation schemas
 */
export const validators = {
  /**
   * Validate service name
   */
  serviceName: (name: string): boolean => {
    return typeof name === 'string' && 
           name.trim().length >= 1 && 
           name.trim().length <= 100 &&
           !/<script|javascript:|data:/i.test(name);
  },

  /**
   * Validate price
   */
  price: (price: number): boolean => {
    return typeof price === 'number' && 
           price >= 0 && 
           price <= 999999.99 &&
           Number.isFinite(price);
  },

  /**
   * Validate simulator ID
   */
  simulatorId: (id: string): boolean => {
    return typeof id === 'string' && 
           sanitize.uuid(id) === id &&
           id.length === 36;
  },

  /**
   * Validate user role
   */
  userRole: (role: string): boolean => {
    return ['owner', 'admin', 'member'].includes(role?.toLowerCase());
  }
};

/**
 * Security audit logging
 */
export const audit = {
  /**
   * Log security events
   */
  logEvent: (event: string, details: Record<string, any>, severity: 'low' | 'medium' | 'high' = 'low') => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // In production, send to security monitoring service
    if (import.meta.env.PROD) {
      console.warn('Security event:', logEntry);
      // TODO: Send to security monitoring service
    } else {
      console.log('Security audit:', logEntry);
    }
  },

  /**
   * Log failed authentication attempts
   */
  logAuthFailure: (email: string, reason: string) => {
    audit.logEvent('auth_failure', { email, reason }, 'medium');
  },

  /**
   * Log rate limit violations
   */
  logRateLimit: (endpoint: string, ip?: string) => {
    audit.logEvent('rate_limit_exceeded', { endpoint, ip }, 'medium');
  },

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity: (activity: string, details: Record<string, any>) => {
    audit.logEvent('suspicious_activity', { activity, details }, 'high');
  }
};

/**
 * Secure data handling utilities
 */
export const secure = {
  /**
   * Safely parse JSON with error handling
   */
  parseJSON: <T>(json: string, fallback: T): T => {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  },

  /**
   * Safely stringify data
   */
  stringify: (data: any): string => {
    try {
      return JSON.stringify(data);
    } catch {
      return '{}';
    }
  },

  /**
   * Generate secure random string
   */
  randomString: (length: number = 32): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Hash sensitive data (client-side hashing for additional security)
   */
  hash: async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};
