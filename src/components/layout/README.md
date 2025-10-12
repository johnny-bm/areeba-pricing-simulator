# Layout Components

This directory contains unified Header and Footer components that provide consistent navigation and branding across the application.

## Components

### Header

A flexible header component that supports different variants and configurations.

#### Variants

- **`public`**: Standard public header with logo, navigation, and user menu
- **`admin`**: Admin-specific header with breadcrumbs, theme toggle, and admin actions
- **`simulator`**: Simulator page header with back button and user menu

#### Props

```typescript
interface HeaderProps {
  variant?: 'public' | 'admin' | 'simulator';
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
  showUserMenu?: boolean;
  showAdminButton?: boolean;
  onAdminClick?: () => void;
  onLogout?: () => void;
  navigationItems?: NavigationItem[];
  showBreadcrumbs?: boolean;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  className?: string;
}
```

#### Usage Examples

```tsx
// Public header
<Header
  variant="public"
  title="Pricing Simulators"
  subtitle="Select a pricing simulator to configure and calculate costs"
  showAdminButton={true}
  onAdminClick={handleAdminClick}
  onLogout={handleLogout}
  navigationItems={navigationItems}
/>

// Simulator header
<Header
  variant="simulator"
  title="Payment Gateway Simulator"
  showBackButton={true}
  backButtonText="Back to Simulators"
  onBackClick={handleBackClick}
  showUserMenu={true}
  onLogout={handleLogout}
/>

// Admin header
<Header
  variant="admin"
  title="Admin Dashboard"
  showBreadcrumbs={true}
  breadcrumbs={[
    { label: 'Admin', href: '/admin' },
    { label: 'Dashboard' }
  ]}
  showUserMenu={true}
  onLogout={handleLogout}
  navigationItems={navigationItems}
/>
```

### Footer

A flexible footer component that supports different variants and configurations.

#### Variants

- **`public`**: Full footer with columns, social links, and branding
- **`admin`**: Simple admin footer with copyright and links
- **`simulator`**: Simulator page footer with version info

#### Props

```typescript
interface FooterProps {
  variant?: 'public' | 'admin' | 'simulator';
  showVersionInfo?: boolean;
  showSocialLinks?: boolean;
  showPrivacyLink?: boolean;
  showAboutLink?: boolean;
  columns?: FooterColumn[];
  customLinks?: FooterLink[];
  className?: string;
}
```

#### Usage Examples

```tsx
// Public footer
<Footer
  variant="public"
  showVersionInfo={true}
  showSocialLinks={true}
  columns={footerColumns}
/>

// Simulator footer
<Footer
  variant="simulator"
  showVersionInfo={true}
/>

// Admin footer
<Footer
  variant="admin"
  showVersionInfo={true}
/>
```

## Features

### Responsive Design
- Mobile-first approach with responsive breakpoints
- Collapsible mobile navigation menu
- Adaptive layout for different screen sizes

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly

### Theme Support
- Dark/light mode support
- System theme detection
- Theme toggle in admin header

### Navigation
- Configurable navigation items
- Breadcrumb support
- Back button functionality
- User menu with profile information

## Implementation Details

### Dependencies
- React Router for navigation
- shadcn/ui components for consistent styling
- Lucide React for icons
- Theme context for theme management

### Styling
- Tailwind CSS for styling
- Consistent with shadcn/ui design system
- Responsive breakpoints: sm, md, lg, xl

### State Management
- Uses localStorage for user data
- Theme context for theme management
- Router navigation for page transitions

## Migration Guide

### Replacing Existing Headers

1. **SimulatorLanding**: ✅ Completed
   - Replaced custom header with `<Header variant="public" />`
   - Maintains all existing functionality

2. **PricingSimulator**: ✅ Completed
   - Replaced custom header with `<Header variant="simulator" />`
   - Maintains back button and user menu

3. **AdminInterface**: ⚠️ Pending
   - Complex sidebar layout - may need custom implementation
   - Consider using header for breadcrumbs and user menu

### Replacing Existing Footers

1. **SimulatorLanding**: ✅ Completed
   - Replaced custom footer with `<Footer variant="public" />`

2. **PricingSimulator**: ✅ Completed
   - Replaced custom footer with `<Footer variant="simulator" />`

## Testing

Use the `HeaderFooterTest` component to test different configurations:

```tsx
import { HeaderFooterTest } from './layout/HeaderFooterTest';

// Add to your routes for testing
<Route path="/test-layout" element={<HeaderFooterTest />} />
```

## Future Enhancements

- [ ] Add search functionality to header
- [ ] Implement notification system
- [ ] Add keyboard shortcuts
- [ ] Enhance mobile navigation
- [ ] Add animation transitions
