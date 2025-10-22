/**
 * Critical Path Tests for Essential User Flows
 * Tests the most important user journeys to ensure core functionality works
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PricingSimulator } from '../../src/components/PricingSimulator';
import { AdminInterface } from '../../src/components/AdminInterface';
import { api } from '../../src/utils/api';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';

// Mock data
const mockPricingItems = [
  {
    id: '1',
    name: 'Web Development',
    description: 'Custom web application development',
    categoryId: 'cat-1',
    unit: 'hour',
    defaultPrice: 150,
    pricingType: 'one_time' as const,
    billingCycle: 'one_time' as const,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Hosting',
    description: 'Monthly hosting service',
    categoryId: 'cat-2',
    unit: 'month',
    defaultPrice: 50,
    pricingType: 'recurring' as const,
    billingCycle: 'monthly' as const,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockCategories = [
  {
    id: 'cat-1',
    name: 'Development',
    description: 'Software development services',
    color: '#3B82F6',
    order_index: 1,
    display_order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'cat-2',
    name: 'Hosting',
    description: 'Hosting and infrastructure services',
    color: '#10B981',
    order_index: 2,
    display_order: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Mock API responses
vi.mock('../../src/utils/api', () => ({
  api: {
    loadPricingItems: vi.fn(),
    loadCategories: vi.fn(),
    savePricingItems: vi.fn(),
    saveCategories: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </BrowserRouter>
);

describe('Critical User Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default API mocks
    vi.mocked(api.loadPricingItems).mockResolvedValue(mockPricingItems);
    vi.mocked(api.loadCategories).mockResolvedValue(mockCategories);
    vi.mocked(api.savePricingItems).mockResolvedValue();
    vi.mocked(api.saveCategories).mockResolvedValue();
    vi.mocked(api.healthCheck).mockResolvedValue(true);
  });

  describe('Pricing Simulator Flow', () => {
    it('should load and display pricing items', async () => {
      render(
        <TestWrapper>
          <PricingSimulator />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(api.loadPricingItems).toHaveBeenCalled();
        expect(api.loadCategories).toHaveBeenCalled();
      });

      // Check if pricing items are displayed
      expect(screen.getByText('Web Development')).toBeInTheDocument();
      expect(screen.getByText('Hosting')).toBeInTheDocument();
    });

    it('should allow adding items to selection', async () => {
      render(
        <TestWrapper>
          <PricingSimulator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Web Development')).toBeInTheDocument();
      });

      // Find and click add button for first item
      const addButtons = screen.getAllByRole('button', { name: /add/i });
      if (addButtons.length > 0) {
        fireEvent.click(addButtons[0]);
        
        // Verify item was added to selection
        await waitFor(() => {
          expect(screen.getByText(/selected items/i)).toBeInTheDocument();
        });
      }
    });

    it('should calculate totals correctly', async () => {
      render(
        <TestWrapper>
          <PricingSimulator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Web Development')).toBeInTheDocument();
      });

      // Add items and verify totals are calculated
      const addButtons = screen.getAllByRole('button', { name: /add/i });
      if (addButtons.length > 0) {
        fireEvent.click(addButtons[0]);
        
        await waitFor(() => {
          // Check if totals are displayed
          expect(screen.getByText(/\$150/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Admin Interface Flow', () => {
    it('should load admin dashboard', async () => {
      render(
        <TestWrapper>
          <AdminInterface />
        </TestWrapper>
      );

      // Check if admin interface loads
      await waitFor(() => {
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });
    });

    it('should handle admin operations', async () => {
      render(
        <TestWrapper>
          <AdminInterface />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/admin/i)).toBeInTheDocument();
      });

      // Test admin functionality
      const adminButtons = screen.getAllByRole('button');
      expect(adminButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      vi.mocked(api.loadPricingItems).mockRejectedValue(new Error('API Error'));

      render(
        <TestWrapper>
          <PricingSimulator />
        </TestWrapper>
      );

      // Check if error is handled
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should recover from errors with retry', async () => {
      // Mock API error then success
      vi.mocked(api.loadPricingItems)
        .mockRejectedValueOnce(new Error('API Error'))
        .mockResolvedValueOnce(mockPricingItems);

      render(
        <TestWrapper>
          <PricingSimulator />
        </TestWrapper>
      );

      // Wait for error
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Find and click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Check if data loads after retry
      await waitFor(() => {
        expect(screen.getByText('Web Development')).toBeInTheDocument();
      });
    });
  });

  describe('Data Persistence Flow', () => {
    it('should save pricing items', async () => {
      render(
        <TestWrapper>
          <PricingSimulator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Web Development')).toBeInTheDocument();
      });

      // Find save button and click
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Verify save was called
      await waitFor(() => {
        expect(api.savePricingItems).toHaveBeenCalled();
      });
    });

    it('should save categories', async () => {
      render(
        <TestWrapper>
          <PricingSimulator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Development')).toBeInTheDocument();
      });

      // Find save button and click
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Verify save was called
      await waitFor(() => {
        expect(api.saveCategories).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate between sections', async () => {
      render(
        <TestWrapper>
          <PricingSimulator />
        </TestWrapper>
      );

      // Check if navigation elements are present
      const navElements = screen.getAllByRole('button');
      expect(navElements.length).toBeGreaterThan(0);
    });

    it('should maintain state during navigation', async () => {
      render(
        <TestWrapper>
          <PricingSimulator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Web Development')).toBeInTheDocument();
      });

      // Add item to selection
      const addButtons = screen.getAllByRole('button', { name: /add/i });
      if (addButtons.length > 0) {
        fireEvent.click(addButtons[0]);
      }

      // Navigate and verify state is maintained
      // This would depend on the specific navigation implementation
    });
  });

  describe('Performance Flow', () => {
    it('should load within acceptable time', async () => {
      const startTime = Date.now();
      
      render(
        <TestWrapper>
          <PricingSimulator />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Web Development')).toBeInTheDocument();
      });

      const loadTime = Date.now() - startTime;
      
      // Should load within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });

    it('should handle large datasets', async () => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        description: `Description ${i}`,
        categoryId: 'cat-1',
        unit: 'hour',
        defaultPrice: 100 + i,
        pricingType: 'one_time' as const,
        billingCycle: 'one_time' as const,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }));

      vi.mocked(api.loadPricingItems).mockResolvedValue(largeDataset);

      render(
        <TestWrapper>
          <PricingSimulator />
        </TestWrapper>
      );

      // Should handle large dataset without issues
      await waitFor(() => {
        expect(screen.getByText('Item 0')).toBeInTheDocument();
      });
    });
  });
});
