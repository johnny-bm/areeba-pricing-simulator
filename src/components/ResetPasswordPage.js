import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import WordMarkRed from '../imports/WordMarkRed';
export function ResetPasswordPage() {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidToken, setIsValidToken] = useState(false);
    useEffect(() => {
        // Check if we have a valid recovery token
        const checkToken = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Invalid or expired reset link. Please request a new one.');
                return;
            }
            setIsValidToken(true);
        };
        checkToken();
    }, []);
    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number';
        }
        return null;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) {
                console.error('Password update error:', error);
                setError(error.message);
                setIsLoading(false);
                return;
            }
            setSuccess(true);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
        catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };
    if (!isValidToken && error) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "space-y-1", children: [_jsx("div", { className: "w-24 h-6 mx-auto mb-4", children: _jsx(WordMarkRed, {}) }), _jsx(CardTitle, { className: "text-center", children: "Invalid Reset Link" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) }), _jsx(Button, { onClick: () => navigate('/forgot-password'), className: "w-full", children: "Request New Reset Link" })] })] }) }));
    }
    if (success) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: _jsx(Card, { className: "w-full max-w-md", children: _jsxs(CardHeader, { className: "space-y-1", children: [_jsx("div", { className: "w-24 h-6 mx-auto mb-4", children: _jsx(WordMarkRed, {}) }), _jsx("div", { className: "flex justify-center mb-4", children: _jsx("div", { className: "w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center", children: _jsx(CheckCircle, { className: "h-8 w-8 text-green-600 dark:text-green-400" }) }) }), _jsx(CardTitle, { className: "text-center", children: "Password Reset Successful" }), _jsx(CardDescription, { className: "text-center", children: "Your password has been updated successfully. Redirecting to login..." })] }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "space-y-1", children: [_jsx("div", { className: "w-24 h-6 mx-auto mb-4", children: _jsx(WordMarkRed, {}) }), _jsx(CardTitle, { className: "text-center", children: "Reset Password" }), _jsx(CardDescription, { className: "text-center", children: "Enter your new password below" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "newPassword", children: "New Password" }), _jsx(Input, { id: "newPassword", type: "password", placeholder: "Enter new password", value: newPassword, onChange: (e) => setNewPassword(e.target.value), disabled: isLoading, required: true, autoFocus: true }), _jsx("p", { className: "text-xs text-muted-foreground", children: "Must be at least 8 characters with uppercase, lowercase, and numbers" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", children: "Confirm Password" }), _jsx(Input, { id: "confirmPassword", type: "password", placeholder: "Confirm new password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), disabled: isLoading, required: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? 'Updating...' : 'Reset Password' })] }) })] }) }));
}
