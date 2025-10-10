import { useState, useEffect } from 'react';
import { StandardDialog } from '../StandardDialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { ROLES } from '../../config/database';
import { AlertCircle, Trash2 } from 'lucide-react';

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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState(ROLES.MEMBER);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    } else {
      setEmail('');
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
      } else {
        // Create new user invitation
        await onSave('', {
          email,
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
      title={isEditing ? 'Edit User' : 'Send User Invitation'}
      description={
        isEditing 
          ? 'Update user information and permissions' 
          : 'Send an invitation email to create a new user account with specified role and permissions'
      }
      size="lg"
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
        label: isSaving ? 'Saving...' : isEditing ? 'Update User' : 'Send Invitation',
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

          {/* Invitation Info */}
          {!isEditing && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
                    <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">ℹ</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Invitation Process</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    An invitation email will be sent to the user. They will create their own password during signup.
                  </p>
                </div>
              </div>
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
