import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../features/auth';
import { AdminInterface } from '../components/AdminInterface';
import { UnitsConfiguration } from '../features/configuration/components/pricing/UnitsConfiguration';
import { PricingTypesConfiguration } from '../features/configuration/components/pricing/PricingTypesConfiguration';
import { BillingCyclesConfiguration } from '../features/configuration/components/pricing/BillingCyclesConfiguration';
import { TieredTemplatesConfiguration } from '../features/configuration/components/pricing/TieredTemplatesConfiguration';

/**
 * ConfigurationLoader - Renders configuration pages within AdminInterface layout
 * 
 * This component:
 * - Uses AdminInterface for consistent layout
 * - Renders the appropriate configuration page based on route
 * - Provides header, sidebar, and navigation
 * - Ensures consistent styling across all config pages
 */
export function ConfigurationLoader() {
  const location = useLocation();
  const { logout, user } = useAuthContext();

  const handleLogout = async () => {
    await logout();
  };

  // Determine which configuration page to render based on the current route
  const getConfigurationPage = () => {
    if (location.pathname.includes('/pricing/units')) {
      return <UnitsConfiguration />;
    } else if (location.pathname.includes('/pricing/types')) {
      return <PricingTypesConfiguration />;
    } else if (location.pathname.includes('/pricing/billing-cycles')) {
      return <BillingCyclesConfiguration />;
    } else if (location.pathname.includes('/pricing/tiered-templates')) {
      return <TieredTemplatesConfiguration />;
    }
    return <UnitsConfiguration />; // Default fallback
  };

  return (
    <AdminInterface
      onClose={() => window.history.back()}
      items={[]}           // No simulator-specific items for global config
      categories={[]}      // No simulator-specific categories for global config
      onUpdateItems={async () => {}} // Not needed for global configuration
      onUpdateCategories={async () => {}} // Not needed for global configuration
      onLogout={handleLogout}
      currentUserId={user?.id || ""}
      currentUserRole={user?.role || ""}
      isLoading={false}
    />
  );
}
