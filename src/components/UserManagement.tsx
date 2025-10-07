import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TableCell } from './ui/table';
import { Plus, Edit, Trash2, User as UserIcon, Copy } from 'lucide-react';
import { DataTable } from './DataTable';
import { UserDialog } from './dialogs/UserDialog';
import { supabase } from '../utils/supabase/client';
import { TABLES, ROLES } from '../config/database';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_invite?: boolean; // Flag to identify invites
  invite_id?: string; // Invite ID if it's a pending invite
  expires_at?: string; // Expiration date for invites
}

interface UserManagementProps {
  currentUserId: string;
  currentUserRole: string;
}

export function UserManagement({ currentUserId, currentUserRole }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

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

      if (usersError) throw usersError;

      // Load pending invites (not used yet)
      const { data: invitesData, error: invitesError } = await supabase
        .from('user_invites')
        .select('*')
        .is('used_at', null)
        .order('created_at', { ascending: false });

      if (invitesError) throw invitesError;

      // Convert invites to user format for display
      const pendingInvites = (invitesData || []).map((invite: any) => ({
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
    } catch (error: any) {
      console.error('❌ Failed to load users:', error);
      toast.error('Failed to load users', {
        description: error.message || 'Please try again',
        duration: 5000
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (userId: any, userData: any) => {
    try {
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

      toast.success('Invite created!', {
        duration: 3000
      });

      alert(
        `Invite created for ${userData.email}\n\n` +
        `Invite Code: ${invite.invite_code}\n\n` +
        `Share this code with the user.\n` +
        `They should go to: ${window.location.origin}/signup\n` +
        `And enter the code to create their account.`
      );

      await loadUsers();
      setShowUserDialog(false);
    } catch (error: any) {
      toast.error('Failed to create invite', {
        description: error.message,
        duration: 5000
      });
      throw error;
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const { error } = await supabase
        .from(TABLES.USER_PROFILES)
        .update(updates)
        .eq('id', userId);

      if (error) throw error;

      toast.success('User updated successfully', {
        duration: 3000
      });

      await loadUsers();
      setShowUserDialog(false);
      setEditingUser(null);
    } catch (error: any) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user', {
        description: error.message || 'Please try again',
        duration: 5000
      });
      throw error;
    }
  };

  const handleDeleteUser = async (user: User) => {
    // Handle pending invites
    if (user.is_invite) {
      const confirmed = window.confirm(
        `Are you sure you want to delete the invite for ${user.email}?\n\nThis action cannot be undone.`
      );

      if (!confirmed) return;

      console.log('🗑️ Deleting invite:', user.email);

      try {
        const { error } = await supabase
          .from('user_invites')
          .delete()
          .eq('id', user.invite_id);

        if (error) throw error;

        toast.success('Invite deleted successfully', { duration: 3000 });
        console.log('✅ Invite deleted, reloading list...');
        await loadUsers();
      } catch (error: any) {
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

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.email}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    console.log('🗑️ Deleting user:', user.email);

    try {
      // Call the function instead of direct delete
      const { error } = await supabase.rpc('delete_user_profile', {
        target_user_id: user.id
      });

      if (error) throw error;

      toast.success('User deleted successfully', { duration: 3000 });

      console.log('✅ User deleted, reloading list...');
      await loadUsers();
    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      toast.error('Failed to delete user', {
        description: error.message || 'Please try again',
        duration: 5000
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case ROLES.OWNER:
        return 'default';
      case ROLES.ADMIN:
        return 'secondary';
      case ROLES.MEMBER:
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <DataTable
        title="User Management"
        description="Manage system users, roles, and access permissions"
        headers={['User', 'Role', 'Status', 'Created', 'Actions']}
        items={users}
        getItemKey={(user) => user.id}
        onRowClick={(user) => {
          if (canManageUsers && !user.is_invite) {
            setEditingUser(user);
            setShowUserDialog(true);
          }
        }}
        searchFields={['email', 'first_name', 'last_name']}
        searchPlaceholder="Search by name or email..."
        filterOptions={[
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
        ]}
        actionButton={
          canManageUsers ? (
            <Button onClick={() => {
              setEditingUser(null);
              setShowUserDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          ) : undefined
        }
        emptyStateTitle="No users found"
        emptyStateDescription="Users will appear here once they are added to the system"
        emptyStateIcon={<UserIcon className="h-12 w-12 text-muted-foreground" />}
        isLoading={isLoading}
        renderRow={(user) => (
          <>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">
                    {user.first_name || user.last_name
                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                      : 'No name set'}
                    {user.id === currentUserId && (
                      <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                    )}
                    {user.is_invite && (
                      <Badge variant="secondary" className="ml-2 text-xs">Pending Invite</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  {user.is_invite && user.expires_at && (
                    <div className="text-xs text-muted-foreground">
                      Expires: {new Date(user.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>
              {user.is_invite ? (
                <Badge variant="outline">
                  Invite Sent
                </Badge>
              ) : (
                <Badge variant={user.is_active ? "default" : "secondary"}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-1">
                {canManageUsers && (
                  <>
                    {!user.is_invite && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingUser(user);
                          setShowUserDialog(true);
                        }}
                        title="Edit user"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {(isOwner || (isAdmin && user.role !== ROLES.OWNER)) && user.id !== currentUserId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user)}
                        title="Delete user"
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </TableCell>
          </>
        )}
      />

      {showUserDialog && (
        <UserDialog
          isOpen={showUserDialog}
          onClose={() => {
            setShowUserDialog(false);
            setEditingUser(null);
          }}
          onSave={editingUser ? handleUpdateUser : handleCreateUser}
          onDelete={handleDeleteUser}
          user={editingUser}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
        />
      )}

      {/* Invite Link Modal */}
      {inviteLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Invite Link Created</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share this link with the new user. They can use it to create their account.
            </p>
            <div className="bg-muted p-3 rounded border mb-4">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="w-full bg-transparent border-none outline-none text-sm"
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Click the link above to select it, then copy with Ctrl+C (Cmd+C on Mac)
            </p>
            <Button onClick={() => setInviteLink(null)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}