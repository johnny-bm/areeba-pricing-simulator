/**
 * Main Zustand Store
 * 
 * Centralized state management with middleware
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createAuthSlice } from './slices/auth.slice';
import { createPricingSlice } from './slices/pricing.slice';
import { createUISlice } from './slices/ui.slice';
import { createAdminSlice } from './slices/admin.slice';
import { createDocumentSlice } from './slices/document.slice';
import { StoreState } from './types';

export const useAppStore = create<StoreState>()(
  devtools(
    persist(
      immer((...args) => ({
        auth: createAuthSlice(...args),
        pricing: createPricingSlice(...args),
        ui: createUISlice(...args),
        admin: createAdminSlice(...args),
        document: createDocumentSlice(...args),
      })),
      {
        name: 'areeba-store',
        partialize: (state) => ({
          // Only persist auth and theme for security
          auth: {
            user: state.auth.user,
            isAuthenticated: state.auth.isAuthenticated,
          },
          ui: {
            theme: state.ui.theme,
          },
        }),
      }
    ),
    {
      name: 'Areeba Pricing Store',
    }
  )
);

// Typed selector hooks for better DX
export const useAuth = () => useAppStore((state) => state.auth);
export const usePricing = () => useAppStore((state) => state.pricing);
export const useUI = () => useAppStore((state) => state.ui);
export const useAdmin = () => useAppStore((state) => state.admin);
export const useDocument = () => useAppStore((state) => state.document);

// Export store for direct access if needed
export { useAppStore as useStore };
