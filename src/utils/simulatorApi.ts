import { supabase } from './supabase/client';
import { Simulator, CreateSimulatorData, UpdateSimulatorData } from '../types/simulator';

export class SimulatorApi {
  /**
   * Load all active simulators
   */
  static async loadSimulators(): Promise<Simulator[]> {
    try {
      const { data, error } = await supabase
        .from('simulators')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return data?.map(this.mapDatabaseToSimulator) || [];
    } catch (error) {
      console.error('Failed to load simulators:', error);
      throw error;
    }
  }

  /**
   * Load all simulators (including inactive) for admin
   */
  static async loadAllSimulators(): Promise<Simulator[]> {
    try {
      const { data, error } = await supabase
        .from('simulators')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return data?.map(this.mapDatabaseToSimulator) || [];
    } catch (error) {
      console.error('Failed to load all simulators:', error);
      throw error;
    }
  }

  /**
   * Load simulator by URL slug
   */
  static async loadSimulatorBySlug(slug: string): Promise<Simulator | null> {
    try {
      const { data, error } = await supabase
        .from('simulators')
        .select('*')
        .eq('url_slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }

      return data ? this.mapDatabaseToSimulator(data) : null;
    } catch (error) {
      console.error('Failed to load simulator by slug:', error);
      throw error;
    }
  }

  /**
   * Create a new simulator
   */
  static async createSimulator(simulatorData: CreateSimulatorData): Promise<Simulator> {
    try {
      // Generate URL slug if not provided
      const urlSlug = simulatorData.urlSlug || this.generateUrlSlug(simulatorData.name);

      const { data, error } = await supabase
        .from('simulators')
        .insert({
          name: simulatorData.name,
          title: simulatorData.title,
          description: simulatorData.description,
          cta_text: simulatorData.ctaText || 'Start Simulation',
          icon_name: simulatorData.iconName || 'CreditCard',
          url_slug: urlSlug,
          is_active: simulatorData.isActive ?? true,
          is_available: simulatorData.isAvailable ?? true,
          coming_soon: simulatorData.comingSoon ?? false,
          sort_order: simulatorData.sortOrder ?? 0
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseToSimulator(data);
    } catch (error) {
      console.error('Failed to create simulator:', error);
      throw error;
    }
  }

  /**
   * Update an existing simulator
   */
  static async updateSimulator(id: string, simulatorData: UpdateSimulatorData): Promise<Simulator> {
    try {
      const updateData: any = {};

      if (simulatorData.name !== undefined) updateData.name = simulatorData.name;
      if (simulatorData.title !== undefined) updateData.title = simulatorData.title;
      if (simulatorData.description !== undefined) updateData.description = simulatorData.description;
      if (simulatorData.ctaText !== undefined) updateData.cta_text = simulatorData.ctaText;
      if (simulatorData.iconName !== undefined) updateData.icon_name = simulatorData.iconName;
      if (simulatorData.urlSlug !== undefined) updateData.url_slug = simulatorData.urlSlug;
      if (simulatorData.isActive !== undefined) updateData.is_active = simulatorData.isActive;
      if (simulatorData.isAvailable !== undefined) updateData.is_available = simulatorData.isAvailable;
      if (simulatorData.comingSoon !== undefined) updateData.coming_soon = simulatorData.comingSoon;
      if (simulatorData.sortOrder !== undefined) updateData.sort_order = simulatorData.sortOrder;

      const { data, error } = await supabase
        .from('simulators')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.mapDatabaseToSimulator(data);
    } catch (error) {
      console.error('Failed to update simulator:', error);
      throw error;
    }
  }

  /**
   * Delete a simulator
   */
  static async deleteSimulator(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('simulators')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete simulator:', error);
      throw error;
    }
  }

  /**
   * Reorder simulators
   */
  static async reorderSimulators(simulatorIds: string[]): Promise<void> {
    try {
      const updates = simulatorIds.map((id, index) => ({
        id,
        sort_order: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('simulators')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Failed to reorder simulators:', error);
      throw error;
    }
  }

  /**
   * Copy all data from one simulator to another
   */
  static async copySimulatorData(sourceSimulatorId: string, targetSimulatorId: string): Promise<void> {
    try {
      // Copy categories
      const { data: sourceCategories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('simulator_id', sourceSimulatorId);

      if (categoriesError) throw categoriesError;

      if (sourceCategories && sourceCategories.length > 0) {
        const categoriesToInsert = sourceCategories.map(cat => ({
          ...cat,
          id: undefined, // Let database generate new ID
          simulator_id: targetSimulatorId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: insertCategoriesError } = await supabase
          .from('categories')
          .insert(categoriesToInsert);

        if (insertCategoriesError) throw insertCategoriesError;
      }

      // Copy services
      const { data: sourceServices, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('simulator_id', sourceSimulatorId);

      if (servicesError) throw servicesError;

      if (sourceServices && sourceServices.length > 0) {
        const servicesToInsert = sourceServices.map(service => ({
          ...service,
          id: undefined, // Let database generate new ID
          simulator_id: targetSimulatorId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: insertServicesError } = await supabase
          .from('services')
          .insert(servicesToInsert);

        if (insertServicesError) throw insertServicesError;
      }

      // Copy configurations
      const { data: sourceConfigs, error: configsError } = await supabase
        .from('configurations')
        .select('*')
        .eq('simulator_id', sourceSimulatorId);

      if (configsError) throw configsError;

      if (sourceConfigs && sourceConfigs.length > 0) {
        const configsToInsert = sourceConfigs.map(config => ({
          ...config,
          id: undefined, // Let database generate new ID
          simulator_id: targetSimulatorId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: insertConfigsError } = await supabase
          .from('configurations')
          .insert(configsToInsert);

        if (insertConfigsError) throw insertConfigsError;
      }

    } catch (error) {
      console.error('Failed to copy simulator data:', error);
      throw error;
    }
  }

  /**
   * Create a new simulator by copying from an existing one
   */
  static async createSimulatorFromTemplate(
    templateSimulatorId: string, 
    newSimulatorData: CreateSimulatorData
  ): Promise<Simulator> {
    try {
      // First create the new simulator
      const newSimulator = await this.createSimulator(newSimulatorData);
      
      // Then copy all data from the template
      await this.copySimulatorData(templateSimulatorId, newSimulator.id);
      
      return newSimulator;
    } catch (error) {
      console.error('Failed to create simulator from template:', error);
      throw error;
    }
  }

  /**
   * Generate URL slug from name
   */
  private static generateUrlSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }

  /**
   * Map database row to Simulator interface
   */
  private static mapDatabaseToSimulator(row: any): Simulator {
    return {
      id: row.id,
      name: row.name,
      title: row.title,
      description: row.description,
      ctaText: row.cta_text,
      iconName: row.icon_name,
      urlSlug: row.url_slug,
      isActive: row.is_active,
      isAvailable: row.is_available,
      comingSoon: row.coming_soon,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: row.created_by,
      updatedBy: row.updated_by
    };
  }
}
