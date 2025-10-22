// Optimized router with smart data loading and caching
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react';
import { useAuthContext } from '../features/auth';
import { ROUTES } from '../config/routes';
import { OptimizedDataLoader } from '../utils/optimizedDataLoader';
import { routeCache, CACHE_KEYS } from '../utils/routeCache';
import { PricingItem, Category } from '../types/domain';
import { api } from '../utils/api';
import { ConfigurationLoader } from './ConfigurationLoader';
import { Skeleton } from '../components/ui/skeleton';
import { NavigationLoader } from '../components/NavigationLoader';
import { SimulatorLoadingProvider, SimulatorLoadingOverlay } from '../features/simulator/components/SimulatorLoadingManager';

// Lazy load heavy components
const SimulatorLanding = lazy(() => import('../features/simulator/components/SimulatorLanding').then(m => ({ default: m.SimulatorLanding })));
const LoginPage = lazy(() => import('../features/auth/components/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('../features/auth/components/SignupPage').then(m => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import('../features/auth/components/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../features/auth/components/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const PricingSimulator = lazy(() => import('../features/simulator/components/PricingSimulator').then(m => ({ default: m.PricingSimulator })));
const AdminInterface = lazy(() => import('../features/admin/components/AdminInterface').then(m => ({ default: m.AdminInterface })));
const PdfBuilderAdmin = lazy(() => import('../features/pdfBuilder').then(m => ({ default: m.PdfBuilderAdmin })));

// Pricing configuration components
const UnitsConfiguration = lazy(() => import('../features/configuration/components/pricing/UnitsConfiguration').then(m => ({ default: m.UnitsConfiguration })));
const PricingTypesConfiguration = lazy(() => import('../features/configuration/components/pricing/PricingTypesConfiguration').then(m => ({ default: m.PricingTypesConfiguration })));
const BillingCyclesConfiguration = lazy(() => import('../features/configuration/components/pricing/BillingCyclesConfiguration').then(m => ({ default: m.BillingCyclesConfiguration })));
const TieredTemplatesConfiguration = lazy(() => import('../features/configuration/components/pricing/TieredTemplatesConfiguration').then(m => ({ default: m.TieredTemplatesConfiguration })));

// Content-only skeleton loading component
function ContentSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 w-96">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Optimized AdminDataLoader with caching
function OptimizedAdminDataLoader() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [simulators, setSimulators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { simulator } = useParams<{ simulator: string }>();
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  
  // Refs to prevent duplicate loading
  const isDataLoadingRef = useRef(false);
  const hasDataLoadedRef = useRef(false);
  const lastSimulatorRef = useRef<string | null>(null);
  
  // Debounce save operations to prevent multiple rapid calls
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounced save function for items
  const debouncedSaveItems = useCallback(async (items: PricingItem[]) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Return a promise that resolves when the actual database save is complete
    return new Promise<void>((resolve, reject) => {
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          // Calculate simulator ID from current simulators
          const currentSimulatorId = simulator ? simulators.find(s => s.urlSlug === simulator)?.id : null;
          
          if (!currentSimulatorId) {
            throw new Error('Simulator ID not found. Please ensure you are on a valid simulator page.');
          }
          
          await api.savePricingItems(items, currentSimulatorId);
          
          // Update local state immediately
          setItems(items);
          
          // Clear cache to ensure fresh data on next load
          if (currentSimulatorId) {
            OptimizedDataLoader.clearSimulatorCache(currentSimulatorId);
          }
          
          // Resolve the promise after successful save
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 500); // 500ms debounce
    });
  }, [simulator, simulators]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Load data with caching
  useEffect(() => {
    const loadData = async () => {
      if (isDataLoadingRef.current) return;
      
      try {
        isDataLoadingRef.current = true;
        setIsLoading(true);
        setError(null);

        // Load simulators first (cached)
        const simulatorsData = await OptimizedDataLoader.loadSimulators();
        setSimulators(simulatorsData);

        // Find simulator ID
        const simulatorId = simulator ? simulatorsData.find(s => s.urlSlug === simulator)?.id : null;
        
        if (!simulatorId && simulator) {
          setError(`Simulator not found: ${simulator}`);
          return;
        }

        // Load simulator-specific data (cached)
        if (simulatorId) {
          const { services, categories, configurations } = await OptimizedDataLoader.loadSimulatorData(simulatorId);
          setItems(services);
          setCategories(categories);
          setConfigurations(configurations);
        }

        hasDataLoadedRef.current = true;
        lastSimulatorRef.current = simulator;

      } catch (error) {
        console.error('Failed to load admin data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
        isDataLoadingRef.current = false;
      }
    };

    // Only load if simulator changed or data not loaded
    if (simulator !== lastSimulatorRef.current || !hasDataLoadedRef.current) {
      loadData();
    }
  }, [simulator]);

  // Clear cache when component unmounts
  useEffect(() => {
    return () => {
      if (simulator) {
        OptimizedDataLoader.clearSimulatorCache(simulator);
      }
    };
  }, [simulator]);

  // Don't show full-screen skeleton - let AdminInterface handle loading states
  // if (isLoading) {
  //   return <ContentSkeleton />;
  // }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  
  return (
    <AdminInterface
      onClose={() => navigate(ROUTES.HOME)}
      items={items}
      categories={categories}
      configurations={configurations}
      tags={tags}
      selectedItems={[]}
      clientConfig={null}
      onUpdateItems={debouncedSaveItems}
      onUpdateCategories={setCategories}
      onLogout={logout}
      onForceRefresh={() => {
        // Clear cache and reload
        OptimizedDataLoader.clearAllCache();
        hasDataLoadedRef.current = false;
        isDataLoadingRef.current = false;
      }}
      adminToken=""
      currentUserId={user?.id || ''}
      currentUserRole={user?.role || 'member'}
      isLoading={isLoading}
    />
  );
}

export function OptimizedAppRouter() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const navigate = useNavigate();

  // Show loading while auth is initializing
  if (isLoading) {
    return <ContentSkeleton />;
  }

  return (
    <SimulatorLoadingProvider>
      <NavigationLoader />
      <SimulatorLoadingOverlay />
      <Suspense fallback={<ContentSkeleton />}>
        <Routes>
        {/* Public routes */}
        <Route 
          path={ROUTES.HOME} 
          element={
            isAuthenticated ? (
              <SimulatorLanding 
                onSelectSimulator={(simulatorSlug: string) => navigate(`${ROUTES.SIMULATOR}/${simulatorSlug}`)} 
                onOpenAdmin={() => navigate(ROUTES.ADMIN_SIMULATORS)}
                onLogout={() => navigate(ROUTES.LOGIN)} 
              />
            ) : (
              <Navigate to={ROUTES.LOGIN} replace />
            )
          } 
        />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
        
        {/* Protected routes */}
        <Route 
          path={`${ROUTES.SIMULATOR}/:simulatorType?`} 
          element={
            isAuthenticated ? <PricingSimulator /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path={ROUTES.ADMIN} 
          element={<Navigate to={ROUTES.ADMIN_SIMULATORS} replace />} 
        />
        
        {/* Global pricing configuration routes */}
        <Route 
          path="/admin/configuration/pricing/units" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/configuration/pricing/types" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/configuration/pricing/billing-cycles" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/configuration/pricing/tiered-templates" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        
        {/* Simulator-specific admin routes - OPTIMIZED */}
        <Route 
          path="/admin/:simulator/dashboard" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/info" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/client-fields" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/categories" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/services" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/tags" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/configuration/pricing/units" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/configuration/pricing/types" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/configuration/pricing/billing-cycles" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/configuration/pricing/tiered-templates" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/configuration/users" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/configuration/pdf-builder/sections" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/configuration/pdf-builder/templates" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/:simulator/configuration/pdf-builder/archived" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        
        {/* Global admin routes - OPTIMIZED */}
        <Route 
          path={ROUTES.ADMIN_SIMULATORS} 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path={ROUTES.ADMIN_HISTORY} 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path={ROUTES.ADMIN_GUEST_SUBMISSIONS} 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path={ROUTES.ADMIN_USERS} 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        
        {/* Legacy routes - OPTIMIZED */}
        <Route 
          path={ROUTES.ADMIN_CONFIGURATION} 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path={ROUTES.ADMIN_CATEGORIES} 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path={ROUTES.ADMIN_SERVICES} 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path={ROUTES.ADMIN_TAGS} 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path={ROUTES.ADMIN_SCENARIOS} 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        
        {/* PDF Builder routes - OPTIMIZED */}
        <Route 
          path="/admin/pdf-builder/sections" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/pdf-builder/templates" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/pdf-builder/versions" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/pdf-builder/generated" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/pdf-builder/archived" 
          element={
            isAuthenticated ? <OptimizedAdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
          } 
        />
        <Route 
          path="/admin/pdf-builder" 
          element={<Navigate to="/admin/pdf-builder/sections" replace />} 
        />
        
        {/* Guest routes */}
        <Route path={ROUTES.GUEST} element={<PricingSimulator isGuestMode />} />
        
        {/* Preview routes */}
        <Route path="/preview/:previewId" element={<PreviewPage />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
        </Routes>
      </Suspense>
    </SimulatorLoadingProvider>
  );
}

// Preview Page Component
function PreviewPage() {
  const { previewId } = useParams<{ previewId: string }>();
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Preview: {previewId}</h1>
        <p className="text-muted-foreground">Preview functionality coming soon...</p>
      </div>
    </div>
  );
}
