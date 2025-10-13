/**
 * Repository Factory
 * 
 * Centralized factory for creating repository instances
 * Manages dependencies and ensures proper configuration
 */

import { supabase } from '../supabase/client';
import { SupabasePricingRepository } from './SupabasePricingRepository';
import type { IPricingRepository } from '../../../../domain/pricing/repositories/IPricingRepository';

export class RepositoryFactory {
  private static pricingRepository: IPricingRepository | null = null;

  /**
   * Get pricing repository instance
   * Uses singleton pattern to ensure single instance
   */
  static getPricingRepository(): IPricingRepository {
    if (!this.pricingRepository) {
      this.pricingRepository = new SupabasePricingRepository(supabase);
    }
    return this.pricingRepository;
  }

  /**
   * Reset all repository instances
   * Useful for testing or configuration changes
   */
  static reset(): void {
    this.pricingRepository = null;
  }

  /**
   * Check if all repositories are properly configured
   */
  static async healthCheck(): Promise<{
    pricing: boolean;
    database: boolean;
  }> {
    const results = {
      pricing: false,
      database: false,
    };

    try {
      // Test pricing repository
      const pricingRepo = this.getPricingRepository();
      await pricingRepo.count();
      results.pricing = true;
    } catch (error) {
      console.error('Pricing repository health check failed:', error);
    }

    try {
      // Test database connection
      const { error } = await supabase
        .from('pricing_items')
        .select('id')
        .limit(1);
      
      results.database = !error;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    return results;
  }
}

// Export convenience functions
export const getPricingRepository = () => RepositoryFactory.getPricingRepository();
export const resetRepositories = () => RepositoryFactory.reset();
export const healthCheck = () => RepositoryFactory.healthCheck();
