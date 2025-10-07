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
      onUpdateItems={setItems}
      onUpdateCategories={setCategories}
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
              onSelectSimulator={(simulatorId: string) => navigate(ROUTES.SIMULATOR)} 
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
        path={ROUTES.SIMULATOR} 
        element={
          isAuthenticated ? <PricingSimulator /> : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      <Route 
        path={ROUTES.ADMIN} 
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
