class ErrorTrackingService {
    constructor() {
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "errorQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "maxQueueSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 50
        });
    }
    /**
     * Initialize error tracking
     */
    initialize() {
        if (this.isInitialized)
            return;
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
    trackError(error, context = {}, severity = 'medium') {
        const errorReport = {
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
    trackReactError(error, errorInfo, context = {}) {
        const errorReport = {
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
    trackApiError(error, endpoint, method, statusCode) {
        this.trackError(error, {
            endpoint,
            method,
            statusCode,
        }, 'medium');
    }
    /**
     * Track authentication errors
     */
    trackAuthError(error, action) {
        this.trackError(error, {
            action,
        }, 'high');
    }
    /**
     * Track performance errors
     */
    trackPerformanceError(error, metric, value) {
        this.trackError(error, {
            metric,
            value,
        }, 'low');
    }
    /**
     * Handle global errors
     */
    handleGlobalError(event) {
        this.trackError(new Error(event.message), {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        }, 'medium');
    }
    /**
     * Handle unhandled promise rejections
     */
    handleUnhandledRejection(event) {
        this.trackError(new Error(event.reason), {
            type: 'unhandledrejection',
        }, 'high');
    }
    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
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
                        this.trackPerformanceError(new Error('Long task detected'), 'long-task', entry.duration);
                    }
                }
            });
            observer.observe({ entryTypes: ['longtask'] });
        }
    }
    /**
     * Add error to queue
     */
    addToQueue(errorReport) {
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
    async sendToService(errorReport) {
        if (process.env.NODE_ENV === 'production') {
            try {
                // TODO: Send to your error tracking service (e.g., Sentry, LogRocket, etc.)
                console.log('Error sent to tracking service:', errorReport);
            }
            catch (error) {
                console.error('Failed to send error to tracking service:', error);
            }
        }
        else {
            console.error('Error Report:', errorReport);
        }
    }
    /**
     * Get error queue (for debugging)
     */
    getErrorQueue() {
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
