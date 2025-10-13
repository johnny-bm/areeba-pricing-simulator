// Error tracking and monitoring
interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: number;
  componentStack?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  action?: string;
  metric?: string;
  value?: number;
  filename?: string;
  lineno?: number;
  colno?: number;
  type?: string;
}

interface ErrorReport {
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorTrackingService {
  private isInitialized = false;
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;

  /**
   * Initialize error tracking
   */
  initialize() {
    if (this.isInitialized) return;

    // Set up global error handlers
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

    // Set up performance monitoring
    this.setupPerformanceMonitoring();

    this.isInitialized = true;
  }

  /**
   * Check if error should be ignored
   */
  private shouldIgnoreError(error: Error): boolean {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    // Ignore browser extension errors
    if (message.includes('chrome-extension://') || 
        message.includes('moz-extension://') ||
        message.includes('safari-extension://') ||
        stack.includes('chrome-extension://') ||
        stack.includes('moz-extension://') ||
        stack.includes('safari-extension://')) {
      return true;
    }
    
    // Ignore Grammarly errors
    if (message.includes('grammarly') || stack.includes('grammarly')) {
      return true;
    }
    
    // Ignore shadow DOM errors from extensions
    if (message.includes('shadow root') && message.includes('already hosts')) {
      return true;
    }
    
    // Ignore poetry.js errors (likely from extensions)
    if (stack.includes('poetry.js')) {
      return true;
    }
    
    // Ignore extension CSS loading errors
    if (message.includes('net::err_file_not_found') && 
        (message.includes('chrome-extension://') || message.includes('moz-extension://'))) {
      return true;
    }
    
    // Ignore aria-hidden accessibility warnings from extensions
    if (message.includes('blocked aria-hidden') && message.includes('descendant retained focus')) {
      return true;
    }
    
    return false;
  }

  /**
   * Track custom errors
   */
  trackError(error: Error, context: Partial<ErrorContext> = {}, severity: ErrorReport['severity'] = 'medium') {
    // Skip ignored errors
    if (this.shouldIgnoreError(error)) {
      return;
    }
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      severity,
    };

    this.addToQueue(errorReport);
  }

  /**
   * Track React errors
   */
  trackReactError(error: Error, errorInfo: any, context: Partial<ErrorContext> = {}) {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      severity: 'high',
    };

    this.addToQueue(errorReport);
  }

  /**
   * Track API errors
   */
  trackApiError(error: Error, endpoint: string, method: string, statusCode?: number) {
    this.trackError(error, {
      endpoint,
      method,
      statusCode,
    }, 'medium');
  }

  /**
   * Track authentication errors
   */
  trackAuthError(error: Error, action: string) {
    this.trackError(error, {
      action,
    }, 'high');
  }

  /**
   * Track performance errors
   */
  trackPerformanceError(error: Error, metric: string, value: number) {
    this.trackError(error, {
      metric,
      value,
    }, 'low');
  }

  /**
   * Handle global errors
   */
  private handleGlobalError(event: ErrorEvent) {
    this.trackError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    }, 'medium');
  }

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    this.trackError(new Error(event.reason), {
      type: 'unhandledrejection',
    }, 'high');
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      // TODO: Import and use web-vitals library
      // getCLS, getFID, getFCP, getLCP, getTTFB
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      // Disabled long task monitoring to reduce console noise
      // const observer = new PerformanceObserver((list) => {
      //   for (const entry of list.getEntries()) {
      //     if (entry.duration > 100) { // Tasks longer than 100ms
      //       this.trackPerformanceError(
      //         new Error('Long task detected'),
      //         'long-task',
      //         entry.duration
      //       );
      //     }
      //   }
      // });

      // observer.observe({ entryTypes: ['longtask'] });
    }
  }

  /**
   * Add error to queue
   */
  private addToQueue(errorReport: ErrorReport) {
    this.errorQueue.push(errorReport);

    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Send to error tracking service
    this.sendToService(errorReport);
  }

  /**
   * Send error to tracking service
   */
  private async sendToService(errorReport: ErrorReport) {
    if (import.meta.env.PROD) {
      try {
        // TODO: Send to your error tracking service (e.g., Sentry, LogRocket, etc.)
        // // console.log('Error sent to tracking service:', errorReport);
      } catch (error) {
        // // console.error('Failed to send error to tracking service:', error);
      }
    } else {
      // // console.error('Error Report:', errorReport);
    }
  }

  /**
   * Get error queue (for debugging)
   */
  getErrorQueue(): ErrorReport[] {
    return [...this.errorQueue];
  }

  /**
   * Clear error queue
   */
  clearErrorQueue() {
    this.errorQueue = [];
  }
}

export const errorTracking = new ErrorTrackingService();

// Initialize error tracking on import
errorTracking.initialize();
