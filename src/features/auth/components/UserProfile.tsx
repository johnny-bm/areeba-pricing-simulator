import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../../../shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../../../shared/components/ui/avatar';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AUTH_ROLES } from '../constants';
import { ROUTES } from '../../../config/routes';
import { getAvatarProps } from '../../../utils/avatarColors';
import { ThemeToggle } from '../../../components/ThemeToggle';

interface UserProfileProps {
  onLogout: () => void;
}

export function UserProfile({ onLogout }: UserProfileProps) {
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
    } catch (error) {
      // Still logout locally even if API call fails
      onLogout();
      navigate(ROUTES.LOGIN);
    }
  };

  const avatarProps = getAvatarProps(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={`text-xs font-medium ${avatarProps.bgClass} ${avatarProps.textClass}`}>
              {avatarProps.initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{displayName}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user.email}
          </p>
          <p className="text-xs leading-none text-muted-foreground capitalize">
            {user.role}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate(ROUTES.ADMIN)}
          disabled={!isAdminOrOwner}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Admin Panel</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut || isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
