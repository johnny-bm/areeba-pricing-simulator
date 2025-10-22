// Performance monitoring and optimization utilities
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

interface PerformanceThreshold {
  metric: string;
  warning: number;
  error: number;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private thresholds: PerformanceThreshold[] = [
    { metric: 'page-load', warning: 2000, error: 4000 },
    { metric: 'api-response', warning: 1000, error: 3000 },
    { metric: 'render-time', warning: 100, error: 500 },
    { metric: 'memory-usage', warning: 50, error: 100 },
  ];

  /**
   * Measure performance of a function
   */
  async measureFunction<T>(
    name: string,
    fn: () => Promise<T> | T,
    context?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordMetric(name, duration, context);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`${name}-error`, duration, { ...context, error: error.message });
      throw error;
    }
  }

  /**
   * Measure API call performance
   */
  async measureApiCall<T>(
    endpoint: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    return this.measureFunction(`api-${endpoint}`, apiCall, { endpoint });
  }

  /**
   * Measure component render time
   */
  measureRender(componentName: string, renderFn: () => void) {
    const start = performance.now();
    renderFn();
    const duration = performance.now() - start;
    
    this.recordMetric(`render-${componentName}`, duration, { component: componentName });
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, context?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context,
    };

    this.metrics.push(metric);

    // Check thresholds
    const threshold = this.thresholds.find(t => t.metric === name);
    if (threshold) {
      if (value >= threshold.error) {
        // // console.error(`Performance Error: ${name} took ${value}ms (threshold: ${threshold.error}ms)`);
      } else if (value >= threshold.warning) {
        // // console.warn(`Performance Warning: ${name} took ${value}ms (threshold: ${threshold.warning}ms)`);
      }
    }

    // Limit metrics array size
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics(filter?: string): PerformanceMetric[] {
    if (filter) {
      return this.metrics.filter(m => m.name.includes(filter));
    }
    return [...this.metrics];
  }

  /**
   * Get average performance for a metric
   */
  getAverageMetric(name: string, timeWindow?: number): number {
    const now = Date.now();
    const windowStart = timeWindow ? now - timeWindow : 0;
    
    const relevantMetrics = this.metrics.filter(m => 
      m.name === name && m.timestamp >= windowStart
    );

    if (relevantMetrics.length === 0) return 0;

    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    // Group metrics by name
    const groupedMetrics = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate statistics for each metric
    Object.entries(groupedMetrics).forEach(([name, values]) => {
      const sorted = values.sort((a, b) => a - b);
      const count = values.length;
      const sum = values.reduce((acc, val) => acc + val, 0);
      const average = sum / count;
      const min = sorted[0];
      const max = sorted[count - 1];
      const median = sorted[Math.floor(count / 2)];

      summary[name] = {
        count,
        average: Math.round(average * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        median: Math.round(median * 100) / 100,
      };
    });

    return summary;
  }

  /**
   * Monitor memory usage (disabled to reduce console noise)
   */
  monitorMemory() {
    // Disabled memory monitoring to reduce console noise
    // if ('memory' in performance) {
    //   const memory = (performance as any).memory;
    //   this.recordMetric('memory-usage', memory.usedJSHeapSize / 1024 / 1024, {
    //     total: memory.totalJSHeapSize / 1024 / 1024,
    //     limit: memory.jsHeapSizeLimit / 1024 / 1024,
    //   });
    // }
  }

  /**
   * Monitor Core Web Vitals
   */
  monitorCoreWebVitals() {
    // First Contentful Paint (FCP)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            this.recordMetric('fcp', entry.startTime);
          }
        }
      });

      observer.observe({ entryTypes: ['paint'] });
    }

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('lcp', entry.startTime);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.recordMetric('cls', clsValue);
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics = [];
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      summary: this.getPerformanceSummary(),
      timestamp: Date.now(),
    }, null, 2);
  }
}

export const performanceService = new PerformanceService();

// Initialize performance monitoring
performanceService.monitorCoreWebVitals();

// Monitor memory usage every 30 seconds
setInterval(() => {
  performanceService.monitorMemory();
}, 30000);
