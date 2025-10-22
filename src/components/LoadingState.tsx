// Loading state component with better UX
import { Skeleton } from './ui/skeleton';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  showTimeout?: boolean;
  onTimeout?: () => void;
}

export function LoadingState({ 
  message = "Loading...", 
  showTimeout = false, 
  onTimeout 
}: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-6 w-96 text-center">
        {/* Loading spinner */}
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        
        {/* Loading message */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">{message}</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we load your data...
          </p>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
        
        {/* Timeout message */}
        {showTimeout && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Loading is taking longer than expected...</p>
            <button 
              onClick={onTimeout || (() => window.location.reload())}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Simulator-specific loading state
export function SimulatorLoadingState({ simulatorName }: { simulatorName?: string }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content skeleton */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Page header skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
            
            {/* Center column */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
