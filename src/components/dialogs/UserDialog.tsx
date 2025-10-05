import { useState, useEffect } from 'react';
import { StandardDialog } from '../StandardDialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { ROLES } from '../../config/database';
import { AlertCircle, Eye, EyeOff, Trash2 } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
}

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, updates: any) => Promise<void>;
  onDelete?: (user: User) => Promise<void>;
  user: User | null;
  currentUserId: string;
  currentUserRole: string;
}

export function UserDialog({ isOpen, onClose, onSave, onDelete, user, currentUserId, currentUserRole }: UserDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState(ROLES.MEMBER);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!user;
  const isOwner = currentUserRole === ROLES.OWNER;
  const isEditingSelf = user?.id === currentUserId;

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setRole(user.role as any);
      setIsActive(user.is_active);
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setRole(ROLES.MEMBER);
      setIsActive(true);
    }
    setErrors({});
  }, [user]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation (only for new users)
    if (!isEditing) {
      if (!password) {
        newErrors.password = 'Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

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
      } else {
        // Create new user
        await onSave('', {
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role,
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !onDelete) return;

    const userName = firstName || lastName 
      ? `${firstName || ''} ${lastName || ''}`.trim()
      : email;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${userName}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setIsSaving(true);
    try {
      await onDelete(user);
      onClose();
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StandardDialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit User' : 'Add New User'}
      description={
        isEditing 
          ? 'Update user information and permissions' 
          : 'Create a new user account with specified role and permissions'
      }
      size="md"
      destructiveActions={isEditing && onDelete && !isEditingSelf && (isOwner || user.role !== ROLES.OWNER) ? [{
        label: 'Delete User',
        onClick: handleDelete,
        loading: isSaving,
        icon: <Trash2 className="h-4 w-4" />
      }] : []}
      secondaryActions={[
        {
          label: 'Cancel',
          onClick: onClose,
          disabled: isSaving
        }
      ]}
      primaryAction={{
        label: isSaving ? 'Saving...' : isEditing ? 'Update User' : 'Create User',
        onClick: handleSave,
        loading: isSaving
      }}
    >
      <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEditing} // Email cannot be changed after creation
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground">Email cannot be changed after account creation</p>
            )}
          </div>

          {/* Password (only for new users) */}
          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters
              </p>
            </div>
          )}

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={role} 
              onValueChange={setRole}
              disabled={isEditingSelf || (!isOwner && user?.role === ROLES.OWNER)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROLES.MEMBER}>
                  <div className="flex flex-col items-start">
                    <span>Member</span>
                    <span className="text-xs text-muted-foreground">Can create and manage their own scenarios</span>
                  </div>
                </SelectItem>
                <SelectItem value={ROLES.ADMIN}>
                  <div className="flex flex-col items-start">
                    <span>Admin</span>
                    <span className="text-xs text-muted-foreground">Can manage services and view all data</span>
                  </div>
                </SelectItem>
                {isOwner && (
                  <SelectItem value={ROLES.OWNER}>
                    <div className="flex flex-col items-start">
                      <span>Owner</span>
                      <span className="text-xs text-muted-foreground">Full system access and user management</span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {isEditingSelf && (
              <p className="text-xs text-muted-foreground">You cannot change your own role</p>
            )}
            {!isOwner && user?.role === ROLES.OWNER && (
              <p className="text-xs text-muted-foreground">Only owners can modify owner accounts</p>
            )}
          </div>

          {/* Active Status */}
          {isEditing && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  {isActive ? 'User can log in and access the system' : 'User is blocked from logging in'}
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isEditingSelf}
              />
            </div>
          )}
        </div>
    </StandardDialog>
  );
}
