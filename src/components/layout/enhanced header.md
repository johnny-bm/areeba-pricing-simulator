#### Enhanced Cover Component

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
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import { ArrowLeft, LogOut, Settings, Sun, Moon, Monitor } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { ROLES } from '../../config/database';
import { getAvatarProps } from '../../utils/avatarColors';
import WordMarkRed from '../../imports/WordMarkRed';

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


# Header Consistency - Complete Implementation Guide

## 🎯 Problems Identified

### 1. **Avatar Inconsistency** (Critical)
- AdminInterface used hardcoded `bg-cyan-500` and `OA` initials
- Should use `getAvatarProps()` for dynamic colors

### 2. **User Data Hardcoding**
- AdminInterface had hardcoded "Owner areeba", "owner@areeba.com"
- Should read dynamically from localStorage

### 3. **Missing Features**
- Unified Header lacked breadcrumb support (needed by AdminInterface)
- Unified Header lacked theme switching (needed by AdminInterface)

### 4. **Logo Size Inconsistency**
- Main app: `h-4`
- Auth pages: Mixed (`h-8 w-32`, `w-24 h-6`, etc.)
- No consistent standard

### 5. **Menu Items Different**
- AdminInterface had theme options
- Unified Header didn't

---

## ✅ Solutions Implemented

### 1. Enhanced Header Component
**New Features Added:**
- ✅ Breadcrumb navigation support
- ✅ Theme switching in dropdown menu
- ✅ Dynamic user data from localStorage
- ✅ Dynamic avatar colors via `getAvatarProps()`
- ✅ Flexible left section (breadcrumbs OR title)

### 2. Standardized Logo Sizing
**Consistent Pattern:**
```typescript
// Main App Headers (unified Header component)
<WordMarkRed className="h-6" />

// Auth Pages (Login, Signup, Forgot/Reset Password)
<div className="flex justify-center mb-4">
  <div className="h-6 w-auto">
    <WordMarkRed />
  </div>
</div>
```

### 3. Complete Menu Consistency
**All Headers Now Include:**
- User profile info (name, email, role)
- Admin Panel link (conditional on role)
- Theme switching (conditional on `showThemeToggle`)
- Sign Out option

### 4. Dynamic User Data Everywhere
**No more hardcoding:**
```typescript
const userData = JSON.parse(localStorage.getItem('user') || '{}');
const { email, first_name, last_name, role } = userData;
const displayName = first_name || last_name
  ? `${first_name || ''} ${last_name || ''}`.trim()
  : email || 'User';
const avatarProps = getAvatarProps(displayName);
```

---

## 📋 Implementation Checklist

### Step 1: Update Header Component
- [x] Add breadcrumb support
- [x] Add theme toggle support
- [x] Ensure dynamic user data
- [x] Ensure dynamic avatar colors
- [x] Standardize logo to `h-6`

### Step 2: Update AdminInterface
- [ ] Remove old `<header>` code (lines 686-750+)
- [ ] Import updated `Header` component
- [ ] Pass `breadcrumbs` prop
- [ ] Pass `showThemeToggle={true}` and theme props
- [ ] Remove hardcoded user data

### Step 3: Update Auth Pages
- [ ] **LoginPage.tsx**: Update logo wrapper to standard pattern
- [ ] **SignupPage.tsx**: Update both headers to standard pattern
- [ ] **ForgotPasswordPage.tsx**: Update both states to standard pattern
- [ ] **ResetPasswordPage.tsx**: Update all three states to standard pattern

### Step 4: Verify All Pages
- [ ] SimulatorLanding - already uses Header correctly
- [ ] PricingSimulator - already uses Header correctly
- [ ] AdminInterface - updated with new props
- [ ] All auth pages - logos standardized

---

## 🎨 Design Standards

### Header Layout
```
┌─────────────────────────────────────────────────────────┐
│  [Back] | Logo | Title/Breadcrumbs    [Admin] [User ▼]  │
└─────────────────────────────────────────────────────────┘
```

### Spacing & Sizing
- **Header padding**: `px-4 py-3`
- **Logo height**: `h-6` (24px)
- **Avatar size**: `h-6 w-6` (24px)
- **Button height**: `h-8` (32px)
- **Gap between items**: `gap-2` to `gap-4`

### User Dropdown Menu Items
1. **User Info Section**
   - Name (from localStorage)
   - Email (from localStorage)
   - Role (from localStorage, capitalized)

2. **Navigation Section** (conditional)
   - Admin Panel (if user is Admin or Owner)

3. **Theme Section** (conditional)
   - Light
   - Dark
   - System

4. **Actions Section**
   - Sign Out (red text)

---

## 🔄 Migration Path

### For Existing Pages

**Before (AdminInterface):**
```typescript
<header className="flex h-auto...">
  <div className="flex items-center gap-4">
    <Breadcrumb>{/* breadcrumbs */}</Breadcrumb>
    <DropdownMenu>
      {/* hardcoded user data */}
      <AvatarFallback className="bg-cyan-500">OA</AvatarFallback>
    </DropdownMenu>
  </div>
</header>
```

**After:**
```typescript
<Header
  breadcrumbs={getBreadcrumbs()}
  showUserMenu={true}
  onLogout={onLogout}
  showThemeToggle={true}
  theme={theme}
  setTheme={setTheme}
/>
```

---

## 🎯 Benefits Achieved

### Consistency
- ✅ Same header component everywhere
- ✅ Same styling across all pages
- ✅ Same user experience throughout app

### Maintainability
- ✅ Single source of truth
- ✅ Change once, applies everywhere
- ✅ No duplicate code

### Functionality
- ✅ Dynamic user data (no hardcoding)
- ✅ Dynamic avatar colors
- ✅ Support for all use cases (breadcrumbs, titles, themes)
- ✅ Responsive design built-in

### Developer Experience
- ✅ Easy to use with clear props
- ✅ TypeScript types for safety
- ✅ Flexible options for different pages
- ✅ Well-documented examples

---

## 📖 Quick Reference

### Common Use Cases

**Simple page with logo:**
```typescript
<Header onLogout={handleLogout} />
```

**Page with title:**
```typescript
<Header 
  title="My Page" 
  subtitle="Description"
  onLogout={handleLogout} 
/>
```

**Page with back button:**
```typescript
<Header 
  showBackButton={true}
  backButtonText="Back to Home"
  onLogout={handleLogout} 
/>
```

**Admin panel with breadcrumbs:**
```typescript
<Header 
  breadcrumbs={getBreadcrumbs()}
  showThemeToggle={true}
  theme={theme}
  setTheme={setTheme}
  onLogout={handleLogout} 
/>
```

---

## ⚠️ Important Notes

1. **Breadcrumbs vs Title**: If breadcrumbs are provided, title is ignored (breadcrumbs take precedence)

2. **Theme Toggle**: Only show when `showThemeToggle={true}` AND `setTheme` function is provided

3. **Admin Button**: Separate from dropdown Admin Panel link - use for special admin actions

4. **Logo Sizing**: 
   - Main headers: `h-6` built into component
   - Auth pages: `h-6` in centered wrapper

5. **User Data**: Always read from localStorage, never hardcode

6. **Avatar Colors**: Always use `getAvatarProps()` utility

---

## 🚀 Next Steps

1. Replace the old Header component with the enhanced version
2. Update AdminInterface to use the new Header
3. Update all auth page logos to use consistent sizing
4. Test all pages to ensure proper rendering
5. Remove any old header code that's no longer needed

---

**Result**: Complete header consistency across the entire application! 🎉




You can now implement these changes step by step:
🚀 Implementation Order:
1. Start with the Header Component (Lowest Risk)
Replace your existing src/components/layout/Header.tsx with the enhanced version. This is backward compatible - all existing pages will continue to work.
2. Update AdminInterface (Highest Impact)
This is where you'll see the biggest consistency improvement:

Remove the old header JSX (lines 686-750+)
Import the Header component
Add the breadcrumbs logic
Pass the props

The AdminInterface change looks like this:
typescript// Add these imports at the top
import { Header } from './layout/Header';
import type { BreadcrumbItem } from './layout/Header';

// Keep your existing getBreadcrumbs() function logic

// Then replace the entire <header> element with just:
<Header
  breadcrumbs={getBreadcrumbs()}
  showUserMenu={true}
  onLogout={onLogout}
  showThemeToggle={true}
  theme={theme}
  setTheme={setTheme}
/>
That's it! All the hardcoded "Owner areeba", cyan avatar, etc. will be automatically replaced with dynamic data.
3. Update Auth Pages (Quick Wins)
Just find and replace the logo sections. Each page has 1-3 instances:
Find pattern:
typescript<div className="h-8 w-32">
  <WordMarkRed />
</div>
// OR
<div className="w-24 h-6 mx-auto mb-4">
  <WordMarkRed />
</div>
Replace with:
typescript<div className="flex justify-center mb-4">
  <div className="h-6 w-auto">
    <WordMarkRed />
  </div>
</div>
4. Test Each Page

 Simulator Landing - Should work unchanged
 Pricing Simulator - Should work unchanged
 Admin Panel - Verify breadcrumbs, theme switching, dynamic user info
 Login - Verify logo size
 Signup - Verify logo size in both states
 Forgot Password - Verify logo size in both states
 Reset Password - Verify logo size in all three states

🎨 Visual Verification Checklist:
When testing, verify:
✅ User Avatar

Shows correct initials (not "OA" for everyone)
Has varied colors (not always cyan)
Colors are consistent per user across all pages

✅ User Dropdown

Shows real name from localStorage
Shows real email
Shows correct role (capitalized)
Admin Panel link appears for admin/owner only
Theme options appear when showThemeToggle={true}
Sign Out in red at the bottom

✅ Logo

Same height everywhere (24px / h-6)
Maintains aspect ratio
Centered on auth pages
Left-aligned in main headers

✅ Layout

Consistent padding and spacing
Same border-bottom
Same responsive behavior (user name hidden on mobile)

🔧 Troubleshooting:
If avatars don't show colors:

Verify getAvatarProps() is imported and working
Check that user data exists in localStorage
Verify the utility returns bgClass and textClass

If breadcrumbs don't appear:

Ensure you're passing a non-empty breadcrumbs array
Check that BreadcrumbItem type matches the interface
Verify breadcrumb imports are correct

If theme toggle doesn't appear:

Must pass showThemeToggle={true}
Must pass both theme and setTheme props
Check that theme context/hook is properly set up

If admin button shows for regular users:

Verify role in localStorage matches ROLES constants
Check ROLES.ADMIN and ROLES.OWNER are defined correctly

💡 Pro Tips:

Start with a backup - Copy your current Header.tsx before replacing
Test incrementally - Update one page at a time rather than all at once
Use browser DevTools - Check localStorage to verify user data structure
Console log breadcrumbs - If they don't appear, log the array to debug
Check imports - Make sure all UI components (Breadcrumb, etc.) are imported

🎯 Expected Results:
Before:

AdminInterface shows "Owner areeba" with cyan avatar
Auth pages have inconsistent logo sizes
Duplicate header code in multiple files
Theme switching only in admin panel

After:

All headers show real user data with dynamic avatar colors
All logos are consistently sized at h-6
Single Header component used everywhere
Theme switching available wherever needed
Breadcrumbs work in admin panel
Zero hardcoded user information