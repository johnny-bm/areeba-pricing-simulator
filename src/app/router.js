import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
    }
    return (_jsxs(Routes, { children: [_jsx(Route, { path: ROUTES.HOME, element: _jsx(SimulatorLanding, { onSelectSimulator: () => { }, onLogout: () => { } }) }), _jsx(Route, { path: ROUTES.LOGIN, element: _jsx(LoginPage, {}) }), _jsx(Route, { path: ROUTES.SIGNUP, element: _jsx(SignupPage, {}) }), _jsx(Route, { path: ROUTES.FORGOT_PASSWORD, element: _jsx(ForgotPasswordPage, {}) }), _jsx(Route, { path: ROUTES.RESET_PASSWORD, element: _jsx(ResetPasswordPage, {}) }), _jsx(Route, { path: ROUTES.SIMULATOR, element: isAuthenticated ? _jsx(PricingSimulator, {}) : _jsx(Navigate, { to: ROUTES.LOGIN }) }), _jsx(Route, { path: ROUTES.ADMIN, element: isAuthenticated ? (_jsx(AdminInterface, { onClose: () => { }, items: [], categories: [], onUpdateItems: () => { }, onUpdateCategories: () => { }, currentUserId: "", currentUserRole: "" })) : _jsx(Navigate, { to: ROUTES.LOGIN }) }), _jsx(Route, { path: ROUTES.GUEST, element: _jsx(PricingSimulator, { isGuestMode: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: ROUTES.HOME }) })] }));
}
