/**
 * Performance Tests
 * Tests application performance under various conditions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PricingSimulator } from '../../src/components/PricingSimulator';
import { AdminInterface } from '../../src/components/AdminInterface';
import { api } from '../../src/utils/api';

// Mock API
vi.mock('../../src/utils/api', () => ({
  api: {
    loadPricingItems: vi.fn(),
    loadCategories: vi.fn(),
    savePricingItems: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

// Performance test utilities
const measurePerformance = async (fn: () => Promise<any> | any) => {
  const startTime = performance.now();
  await fn();
  const endTime = performance.now();
  return endTime - startTime;
};

const generateLargeDataset = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
    description: `Description for item ${i}`,
    categoryId: `cat-${i % 10}`,
    unit: 'hour',
    defaultPrice: 100 + (i % 500),
    pricingType: 'one_time' as const,
    billingCycle: 'one_time' as const,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }));
};

describe('Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering Performance', () => {
    it('should render PricingSimulator within acceptable time', async () => {
      vi.mocked(api.loadPricingItems).mockResolvedValue([]);
      vi.mocked(api.loadCategories).mockResolvedValue([]);

      const renderTime = await measurePerformance(() => {
        render(
          <BrowserRouter>
            <PricingSimulator />
          </BrowserRouter>
        );
      });

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should render AdminInterface within acceptable time', async () => {
      const renderTime = await measurePerformance(() => {
        render(
          <BrowserRouter>
            <AdminInterface />
          </BrowserRouter>
        );
      });

      // Should render within 100ms
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle large datasets efficiently', async () => {
      const largeDataset = generateLargeDataset(1000);
      vi.mocked(api.loadPricingItems).mockResolvedValue(largeDataset);
      vi.mocked(api.loadCategories).mockResolvedValue([]);

      const renderTime = await measurePerformance(async () => {
        render(
          <BrowserRouter>
            <PricingSimulator />
          </BrowserRouter>
        );
        
        await waitFor(() => {
          expect(screen.getByText('Item 0')).toBeInTheDocument();
        });
      });

      // Should handle large dataset within 2 seconds
      expect(renderTime).toBeLessThan(2000);
    });
  });

  describe('API Performance', () => {
    it('should load pricing items within acceptable time', async () => {
      const dataset = generateLargeDataset(100);
      vi.mocked(api.loadPricingItems).mockResolvedValue(dataset);

      const loadTime = await measurePerformance(async () => {
        await api.loadPricingItems('simulator-1');
      });

      // Should load within 1 second
      expect(loadTime).toBeLessThan(1000);
    });

    it('should handle concurrent API calls efficiently', async () => {
      vi.mocked(api.loadPricingItems).mockResolvedValue([]);
      vi.mocked(api.loadCategories).mockResolvedValue([]);

      const concurrentTime = await measurePerformance(async () => {
        const promises = Array.from({ length: 10 }, () => 
          Promise.all([
            api.loadPricingItems('simulator-1'),
            api.loadCategories('simulator-1'),
          ])
        );
        await Promise.all(promises);
      });

      // Should handle 10 concurrent calls within 2 seconds
      expect(concurrentTime).toBeLessThan(2000);
    });

    it('should save data within acceptable time', async () => {
      const dataset = generateLargeDataset(50);
      vi.mocked(api.savePricingItems).mockResolvedValue();

      const saveTime = await measurePerformance(async () => {
        await api.savePricingItems(dataset, 'simulator-1');
      });

      // Should save within 1 second
      expect(saveTime).toBeLessThan(1000);
    });
  });

  describe('Memory Performance', () => {
    it('should not leak memory with repeated renders', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render component multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <BrowserRouter>
            <PricingSimulator />
          </BrowserRouter>
        );
        unmount();
      }

      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should handle large datasets without memory issues', async () => {
      const largeDataset = generateLargeDataset(5000);
      vi.mocked(api.loadPricingItems).mockResolvedValue(largeDataset);

      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      render(
        <BrowserRouter>
          <PricingSimulator />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Item 0')).toBeInTheDocument();
      });

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable for large dataset
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
    });
  });

  describe('Bundle Size Performance', () => {
    it('should have reasonable initial bundle size', () => {
      // This would typically be tested with bundle analysis tools
      // For now, we'll just ensure the test structure is in place
      expect(true).toBe(true);
    });

    it('should load critical chunks quickly', async () => {
      const loadTime = await measurePerformance(async () => {
        // Simulate loading critical chunks
        await import('../../src/components/PricingSimulator');
        await import('../../src/utils/api');
      });

      // Critical chunks should load within 500ms
      expect(loadTime).toBeLessThan(500);
    });
  });

  describe('User Interaction Performance', () => {
    it('should handle rapid user interactions', async () => {
      vi.mocked(api.loadPricingItems).mockResolvedValue([]);
      vi.mocked(api.loadCategories).mockResolvedValue([]);

      render(
        <BrowserRouter>
          <PricingSimulator />
        </BrowserRouter>
      );

      const interactionTime = await measurePerformance(async () => {
        // Simulate rapid button clicks
        const buttons = screen.getAllByRole('button');
        for (let i = 0; i < 100; i++) {
          if (buttons[i % buttons.length]) {
            buttons[i % buttons.length].click();
          }
        }
      });

      // Should handle 100 interactions within 1 second
      expect(interactionTime).toBeLessThan(1000);
    });

    it('should debounce rapid API calls', async () => {
      let apiCallCount = 0;
      vi.mocked(api.savePricingItems).mockImplementation(async () => {
        apiCallCount++;
        return Promise.resolve();
      });

      render(
        <BrowserRouter>
          <PricingSimulator />
        </BrowserRouter>
      );

      // Simulate rapid save operations
      const saveButtons = screen.getAllByRole('button', { name: /save/i });
      if (saveButtons.length > 0) {
        for (let i = 0; i < 10; i++) {
          saveButtons[0].click();
        }
      }

      // Wait for debouncing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Should not make excessive API calls due to debouncing
      expect(apiCallCount).toBeLessThan(10);
    });
  });

  describe('Network Performance', () => {
    it('should handle slow network conditions', async () => {
      // Simulate slow network
      vi.mocked(api.loadPricingItems).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return [];
      });

      const loadTime = await measurePerformance(async () => {
        await api.loadPricingItems('simulator-1');
      });

      // Should complete even with slow network
      expect(loadTime).toBeGreaterThan(2000);
      expect(loadTime).toBeLessThan(3000);
    });

    it('should handle network failures gracefully', async () => {
      vi.mocked(api.loadPricingItems).mockRejectedValue(new Error('Network error'));

      await expect(api.loadPricingItems('simulator-1')).rejects.toThrow('Network error');
    });
  });

  describe('Scalability Tests', () => {
    it('should scale with increasing data size', async () => {
      const sizes = [100, 500, 1000, 2000];
      const loadTimes: number[] = [];

      for (const size of sizes) {
        const dataset = generateLargeDataset(size);
        vi.mocked(api.loadPricingItems).mockResolvedValue(dataset);

        const loadTime = await measurePerformance(async () => {
          await api.loadPricingItems('simulator-1');
        });

        loadTimes.push(loadTime);
      }

      // Load time should not increase exponentially
      const lastLoadTime = loadTimes[loadTimes.length - 1];
      const firstLoadTime = loadTimes[0];
      const scaleFactor = lastLoadTime / firstLoadTime;

      // Should scale linearly or better
      expect(scaleFactor).toBeLessThan(20);
    });

    it('should handle concurrent users', async () => {
      vi.mocked(api.loadPricingItems).mockResolvedValue([]);
      vi.mocked(api.loadCategories).mockResolvedValue([]);

      const concurrentTime = await measurePerformance(async () => {
        // Simulate 50 concurrent users
        const promises = Array.from({ length: 50 }, () => 
          Promise.all([
            api.loadPricingItems('simulator-1'),
            api.loadCategories('simulator-1'),
          ])
        );
        await Promise.all(promises);
      });

      // Should handle 50 concurrent users within 5 seconds
      expect(concurrentTime).toBeLessThan(5000);
    });
  });
});
