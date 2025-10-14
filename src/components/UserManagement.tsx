import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TableCell } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, Edit, Trash2, User as UserIcon, Copy, Mail } from 'lucide-react';
import { DataTable } from '../shared/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { UserDialog } from './dialogs/UserDialog';
import { StandardDialog } from './StandardDialog';
import { supabase } from '../utils/supabase/client';
import { TABLES, ROLES } from '../config/database';
import { toast } from 'sonner';
import { getAvatarProps } from '../utils/avatarColors';

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

  // Column definitions for Users table
  const userColumns: ColumnDef<User>[] = [
    {
      accessorKey: "email",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        const displayName = user.first_name || user.last_name
          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
          : user.email || 'User';
        const avatarProps = getAvatarProps(displayName);
        
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={`text-sm font-medium ${avatarProps.bgClass} ${avatarProps.textClass}`}>
                {avatarProps.initials}
              </AvatarFallback>
            </Avatar>
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
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge variant="outline" className={getRoleBadgeClasses(role)}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const user = row.original;
        if (user.is_invite) {
          return (
            <Badge variant="outline">
              Invite Sent
            </Badge>
          );
        }
        return (
          <Badge variant={user.is_active ? "default" : "secondary"}>
            {user.is_active ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue("created_at")).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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
                {user.is_invite && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleResendInvite(user)}
                    title="Resend invite email"
                    className="text-primary hover:text-primary/80"
                  >
                    <Mail className="h-3 w-3" />
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
        );
      },
    },
  ];

  // Load users
  const loadUsers = async () => {
    // // console.log('🔄 Loading users and invites...');
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

      // Filter out invites that correspond to existing users
      const existingUserEmails = new Set((usersData || []).map(user => user.email));
      const filteredInvites = (invitesData || []).filter((invite: any) => 
        !existingUserEmails.has(invite.email)
      );

      // Convert invites to user format for display
      const pendingInvites = filteredInvites.map((invite: any) => ({
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

      // // console.log('✅ Loaded:', usersData?.length || 0, 'users,', pendingInvites.length, 'pending invites');
      setUsers(allUsers);
    } catch (error: any) {
      // // console.error('❌ Failed to load users:', error);
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
      // Step 1: Create invite in database
      // Generate a unique invite code
      const inviteCode = crypto.randomUUID().replace(/-/g, '');
      
      const { data: invite, error: inviteError } = await supabase
        .from('user_invites')
        .insert({
          email: userData.email,
          first_name: userData.first_name || null,
          last_name: userData.last_name || null,
          role: userData.role,
          invite_code: inviteCode,
          created_by: currentUserId
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Step 2: Send email invitation
      // console.log('📧 Attempting to send email invitation...', {
      //   email: userData.email,
      //   firstName: userData.first_name || '',
      //   lastName: userData.last_name || '',
      //   role: userData.role,
      //   inviteCode: invite.invite_code,
      //   appUrl: window.location.origin
      // });

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

      // // console.log('📧 Email result:', { emailResult, emailError });

      if (emailError) {
        // // console.error('Email send failed:', emailError);
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
      // // console.error('Failed to update user:', error);
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

      // // console.log('🗑️ Deleting invite:', user.email);

      try {
        const { error } = await supabase
          .from('user_invites')
          .delete()
          .eq('id', user.invite_id);

        if (error) throw error;

        toast.success('Invite deleted successfully', { duration: 3000 });
        // // console.log('✅ Invite deleted, reloading list...');
        await loadUsers();
      } catch (error: any) {
        // // console.error('❌ Delete failed:', error);
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

    // // console.log('🗑️ Deleting user:', user.email);

    try {
      // Call the function instead of direct delete
      const { error } = await supabase.rpc('delete_user_profile', {
        target_user_id: user.id
      });

      if (error) throw error;

      toast.success('User deleted successfully', { duration: 3000 });

      // // console.log('✅ User deleted, reloading list...');
      await loadUsers();
    } catch (error: any) {
      // // console.error('❌ Delete failed:', error);
      toast.error('Failed to delete user', {
        description: error.message || 'Please try again',
        duration: 5000
      });
    }
  };

  const handleResendInvite = async (user: User) => {
    try {
      // Get the invite details
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

      // Send email invitation
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
        // // console.error('Email send failed:', emailError);
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
    } catch (error: any) {
      toast.error('Failed to resend invite', {
        description: error.message,
        duration: 5000
      });
    }
  };

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case ROLES.OWNER:
        return 'bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800 dark:hover:bg-violet-900/30';
      case ROLES.ADMIN:
        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/30';
      case ROLES.MEMBER:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/30';
      default:
        return '';
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Users</h2>
            <p className="text-muted-foreground">System users, roles, and access permissions</p>
          </div>
          {canManageUsers && (
            <Button onClick={() => {
              setEditingUser(null);
              setShowUserDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DataTable 
            columns={userColumns} 
            data={users}
            searchKey="email"
            searchPlaceholder="Search by name or email..."
            onRowClick={(user) => {
              if (canManageUsers && !user.is_invite) {
                setEditingUser(user);
                setShowUserDialog(true);
              }
            }}
          />
        )}
      </div>

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
        <StandardDialog
          isOpen={!!inviteLink}
          onClose={() => setInviteLink(null)}
          title="Invite Link Created"
          description="Share this link with the new user. They can use it to create their account."
          size="lg"
          primaryAction={{
            label: 'Close',
            onClick: () => setInviteLink(null)
          }}
        >
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded border">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="w-full bg-transparent border-none outline-none text-sm"
                onClick={(e) => e.currentTarget.select()}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Click the link above to select it, then copy with Ctrl+C (Cmd+C on Mac)
            </p>
          </div>
        </StandardDialog>
      )}
    </>
  );
}