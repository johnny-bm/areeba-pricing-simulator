/**
 * Security middleware for API routes and sensitive operations
 */

import { rateLimiters, sanitize, audit, permissions } from './security';

export interface SecurityContext {
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SecurityConfig {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimit?: 'api' | 'auth' | 'mutations' | 'uploads';
  sanitizeInput?: boolean;
  logActivity?: boolean;
}

/**
 * Security middleware factory
 */
export function createSecurityMiddleware(config: SecurityConfig) {
  return async function securityMiddleware<T>(
    operation: () => Promise<T>,
    context: SecurityContext = {}
  ): Promise<T> {
    try {
      // Apply rate limiting if specified
      if (config.rateLimit) {
        const rateLimiter = rateLimiters[config.rateLimit];
        return await rateLimiter(async () => {
          return await executeWithSecurity(operation, config, context);
        });
      }

      return await executeWithSecurity(operation, config, context);
    } catch (error) {
      // Log security violations
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        audit.logRateLimit(operation.name || 'unknown_operation');
      }
      
      throw error;
    }
  };
}

/**
 * Execute operation with security checks
 */
async function executeWithSecurity<T>(
  operation: () => Promise<T>,
  config: SecurityConfig,
  context: SecurityContext
): Promise<T> {
  // Authentication check
  if (config.requireAuth && !context.userId) {
    audit.logSuspiciousActivity('unauthorized_access', {
      operation: operation.name || 'unknown',
      context
    });
    throw new Error('Authentication required');
  }

  // Admin permission check
  if (config.requireAdmin && !permissions.hasAdminAccess(context.userRole || '')) {
    audit.logSuspiciousActivity('insufficient_permissions', {
      operation: operation.name || 'unknown',
      userId: context.userId,
      userRole: context.userRole
    });
    throw new Error('Admin access required');
  }

  // Log activity if configured
  if (config.logActivity) {
    audit.logEvent('api_operation', {
      operation: operation.name || 'unknown',
      userId: context.userId,
      userRole: context.userRole,
      timestamp: new Date().toISOString()
    });
  }

  return await operation();
}

/**
 * Input sanitization middleware
 */
export function sanitizeInput<T extends Record<string, any>>(
  input: T,
  fields: (keyof T)[]
): T {
  const sanitized = { ...input };

  for (const field of fields) {
    if (field in sanitized && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitize.text(sanitized[field] as string) as T[keyof T];
    }
  }

  return sanitized;
}

/**
 * Permission-based access control
 */
export function requirePermission(requiredRole: 'admin' | 'owner' | 'member') {
  return function permissionMiddleware<T>(
    operation: () => Promise<T>,
    context: SecurityContext
  ): Promise<T> {
    const userRole = context.userRole || 'member';
    
    const roleHierarchy = {
      member: 1,
      admin: 2,
      owner: 3
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      audit.logSuspiciousActivity('insufficient_permissions', {
        operation: operation.name || 'unknown',
        userId: context.userId,
        userRole,
        requiredRole
      });
      throw new Error(`Insufficient permissions. Required: ${requiredRole}`);
    }

    return operation();
  };
}

/**
 * CSRF protection middleware
 */
export function requireCSRF(csrfToken: string) {
  return function csrfMiddleware<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    // CSRF token validation would be implemented here
    // For now, we'll just log the attempt
    audit.logEvent('csrf_validation', {
      token: csrfToken ? 'provided' : 'missing',
      timestamp: new Date().toISOString()
    });

    return operation();
  };
}

/**
 * Audit logging middleware
 */
export function auditOperation(operationName: string, details?: Record<string, any>) {
  return function auditMiddleware<T>(
    operation: () => Promise<T>,
    context: SecurityContext
  ): Promise<T> {
    const startTime = Date.now();
    
    return operation().then(
      (result) => {
        audit.logEvent('operation_success', {
          operation: operationName,
          duration: Date.now() - startTime,
          userId: context.userId,
          details
        });
        return result;
      },
      (error) => {
        audit.logEvent('operation_failure', {
          operation: operationName,
          duration: Date.now() - startTime,
          userId: context.userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          details
        });
        throw error;
      }
    );
  };
}

/**
 * Common security configurations
 */
export const securityConfigs = {
  // Public API operations
  public: {
    requireAuth: false,
    rateLimit: 'api' as const,
    sanitizeInput: true,
    logActivity: true
  },

  // Authenticated user operations
  authenticated: {
    requireAuth: true,
    rateLimit: 'api' as const,
    sanitizeInput: true,
    logActivity: true
  },

  // Admin operations
  admin: {
    requireAuth: true,
    requireAdmin: true,
    rateLimit: 'mutations' as const,
    sanitizeInput: true,
    logActivity: true
  },

  // Authentication operations
  auth: {
    requireAuth: false,
    rateLimit: 'auth' as const,
    sanitizeInput: true,
    logActivity: true
  },

  // File upload operations
  upload: {
    requireAuth: true,
    rateLimit: 'uploads' as const,
    sanitizeInput: true,
    logActivity: true
  }
} as const;

/**
 * Pre-configured security middleware
 */
export const secureApi = {
  public: createSecurityMiddleware(securityConfigs.public),
  authenticated: createSecurityMiddleware(securityConfigs.authenticated),
  admin: createSecurityMiddleware(securityConfigs.admin),
  auth: createSecurityMiddleware(securityConfigs.auth),
  upload: createSecurityMiddleware(securityConfigs.upload)
};
