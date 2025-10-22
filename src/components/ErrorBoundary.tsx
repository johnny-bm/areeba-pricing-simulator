/**
 * Comprehensive Error Boundary Component
 * Provides error handling, logging, and recovery mechanisms
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  level?: 'page' | 'component' | 'feature';
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    const { errorId } = this.state;

    // Log error details
    console.error('Error Boundary caught an error:', {
      error,
      errorInfo,
      errorId,
      level,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo, errorId);
    }

    // Log to external service in production
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo, errorId);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary if resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => 
        key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset on any prop change if enabled
    if (hasError && resetOnPropsChange) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService = async (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    try {
      // In a real application, you would send this to your error tracking service
      // For now, we'll just log it
      console.log('Error logged to service:', {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
    });
  };

  private handleRetry = () => {
    const { retryCount } = this.state;
    const newRetryCount = retryCount + 1;

    this.setState({ retryCount: newRetryCount });

    // Clear error state after a short delay
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 100);
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorId } = this.state;
    const bugReportUrl = `mailto:support@areeba.com?subject=Bug Report - ${errorId}&body=Error: ${error?.message}\n\nError ID: ${errorId}\n\nPlease describe what you were doing when this error occurred.`;
    window.open(bugReportUrl);
  };

  render() {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state;
    const { children, fallback, level = 'component' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Render appropriate error UI based on level
      return this.renderErrorUI(error, errorInfo, errorId, retryCount, level);
    }

    return children;
  }

  private renderErrorUI = (
    error: Error | null,
    errorInfo: ErrorInfo | null,
    errorId: string,
    retryCount: number,
    level: string
  ) => {
    const isPageLevel = level === 'page';
    const isFeatureLevel = level === 'feature';

    if (isPageLevel) {
      return this.renderPageError(error, errorId, retryCount);
    }

    if (isFeatureLevel) {
      return this.renderFeatureError(error, errorId, retryCount);
    }

    return this.renderComponentError(error, errorId, retryCount);
  };

  private renderPageError = (error: Error | null, errorId: string, retryCount: number) => (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We're sorry, but something unexpected happened. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertDescription>
              Error ID: {errorId}
            </AlertDescription>
          </Alert>
          
          {error && (
            <div className="rounded-md bg-muted p-4">
              <h4 className="font-medium text-sm mb-2">Error Details:</h4>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={this.handleRetry} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
            <Button onClick={this.handleReload} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
          </div>

          <div className="text-center">
            <Button onClick={this.handleReportBug} variant="link" size="sm">
              Report this issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  private renderFeatureError = (error: Error | null, errorId: string, retryCount: number) => (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center text-destructive">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Feature Error
        </CardTitle>
        <CardDescription>
          This feature is temporarily unavailable. Error ID: {errorId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button onClick={this.handleRetry} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
          <Button onClick={this.handleReportBug} variant="outline" size="sm">
            Report Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  private renderComponentError = (error: Error | null, errorId: string, retryCount: number) => (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
      <div className="flex items-start">
        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 mr-2" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-destructive">Component Error</h4>
          <p className="text-sm text-muted-foreground mt-1">
            This component encountered an error. Error ID: {errorId}
          </p>
          <div className="mt-2">
            <Button onClick={this.handleRetry} size="sm" variant="outline">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Higher-order component for easy error boundary wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error boundary context
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: string) => {
    console.error('Manual error handling:', error, errorInfo);
    
    // In a real application, you would send this to your error tracking service
    if (import.meta.env.PROD) {
      // Send to error tracking service
      console.log('Error sent to tracking service:', { error, errorInfo });
    }
  };

  return { handleError };
};

export default ErrorBoundary;