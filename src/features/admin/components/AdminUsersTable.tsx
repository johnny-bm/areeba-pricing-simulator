import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/components/ui/table';
import { Button } from '../../../shared/components/ui/button';
import { Badge } from '../../../shared/components/ui/badge';
import { Input } from '../../../shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../shared/components/ui/select';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { AdminUser, AdminFilters } from '../types';
import { ADMIN_ROLES, ADMIN_STATUS } from '../constants';
import { formatPrice } from '../../../utils/formatters';
import { Edit, Trash2, UserCheck, UserX, Search, Filter } from 'lucide-react';

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
      console.error('Failed to update user role:', error);
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await updateUser(userId, { is_active: isActive });
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (onDeleteUser) {
      onDeleteUser(user);
    } else {
      try {
        await deleteUser(user.id);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      owner: 'bg-red-100 text-red-800',
      admin: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800',
    };

    return (
      <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
        {role}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filters.userRole || 'all'} onValueChange={(value) => 
          setFilters(prev => ({ ...prev, userRole: value === 'all' ? undefined : value }))
        }>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
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
                <TableCell>
                  <div className="flex items-center gap-2">
                    {canEditUser(user) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditUser?.(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDeleteUser(user) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  );
}
