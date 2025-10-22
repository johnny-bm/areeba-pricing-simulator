import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  BreadcrumbItem as UIBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { ArrowLeft, LogOut, Settings, Sun, Moon, Monitor } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { ROLES } from '../../config/database';
import { getAvatarProps } from '../../utils/avatarColors';
import WordMarkRed from '../../assets/icons/WordMarkRed';

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrent?: boolean;
}

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
  showUserMenu?: boolean;
  onLogout?: () => void;
  showAdminButton?: boolean;
  onAdminClick?: () => void;
  showThemeToggle?: boolean;
  theme?: string;
  setTheme?: (theme: string) => void;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export function Header({
  title,
  subtitle,
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
}: HeaderProps) {
  const navigate = useNavigate();

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

  const renderUserMenu = () => {
    if (!showUserMenu) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 rounded-md px-3 text-xs gap-2"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback 
                className={`text-xs font-medium ${avatarProps.bgClass} ${avatarProps.textClass}`}
              >
                {avatarProps.initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
              <p className="text-xs leading-none text-muted-foreground capitalize">
                {role}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {isAdminOrOwner && (
            <DropdownMenuItem onClick={() => navigate(ROUTES.ADMIN_SIMULATORS)}>
              <Settings className="h-4 w-4 mr-2" />
              Admin Panel
            </DropdownMenuItem>
          )}
          
          {showThemeToggle && setTheme && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="h-4 w-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="h-4 w-4 mr-2" />
                System
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderBreadcrumbs = () => {
    if (!breadcrumbs || breadcrumbs.length === 0) return null;

    return (
      <Breadcrumb>
        <BreadcrumbList className="text-xs">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <UIBreadcrumbItem>
                {crumb.isCurrent ? (
                  <BreadcrumbPage className="text-xs">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    href={crumb.href}
                    className="text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(crumb.href);
                    }}
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </UIBreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator className="text-xs" />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  const renderLeftSection = () => {
    // If breadcrumbs are provided, show them instead of title
    if (breadcrumbs && breadcrumbs.length > 0) {
      return renderBreadcrumbs();
    }

    // Otherwise show the title/logo/back button layout
    return (
      <div className="flex items-center gap-3">
        {showBackButton && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {backButtonText}
            </Button>
            <div className="h-4 w-px bg-border" />
          </>
        )}
        <WordMarkRed className="h-6" />
        {title && (
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className={`flex h-auto shrink-0 flex-col gap-2 border-b px-4 py-3 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          {renderLeftSection()}
        </div>
        
        <div className="flex items-center gap-2">
          {showAdminButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAdminClick}
              className="flex items-center gap-2"
            >
              Admin
            </Button>
          )}
          {renderUserMenu()}
        </div>
      </div>
    </header>
  );
}