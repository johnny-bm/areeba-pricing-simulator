import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import WordMarkRed from '../imports/WordMarkRed';
export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !email.trim()) {
            setError('Please enter your email address');
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) {
                console.error('Password reset error:', error);
                setError(error.message);
                setIsLoading(false);
                return;
            }
            setSuccess(true);
            setIsLoading(false);
        }
        catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };
    if (success) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "space-y-1", children: [_jsx("div", { className: "w-24 h-6 mx-auto mb-4", children: _jsx(WordMarkRed, {}) }), _jsx("div", { className: "flex justify-center mb-4", children: _jsx("div", { className: "w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center", children: _jsx(CheckCircle, { className: "h-8 w-8 text-green-600 dark:text-green-400" }) }) }), _jsx(CardTitle, { className: "text-center", children: "Check Your Email" }), _jsxs(CardDescription, { className: "text-center", children: ["We've sent a password reset link to ", _jsx("strong", { children: email })] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Click the link in the email to reset your password. The link will expire in 1 hour." }), _jsxs(Button, { onClick: () => navigate('/login'), variant: "outline", className: "w-full", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Login"] })] })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "space-y-1", children: [_jsx("div", { className: "w-24 h-6 mx-auto mb-4", children: _jsx(WordMarkRed, {}) }), _jsx(CardTitle, { className: "text-center", children: "Forgot Password" }), _jsx(CardDescription, { className: "text-center", children: "Enter your email address and we'll send you a link to reset your password" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "your.email@example.com", value: email, onChange: (e) => setEmail(e.target.value), disabled: isLoading, required: true, autoComplete: "email", autoFocus: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? 'Sending...' : 'Send Reset Link' }), _jsxs(Button, { type: "button", onClick: () => navigate('/login'), variant: "ghost", className: "w-full", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to Login"] })] }) })] }) }));
}
