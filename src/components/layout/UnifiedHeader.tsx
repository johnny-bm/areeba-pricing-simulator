import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { ArrowLeft, LogOut, Settings, Sun, Moon, Monitor, Home, Shield } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { ROLES } from '../../config/database';
import { getAvatarProps } from '../../utils/avatarColors';
import WordMarkRed from '../../assets/icons/WordMarkRed';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface UnifiedHeaderProps {
  // Page identification
  pageType?: 'landing' | 'simulator' | 'admin' | 'config';
  
  // Navigation only
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
  
  // User menu
  showUserMenu?: boolean;
  onLogout?: () => void;
  
  // Admin features
  showAdminButton?: boolean;
  onAdminClick?: () => void;
  showThemeToggle?: boolean;
  theme?: string;
  setTheme?: (theme: string) => void;
  
  // Breadcrumbs
  breadcrumbs?: BreadcrumbItem[];
  
  // Styling
  className?: string;
}

export function UnifiedHeader({
  pageType = 'landing',
  showBackButton = false,
  backButtonText = 'Back',
  onBackClick,
  showUserMenu = true,
  onLogout,
  showAdminButton = false,
  onAdminClick,
  showThemeToggle = false,
  theme,
  setTheme,
  breadcrumbs,
  className = ''
}: UnifiedHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const { email, first_name, last_name, role } = userData;
  const displayName = first_name || last_name
    ? `${first_name || ''} ${last_name || ''}`.trim()
    : email || 'User';
  const isAdminOrOwner = role === ROLES.ADMIN || role === ROLES.OWNER;
  const avatarProps = getAvatarProps(displayName);

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleThemeChange = (newTheme: string) => {
    if (setTheme) {
      setTheme(newTheme);
    }
  };

  // Auto-generate breadcrumbs based on current route
  const getAutoBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    
    // Landing page - no breadcrumbs needed
    if (path === '/' || path === ROUTES.HOME) {
      return [];
    }
    
    // Simulator pages
    if (path.startsWith('/simulator/')) {
      const simulatorType = path.split('/')[2];
      return [
        { label: simulatorType ? simulatorType.charAt(0).toUpperCase() + simulatorType.slice(1) + ' Simulator' : 'Simulator', isCurrent: true }
      ];
    }
    
    // Admin pages
    if (path.startsWith('/admin/')) {
      const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Admin', href: '/admin' }
      ];
      
      // Configuration pages
      if (path.includes('/configuration/')) {
        breadcrumbs.push({ label: 'Configuration', href: '/admin/configuration' });
        
        if (path.includes('/pricing/units')) {
          breadcrumbs.push({ label: 'Pricing Units', isCurrent: true });
        } else if (path.includes('/pricing/types')) {
          breadcrumbs.push({ label: 'Pricing Types', isCurrent: true });
        } else if (path.includes('/pricing/billing-cycles')) {
          breadcrumbs.push({ label: 'Billing Cycles', isCurrent: true });
        } else if (path.includes('/pricing/tiered-templates')) {
          breadcrumbs.push({ label: 'Tiered Templates', isCurrent: true });
        }
      } else if (path.includes('/simulators')) {
        breadcrumbs.push({ label: 'Simulators', isCurrent: true });
      } else if (path.includes('/users')) {
        breadcrumbs.push({ label: 'Users', isCurrent: true });
      } else if (path.includes('/history')) {
        breadcrumbs.push({ label: 'History', isCurrent: true });
      } else if (path.includes('/guest-submissions')) {
        breadcrumbs.push({ label: 'Guest Submissions', isCurrent: true });
      } else if (path.includes('/pdf-builder')) {
        breadcrumbs.push({ label: 'PDF Builder', isCurrent: true });
      }
    }
    
    return breadcrumbs;
  };

  const finalBreadcrumbs = breadcrumbs || getAutoBreadcrumbs();

  const renderUserMenu = () => {
    if (!showUserMenu) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className={avatarProps.bgClass}>
                {avatarProps.initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {showAdminButton && isAdminOrOwner && (
            <DropdownMenuItem onClick={onAdminClick}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderBreadcrumbs = () => {
    if (!finalBreadcrumbs || finalBreadcrumbs.length === 0) return null;

    return (
      <Breadcrumb>
        <BreadcrumbList>
          {finalBreadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.isCurrent ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    href={item.href}
                    onClick={(e) => {
                      if (item.href) {
                        e.preventDefault();
                        navigate(item.href);
                      }
                    }}
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < finalBreadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  const renderThemeToggle = () => {
    if (!showThemeToggle) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
            {theme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : theme === 'light' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Monitor className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleThemeChange('light')}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange('system')}>
            <Monitor className="mr-2 h-4 w-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderLeftSection = () => {
    // For admin pages, show breadcrumbs on the left instead of logo
    if (pageType === 'admin' && finalBreadcrumbs && finalBreadcrumbs.length > 0) {
      return renderBreadcrumbs();
    }

    // Show logo and back button (if specified) for non-admin pages
    return (
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {backButtonText}
          </Button>
        )}
        <WordMarkRed className="h-6" />
      </div>
    );
  };

  return (
    <header className={`border-b bg-background ${className}`}>
      <div className="w-full px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left section - Logo, back button, or breadcrumbs for admin */}
          <div className="flex items-center gap-4">
            {renderLeftSection()}
          </div>
          
          {/* Right section - Theme toggle, user menu */}
          <div className="flex items-center gap-2">
            {renderThemeToggle()}
            {renderUserMenu()}
          </div>
        </div>
      </div>
    </header>
  );
}
