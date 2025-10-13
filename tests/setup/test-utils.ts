// Test utilities for consistent testing across the application

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock data factories
export const createMockPricingItem = (overrides = {}) => ({
  id: 'item-123',
  name: 'Test Service',
  basePrice: { amount: 100, currency: 'USD' },
  quantity: { value: 1, unit: 'pieces' },
  ...overrides
});

export const createMockPricingScenario = (overrides = {}) => ({
  id: 'scenario-123',
  name: 'Test Scenario',
  items: [createMockPricingItem()],
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user-123',
  ...overrides
});

export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
  ...overrides
});

// Mock repository implementations
export class MockPricingRepository {
  private scenarios: Map<string, any> = new Map();
  
  async save(scenario: any): Promise<void> {
    this.scenarios.set(scenario.id, scenario);
  }
  
  async findById(id: string): Promise<any> {
    return this.scenarios.get(id) || null;
  }
  
  async findAll(): Promise<any[]> {
    return Array.from(this.scenarios.values());
  }
  
  async delete(id: string): Promise<void> {
    this.scenarios.delete(id);
  }
  
  async update(scenario: any): Promise<void> {
    this.scenarios.set(scenario.id, scenario);
  }
}

// Test helpers
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockFetch = (response: any) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(response)
  });
};

export const mockFetchError = (error: string) => {
  global.fetch = jest.fn().mockRejectedValue(new Error(error));
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };
