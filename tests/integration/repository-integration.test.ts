// Integration test for repository functionality
import { describe, it, expect, beforeEach } from 'vitest';
import { SupabasePricingRepository } from '@/core/infrastructure/database/repositories/SupabasePricingRepository';
import { createClient } from '@supabase/supabase-js';

describe('Repository Integration', () => {
  let repository: SupabasePricingRepository;
  let supabaseClient: any;

  beforeEach(async () => {
    // Setup test database
    supabaseClient = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );
    repository = new SupabasePricingRepository(supabaseClient);
  });

  it('should save and retrieve pricing scenario', async () => {
    const scenario = createMockPricingScenario();
    
    // Save scenario
    await repository.save(scenario);
    
    // Retrieve scenario
    const retrieved = await repository.findById(scenario.id);
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(scenario.id);
    expect(retrieved?.name).toBe(scenario.name);
  });

  it('should update pricing scenario', async () => {
    const scenario = createMockPricingScenario();
    await repository.save(scenario);
    
    // Update scenario
    const updatedScenario = {
      ...scenario,
      name: 'Updated Scenario'
    };
    await repository.update(updatedScenario);
    
    // Verify update
    const retrieved = await repository.findById(scenario.id);
    expect(retrieved?.name).toBe('Updated Scenario');
  });

  it('should delete pricing scenario', async () => {
    const scenario = createMockPricingScenario();
    await repository.save(scenario);
    
    // Delete scenario
    await repository.delete(scenario.id);
    
    // Verify deletion
    const retrieved = await repository.findById(scenario.id);
    expect(retrieved).toBeNull();
  });

  it('should retrieve all scenarios for user', async () => {
    const userScenarios = [
      createMockPricingScenario({ createdBy: 'user-1' }),
      createMockPricingScenario({ createdBy: 'user-1' }),
      createMockPricingScenario({ createdBy: 'user-2' })
    ];
    
    // Save all scenarios
    for (const scenario of userScenarios) {
      await repository.save(scenario);
    }
    
    // Retrieve user scenarios
    const user1Scenarios = await repository.findByUserId('user-1');
    const user2Scenarios = await repository.findByUserId('user-2');
    
    expect(user1Scenarios).toHaveLength(2);
    expect(user2Scenarios).toHaveLength(1);
  });

  it('should handle database errors gracefully', async () => {
    // Test with invalid scenario
    const invalidScenario = {
      id: 'invalid-id',
      name: '', // Invalid name
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'user-1'
    };
    
    await expect(repository.save(invalidScenario)).rejects.toThrow();
  });
});
