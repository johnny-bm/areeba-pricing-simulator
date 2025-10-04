import React from 'react';
import { Button } from './ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from "sonner@2.0.3";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    // Log specific details for JSON parsing errors
    if (error.message && error.message.includes('JSON')) {
      console.error('🚨 JSON parsing error in React component:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
      
      // Show a toast notification for JSON errors
      toast.error('Data parsing error', {
        description: 'Please refresh the page to resolve this issue.',
        duration: 5000
      });
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={error!} retry={this.handleRetry} />;
      }

      // Default error UI
      const isJsonError = error?.message?.includes('JSON');
      
      return (
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-destructive/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            
            <h2 className="text-xl mb-2">
              {isJsonError ? 'Data Format Error' : 'Something went wrong'}
            </h2>
            
            <p className="text-muted-foreground mb-4">
              {isJsonError 
                ? 'There was an issue parsing data from the server. This usually resolves itself with a page refresh.'
                : 'An unexpected error occurred. Please try refreshing the page.'
              }
            </p>
            
            <div className="flex gap-2 justify-center mb-4">
              <Button onClick={this.handleRetry} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Refresh Page
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && error && (
              <details className="text-left mt-4 p-4 bg-muted rounded-lg">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                  {error.message}
                  {error.stack && `\n\nStack trace:\n${error.stack}`}
                </pre>
              </details>
            )}
            
            {isJsonError && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>💡 Tip:</strong> JSON parsing errors are usually temporary server issues. 
                  Refreshing the page typically resolves this problem.
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}