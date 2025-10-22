/**
 * Lazy-loaded components for better bundle splitting
 * This file contains all the heavy components that should be loaded on demand
 */

import React, { lazy } from 'react';

// Admin components - only load when admin features are accessed
export const AdminInterface = lazy(() => import('../components/AdminInterface'));
export const AdminDashboard = lazy(() => import('../features/admin/components/AdminDashboard'));
export const AdminUsersTable = lazy(() => import('../features/admin/components/AdminUsersTable'));

// PDF Builder components - only load when PDF features are accessed
export const PdfGenerator = lazy(() => import('../features/pdfBuilder/components/PdfGenerator'));
export const TemplateBuilder = lazy(() => import('../features/pdfBuilder/components/TemplateBuilder'));
export const TemplateBuilderInterface = lazy(() => import('../features/pdfBuilder/components/TemplateBuilderInterface'));
export const SectionManager = lazy(() => import('../features/pdfBuilder/components/SectionManager'));
export const SectionsPage = lazy(() => import('../features/pdfBuilder/components/SectionsPage'));
export const RichTextEditor = lazy(() => import('../features/pdfBuilder/components/RichTextEditor'));

// Configuration components - only load when configuration is accessed
export const PricingTypesConfiguration = lazy(() => import('../features/configuration/components/pricing/PricingTypesConfiguration'));
export const BillingCyclesConfiguration = lazy(() => import('../features/configuration/components/pricing/BillingCyclesConfiguration'));
export const UnitsConfiguration = lazy(() => import('../features/configuration/components/pricing/UnitsConfiguration'));
export const TieredTemplatesConfiguration = lazy(() => import('../features/configuration/components/pricing/TieredTemplatesConfiguration'));

// Heavy UI components
export const DataTable = lazy(() => import('../components/ui/table'));
export const Chart = lazy(() => import('../components/ui/chart'));

// Dialog components - load on demand
export const ItemDialog = lazy(() => import('../components/dialogs/ItemDialog'));
export const ScenarioDialog = lazy(() => import('../components/dialogs/ScenarioDialog'));
export const ScenarioSummaryDialog = lazy(() => import('../components/dialogs/ScenarioSummaryDialog'));
export const GuestSubmissionDetailDialog = lazy(() => import('../components/dialogs/GuestSubmissionDetailDialog'));

// Service management components
export const SimpleServiceManager = lazy(() => import('../components/SimpleServiceManager'));
export const SimpleServiceEditor = lazy(() => import('../components/SimpleServiceEditor'));
export const TieredPricingEditor = lazy(() => import('../components/TieredPricingEditor'));

// Utility components
export const ConnectionDiagnostics = lazy(() => import('../components/ConnectionDiagnostics'));
export const BackendConnectionError = lazy(() => import('../components/BackendConnectionError'));

/**
 * Preload critical components for better UX
 * Call these functions when user hovers over navigation items
 */
export const preloadAdminComponents = () => {
  import('../components/AdminInterface');
  import('../features/admin/components/AdminDashboard');
};

export const preloadPdfComponents = () => {
  import('../features/pdfBuilder/components/PdfGenerator');
  import('../features/pdfBuilder/components/TemplateBuilder');
};

export const preloadConfigurationComponents = () => {
  import('../features/configuration/components/pricing/PricingTypesConfiguration');
  import('../features/configuration/components/pricing/BillingCyclesConfiguration');
};

/**
 * Lazy loading with error boundaries
 */
export const withLazyLoading = (Component: React.LazyExoticComponent<any>) => {
  return (props: any) => {
    const LazyComponent = Component;
    
    return React.createElement(React.Suspense, {
      fallback: React.createElement('div', {
        className: "flex items-center justify-center p-8"
      }, React.createElement('div', {
        className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
      }))
    }, React.createElement(LazyComponent, props));
  };
};

/**
 * Route-based lazy loading
 */
export const lazyRoutes = {
  admin: () => import('../features/admin/components/AdminDashboard'),
  pdfBuilder: () => import('../features/pdfBuilder/components/TemplateBuilder'),
  configuration: () => import('../features/configuration/components/pricing/PricingTypesConfiguration'),
  pricing: () => import('../features/pricing/components/PricingSimulator'),
};

/**
 * Feature-based lazy loading
 */
export const lazyFeatures = {
  admin: {
    dashboard: () => import('../features/admin/components/AdminDashboard'),
    users: () => import('../features/admin/components/AdminUsersTable'),
    stats: () => import('../features/admin/hooks/useAdminStats'),
  },
  pdfBuilder: {
    generator: () => import('../features/pdfBuilder/components/PdfGenerator'),
    templateBuilder: () => import('../features/pdfBuilder/components/TemplateBuilder'),
    sectionManager: () => import('../features/pdfBuilder/components/SectionManager'),
  },
  configuration: {
    pricingTypes: () => import('../features/configuration/components/pricing/PricingTypesConfiguration'),
    billingCycles: () => import('../features/configuration/components/pricing/BillingCyclesConfiguration'),
    units: () => import('../features/configuration/components/pricing/UnitsConfiguration'),
  },
};
