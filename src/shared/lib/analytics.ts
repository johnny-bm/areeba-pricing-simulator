// Analytics and monitoring utilities
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

interface UserProperties {
  userId?: string;
  userRole?: string;
  isGuest?: boolean;
  sessionId?: string;
}

class AnalyticsService {
  private isInitialized = false;
  private userProperties: UserProperties = {};

  /**
   * Initialize analytics service
   */
  initialize() {
    if (this.isInitialized) return;

    // Initialize analytics in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Initialize your analytics service (e.g., Google Analytics, Mixpanel, etc.)
      console.log('Analytics initialized');
    }

    this.isInitialized = true;
  }

  /**
   * Track user properties
   */
  identify(properties: UserProperties) {
    this.userProperties = { ...this.userProperties, ...properties };

    if (process.env.NODE_ENV === 'production') {
      // TODO: Send user properties to analytics service
      console.log('User identified:', properties);
    }
  }

  /**
   * Track custom events
   */
  track(event: AnalyticsEvent) {
    const eventData = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      userId: this.userProperties.userId,
      sessionId: this.userProperties.sessionId,
    };

    if (process.env.NODE_ENV === 'production') {
      // TODO: Send event to analytics service
      console.log('Event tracked:', eventData);
    } else {
      console.log('Analytics Event:', eventData);
    }
  }

  /**
   * Track page views
   */
  pageView(pageName: string, properties?: Record<string, any>) {
    this.track({
      name: 'Page View',
      properties: {
        page: pageName,
        ...properties,
      },
    });
  }

  /**
   * Track user actions
   */
  trackAction(action: string, properties?: Record<string, any>) {
    this.track({
      name: 'User Action',
      properties: {
        action,
        ...properties,
      },
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: Record<string, any>) {
    this.track({
      name: 'Error',
      properties: {
        error: error.message,
        stack: error.stack,
        context,
      },
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
    this.track({
      name: 'Performance',
      properties: {
        metric,
        value,
        ...properties,
      },
    });
  }

  /**
   * Track business metrics
   */
  trackBusiness(metric: string, value: number, properties?: Record<string, any>) {
    this.track({
      name: 'Business Metric',
      properties: {
        metric,
        value,
        ...properties,
      },
    });
  }
}

export const analytics = new AnalyticsService();

// Initialize analytics on import
analytics.initialize();
