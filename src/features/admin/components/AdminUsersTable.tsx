import { useState } from 'react';
import { TableCell } from '../../../shared/components/ui/table';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { DataTable } from '../../../shared/components/ui/data-table';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { AdminUser, AdminFilters } from '../types';
import { ADMIN_ROLES, ADMIN_STATUS } from '../constants';
import { formatPrice } from '../../../utils/formatters';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface AdminUsersTableProps {
  onEditUser?: (user: AdminUser) => void;
  onDeleteUser?: (user: AdminUser) => void;
  currentUserRole: string;
}

export function AdminUsersTable({ 
  onEditUser, 
  onDeleteUser, 
  currentUserRole 
}: AdminUsersTableProps) {
  const { users, isLoading, error, updateUser, deleteUser } = useAdminUsers();
  const [filters, setFilters] = useState<AdminFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.email.toLowerCase().includes(searchLower) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUser(userId, { role: newRole as any });
    } catch (error) {
      // // console.error('Failed to update user role:', error);
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await updateUser(userId, { is_active: isActive });
    } catch (error) {
      // // console.error('Failed to update user status:', error);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (onDeleteUser) {
      onDeleteUser(user);
    } else {
      try {
        await deleteUser(user.id);
      } catch (error) {
        // // console.error('Failed to delete user:', error);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      owner: 'bg-red-100 text-red-800 hover:bg-red-100',
      admin: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      member: 'bg-green-100 text-green-800 hover:bg-green-100',
    };

    return (
      <Badge 
        variant="default"
        className={roleColors[role] || 'bg-gray-100 text-gray-800 hover:bg-gray-100'}
      >
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge 
        variant={isActive ? 'default' : 'secondary'}
        className={isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"}
      >
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const canEditUser = (user: AdminUser) => {
    if (currentUserRole === 'owner') return true;
    if (currentUserRole === 'admin') return user.role === 'member';
    return false;
  };

  const canDeleteUser = (user: AdminUser) => {
    if (currentUserRole === 'owner') return true;
    if (currentUserRole === 'admin') return user.role === 'member';
    return false;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <DataTable
      title="Users"
      description="User accounts and permissions management"
      headers={['User', 'Role', 'Status', 'Created', 'Actions']}
      items={filteredUsers}
      getItemKey={(user) => user.id}
      searchFields={['email', 'full_name', 'first_name', 'last_name']}
      searchPlaceholder="Search users by name or email..."
      filterOptions={[
        {
          key: 'role',
          label: 'Role',
          options: [
            { value: 'owner', label: 'Owner' },
            { value: 'admin', label: 'Admin' },
            { value: 'member', label: 'Member' }
          ]
        }
      ]}
      actionButton={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      }
      emptyStateTitle="No users found"
      emptyStateDescription="No users match your current filters"
      renderRow={(user) => (
        <>
          <TableCell>
            <div>
              <div className="font-medium">
                {user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name'}
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </TableCell>
          <TableCell>
            {canEditUser(user) ? (
              <Select 
                value={user.role} 
                onValueChange={(value) => handleRoleChange(user.id, value)}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {currentUserRole === 'owner' && (
                    <SelectItem value="owner">Owner</SelectItem>
                  )}
                </SelectContent>
              </Select>
            ) : (
              getRoleBadge(user.role)
            )}
          </TableCell>
          <TableCell>
            {canEditUser(user) ? (
              <Select 
                value={user.is_active ? 'active' : 'inactive'} 
                onValueChange={(value) => handleStatusChange(user.id, value === 'active')}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              getStatusBadge(user.is_active)
            )}
          </TableCell>
          <TableCell>
            <div className="text-sm">
              {new Date(user.created_at).toLocaleDateString()}
            </div>
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
              {canEditUser(user) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditUser?.(user)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {canDeleteUser(user) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteUser(user)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TableCell>
        </>
      )}
    />
  );
}
