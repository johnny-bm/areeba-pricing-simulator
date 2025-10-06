import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../utils/supabase/client';
import { TABLES } from '../config/database';
import WordMarkRed from '../imports/WordMarkRed';
export function SignupPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlInviteCode = searchParams.get('invite');
    const [inviteCode, setInviteCode] = useState(urlInviteCode || '');
    const [invite, setInvite] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingInvite, setLoadingInvite] = useState(false);
    const [showForm, setShowForm] = useState(false);
    // Auto-load invite if code in URL
    useEffect(() => {
        if (urlInviteCode) {
            loadInvite(urlInviteCode);
        }
    }, [urlInviteCode]);
    const loadInvite = async (code) => {
        setLoadingInvite(true);
        setError('');
        try {
            const { data, error } = await supabase
                .from('user_invites')
                .select('*')
                .eq('invite_code', code)
                .is('used_at', null)
                .single();
            if (error || !data) {
                setError('Invite code not found or already used');
                setLoadingInvite(false);
                return;
            }
            // Check if expired
            if (new Date(data.expires_at) < new Date()) {
                setError('This invite has expired. Please request a new one');
                setLoadingInvite(false);
                return;
            }
            setInvite(data);
            setFirstName(data.first_name || '');
            setLastName(data.last_name || '');
            setShowForm(true);
            setError('');
        }
        catch (err) {
            setError('Failed to load invite details');
        }
        finally {
            setLoadingInvite(false);
        }
    };
    const handleLoadInvite = (e) => {
        e.preventDefault();
        if (!inviteCode.trim()) {
            setError('Please enter an invite code');
            return;
        }
        loadInvite(inviteCode.trim());
    };
    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            console.log('Step 1: Creating auth user...');
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: invite.email,
                password: password,
            });
            if (authError) {
                console.error('Auth error:', authError);
                throw authError;
            }
            if (!authData.user) {
                throw new Error('Signup failed - no user returned');
            }
            console.log('Step 2: Auth user created:', authData.user.id);
            console.log('Step 3: Creating profile with data:', {
                id: authData.user.id,
                email: invite.email,
                first_name: firstName || null,
                last_name: lastName || null,
                role: invite.role,
                is_active: true,
            });
            const { data: profileData, error: profileError } = await supabase
                .from(TABLES.USER_PROFILES)
                .insert({
                id: authData.user.id,
                email: invite.email,
                first_name: firstName || null,
                last_name: lastName || null,
                role: invite.role,
                is_active: true,
            })
                .select();
            console.log('Profile insert result:', { profileData, profileError });
            if (profileError) {
                console.error('Profile creation error:', profileError);
                throw profileError;
            }
            console.log('Step 4: Marking invite as used...');
            await supabase
                .from('user_invites')
                .update({ used_at: new Date().toISOString() })
                .eq('id', invite.id);
            console.log('Step 5: Success! Navigating to simulators...');
            navigate('/simulators');
        }
        catch (err) {
            console.error('Full signup error:', err);
            setError(err.message || 'Signup failed. Please try again.');
            setIsLoading(false);
        }
    };
    if (!showForm) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { children: [_jsx("div", { className: "w-24 h-6 mx-auto mb-4", children: _jsx(WordMarkRed, {}) }), _jsx(CardTitle, { className: "text-center", children: "Enter Invite Code" }), _jsx(CardDescription, { className: "text-center", children: "Enter the invite code provided by your administrator" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleLoadInvite, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "inviteCode", children: "Invite Code" }), _jsx(Input, { id: "inviteCode", value: inviteCode, onChange: (e) => setInviteCode(e.target.value), placeholder: "Enter your invite code", disabled: loadingInvite, required: true, autoFocus: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: loadingInvite, children: loadingInvite ? 'Loading...' : 'Continue' }), _jsx(Button, { type: "button", onClick: () => navigate('/login'), variant: "ghost", className: "w-full", children: "Back to Login" })] }) })] }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { children: [_jsx("div", { className: "w-24 h-6 mx-auto mb-4", children: _jsx(WordMarkRed, {}) }), _jsx(CardTitle, { className: "text-center", children: "Complete Your Account" }), _jsxs(CardDescription, { className: "text-center", children: ["You've been invited as ", invite?.role] })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSignup, className: "space-y-4", children: [error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error }) })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Email" }), _jsx(Input, { value: invite?.email, disabled: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "firstName", children: "First Name" }), _jsx(Input, { id: "firstName", value: firstName, onChange: (e) => setFirstName(e.target.value), disabled: isLoading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lastName", children: "Last Name" }), _jsx(Input, { id: "lastName", value: lastName, onChange: (e) => setLastName(e.target.value), disabled: isLoading })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), disabled: isLoading, required: true, placeholder: "Minimum 6 characters" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirmPassword", children: "Confirm Password" }), _jsx(Input, { id: "confirmPassword", type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), disabled: isLoading, required: true })] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, children: isLoading ? 'Creating Account...' : 'Create Account' })] }) })] }) }));
}
