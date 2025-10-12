# Complete Header Code Documentation

## What This Document Contains

This document was created to provide a comprehensive overview of **ALL header implementations** across the entire application. The user requested to see all header-related code from every page to understand the current state and ensure consistency.

**Purpose**: To document every header implementation in the app, including:
- Unified Header component (new)
- AdminInterface header (existing complex sidebar)
- Login/Signup page headers (auth pages)
- Forgot/Reset password headers (auth flow)
- All variations and states

**Goal**: Ensure all headers are consistent in terms of layout, design, spacing, and functionality across the entire application.

---

## All Header Implementations Across the Application

### 1. Unified Header Component

#### File: `src/components/layout/Header.tsx`

```typescript
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
import { ArrowLeft, LogOut, Settings } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { ROLES } from '../../config/database';
import { getAvatarProps } from '../../utils/avatarColors';
import WordMarkRed from '../../imports/WordMarkRed';

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
          
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className={`flex h-auto shrink-0 flex-col gap-2 border-b px-4 py-3 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
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
            <WordMarkRed className="h-4" />
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
```

### 2. AdminInterface Header (Complex Sidebar Layout)

#### File: `src/components/AdminInterface.tsx` (lines 686-750+)

```typescript
<header className="flex h-auto shrink-0 flex-col gap-2 border-b px-4 py-3">
  <div className="flex items-center gap-4">
    <div className="flex-1">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList className="text-xs">
          {getBreadcrumbs().map((crumb, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
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
              </BreadcrumbItem>
              {index < getBreadcrumbs().length - 1 && <BreadcrumbSeparator className="text-xs" />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 rounded-md px-3 text-xs gap-2"
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback 
              className="text-xs font-medium bg-cyan-500 text-white"
            >
              OA
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">Owner areeba</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Owner areeba</p>
            <p className="text-xs leading-none text-muted-foreground">
              owner@areeba.com
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              Owner
            </p>
          </div>
        </DropdownMenuLabel>
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</header>
```

### 3. Login Page Header

#### File: `src/components/LoginPage.tsx` (lines 73-83)

```typescript
<CardHeader className="text-center">
  <div className="flex justify-center mb-4">
    <div className="h-8 w-32">
      <WordMarkRed />
    </div>
  </div>
  <CardTitle>Sign In</CardTitle>
  <CardDescription>
    Sign in to your account to continue
  </CardDescription>
</CardHeader>
```

### 4. Signup Page Header

#### File: `src/components/SignupPage.tsx` (lines 160-168 and 216-224)

```typescript
// Invite Code Form Header
<CardHeader>
  <div className="w-24 h-6 mx-auto mb-4">
    <WordMarkRed />
  </div>
  <CardTitle className="text-center">Enter Invite Code</CardTitle>
  <CardDescription className="text-center">
    Enter the invite code provided by your administrator
  </CardDescription>
</CardHeader>

// Signup Form Header
<CardHeader>
  <div className="w-24 h-6 mx-auto mb-4">
    <WordMarkRed />
  </div>
  <CardTitle className="text-center">Create Account</CardTitle>
  <CardDescription className="text-center">
    You've been invited as {invite?.role}
  </CardDescription>
</CardHeader>
```

### 5. Forgot Password Page Header

#### File: `src/components/ForgotPasswordPage.tsx` (lines 65-78 and 100-108)

```typescript
// Success State Header
<CardHeader className="space-y-1">
  <div className="w-24 h-6 mx-auto mb-4">
    <WordMarkRed />
  </div>
  <CardTitle className="text-center">Check Your Email</CardTitle>
  <CardDescription className="text-center">
    We've sent a password reset link to <strong>{email}</strong>
  </CardDescription>
</CardHeader>

// Form Header
<CardHeader className="space-y-1">
  <div className="w-24 h-6 mx-auto mb-4">
    <WordMarkRed />
  </div>
  <CardTitle className="text-center">Reset Password</CardTitle>
  <CardDescription className="text-center">
    Enter your email address and we'll send you a link to reset your password
  </CardDescription>
</CardHeader>
```

### 6. Reset Password Page Header

#### File: `src/components/ResetPasswordPage.tsx` (lines 100-105, 126-139, 148-156)

```typescript
// Error State Header
<CardHeader className="space-y-1">
  <div className="w-24 h-6 mx-auto mb-4">
    <WordMarkRed />
  </div>
  <CardTitle className="text-center">Invalid Reset Link</CardTitle>
</CardHeader>

// Success State Header
<CardHeader className="space-y-1">
  <div className="w-24 h-6 mx-auto mb-4">
    <WordMarkRed />
  </div>
  <CardTitle className="text-center">Password Updated</CardTitle>
  <CardDescription className="text-center">
    Your password has been updated successfully. Redirecting to login...
  </CardDescription>
</CardHeader>

// Form Header
<CardHeader className="space-y-1">
  <div className="w-24 h-6 mx-auto mb-4">
    <WordMarkRed />
  </div>
  <CardTitle className="text-center">Set New Password</CardTitle>
  <CardDescription className="text-center">
    Enter your new password below
  </CardDescription>
</CardHeader>
```

## Usage Examples

### SimulatorLanding Page (Using Unified Header)
```typescript
<Header
  title="Pricing Simulators"
  subtitle="Select a pricing simulator to configure and calculate costs for your payment solutions"
  showAdminButton={!!onOpenAdmin}
  onAdminClick={onOpenAdmin}
  onLogout={onLogout}
/>
```

### PricingSimulator Page (Using Unified Header)
```typescript
<Header
  showBackButton={true}
  backButtonText="Back to Simulators"
  onBackClick={() => setSelectedSimulator(null)}
  showUserMenu={isAuthenticated}
  onLogout={handleLogout}
/>
```

## Key Features

### Layout Structure
- **Header Container**: `flex h-auto shrink-0 flex-col gap-2 border-b px-4 py-3`
- **Main Row**: `flex items-center gap-4`
- **Left Section**: `flex-1` with logo, back button, title
- **Right Section**: Admin button and user menu

### User Profile Dropdown
- **Button**: `h-8 rounded-md px-3 text-xs gap-2`
- **Avatar**: `h-6 w-6` with colored background
- **Dropdown**: `w-56` with user info, role, and actions
- **Menu Items**: Admin Panel link (for admin users) and Sign Out

### Responsive Design
- **Mobile**: User name hidden on small screens (`hidden sm:inline`)
- **Desktop**: Full user name and admin button visible
- **Consistent**: Same styling across all pages

### Styling Classes
- **Header**: `flex h-auto shrink-0 flex-col gap-2 border-b px-4 py-3`
- **User Button**: `h-8 rounded-md px-3 text-xs gap-2`
- **Avatar**: `h-6 w-6` with dynamic colors
- **Dropdown**: `w-56` with proper alignment

## Consistency Achieved

✅ **Same header layout** across simulator and admin pages
✅ **Same user dropdown** with identical styling and behavior  
✅ **Same spacing and padding** throughout
✅ **Same button styles** and interactions
✅ **Same responsive behavior** on all screen sizes
