import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StandardDialog } from '../StandardDialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { ROLES } from '../../config/database';
import { AlertCircle, Trash2 } from 'lucide-react';
export function UserDialog({ isOpen, onClose, onSave, onDelete, user, currentUserId, currentUserRole }) {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState(ROLES.MEMBER);
    const [isActive, setIsActive] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const isEditing = !!user;
    const isOwner = currentUserRole === ROLES.OWNER;
    const isEditingSelf = user?.id === currentUserId;
    useEffect(() => {
        if (user) {
            setEmail(user.email);
            setFirstName(user.first_name || '');
            setLastName(user.last_name || '');
            setRole(user.role);
            setIsActive(user.is_active);
        }
        else {
            setEmail('');
            setFirstName('');
            setLastName('');
            setRole(ROLES.MEMBER);
            setIsActive(true);
        }
        setErrors({});
    }, [user]);
    const validateForm = () => {
        const newErrors = {};
        // Email validation
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Invalid email format';
        }
        // No password validation needed for invitation system
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }
        setIsSaving(true);
        try {
            if (isEditing && user) {
                // Update existing user
                await onSave(user.id, {
                    email,
                    first_name: firstName || null,
                    last_name: lastName || null,
                    role,
                    is_active: isActive,
                    updated_at: new Date().toISOString(),
                });
            }
            else {
                // Create new user invitation
                await onSave('', {
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    role,
                });
            }
            onClose();
        }
        catch (error) {
            console.error('Failed to save user:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleDelete = async () => {
        if (!user || !onDelete)
            return;
        const userName = firstName || lastName
            ? `${firstName || ''} ${lastName || ''}`.trim()
            : email;
        const confirmed = window.confirm(`Are you sure you want to delete ${userName}?\n\nThis action cannot be undone.`);
        if (!confirmed)
            return;
        setIsSaving(true);
        try {
            await onDelete(user);
            onClose();
        }
        catch (error) {
            console.error('Failed to delete user:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    return (_jsx(StandardDialog, { isOpen: isOpen, onClose: onClose, title: isEditing ? 'Edit User' : 'Send User Invitation', description: isEditing
            ? 'Update user information and permissions'
            : 'Send an invitation email to create a new user account with specified role and permissions', size: "md", destructiveActions: isEditing && onDelete && !isEditingSelf && (isOwner || user.role !== ROLES.OWNER) ? [{
                label: 'Delete User',
                onClick: handleDelete,
                loading: isSaving,
                icon: _jsx(Trash2, { className: "h-4 w-4" })
            }] : [], secondaryActions: [
            {
                label: 'Cancel',
                onClick: onClose,
                disabled: isSaving
            }
        ], primaryAction: {
            label: isSaving ? 'Saving...' : isEditing ? 'Update User' : 'Send Invitation',
            onClick: handleSave,
            loading: isSaving
        }, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "email", children: ["Email ", _jsx("span", { className: "text-destructive", children: "*" })] }), _jsx(Input, { id: "email", type: "email", placeholder: "user@example.com", value: email, onChange: (e) => setEmail(e.target.value), disabled: isEditing, className: errors.email ? 'border-destructive' : '' }), errors.email && (_jsxs("p", { className: "text-sm text-destructive flex items-center gap-1", children: [_jsx(AlertCircle, { className: "h-3 w-3" }), errors.email] })), isEditing && (_jsx("p", { className: "text-xs text-muted-foreground", children: "Email cannot be changed after account creation" }))] }), !isEditing && (_jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "password", children: ["Password ", _jsx("span", { className: "text-destructive", children: "*" })] }), _jsxs("div", { className: "relative", children: [_jsx(Input, { id: "password", type: showPassword ? 'text' : 'password', placeholder: "Enter a strong password", value: password, onChange: (e) => setPassword(e.target.value), className: errors.password ? 'border-destructive pr-10' : 'pr-10' }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: showPassword ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] }), errors.password && (_jsxs("p", { className: "text-sm text-destructive flex items-center gap-1", children: [_jsx(AlertCircle, { className: "h-3 w-3" }), errors.password] })), _jsx("p", { className: "text-xs text-muted-foreground", children: "Minimum 6 characters" })] })), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "firstName", children: "First Name" }), _jsx(Input, { id: "firstName", type: "text", placeholder: "John", value: firstName, onChange: (e) => setFirstName(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lastName", children: "Last Name" }), _jsx(Input, { id: "lastName", type: "text", placeholder: "Doe", value: lastName, onChange: (e) => setLastName(e.target.value) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "role", children: ["Role ", _jsx("span", { className: "text-destructive", children: "*" })] }), _jsxs(Select, { value: role, onValueChange: setRole, disabled: isEditingSelf || (!isOwner && user?.role === ROLES.OWNER), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: ROLES.MEMBER, children: _jsxs("div", { className: "flex flex-col items-start", children: [_jsx("span", { children: "Member" }), _jsx("span", { className: "text-xs text-muted-foreground", children: "Can create and manage their own scenarios" })] }) }), _jsx(SelectItem, { value: ROLES.ADMIN, children: _jsxs("div", { className: "flex flex-col items-start", children: [_jsx("span", { children: "Admin" }), _jsx("span", { className: "text-xs text-muted-foreground", children: "Can manage services and view all data" })] }) }), isOwner && (_jsx(SelectItem, { value: ROLES.OWNER, children: _jsxs("div", { className: "flex flex-col items-start", children: [_jsx("span", { children: "Owner" }), _jsx("span", { className: "text-xs text-muted-foreground", children: "Full system access and user management" })] }) }))] })] }), isEditingSelf && (_jsx("p", { className: "text-xs text-muted-foreground", children: "You cannot change your own role" })), !isOwner && user?.role === ROLES.OWNER && (_jsx("p", { className: "text-xs text-muted-foreground", children: "Only owners can modify owner accounts" }))] }), isEditing && (_jsxs("div", { className: "flex items-center justify-between rounded-lg border p-4", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx(Label, { htmlFor: "isActive", children: "Active Status" }), _jsx("p", { className: "text-sm text-muted-foreground", children: isActive ? 'User can log in and access the system' : 'User is blocked from logging in' })] }), _jsx(Switch, { id: "isActive", checked: isActive, onCheckedChange: setIsActive, disabled: isEditingSelf })] }))] }) }));
}
