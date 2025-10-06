import { jsx as _jsx } from "react/jsx-runtime";
// Production providers and context setup
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth';
import { ErrorBoundary } from '../shared/components/ErrorBoundary';
import { analytics } from '../shared/lib/analytics';
import { errorTracking } from '../shared/lib/errorTracking';
import { performanceService } from '../shared/lib/performance';
import { getEnvironmentConfig } from '../config/production';
export function Providers({ children }) {
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
    return (_jsx(ErrorBoundary, { children: _jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: children }) }) }));
}
export const AppProviders = Providers;
