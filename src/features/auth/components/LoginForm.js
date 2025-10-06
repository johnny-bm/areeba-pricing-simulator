import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { useAuth } from '../hooks/useAuth';
import { useAuthValidation } from '../hooks/useAuthValidation';
import { ROUTES } from '../../../config/routes';
import WordMarkRed from '../../../imports/WordMarkRed';
export function LoginForm({ onLoginSuccess }) {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuth();
    const { errors, validateLoginForm, clearError: clearValidationError } = useAuthValidation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        clearValidationError(field);
        if (error)
            clearError();
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateLoginForm(formData.email, formData.password)) {
            return;
        }
        try {
            await login(formData);
            onLoginSuccess?.();
            navigate(ROUTES.SIMULATOR);
        }
        catch (error) {
            // Error is handled by useAuth hook
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "space-y-1", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx(WordMarkRed, { className: "h-8" }) }), _jsx(CardTitle, { className: "text-2xl text-center", children: "Sign In" }), _jsx(CardDescription, { className: "text-center", children: "Enter your credentials to access the pricing simulator" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(error || Object.keys(errors).length > 0) && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error || Object.values(errors)[0] }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "Enter your email", value: formData.email, onChange: (e) => handleInputChange('email', e.target.value), disabled: isLoading, required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", placeholder: "Enter your password", value: formData.password, onChange: (e) => handleInputChange('password', e.target.value), disabled: isLoading, required: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? 'Signing In...' : 'Sign In' }), _jsx("div", { className: "text-center space-y-2", children: _jsx(Button, { type: "button", variant: "link", onClick: () => navigate(ROUTES.FORGOT_PASSWORD), className: "text-sm", children: "Forgot your password?" }) })] }) })] }) }));
}
