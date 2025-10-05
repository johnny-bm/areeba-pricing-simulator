import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../features/auth';
import { ROUTES } from '../config/routes';
import { SimulatorLanding } from '../components/SimulatorLanding';
import { LoginPage } from '../components/LoginPage';
import { SignupPage } from '../components/SignupPage';
import { ForgotPasswordPage } from '../components/ForgotPasswordPage';
import { ResetPasswordPage } from '../components/ResetPasswordPage';
import { PricingSimulator } from '../components/PricingSimulator';
import { AdminInterface } from '../components/AdminInterface';

export function AppRouter() {
  const { isAuthenticated, isLoading } = useAuthContext();

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
      <Route path={ROUTES.HOME} element={<SimulatorLanding onSelectSimulator={() => {}} onLogout={() => {}} />} />
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
          isAuthenticated ? (
            <AdminInterface 
              onClose={() => {}}
              items={[]}
              categories={[]}
              onUpdateItems={() => {}}
              onUpdateCategories={() => {}}
              currentUserId=""
              currentUserRole=""
            />
          ) : <Navigate to={ROUTES.LOGIN} />
        } 
      />
      
      {/* Guest routes */}
      <Route path={ROUTES.GUEST} element={<PricingSimulator isGuestMode />} />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
    </Routes>
  );
}
