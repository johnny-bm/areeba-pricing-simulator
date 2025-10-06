import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../../../shared/components/ui/avatar';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AUTH_ROLES } from '../constants';
import { ROUTES } from '../../../config/routes';
export function UserProfile({ onLogout }) {
    const navigate = useNavigate();
    const { user, logout, isLoading } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    if (!user) {
        return null;
    }
    const displayName = user.first_name || user.last_name
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : user.email || 'User';
    const isAdminOrOwner = user.role === AUTH_ROLES.ADMIN || user.role === AUTH_ROLES.OWNER;
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            onLogout();
            navigate(ROUTES.LOGIN);
        }
        catch (error) {
            // Still logout locally even if API call fails
            onLogout();
            navigate(ROUTES.LOGIN);
        }
    };
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    return (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", className: "relative h-8 w-8 rounded-full", children: _jsx(Avatar, { className: "h-8 w-8", children: _jsx(AvatarFallback, { className: "text-xs", children: getInitials(displayName) }) }) }) }), _jsxs(DropdownMenuContent, { className: "w-56", align: "end", forceMount: true, children: [_jsxs("div", { className: "flex flex-col space-y-1 p-2", children: [_jsx("p", { className: "text-sm font-medium leading-none", children: displayName }), _jsx("p", { className: "text-xs leading-none text-muted-foreground", children: user.email }), _jsx("p", { className: "text-xs leading-none text-muted-foreground capitalize", children: user.role })] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: () => navigate(ROUTES.ADMIN), disabled: !isAdminOrOwner, children: [_jsx(Settings, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: "Admin Panel" })] }), _jsx(DropdownMenuSeparator, {}), _jsxs(DropdownMenuItem, { onClick: handleLogout, disabled: isLoggingOut || isLoading, children: [_jsx(LogOut, { className: "mr-2 h-4 w-4" }), _jsx("span", { children: isLoggingOut ? 'Signing Out...' : 'Sign Out' })] })] })] }));
}
