import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from './ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { ROLES } from '../config/database';
export function UserProfileHeader({ onLogout }) {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const { email, first_name, last_name, role } = userData;
    const displayName = first_name || last_name
        ? `${first_name || ''} ${last_name || ''}`.trim()
        : email || 'User';
    const isAdminOrOwner = role === ROLES.ADMIN || role === ROLES.OWNER;
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Sign out from Supabase
            await supabase.auth.signOut();
            // Clear localStorage
            localStorage.removeItem('user');
            // Call parent logout handler
            onLogout();
            // Navigate to login
            navigate('/login');
        }
        catch (error) {
            console.error('Logout error:', error);
            // Still logout locally even if API call fails
            localStorage.removeItem('user');
            onLogout();
            navigate('/login');
        }
    };
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsxs(Button, { variant: "ghost", size: "sm", className: "gap-2", children: [_jsx(User, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: displayName })] }) }), _jsxs(DropdownMenuContent, { align: "end", className: "w-56", children: [_jsx(DropdownMenuLabel, { children: _jsxs("div", { className: "flex flex-col space-y-1", children: [_jsx("p", { className: "text-sm font-medium", children: displayName }), _jsx("p", { className: "text-xs text-muted-foreground", children: email }), _jsxs("p", { className: "text-xs text-muted-foreground capitalize", children: ["Role: ", role] })] }) }), _jsx(DropdownMenuSeparator, {}), isAdminOrOwner && (_jsxs(DropdownMenuItem, { onClick: () => navigate('/admin'), children: [_jsx(Settings, { className: "h-4 w-4 mr-2" }), "Admin Panel"] })), _jsxs(DropdownMenuItem, { onClick: handleLogout, disabled: isLoggingOut, children: [_jsx(LogOut, { className: "h-4 w-4 mr-2" }), isLoggingOut ? 'Signing out...' : 'Sign Out'] })] })] }));
}
