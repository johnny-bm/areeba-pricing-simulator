import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../features/auth';
import { ROUTES } from '../config/routes';
import { SimulatorLanding } from '../components/SimulatorLanding';
import { LoginPage } from '../components/LoginPage';
import { SignupPage } from '../components/SignupPage';
import { ForgotPasswordPage } from '../components/ForgotPasswordPage';
import { ResetPasswordPage } from '../components/ResetPasswordPage';
import { PricingSimulator } from '../components/PricingSimulator';
import { AdminInterface } from '../components/AdminInterface';
import { PdfBuilderAdmin } from '../features/pdfBuilder';
import { api } from '../utils/api';
import { PricingItem, Category } from '../types/pricing';

// Component to load data for admin panel
function AdminDataLoader() {
  const [items, setItems] = useState<PricingItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Move useAuthContext to the top to fix hooks order
  const { logout, user } = useAuthContext();

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setIsLoading(true);
        
        // Load services and categories
        const [servicesResponse, categoriesResponse] = await Promise.all([
          api.loadPricingItems(),
          api.loadCategories()
        ]);
        
        setItems(servicesResponse || []);
        setCategories(categoriesResponse || []);
      } catch (error) {
        setError('Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
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
      onUpdateItems={async (items) => setItems(items)}
      onUpdateCategories={async (categories) => setCategories(categories)}
      onLogout={handleLogout}
      currentUserId={user?.id || ""}
      currentUserRole={user?.role || ""}
    />
  );
}

export function AppRouter() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path={ROUTES.HOME} 
        element={
          isAuthenticated ? (
            <SimulatorLanding 
              onSelectSimulator={(simulatorSlug: string) => navigate(`/admin/${simulatorSlug}/dashboard`)} 
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
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
    </Routes>
  );
}

