// Integration test for pricing functionality
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/tests/setup/test-utils';
import { PricingSimulator } from '@/components/PricingSimulator';
import { MockPricingRepository } from '@/tests/setup/test-utils';

describe('Pricing Integration', () => {
  let mockRepository: MockPricingRepository;

  beforeEach(() => {
    mockRepository = new MockPricingRepository();
  });

  it('should create and calculate pricing scenario', async () => {
    render(<PricingSimulator repository={mockRepository} />);

    // Create new scenario
    fireEvent.click(screen.getByTestId('create-scenario'));
    fireEvent.change(screen.getByTestId('scenario-name'), {
      target: { value: 'Test Scenario' }
    });
    fireEvent.click(screen.getByTestId('save-scenario'));

    // Add pricing item
    fireEvent.click(screen.getByTestId('add-item'));
    fireEvent.change(screen.getByTestId('item-name'), {
      target: { value: 'Web Hosting' }
    });
    fireEvent.change(screen.getByTestId('item-price'), {
      target: { value: '50' }
    });
    fireEvent.change(screen.getByTestId('item-quantity'), {
      target: { value: '1' }
    });
    fireEvent.click(screen.getByTestId('save-item'));

    // Verify item was added
    await waitFor(() => {
      expect(screen.getByText('Web Hosting')).toBeInTheDocument();
    });

    // Verify total calculation
    await waitFor(() => {
      expect(screen.getByTestId('total-price')).toHaveTextContent('$50');
    });
  });

  it('should update pricing item', async () => {
    // Setup initial scenario with item
    const scenario = createMockPricingScenario();
    await mockRepository.save(scenario);

    render(<PricingSimulator repository={mockRepository} />);

    // Edit item
    fireEvent.click(screen.getByTestId('edit-item-0'));
    fireEvent.change(screen.getByTestId('item-price'), {
      target: { value: '75' }
    });
    fireEvent.click(screen.getByTestId('save-item'));

    // Verify price was updated
    await waitFor(() => {
      expect(screen.getByTestId('total-price')).toHaveTextContent('$75');
    });
  });

  it('should delete pricing item', async () => {
    // Setup initial scenario with item
    const scenario = createMockPricingScenario();
    await mockRepository.save(scenario);

    render(<PricingSimulator repository={mockRepository} />);

    // Delete item
    fireEvent.click(screen.getByTestId('delete-item-0'));
    fireEvent.click(screen.getByTestId('confirm-delete'));

    // Verify item was removed
    await waitFor(() => {
      expect(screen.queryByText('Test Service')).not.toBeInTheDocument();
    });
  });

  it('should handle multiple items', async () => {
    render(<PricingSimulator repository={mockRepository} />);

    // Add first item
    fireEvent.click(screen.getByTestId('add-item'));
    fireEvent.change(screen.getByTestId('item-name'), {
      target: { value: 'Web Hosting' }
    });
    fireEvent.change(screen.getByTestId('item-price'), {
      target: { value: '50' }
    });
    fireEvent.change(screen.getByTestId('item-quantity'), {
      target: { value: '1' }
    });
    fireEvent.click(screen.getByTestId('save-item'));

    // Add second item
    fireEvent.click(screen.getByTestId('add-item'));
    fireEvent.change(screen.getByTestId('item-name'), {
      target: { value: 'Domain' }
    });
    fireEvent.change(screen.getByTestId('item-price'), {
      target: { value: '15' }
    });
    fireEvent.change(screen.getByTestId('item-quantity'), {
      target: { value: '1' }
    });
    fireEvent.click(screen.getByTestId('save-item'));

    // Verify total calculation
    await waitFor(() => {
      expect(screen.getByTestId('total-price')).toHaveTextContent('$65');
    });
  });
});
