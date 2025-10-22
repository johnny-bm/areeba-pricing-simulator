import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react';
import { useAuthContext } from '../features/auth';
import { ROUTES } from '../config/routes';
import { api } from '../utils/api';
import { SimulatorApi } from '../utils/simulatorApi';
import { PricingItem, Category } from '../types/domain';
import { ConfigurationLoader } from './ConfigurationLoader';
import { Skeleton } from '../components/ui/skeleton';

// Lazy load heavy components
const SimulatorLanding = lazy(() => import('../features/simulator/components/SimulatorLanding').then(m => ({ default: m.SimulatorLanding })));
const LoginPage = lazy(() => import('../features/auth/components/LoginPage').then(m => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('../features/auth/components/SignupPage').then(m => ({ default: m.SignupPage })));
const ForgotPasswordPage = lazy(() => import('../features/auth/components/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('../features/auth/components/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const PricingSimulator = lazy(() => import('../features/simulator/components/PricingSimulator').then(m => ({ default: m.PricingSimulator })));
const AdminInterface = lazy(() => import('../features/admin/components/AdminInterface').then(m => ({ default: m.AdminInterface })));
const PdfBuilderAdmin = lazy(() => import('../features/pdfBuilder').then(m => ({ default: m.PdfBuilderAdmin })));

// Content-only skeleton loading component
function AdminContentSkeleton() {
  return (
    <div className="flex-1 p-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Content Cards */}
        <div className="grid gap-6">
          <div className="rounded-lg border bg-card p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-9 w-24" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-36" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component to load data for admin panel
function AdminDataLoader() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [simulators, setSimulators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent multiple data loads
  const isDataLoadingRef = useRef(false);
  const hasDataLoadedRef = useRef(false);
  const loadedSimulatorRef = useRef<string | null>(null);
  
  // Move useAuthContext to the top to fix hooks order
  const { logout, user } = useAuthContext();
  
  // Get simulator from URL parameters
  const { simulator } = useParams<{ simulator: string }>();
  
  // Find the actual simulator ID from the slug
  // This will be calculated after simulators are loaded

  // Debounce save operations to prevent multiple rapid calls
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedSaveItems = useCallback(async (items: PricingItem[]) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      // Calculate simulator ID from current simulators
      const currentSimulatorId = simulator ? simulators.find(s => s.urlSlug === simulator)?.id : null;
      
      if (!currentSimulatorId) {
        console.error('Simulator ID not found!');
        throw new Error('Simulator ID not found. Please ensure you are on a valid simulator page.');
      }
      
      try {
        await api.savePricingItems(items, currentSimulatorId);
        setItems(items);
      } catch (error) {
        console.error('Router: Failed to save items:', error);
        throw error;
      }
    }, 500); // 500ms debounce
  }, [simulator, simulators]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Prevent multiple data loads using refs
    if (isDataLoadingRef.current) {
      return;
    }
    
    // Check if we already loaded data for this specific simulator
    if (hasDataLoadedRef.current && loadedSimulatorRef.current === simulator) {
      return;
    }
    
    // Reset refs when simulator changes
    if (simulator && loadedSimulatorRef.current !== simulator) {
      hasDataLoadedRef.current = false;
      isDataLoadingRef.current = false;
    }

    const loadAdminData = async () => {
      try {
        isDataLoadingRef.current = true;
        setIsLoading(true);
        
        // Load simulators first to get the simulator ID
        const simulatorsResponse = await SimulatorApi.loadSimulators();
        setSimulators(simulatorsResponse || []);
        
        // Calculate simulator ID after simulators are loaded
        const simulatorId = simulator ? simulatorsResponse?.find(s => s.urlSlug === simulator)?.id : null;
        
        if (!simulatorId && simulator) {
          console.error('Router: No simulator found for slug:', simulator);
          
          // Try to find a similar simulator
          const similarSimulator = simulatorsResponse?.find(s => 
            s.urlSlug.includes('issuing') || 
            s.urlSlug.includes('processing') ||
            s.name.toLowerCase().includes('issuing') ||
            s.name.toLowerCase().includes('processing')
          );
          
          if (similarSimulator) {
            setError(`Simulator not found: ${simulator}. Did you mean "${similarSimulator.urlSlug}"? Available simulators: ${simulatorsResponse?.map(s => s.urlSlug).join(', ')}`);
          } else {
            setError(`Simulator not found: ${simulator}. Available simulators: ${simulatorsResponse?.map(s => s.urlSlug).join(', ')}`);
          }
          return;
        }
        // Load all data with the simulator ID
        const [servicesResponse, categoriesResponse, configurationsResponse, tagsResponse] = await Promise.all([
          api.loadPricingItems(simulatorId), // Pass simulator ID to filter services
          api.loadCategories(simulatorId),  // Pass simulator ID to filter categories
          api.loadConfigurations(simulatorId), // Pass simulator ID to filter configurations
          api.loadTags(simulatorId)          // Pass simulator ID to filter tags
        ]);
        
        setItems(servicesResponse || []);
        setCategories(categoriesResponse || []);
        setConfigurations(configurationsResponse || []);
        setTags(tagsResponse || []);
        
        hasDataLoadedRef.current = true;
        loadedSimulatorRef.current = simulator;
      } catch (error) {
        console.error('loadAdminData failed:', error);
        setError(`Failed to load admin data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        isDataLoadingRef.current = false;
        setIsLoading(false);
      }
    };

    loadAdminData();
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [simulator]); // Depend on simulator changes

  if (isLoading) {
    return (
      <AdminInterface
        onClose={() => window.history.back()}
        items={[]}
        categories={[]}
        configurations={[]}
        tags={[]}
        onUpdateItems={debouncedSaveItems}
        onUpdateCategories={async (categories) => {
          // Calculate simulator ID from current simulators
          const currentSimulatorId = simulator ? simulators.find(s => s.urlSlug === simulator)?.id : null;
          
          if (!currentSimulatorId) {
            throw new Error('Simulator ID not found. Please ensure you are on a valid simulator page.');
          }
          try {
            await api.saveCategories(categories, currentSimulatorId);
            setCategories(categories);
          } catch (error) {
            console.error('Failed to save categories:', error);
            throw error;
          }
        }}
        onLogout={handleLogout}
        currentUserId={user?.id || ""}
        currentUserRole={user?.role || ""}
        isLoading={true}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Admin Data</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AdminInterface
      onClose={() => window.history.back()}
      items={items}
      categories={categories}
      configurations={configurations}
      tags={tags}
      onUpdateItems={debouncedSaveItems}
      onUpdateCategories={async (categories) => {
        // Calculate simulator ID from current simulators
        const currentSimulatorId = simulator ? simulators.find(s => s.urlSlug === simulator)?.id : null;
        
        if (!currentSimulatorId) {
          throw new Error('Simulator ID not found. Please ensure you are on a valid simulator page.');
        }
        try {
          await api.saveCategories(categories, currentSimulatorId);
          setCategories(categories);
        } catch (error) {
          // // // console.error('❌ Router: Failed to save categories:', error);
          throw error;
        }
      }}
      onLogout={handleLogout}
      currentUserId={user?.id || ""}
      currentUserRole={user?.role || ""}
      isLoading={false}
    />
  );
}

export function AppRouter() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const navigate = useNavigate();

  // Add timeout for loading state to prevent infinite loading
  const [showTimeout, setShowTimeout] = useState(false);
  
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setShowTimeout(true);
      }, 15000); // 15 second timeout
      
      return () => clearTimeout(timeout);
    } else {
      setShowTimeout(false);
    }
  }, [isLoading]);

  if (isLoading) {
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
            {showTimeout && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                <p>Loading is taking longer than expected...</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Refresh Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
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
    }>
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
      
      {/* Simulator-specific admin routes */}
      <Route 
        path="/admin/:simulator/dashboard" 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path="/admin/:simulator/info" 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path="/admin/:simulator/client-fields" 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path="/admin/:simulator/categories" 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path="/admin/:simulator/services" 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path="/admin/:simulator/tags" 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      
      
      {/* Global admin routes */}
      <Route 
        path={ROUTES.ADMIN_SIMULATORS} 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path={ROUTES.ADMIN_HISTORY} 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path={ROUTES.ADMIN_GUEST_SUBMISSIONS} 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path={ROUTES.ADMIN_USERS} 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      
      {/* Global configuration routes (no simulator parameter needed) */}
      <Route 
        path="/admin/configuration/pricing/units" 
        element={
          isAuthenticated ? <ConfigurationLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path="/admin/configuration/pricing/types" 
        element={
          isAuthenticated ? <ConfigurationLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path="/admin/configuration/pricing/billing-cycles" 
        element={
          isAuthenticated ? <ConfigurationLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path="/admin/configuration/pricing/tiered-templates" 
        element={
          isAuthenticated ? <ConfigurationLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      
      {/* PDF Builder routes */}
      <Route 
        path="/admin/pdf-builder/sections" 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path="/admin/pdf-builder/templates" 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path="/admin/pdf-builder/versions" 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path="/admin/pdf-builder/generated" 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path="/admin/pdf-builder" 
        element={<Navigate to="/admin/pdf-builder/sections" replace />} 
      />
      
      {/* Legacy routes (for backward compatibility) */}
      <Route 
        path={ROUTES.ADMIN_CONFIGURATION} 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path={ROUTES.ADMIN_CATEGORIES} 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path={ROUTES.ADMIN_SERVICES} 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path={ROUTES.ADMIN_TAGS} 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path={ROUTES.ADMIN_SCENARIOS} 
        element={
          isAuthenticated ? <AdminDataLoader /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      
      
      {/* Guest routes - explicit guest access */}
      <Route path={ROUTES.GUEST} element={<PricingSimulator isGuestMode />} />
      
      {/* Preview routes - public access to generated previews */}
      <Route path="/preview/:previewId" element={<PreviewPage />} />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
    </Routes>
    </Suspense>
  );
}

// Preview Page Component
function PreviewPage() {
  const { previewId } = useParams<{ previewId: string }>();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!previewId) {
      setError('Invalid preview ID');
      setIsLoading(false);
      return;
    }

    // Load HTML content from Supabase
    const loadPreview = async () => {
      try {
        // Try to load from Supabase first
        const { loadPreviewFromSupabase } = await import('../utils/pdfHelpers');
        const supabaseContent = await loadPreviewFromSupabase(previewId);
        
        if (supabaseContent) {
          setHtmlContent(supabaseContent);
          setIsLoading(false);
          return;
        }
        
        // Fallback to localStorage
        const storedContent = localStorage.getItem(`preview-${previewId}`);
        
        if (storedContent) {
          setHtmlContent(storedContent);
          setIsLoading(false);
        } else {
          setError('Preview not found or has expired');
          setIsLoading(false);
        }
      } catch (error) {
        // // // console.error('Failed to load preview:', error);
        setError('Failed to load preview');
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [previewId]);

  const downloadPDF = () => {
    // This will be implemented to convert HTML to PDF
    alert('PDF download functionality will be implemented here');
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Preview Not Found</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.close()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      
      {/* Override the download function */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.downloadPDF = function() {
              alert('PDF download functionality will be implemented here');
            };
          `
        }}
      />
    </div>
  );
}

