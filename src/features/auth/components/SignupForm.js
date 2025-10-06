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
export function SignupForm() {
    const navigate = useNavigate();
    const { signup, isLoading, error, clearError } = useAuth();
    const { errors, validateSignupForm, clearError: clearValidationError } = useAuthValidation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        inviteCode: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        clearValidationError(field);
        if (error)
            clearError();
    };
    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value);
        clearValidationError('confirmPassword');
        if (error)
            clearError();
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateSignupForm(formData.email, formData.password, confirmPassword, formData.firstName, formData.lastName)) {
            return;
        }
        try {
            await signup(formData);
            navigate(ROUTES.SIMULATOR);
        }
        catch (error) {
            // Error is handled by useAuth hook
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "space-y-1", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx(WordMarkRed, { className: "h-8" }) }), _jsx(CardTitle, { className: "text-2xl text-center", children: "Create Account" }), _jsx(CardDescription, { className: "text-center", children: "Enter your invite code and create your account" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [(error || Object.keys(errors).length > 0) && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error || Object.values(errors)[0] }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inviteCode", children: "Invite Code" }), _jsx(Input, { id: "inviteCode", type: "text", placeholder: "Enter your invite code", value: formData.inviteCode, onChange: (e) => handleInputChange('inviteCode', e.target.value), disabled: isLoading, required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "Enter your email", value: formData.email, onChange: (e) => handleInputChange('email', e.target.value), disabled: isLoading, required: true })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "firstName", children: "First Name" }), _jsx(Input, { id: "firstName", type: "text", placeholder: "First name", value: formData.firstName, onChange: (e) => handleInputChange('firstName', e.target.value), disabled: isLoading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lastName", children: "Last Name" }), _jsx(Input, { id: "lastName", type: "text", placeholder: "Last name", value: formData.lastName, onChange: (e) => handleInputChange('lastName', e.target.value), disabled: isLoading })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", placeholder: "Create a password", value: formData.password, onChange: (e) => handleInputChange('password', e.target.value), disabled: isLoading, required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", children: "Confirm Password" }), _jsx(Input, { id: "confirmPassword", type: "password", placeholder: "Confirm your password", value: confirmPassword, onChange: (e) => handleConfirmPasswordChange(e.target.value), disabled: isLoading, required: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? 'Creating Account...' : 'Create Account' }), _jsx("div", { className: "text-center", children: _jsx(Button, { type: "button", variant: "link", onClick: () => navigate(ROUTES.LOGIN), className: "text-sm", children: "Already have an account? Sign in" }) })] }) })] }) }));
}
