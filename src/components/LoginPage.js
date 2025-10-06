import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../utils/supabase/client';
import { TABLES } from '../config/database';
import WordMarkRed from '../imports/WordMarkRed';
export function LoginPage({ onLoginSuccess }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        // Client-side validation
        if (!email || !email.trim()) {
            setError('Please enter your email address');
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (!password) {
            setError('Please enter your password');
            return;
        }
        setIsLoading(true);
        try {
            // Step 1: Sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });
            if (error) {
                console.error('❌ Login error:', error);
                setError(error.message);
                setIsLoading(false);
                return;
            }
            const user = data.user;
            if (!user) {
                console.error('❌ No user in response');
                setError('Authentication failed. Please try again.');
                setIsLoading(false);
                return;
            }
            console.log('✅ User authenticated:', user.id);
            // Step 2: CRITICAL - Wait for session to be fully set
            // This ensures auth.uid() will work in RLS policies
            await new Promise(resolve => setTimeout(resolve, 100));
            // Step 3: Verify session is active
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                console.error('❌ Session error:', sessionError);
                setError('Session setup failed. Please try again.');
                setIsLoading(false);
                return;
            }
            console.log('✅ Session active:', session.user.id);
            // Step 4: Now fetch profile (RLS will work because session is active)
            const { data: profile, error: profileError } = await supabase
                .from(TABLES.USER_PROFILES)
                .select('*')
                .eq('id', user.id)
                .single();
            if (profileError) {
                console.error('❌ Profile fetch error:', profileError);
                setError('Failed to load user profile. Please try again.');
                setIsLoading(false);
                return;
            }
            console.log('✅ Profile loaded:', profile);
            // Step 5: Store user data
            localStorage.setItem('user', JSON.stringify({
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                role: profile.role
            }));
            console.log('✅ Login complete. Role:', profile.role);
            // Step 6: Callback to update auth state
            if (onLoginSuccess) {
                onLoginSuccess();
            }
            // Step 7: All users go to simulator selection after login
            navigate('/simulators');
        }
        catch (err) {
            console.error('❌ Unexpected error:', err);
            setError('An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "space-y-1", children: [_jsx("div", { className: "w-24 h-6 mx-auto mb-4", children: _jsx(WordMarkRed, {}) }), _jsx(CardTitle, { className: "text-center", children: "Sign In" }), _jsx(CardDescription, { className: "text-center", children: "Enter your credentials to access the pricing simulator" })] }), _jsxs(CardContent, { children: [_jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", placeholder: "your.email@example.com", value: email, onChange: (e) => setEmail(e.target.value), disabled: isLoading, required: true, autoComplete: "email", autoFocus: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx("button", { type: "button", onClick: () => navigate('/forgot-password'), className: "text-xs text-primary hover:underline", children: "Forgot password?" })] }), _jsx(Input, { id: "password", type: "password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), disabled: isLoading, required: true, autoComplete: "current-password" })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? 'Signing in...' : 'Sign In' })] }), _jsxs("div", { className: "text-center mt-6 pt-6 border-t", children: [_jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "Want to explore pricing without signing up?" }), _jsx(Button, { variant: "outline", onClick: () => window.location.href = '/simulators?mode=guest', className: "w-full", children: "Try Simulator as Guest" })] })] })] }) }));
}
