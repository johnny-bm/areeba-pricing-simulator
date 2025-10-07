import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2, User as UserIcon, Mail } from 'lucide-react';
import { DataTable } from './DataTable';
import { UserDialog } from './dialogs/UserDialog.tsx';
import { supabase } from '../utils/supabase/client';
import { TABLES, ROLES } from '../config/database';
import { toast } from 'sonner';
export function UserManagement({ currentUserId, currentUserRole }) {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showUserDialog, setShowUserDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [inviteLink, setInviteLink] = useState(null);
    const isOwner = currentUserRole === ROLES.OWNER;
    const isAdmin = currentUserRole === ROLES.ADMIN;
    const canManageUsers = isOwner || isAdmin;
    // Load users
    const loadUsers = async () => {
        console.log('🔄 Loading users and invites...');
        setIsLoading(true);
        try {
            // Load existing users
            const { data: usersData, error: usersError } = await supabase
                .rpc('get_all_user_profiles');
            if (usersError)
                throw usersError;
            // Load pending invites (not used yet)
            const { data: invitesData, error: invitesError } = await supabase
                .from('user_invites')
                .select('*')
                .is('used_at', null)
                .order('created_at', { ascending: false });
            if (invitesError)
                throw invitesError;
            // Convert invites to user format for display
            const pendingInvites = (invitesData || []).map((invite) => ({
                id: invite.id,
                email: invite.email,
                first_name: invite.first_name,
                last_name: invite.last_name,
                role: invite.role,
                is_active: false, // Invites are not active users
                created_at: invite.created_at,
                updated_at: invite.created_at,
                is_invite: true,
                invite_id: invite.id,
                expires_at: invite.expires_at
            }));
            // Combine users and pending invites
            const allUsers = [...(usersData || []), ...pendingInvites];
            console.log('✅ Loaded:', usersData?.length || 0, 'users,', invitesData?.length || 0, 'pending invites');
            setUsers(allUsers);
        }
        catch (error) {
            console.error('❌ Failed to load users:', error);
            toast.error('Failed to load users', {
                description: error.message || 'Please try again',
                duration: 5000
            });
            setUsers([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        loadUsers();
    }, []);
    const handleCreateUser = async (userId, userData) => {
        try {
            // Step 1: Create invite in database
            const { data: invite, error: inviteError } = await supabase
                .from('user_invites')
                .insert({
                email: userData.email,
                first_name: userData.first_name || null,
                last_name: userData.last_name || null,
                role: userData.role,
                created_by: currentUserId
            })
                .select()
                .single();

            if (inviteError) throw inviteError;

            // Step 2: Send email invitation
            console.log('📧 Attempting to send email invitation...', {
                email: userData.email,
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                role: userData.role,
                inviteCode: invite.invite_code,
                appUrl: window.location.origin
            });

            const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invite', {
                body: {
                    email: userData.email,
                    firstName: userData.first_name || '',
                    lastName: userData.last_name || '',
                    role: userData.role,
                    inviteCode: invite.invite_code,
                    appUrl: window.location.origin
                }
            });

            console.log('📧 Email result:', { emailResult, emailError });

            if (emailError) {
                console.error('Email send failed:', emailError);
                // Still show success for invite creation, but mention email issue
                toast.success('Invite created!', {
                    description: 'Invite was created but email delivery failed. You can manually share the invite code.',
                    duration: 5000
                });
                
                // Show manual sharing option
                const manualShare = confirm(
                    `Invite created for ${userData.email}\n\n` +
                    `Email delivery failed. Would you like to copy the invite code to share manually?\n\n` +
                    `Invite Code: ${invite.invite_code}\n` +
                    `Signup URL: ${window.location.origin}/signup?invite=${invite.invite_code}`
                );
                
                if (manualShare) {
                    navigator.clipboard.writeText(`${window.location.origin}/signup?invite=${invite.invite_code}`);
                    toast.info('Invite URL copied to clipboard');
                }
            } else {
                toast.success('Invite sent!', {
                    description: `Invitation email sent to ${userData.email}`,
                    duration: 5000
                });
            }

            await loadUsers();
            setShowUserDialog(false);
        }
        catch (error) {
            toast.error('Failed to create invite', {
                description: error.message,
                duration: 5000
            });
            throw error;
        }
    };

    const handleResendInvite = async (user) => {
        try {
            const { data: invite, error: inviteError } = await supabase
                .from('user_invites')
                .select('*')
                .eq('email', user.email)
                .is('used_at', null)
                .single();

            if (inviteError || !invite) {
                toast.error('No pending invite found for this user');
                return;
            }

            const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invite', {
                body: {
                    email: user.email,
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    role: user.role,
                    inviteCode: invite.invite_code,
                    appUrl: window.location.origin
                }
            });

            if (emailError) {
                console.error('Email send failed:', emailError);
                toast.error('Failed to resend invite email', {
                    description: emailError.message,
                    duration: 5000
                });
            } else {
                toast.success('Invite resent!', {
                    description: `Invitation email resent to ${user.email}`,
                    duration: 5000
                });
            }
        } catch (error) {
            toast.error('Failed to resend invite', {
                description: error.message,
                duration: 5000
            });
        }
    };

    const handleUpdateUser = async (userId, updates) => {
        try {
            const { error } = await supabase
                .from(TABLES.USER_PROFILES)
                .update(updates)
                .eq('id', userId);
            if (error)
                throw error;
            toast.success('User updated successfully', {
                duration: 3000
            });
            await loadUsers();
            setShowUserDialog(false);
            setEditingUser(null);
        }
        catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Failed to update user', {
                description: error.message || 'Please try again',
                duration: 5000
            });
            throw error;
        }
    };
    const handleDeleteUser = async (user) => {
        // Handle pending invites
        if (user.is_invite) {
            const confirmed = window.confirm(`Are you sure you want to delete the invite for ${user.email}?\n\nThis action cannot be undone.`);
            if (!confirmed)
                return;
            console.log('🗑️ Deleting invite:', user.email);
            try {
                const { error } = await supabase
                    .from('user_invites')
                    .delete()
                    .eq('id', user.invite_id);
                if (error)
                    throw error;
                toast.success('Invite deleted successfully', { duration: 3000 });
                console.log('✅ Invite deleted, reloading list...');
                await loadUsers();
            }
            catch (error) {
                console.error('❌ Delete failed:', error);
                toast.error('Failed to delete invite', {
                    description: error.message || 'Please try again',
                    duration: 5000
                });
            }
            return;
        }
        // Client-side validation for real users
        if (user.id === currentUserId) {
            toast.error('Cannot delete your own account');
            return;
        }
        if (!isOwner && user.role === ROLES.OWNER) {
            toast.error('Cannot delete owner account', {
                description: 'Only owners can delete other owner accounts',
            });
            return;
        }
        const confirmed = window.confirm(`Are you sure you want to delete ${user.email}?\n\nThis action cannot be undone.`);
        if (!confirmed)
            return;
        console.log('🗑️ Deleting user:', user.email);
        try {
            // Call the function instead of direct delete
            const { error } = await supabase.rpc('delete_user_profile', {
                target_user_id: user.id
            });
            if (error)
                throw error;
            toast.success('User deleted successfully', { duration: 3000 });
            console.log('✅ User deleted, reloading list...');
            await loadUsers();
        }
        catch (error) {
            console.error('❌ Delete failed:', error);
            toast.error('Failed to delete user', {
                description: error.message || 'Please try again',
                duration: 5000
            });
        }
    };
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case ROLES.OWNER:
                return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
            case ROLES.ADMIN:
                return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
            case ROLES.MEMBER:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };
    return (_jsxs(_Fragment, { children: [_jsx(DataTable, { title: "User Management", description: "Manage system users, roles, and access permissions", headers: ['User', 'Role', 'Status', 'Created', 'Actions'], items: users, getItemKey: (user) => user.id, onRowClick: (user) => {
                    if (canManageUsers && !user.is_invite) {
                        setEditingUser(user);
                        setShowUserDialog(true);
                    }
                }, searchFields: ['email', 'first_name', 'last_name'], searchPlaceholder: "Search by name or email...", filterOptions: [
                    {
                        key: 'role',
                        label: 'Role',
                        options: [
                            { value: ROLES.OWNER, label: 'Owner', count: users.filter(u => u.role === ROLES.OWNER).length },
                            { value: ROLES.ADMIN, label: 'Admin', count: users.filter(u => u.role === ROLES.ADMIN).length },
                            { value: ROLES.MEMBER, label: 'Member', count: users.filter(u => u.role === ROLES.MEMBER).length },
                        ]
                    },
                    {
                        key: 'is_active',
                        label: 'Status',
                        options: [
                            { value: 'true', label: 'Active', count: users.filter(u => u.is_active).length },
                            { value: 'false', label: 'Inactive', count: users.filter(u => !u.is_active).length },
                        ]
                    }
                ], actionButton: canManageUsers ? (_jsxs(Button, { onClick: () => {
                        setEditingUser(null);
                        setShowUserDialog(true);
                    }, children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add User"] })) : undefined, emptyStateTitle: "No users found", emptyStateDescription: "Users will appear here once they are added to the system", emptyStateIcon: _jsx(UserIcon, { className: "h-12 w-12 text-muted-foreground" }), isLoading: isLoading, renderRow: (user) => (_jsxs(_Fragment, { children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0", children: _jsx(UserIcon, { className: "h-5 w-5 text-primary" }) }), _jsxs("div", { children: [_jsxs("div", { className: "font-medium", children: [user.first_name || user.last_name
                                                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                                        : 'No name set', user.id === currentUserId && (_jsx(Badge, { variant: "outline", className: "ml-2 text-xs", children: "You" })), user.is_invite && (_jsx(Badge, { variant: "secondary", className: "ml-2 text-xs", children: "Pending Invite" }))] }), _jsx("div", { className: "text-sm text-muted-foreground", children: user.email }), user.is_invite && user.expires_at && (_jsxs("div", { className: "text-xs text-muted-foreground", children: ["Expires: ", new Date(user.expires_at).toLocaleDateString()] }))] })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx(Badge, { className: getRoleBadgeColor(user.role), children: user.role.charAt(0).toUpperCase() + user.role.slice(1) }) }), _jsx("td", { className: "px-6 py-4", children: user.is_invite ? (_jsx(Badge, { variant: "secondary", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300", children: "Invite Sent" })) : (_jsx(Badge, { variant: user.is_active ? "default" : "secondary", children: user.is_active ? 'Active' : 'Inactive' })) }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "text-sm", children: new Date(user.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                }) }) }), _jsx("td", { className: "px-6 py-4", onClick: (e) => e.stopPropagation(), children: _jsx("div", { className: "flex gap-1",                                     children: canManageUsers && (_jsxs(_Fragment, { children: [!user.is_invite && (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                                                setEditingUser(user);
                                                setShowUserDialog(true);
                                            }, title: "Edit user", children: _jsx(Edit, { className: "h-3 w-3" }) })), user.is_invite && (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleResendInvite(user), title: "Resend invite email", className: "text-blue-600 hover:text-blue-700", children: _jsx(Mail, { className: "h-3 w-3" }) })), (isOwner || (isAdmin && user.role !== ROLES.OWNER)) && user.id !== currentUserId && (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => handleDeleteUser(user), title: "Delete user", className: "text-destructive hover:text-destructive", children: _jsx(Trash2, { className: "h-3 w-3" }) }))] })) }) })] })) }), showUserDialog && (_jsx(UserDialog, { isOpen: showUserDialog, onClose: () => {
                    setShowUserDialog(false);
                    setEditingUser(null);
                }, onSave: editingUser ? handleUpdateUser : handleCreateUser, onDelete: handleDeleteUser, user: editingUser, currentUserId: currentUserId, currentUserRole: currentUserRole })), inviteLink && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full mx-4", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Invite Link Created" }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Share this link with the new user. They can use it to create their account." }), _jsx("div", { className: "bg-muted p-3 rounded border mb-4", children: _jsx("input", { type: "text", value: inviteLink, readOnly: true, className: "w-full bg-transparent border-none outline-none text-sm", onClick: (e) => e.currentTarget.select() }) }), _jsx("p", { className: "text-xs text-muted-foreground mb-4", children: "Click the link above to select it, then copy with Ctrl+C (Cmd+C on Mac)" }), _jsx(Button, { onClick: () => setInviteLink(null), className: "w-full", children: "Close" })] }) }))] }));
}
