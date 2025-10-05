// Security utilities and input validation
import { z } from 'zod';

// Input sanitization
export class SecurityService {
  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .trim();
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   */
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    return {
      isValid: score >= 4,
      score,
      feedback,
    };
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check for SQL injection patterns
   */
  static detectSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
      /(\b(OR|AND)\s+['"]\s*LIKE\s*['"])/i,
      /(\b(OR|AND)\s+['"]\s*IN\s*\()/i,
      /(\b(OR|AND)\s+['"]\s*BETWEEN\s+)/i,
      /(\b(OR|AND)\s+['"]\s*IS\s+NULL)/i,
      /(\b(OR|AND)\s+['"]\s*IS\s+NOT\s+NULL)/i,
      /(\b(OR|AND)\s+['"]\s*EXISTS\s*\()/i,
      /(\b(OR|AND)\s+['"]\s*NOT\s+EXISTS\s*\()/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check for XSS patterns
   */
  static detectXss(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<applet[^>]*>.*?<\/applet>/gi,
      /<form[^>]*>.*?<\/form>/gi,
      /<input[^>]*>.*?<\/input>/gi,
      /<textarea[^>]*>.*?<\/textarea>/gi,
      /<select[^>]*>.*?<\/select>/gi,
      /<option[^>]*>.*?<\/option>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<meta[^>]*>.*?<\/meta>/gi,
      /<style[^>]*>.*?<\/style>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<base[^>]*>.*?<\/base>/gi,
      /<title[^>]*>.*?<\/title>/gi,
      /<body[^>]*>.*?<\/body>/gi,
      /<html[^>]*>.*?<\/html>/gi,
      /<head[^>]*>.*?<\/head>/gi,
      /<div[^>]*>.*?<\/div>/gi,
      /<span[^>]*>.*?<\/span>/gi,
      /<p[^>]*>.*?<\/p>/gi,
      /<a[^>]*>.*?<\/a>/gi,
      /<img[^>]*>.*?<\/img>/gi,
      /<video[^>]*>.*?<\/video>/gi,
      /<audio[^>]*>.*?<\/audio>/gi,
      /<source[^>]*>.*?<\/source>/gi,
      /<track[^>]*>.*?<\/track>/gi,
      /<canvas[^>]*>.*?<\/canvas>/gi,
      /<svg[^>]*>.*?<\/svg>/gi,
      /<math[^>]*>.*?<\/math>/gi,
      /<table[^>]*>.*?<\/table>/gi,
      /<tr[^>]*>.*?<\/tr>/gi,
      /<td[^>]*>.*?<\/td>/gi,
      /<th[^>]*>.*?<\/th>/gi,
      /<thead[^>]*>.*?<\/thead>/gi,
      /<tbody[^>]*>.*?<\/tbody>/gi,
      /<tfoot[^>]*>.*?<\/tfoot>/gi,
      /<col[^>]*>.*?<\/col>/gi,
      /<colgroup[^>]*>.*?<\/colgroup>/gi,
      /<caption[^>]*>.*?<\/caption>/gi,
      /<ul[^>]*>.*?<\/ul>/gi,
      /<ol[^>]*>.*?<\/ol>/gi,
      /<li[^>]*>.*?<\/li>/gi,
      /<dl[^>]*>.*?<\/dl>/gi,
      /<dt[^>]*>.*?<\/dt>/gi,
      /<dd[^>]*>.*?<\/dd>/gi,
      /<menu[^>]*>.*?<\/menu>/gi,
      /<menuitem[^>]*>.*?<\/menuitem>/gi,
      /<details[^>]*>.*?<\/details>/gi,
      /<summary[^>]*>.*?<\/summary>/gi,
      /<dialog[^>]*>.*?<\/dialog>/gi,
      /<fieldset[^>]*>.*?<\/fieldset>/gi,
      /<legend[^>]*>.*?<\/legend>/gi,
      /<label[^>]*>.*?<\/label>/gi,
      /<button[^>]*>.*?<\/button>/gi,
      /<output[^>]*>.*?<\/output>/gi,
      /<progress[^>]*>.*?<\/progress>/gi,
      /<meter[^>]*>.*?<\/meter>/gi,
      /<datalist[^>]*>.*?<\/datalist>/gi,
      /<optgroup[^>]*>.*?<\/optgroup>/gi,
      /<keygen[^>]*>.*?<\/keygen>/gi,
      /<command[^>]*>.*?<\/command>/gi,
      /<menu[^>]*>.*?<\/menu>/gi,
      /<menuitem[^>]*>.*?<\/menuitem>/gi,
      /<details[^>]*>.*?<\/details>/gi,
      /<summary[^>]*>.*?<\/summary>/gi,
      /<dialog[^>]*>.*?<\/dialog>/gi,
      /<fieldset[^>]*>.*?<\/fieldset>/gi,
      /<legend[^>]*>.*?<\/legend>/gi,
      /<label[^>]*>.*?<\/label>/gi,
      /<button[^>]*>.*?<\/button>/gi,
      /<output[^>]*>.*?<\/output>/gi,
      /<progress[^>]*>.*?<\/progress>/gi,
      /<meter[^>]*>.*?<\/meter>/gi,
      /<datalist[^>]*>.*?<\/datalist>/gi,
      /<optgroup[^>]*>.*?<\/optgroup>/gi,
      /<keygen[^>]*>.*?<\/keygen>/gi,
      /<command[^>]*>.*?<\/command>/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Rate limiting check
   */
  static checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing entries for this key
    const entries = JSON.parse(localStorage.getItem(`rate_limit_${key}`) || '[]');
    
    // Filter entries within the time window
    const validEntries = entries.filter((timestamp: number) => timestamp > windowStart);
    
    // Check if limit is exceeded
    if (validEntries.length >= limit) {
      return false;
    }
    
    // Add current timestamp
    validEntries.push(now);
    
    // Store updated entries
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify(validEntries));
    
    return true;
  }

  /**
   * Generate secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      // Fallback for older browsers
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    
    return result;
  }

  /**
   * Hash string (simple hash for non-cryptographic purposes)
   */
  static hashString(input: string): string {
    let hash = 0;
    if (input.length === 0) return hash.toString();
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }
}

// Zod schemas for validation
export const securitySchemas = {
  email: z.string().email().min(1).max(255),
  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/),
  company: z.string().min(1).max(200),
  url: z.string().url(),
  id: z.string().uuid(),
  positiveNumber: z.number().positive(),
  nonEmptyString: z.string().min(1),
  safeHtml: z.string().transform((val) => SecurityService.sanitizeHtml(val)),
  safeInput: z.string().transform((val) => SecurityService.sanitizeInput(val)),
};

export default SecurityService;
