// Global simulator loading state manager
import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SimulatorLoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
}

const SimulatorLoadingContext = createContext<SimulatorLoadingContextType | undefined>(undefined);

export function SimulatorLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading simulator...');
  const location = useLocation();

  // Reset loading when navigating away from simulator routes
  useEffect(() => {
    if (!location.pathname.startsWith('/simulator/')) {
      setIsLoading(false);
    }
  }, [location.pathname]);

  const setLoading = (loading: boolean, message: string = 'Loading simulator...') => {
    setIsLoading(loading);
    setLoadingMessage(message);
  };

  return (
    <SimulatorLoadingContext.Provider value={{ isLoading, loadingMessage, setLoading }}>
      {children}
    </SimulatorLoadingContext.Provider>
  );
}

export function useSimulatorLoading() {
  const context = useContext(SimulatorLoadingContext);
  if (context === undefined) {
    throw new Error('useSimulatorLoading must be used within a SimulatorLoadingProvider');
  }
  return context;
}

// Global loading overlay component
export function SimulatorLoadingOverlay() {
  const { isLoading, loadingMessage } = useSimulatorLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="space-y-6 w-96 text-center">
        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
        </div>
        
        {/* Loading message */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">{loadingMessage}</h2>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your simulator...
          </p>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-3/4 mx-auto animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
