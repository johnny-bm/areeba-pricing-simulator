// Navigation loading component that shows during route transitions
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function NavigationLoader() {
  const [isNavigating, setIsNavigating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Show loading when route changes
    setIsNavigating(true);
    
    // Hide loading when route is fully loaded (component mounted)
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 2000); // Increased to 2 seconds to ensure user sees it

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="space-y-4 w-96 text-center">
        {/* Loading spinner */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        
        {/* Loading message */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Loading...</h2>
          <p className="text-sm text-muted-foreground">
            Preparing your simulator...
          </p>
        </div>
      </div>
    </div>
  );
}
