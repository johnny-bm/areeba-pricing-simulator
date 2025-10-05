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
   * Track custom errors
   */
  trackError(error: Error, context: Partial<ErrorContext> = {}, severity: ErrorReport['severity'] = 'medium') {
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
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            this.trackPerformanceError(
              new Error('Long task detected'),
              'long-task',
              entry.duration
            );
          }
        }
      });

      observer.observe({ entryTypes: ['longtask'] });
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
    if (process.env.NODE_ENV === 'production') {
      try {
        // TODO: Send to your error tracking service (e.g., Sentry, LogRocket, etc.)
        console.log('Error sent to tracking service:', errorReport);
      } catch (error) {
        console.error('Failed to send error to tracking service:', error);
      }
    } else {
      console.error('Error Report:', errorReport);
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
