import { supabase } from './supabase/client';
import { queryBySimulator, queryAll, upsertRecords, softDeleteRecords } from './supabaseHelpers';

export interface ApiServiceConfig {
  tableName: string;
  selectFields?: string;
  orderBy?: string;
  ascending?: boolean;
}

export abstract class BaseApiService<T> {
  protected config: ApiServiceConfig;

  constructor(config: ApiServiceConfig) {
    this.config = config;
  }

  /**
   * Load all records for a specific simulator
   */
  async loadBySimulator(simulatorId: string): Promise<T[]> {
    return queryBySimulator<T>(
      this.config.tableName,
      simulatorId,
      this.config.selectFields,
      this.config.orderBy,
      this.config.ascending
    );
  }

  /**
   * Load all records (no simulator filter)
   */
  async loadAll(): Promise<T[]> {
    return queryAll<T>(
      this.config.tableName,
      this.config.selectFields,
      this.config.orderBy,
      this.config.ascending
    );
  }

  /**
   * Save/update records
   */
  async save(records: Partial<T>[], userId: string): Promise<T[]> {
    return upsertRecords<T>(this.config.tableName, records, userId);
  }

  /**
   * Soft delete records
   */
  async delete(ids: string[], userId: string): Promise<void> {
    return softDeleteRecords(this.config.tableName, ids, userId);
  }

  /**
   * Get current user for audit trail
   */
  protected async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  /**
   * Get current timestamp
   */
  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }
}

/**
 * Generic CRUD service for any table
 */
export class GenericApiService<T> extends BaseApiService<T> {
  constructor(tableName: string, selectFields = '*', orderBy = 'created_at', ascending = false) {
    super({
      tableName,
      selectFields,
      orderBy,
      ascending
    });
  }
}

/**
 * Service for pricing items with specific business logic
 */
export class PricingItemService extends BaseApiService<any> {
  constructor() {
    super({
      tableName: 'services',
      selectFields: `
        *,
        category:categories(id, name),
        auto_add_rules:auto_add_rules(id, config_field_id),
        quantity_rules:quantity_rules(id, config_field_id, multiplier)
      `,
      orderBy: 'created_at',
      ascending: false
    });
  }

  /**
   * Load pricing items with complex transformations
   */
  async loadPricingItems(simulatorId?: string): Promise<any[]> {
    const items = simulatorId 
      ? await this.loadBySimulator(simulatorId)
      : await this.loadAll();

    // Apply business logic transformations
    return items.map(item => this.transformPricingItem(item));
  }

  /**
   * Transform pricing item for frontend consumption
   */
  private transformPricingItem(service: any): any {
    // Extract auto-add and quantity fields
    const autoAddFields = (service.auto_add_rules || []).map((rule: any) => rule.config_field_id);
    const quantityFields = (service.quantity_rules || []).map((rule: any) => rule.config_field_id);
    
    // Extract tiers from tiered_pricing JSON field
    let tiers = [];
    if (service.tiered_pricing && service.tiered_pricing.tiers) {
      tiers = service.tiered_pricing.tiers;
    }

    return {
      ...service,
      categoryId: service.category?.id || null,
      defaultPrice: service.default_price || 0,
      pricingType: service.tiered_pricing?.original_pricing_type || service.pricing_type || 'one_time',
      billingCycle: service.billing_cycle,
      tags: service.tags || [],
      tiers: tiers,
      quantitySourceFields: quantityFields,
      autoAddServices: autoAddFields,
      is_active: service.is_active !== undefined ? service.is_active : true
    };
  }
}

/**
 * Service for categories
 */
export class CategoryService extends BaseApiService<any> {
  constructor() {
    super({
      tableName: 'categories',
      selectFields: '*',
      orderBy: 'name',
      ascending: true
    });
  }
}

/**
 * Service for configurations
 */
export class ConfigurationService extends BaseApiService<any> {
  constructor() {
    super({
      tableName: 'configurations',
      selectFields: '*',
      orderBy: 'name',
      ascending: true
    });
  }
}

/**
 * Service for tags
 */
export class TagService extends BaseApiService<any> {
  constructor() {
    super({
      tableName: 'tags',
      selectFields: '*',
      orderBy: 'name',
      ascending: true
    });
  }
}
