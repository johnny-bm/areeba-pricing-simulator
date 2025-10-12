import React from 'react';
import { Header, Footer } from './index';
import { ROUTES } from '../../config/routes';

/**
 * Test component to verify Header and Footer components work correctly
 * This component can be used to test different variants and configurations
 */
export function HeaderFooterTest() {
  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const handleAdminClick = () => {
    console.log('Admin clicked');
  };

  const handleBackClick = () => {
    console.log('Back clicked');
  };

  const navigationItems = [
    { label: 'Dashboard', href: ROUTES.HOME, icon: '🏠' },
    { label: 'Simulators', href: ROUTES.SIMULATOR, icon: '⚙️' },
    { label: 'Admin', href: ROUTES.ADMIN, icon: '👤', adminOnly: true }
  ];

  const footerColumns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Documentation', href: '/docs' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/help' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Status', href: '/status' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Test different header variants */}
      <div className="space-y-8 p-4">
        <div>
          <h2 className="text-lg font-semibold mb-4">Public Header</h2>
          <Header
            variant="public"
            title="Pricing Simulators"
            subtitle="Select a pricing simulator to configure and calculate costs"
            showAdminButton={true}
            onAdminClick={handleAdminClick}
            onLogout={handleLogout}
            navigationItems={navigationItems}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Simulator Header</h2>
          <Header
            variant="simulator"
            title="Payment Gateway Simulator"
            showBackButton={true}
            backButtonText="Back to Simulators"
            onBackClick={handleBackClick}
            showUserMenu={true}
            onLogout={handleLogout}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Admin Header</h2>
          <Header
            variant="admin"
            title="Admin Dashboard"
            showBreadcrumbs={true}
            breadcrumbs={[
              { label: 'Admin', href: ROUTES.ADMIN },
              { label: 'Dashboard' }
            ]}
            showUserMenu={true}
            onLogout={handleLogout}
            navigationItems={navigationItems}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Header with Actions</h2>
          <Header
            variant="public"
            title="Test Page"
            actions={
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                  Action 1
                </button>
                <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">
                  Action 2
                </button>
              </div>
            }
            showUserMenu={true}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Test different footer variants */}
      <div className="mt-auto">
        <div className="space-y-8 p-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">Public Footer</h2>
            <Footer
              variant="public"
              showVersionInfo={true}
              showSocialLinks={true}
              columns={footerColumns}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Simulator Footer</h2>
            <Footer
              variant="simulator"
              showVersionInfo={true}
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Admin Footer</h2>
            <Footer
              variant="admin"
              showVersionInfo={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
