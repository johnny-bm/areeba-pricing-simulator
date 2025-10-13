// Example: Use case pattern implementation
// This shows how to structure use cases in Clean Architecture

import { PricingRepository } from '@/core/application/repositories/PricingRepository';
import { PricingCalculationService } from '@/core/domain/services/PricingCalculationService';
import { PricingScenario } from '@/core/domain/pricing/entities/PricingScenario';
import { Money } from '@/core/domain/pricing/value-objects/Money';

export interface CalculatePricingRequest {
  scenarioId: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

export interface CalculatePricingResponse {
  total: Money;
  breakdown: Array<{
    item: string;
    price: Money;
    quantity: number;
    subtotal: Money;
  }>;
  summary: {
    itemCount: number;
    totalAmount: number;
    currency: string;
  };
}

export class CalculatePricingUseCase {
  constructor(
    private pricingRepository: PricingRepository,
    private calculationService: PricingCalculationService
  ) {}

  async execute(request: CalculatePricingRequest): Promise<CalculatePricingResponse> {
    // 1. Validate input
    this.validateRequest(request);

    // 2. Load scenario
    const scenario = await this.pricingRepository.findById(request.scenarioId);
    if (!scenario) {
      throw new Error(`Scenario ${request.scenarioId} not found`);
    }

    // 3. Calculate pricing
    const total = this.calculationService.calculateTotal(scenario.items);
    
    // 4. Create breakdown
    const breakdown = scenario.items.map(item => ({
      item: item.name,
      price: item.basePrice,
      quantity: item.quantity.value,
      subtotal: item.total
    }));

    // 5. Create summary
    const summary = {
      itemCount: scenario.items.length,
      totalAmount: total.amount,
      currency: total.currency
    };

    return {
      total,
      breakdown,
      summary
    };
  }

  private validateRequest(request: CalculatePricingRequest): void {
    if (!request.scenarioId) {
      throw new Error('Scenario ID is required');
    }
    if (!request.items || request.items.length === 0) {
      throw new Error('At least one item is required');
    }
  }
}

// Example usage:
// const useCase = new CalculatePricingUseCase(repository, calculationService);
// const result = await useCase.execute({
//   scenarioId: 'scenario-123',
//   items: [
//     { name: 'Web Hosting', price: 50, quantity: 1 },
//     { name: 'Domain', price: 15, quantity: 1 }
//   ]
// });
// console.log(result.total.amount); // 65
