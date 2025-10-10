// Production providers and context setup
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { ThemeProvider } from '../contexts/ThemeContext';
import { analytics } from '../shared/lib/analytics';
import { errorTracking } from '../shared/lib/errorTracking';
import { performanceService } from '../shared/lib/performance';
import { getEnvironmentConfig } from '../config/production';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const config = getEnvironmentConfig();

  // Initialize monitoring services
  React.useEffect(() => {
    if (config.features.analytics) {
      analytics.initialize();
    }

    if (config.features.errorTracking) {
      errorTracking.initialize();
    }

    if (config.features.performanceMonitoring) {
      performanceService.monitorCoreWebVitals();
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export const AppProviders = Providers;