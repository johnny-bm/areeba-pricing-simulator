import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui/table';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Input } from '../../../shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { Edit, Trash2, Search } from 'lucide-react';
export function AdminUsersTable({ onEditUser, onDeleteUser, currentUserRole }) {
    const { users, isLoading, error, updateUser, deleteUser } = useAdminUsers();
    const [filters, setFilters] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const filteredUsers = users.filter(user => {
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (user.email.toLowerCase().includes(searchLower) ||
                (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
                (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
                (user.last_name && user.last_name.toLowerCase().includes(searchLower)));
        }
        return true;
    });
    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUser(userId, { role: newRole });
        }
        catch (error) {
            console.error('Failed to update user role:', error);
        }
    };
    const handleStatusChange = async (userId, isActive) => {
        try {
            await updateUser(userId, { is_active: isActive });
        }
        catch (error) {
            console.error('Failed to update user status:', error);
        }
    };
    const handleDeleteUser = async (user) => {
        if (onDeleteUser) {
            onDeleteUser(user);
        }
        else {
            try {
                await deleteUser(user.id);
            }
            catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };
    const getRoleBadge = (role) => {
        const roleColors = {
            owner: 'bg-red-100 text-red-800',
            admin: 'bg-blue-100 text-blue-800',
            member: 'bg-green-100 text-green-800',
        };
        return (_jsx(Badge, { className: roleColors[role] || 'bg-gray-100 text-gray-800', children: role }));
    };
    const getStatusBadge = (isActive) => {
        return (_jsx(Badge, { variant: isActive ? 'default' : 'secondary', children: isActive ? 'Active' : 'Inactive' }));
    };
    const canEditUser = (user) => {
        if (currentUserRole === 'owner')
            return true;
        if (currentUserRole === 'admin')
            return user.role === 'member';
        return false;
    };
    const canDeleteUser = (user) => {
        if (currentUserRole === 'owner')
            return true;
        if (currentUserRole === 'admin')
            return user.role === 'member';
        return false;
    };
    if (isLoading) {
        return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-10 bg-gray-200 rounded animate-pulse" }), _jsx("div", { className: "space-y-2", children: Array.from({ length: 5 }).map((_, i) => (_jsx("div", { className: "h-12 bg-gray-200 rounded animate-pulse" }, i))) })] }));
    }
    if (error) {
        return (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-red-600 mb-4", children: error }), _jsx(Button, { onClick: () => window.location.reload(), variant: "outline", children: "Retry" })] }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx(Input, { placeholder: "Search users...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }), _jsxs(Select, { value: filters.userRole || 'all', onValueChange: (value) => setFilters(prev => ({ ...prev, userRole: value === 'all' ? undefined : value })), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, { placeholder: "Role" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Roles" }), _jsx(SelectItem, { value: "owner", children: "Owner" }), _jsx(SelectItem, { value: "admin", children: "Admin" }), _jsx(SelectItem, { value: "member", children: "Member" })] })] })] }), _jsx("div", { className: "border rounded-lg", children: _jsxs(Table, { children: [_jsx(TableHeader, { children: _jsxs(TableRow, { children: [_jsx(TableHead, { children: "User" }), _jsx(TableHead, { children: "Role" }), _jsx(TableHead, { children: "Status" }), _jsx(TableHead, { children: "Created" }), _jsx(TableHead, { children: "Actions" })] }) }), _jsx(TableBody, { children: filteredUsers.map((user) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name' }), _jsx("div", { className: "text-sm text-muted-foreground", children: user.email })] }) }), _jsx(TableCell, { children: canEditUser(user) ? (_jsxs(Select, { value: user.role, onValueChange: (value) => handleRoleChange(user.id, value), children: [_jsx(SelectTrigger, { className: "w-24", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "member", children: "Member" }), _jsx(SelectItem, { value: "admin", children: "Admin" }), currentUserRole === 'owner' && (_jsx(SelectItem, { value: "owner", children: "Owner" }))] })] })) : (getRoleBadge(user.role)) }), _jsx(TableCell, { children: canEditUser(user) ? (_jsxs(Select, { value: user.is_active ? 'active' : 'inactive', onValueChange: (value) => handleStatusChange(user.id, value === 'active'), children: [_jsx(SelectTrigger, { className: "w-24", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "active", children: "Active" }), _jsx(SelectItem, { value: "inactive", children: "Inactive" })] })] })) : (getStatusBadge(user.is_active)) }), _jsx(TableCell, { children: _jsx("div", { className: "text-sm", children: new Date(user.created_at).toLocaleDateString() }) }), _jsx(TableCell, { children: _jsxs("div", { className: "flex items-center gap-2", children: [canEditUser(user) && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => onEditUser?.(user), children: _jsx(Edit, { className: "h-4 w-4" }) })), canDeleteUser(user) && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteUser(user), className: "text-red-600 hover:text-red-700", children: _jsx(Trash2, { className: "h-4 w-4" }) }))] }) })] }, user.id))) })] }) }), filteredUsers.length === 0 && (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-muted-foreground", children: "No users found" }) }))] }));
}
