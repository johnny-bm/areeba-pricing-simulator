// Direct Supabase API - uses RLS policies and direct database queries
// Maps to the schema defined in /config/database.ts

import { PricingItem, Category, ScenarioData, ConfigurationDefinition, Tag } from '../types/domain';
import { supabase } from './supabase/client';
import { TABLES, COLUMNS } from '../config/database';

// Helper function to get current user for audit fields
const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user;
};

// Helper function to generate submission code
const generateSubmissionCode = () => {
  return `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Helper function to get current timestamp
const getCurrentTimestamp = () => new Date().toISOString();

export const api = {
  // Health check - test Supabase connection
  async healthCheck(retries = 2): Promise<boolean> {
    for (let i = 0; i <= retries; i++) {
      try {
        // Test basic Supabase connection by querying a simple table
        const { data, error } = await supabase
          .from(TABLES.SIMULATORS)
          .select('id')
          .limit(1);
        
        if (!error) {
          return true;
        }
        throw new Error(error.message);
      } catch (error: any) {
        console.warn(`Health check attempt ${i + 1}/${retries + 1} failed:`, error.message);
        
        if (i === retries) {
          console.error('Health check failed after all retries:', error);
          return false;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 3000)));
      }
    }
    return false;
  },

  // Ping check - simple connectivity test
  async ping(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(TABLES.SIMULATORS)
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error: any) {
      console.error('Ping check failed:', error.message || error);
      return false;
    }
  },

  // Load services - now uses direct Supabase queries with RLS
  async loadPricingItems(simulatorId?: string): Promise<PricingItem[]> {
    try {
      let query = supabase
        .from(TABLES.SERVICES)
        .select(`
          *,
          category:categories(id, name, color),
          service_tags:service_tags(tag:tags(id, name)),
          auto_add_rules:auto_add_rules(id, config_field_id),
          quantity_rules:quantity_rules(id, config_field_id, multiplier)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      // Filter by simulator if provided
      if (simulatorId) {
        query = query.eq('simulator_id', simulatorId);
      }

      const { data: services, error } = await query;
      
      if (error) {
        throw new Error(`Failed to load services: ${error.message}`);
      }
      
      return services || [];
    } catch (error) {
      console.error('❌ Failed to load services:', error);
      throw error;
    }
  },

  // Get pricing items (alias for loadPricingItems)
  async getPricingItems(simulatorId?: string): Promise<PricingItem[]> {
    return this.loadPricingItems(simulatorId);
  },

  // Load services for a specific simulator
  async loadSimulatorServices(simulatorId: string): Promise<PricingItem[]> {
    return this.loadPricingItems(simulatorId);
  },

  // Save services - now uses direct Supabase operations with audit fields
  async savePricingItems(items: PricingItem[], simulatorId?: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      // Prepare items with audit fields
      const itemsWithAudit = items.map(item => ({
        ...item,
        simulator_id: simulatorId,
        created_by: user?.id,
        updated_by: user?.id,
        created_at: timestamp,
        updated_at: timestamp
      }));

      const { error } = await supabase
        .from(TABLES.SERVICES)
        .upsert(itemsWithAudit, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        throw new Error(`Failed to save services: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to save services:', error);
      throw error;
    }
  },

  // Load categories - now uses direct Supabase queries with RLS
  async loadCategories(simulatorId?: string): Promise<Category[]> {
    try {
      let query = supabase
        .from(TABLES.CATEGORIES)
        .select('*')
        .is('deleted_at', null)
        .order('display_order', { ascending: true });

      // Filter by simulator if provided
      if (simulatorId) {
        query = query.eq('simulator_id', simulatorId);
      }

      const { data: categories, error } = await query;
      
      if (error) {
        throw new Error(`Failed to load categories: ${error.message}`);
      }
      
      return categories || [];
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      throw error;
    }
  },

  // Save categories - now uses direct Supabase operations with audit fields
  async saveCategories(categories: Category[], simulatorId?: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      // Prepare categories with audit fields
      const categoriesWithAudit = categories.map(category => ({
        ...category,
        simulator_id: simulatorId,
        created_by: user?.id,
        updated_by: user?.id,
        created_at: timestamp,
        updated_at: timestamp
      }));

      const { error } = await supabase
        .from(TABLES.CATEGORIES)
        .upsert(categoriesWithAudit, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        throw new Error(`Failed to save categories: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to save categories:', error);
      throw error;
    }
  },

  // Load tags - now uses direct Supabase queries with RLS
  async loadTags(simulatorId?: string): Promise<Tag[]> {
    try {
      let query = supabase
        .from(TABLES.TAGS)
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      // Filter by simulator if provided
      if (simulatorId) {
        query = query.eq('simulator_id', simulatorId);
      }

      const { data: tags, error } = await query;
      
      if (error) {
        throw new Error(`Failed to load tags: ${error.message}`);
      }
      
      return tags || [];
    } catch (error) {
      console.error('❌ Failed to load tags:', error);
      throw error;
    }
  },

  // Save tags - now uses direct Supabase operations with audit fields
  async saveTags(tags: Tag[], simulatorId?: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      // Prepare tags with audit fields
      const tagsWithAudit = tags.map(tag => ({
        ...tag,
        simulator_id: simulatorId,
        created_by: user?.id,
        updated_by: user?.id,
        created_at: timestamp,
        updated_at: timestamp
      }));

      const { error } = await supabase
        .from(TABLES.TAGS)
        .upsert(tagsWithAudit, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        throw new Error(`Failed to save tags: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to save tags:', error);
      throw error;
    }
  },

  // Load configurations - now uses direct Supabase queries with RLS
  async loadConfigurations(simulatorId?: string): Promise<ConfigurationDefinition[]> {
    try {
      let query = supabase
        .from(TABLES.CONFIGURATIONS)
        .select('*')
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });

      // Filter by simulator if provided
      if (simulatorId) {
        query = query.eq('simulator_id', simulatorId);
      }

      const { data: configurations, error } = await query;
      
      if (error) {
        throw new Error(`Failed to load configurations: ${error.message}`);
      }
      
      return configurations || [];
    } catch (error) {
      console.error('❌ Failed to load configurations:', error);
      throw error;
    }
  },

  // Save configurations - now uses direct Supabase operations with audit fields
  async saveConfigurations(configurations: ConfigurationDefinition[], simulatorId?: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      // Prepare configurations with audit fields
      const configurationsWithAudit = configurations.map(config => ({
        ...config,
        simulator_id: simulatorId,
        created_by: user?.id,
        updated_by: user?.id,
        created_at: timestamp,
        updated_at: timestamp
      }));

      const { error } = await supabase
        .from(TABLES.CONFIGURATIONS)
        .upsert(configurationsWithAudit, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        throw new Error(`Failed to save configurations: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to save configurations:', error);
      throw error;
    }
  },

  // Save scenario data - now uses direct Supabase operations with audit fields
  async saveScenarioData(data: ScenarioData, simulatorId?: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      if (!user) {
        throw new Error('User must be authenticated to save scenarios');
      }

      const submissionData = {
        user_id: user.id,
        simulator_id: simulatorId,
        submission_name: (data as any).submissionName || 'Untitled Scenario',
        submission_code: generateSubmissionCode(),
        status: 'submitted',
        client_name: (data as any).clientName || 'Unknown Client',
        project_name: (data as any).projectName || 'Unknown Project',
        prepared_by: (data as any).preparedBy || 'Unknown',
        client_configuration: data.config || {},
        selected_services: data.selectedItems || [],
        global_discount: data.globalDiscount || 0,
        global_discount_type: data.globalDiscountType || 'percentage',
        global_discount_application: data.globalDiscountApplication || 'none',
        cost_summary: data.summary || {},
        simulator_type: (data as any).simulatorType || 'ISS',
        notes: (data as any).notes || '',
        submitted_at: timestamp,
        created_by: user.id,
        updated_by: user.id,
        created_at: timestamp,
        updated_at: timestamp
      };

      const { error } = await supabase
        .from(TABLES.SIMULATOR_SUBMISSIONS)
        .insert(submissionData);
      
      if (error) {
        throw new Error(`Failed to save scenario: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to save scenario:', error);
      throw error;
    }
  },

  // Save guest scenario data - now uses direct Supabase operations (no auth required)
async saveGuestScenario(data: {
  sessionId: string | null;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  companyName: string;
  scenarioName: string;
  config: any;
  selectedItems: any[];
  categories: any[];
  globalDiscount: number;
  globalDiscountType: string;
  globalDiscountApplication: string;
  summary: any;
}): Promise<{ success: boolean; submissionCode: string; scenarioId: string }> {
  try {
      const timestamp = getCurrentTimestamp();
      const submissionCode = generateSubmissionCode();
      
      const guestSubmissionData = {
        submission_code: submissionCode,
        session_id: data.sessionId,
        email: data.email,
        phone_number: data.phoneNumber,
        first_name: data.firstName,
        last_name: data.lastName,
        company_name: data.companyName,
        scenario_name: data.scenarioName || `${data.companyName} - Quote`,
        scenario_data: {
          config: data.config,
          selectedItems: data.selectedItems,
          categories: data.categories,
          globalDiscount: data.globalDiscount,
          globalDiscountType: data.globalDiscountType,
          globalDiscountApplication: data.globalDiscountApplication,
          summary: data.summary
        },
        total_price: data.summary?.totalProjectCost || 0,
        status: 'submitted',
        created_at: timestamp
      };

      const { data: result, error } = await supabase
        .from(TABLES.GUEST_SCENARIOS)
        .insert(guestSubmissionData)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to save guest scenario: ${error.message}`);
      }
      
      return {
        success: true,
        submissionCode: submissionCode,
        scenarioId: result?.id || ''
      };
  } catch (error) {
    console.error('❌ Failed to save guest scenario:', error);
    throw error;
  }
},

  // Load scenarios - now uses direct Supabase queries with RLS
  async loadScenarios(simulatorId?: string): Promise<ScenarioData[]> {
    try {
      let query = supabase
        .from(TABLES.SIMULATOR_SUBMISSIONS)
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Filter by simulator if provided
      if (simulatorId) {
        query = query.eq('simulator_id', simulatorId);
      }

      const { data: scenarios, error } = await query;
      
      if (error) {
        throw new Error(`Failed to load scenarios: ${error.message}`);
      }
      
      // Transform to match expected format
      return (scenarios || []).map(scenario => ({
        id: scenario.id,
        userId: scenario.user_id || '',
        config: scenario.config || {} as any,
        legacyConfig: scenario.legacy_config || {} as any,
        configDefinitions: scenario.config_definitions || [],
        selectedItems: scenario.selected_services || [],
        categories: scenario.categories || [],
        tags: scenario.tags || [],
        summary: scenario.cost_summary || {
          oneTimeTotal: 0,
          monthlyTotal: 0,
          yearlyTotal: 0,
          totalProjectCost: 0,
          savings: {
            totalSavings: 0,
            discountSavings: 0,
            freeSavings: 0,
            originalPrice: 0,
            savingsRate: 0
          }
        },
        globalDiscount: scenario.global_discount || 0,
        globalDiscountType: scenario.global_discount_type || 'percentage',
        globalDiscountApplication: scenario.global_discount_application || 'none',
        createdAt: scenario.created_at,
        updatedAt: scenario.updated_at
      })) as ScenarioData[];
    } catch (error) {
      console.error('❌ Failed to load scenarios:', error);
      throw error;
    }
  },

  // Get scenario data by ID - now uses direct Supabase queries with RLS
  async getScenarioData(scenarioId: string): Promise<ScenarioData | null> {
    try {
      const { data: scenario, error } = await supabase
        .from(TABLES.SIMULATOR_SUBMISSIONS)
        .select('*')
        .eq('id', scenarioId)
        .is('deleted_at', null)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to load scenario: ${error.message}`);
      }
      
      return scenario;
    } catch (error) {
      console.error(`❌ Failed to load scenario ${scenarioId}:`, error);
      throw error;
    }
  },

  // Load guest submissions - now uses direct Supabase queries with RLS
  async loadGuestSubmissions(): Promise<any[]> {
    try {
      const { data: submissions, error } = await supabase
        .from(TABLES.GUEST_SCENARIOS)
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to load guest submissions: ${error.message}`);
      }
      
      // Transform to match expected format
      return (submissions || []).map(sub => ({
        id: sub.id,
        submissionCode: sub.submission_code,
        firstName: sub.first_name,
        lastName: sub.last_name,
        email: sub.email,
        phoneNumber: sub.phone_number,
        companyName: sub.company_name,
        scenarioName: sub.scenario_name,
        totalPrice: sub.total_price || 0,
        servicesCount: sub.scenario_data?.selectedItems?.length || 0,
        status: sub.status || 'submitted',
        createdAt: sub.created_at,
        scenario_data: sub.scenario_data || {}
      }));
    } catch (error) {
      console.error('❌ Failed to load guest submissions:', error);
      throw error;
    }
  },

  // Get guest scenario data by ID - now uses direct Supabase queries with RLS
  async getGuestScenarioData(submissionId: string): Promise<any | null> {
    try {
      const { data: submission, error } = await supabase
        .from(TABLES.GUEST_SCENARIOS)
        .select('*')
        .eq('id', submissionId)
        .is('deleted_at', null)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to load guest scenario: ${error.message}`);
      }
      
      return submission;
    } catch (error) {
      console.error(`❌ Failed to load guest scenario ${submissionId}:`, error);
      throw error;
    }
  },

  // Delete scenario - now uses soft delete with audit fields
  async deleteScenario(scenarioId: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      if (!user) {
        throw new Error('User must be authenticated to delete scenarios');
      }

      const { error } = await supabase
        .from(TABLES.SIMULATOR_SUBMISSIONS)
        .update({
          deleted_at: timestamp,
          deleted_by: user.id,
          updated_by: user.id,
          updated_at: timestamp
        })
        .eq('id', scenarioId);
      
      if (error) {
        throw new Error(`Failed to delete scenario: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to delete scenario:', error);
      throw error;
    }
  },

  // Session data persistence - now uses KV store with direct Supabase queries
  async saveSessionData(sessionId: string, key: string, value: any): Promise<void> {
    try {
      const fullKey = `${sessionId}_${key}`;
      const timestamp = getCurrentTimestamp();
      
      const { error } = await supabase
        .from('kv_store')
        .upsert({
          key: fullKey,
          value: value,
          created_at: timestamp,
          updated_at: timestamp
        }, { onConflict: 'key' });
      
      if (error) {
        throw new Error(`Failed to save session data: ${error.message}`);
      }
    } catch (error) {
      console.error(`❌ Failed to save session data for ${key}:`, error);
      throw error;
    }
  },

  async loadSessionData<T>(sessionId: string, key: string, fallback: T): Promise<T> {
    try {
      const fullKey = `${sessionId}_${key}`;
      
      const { data, error } = await supabase
        .from('kv_store')
        .select('value')
        .eq('key', fullKey)
        .single();
      
      if (error || !data) {
        return fallback;
      }
      
      return data.value !== null && data.value !== undefined ? data.value : fallback;
    } catch (error) {
      console.warn(`Failed to load session data for ${key}:`, error);
      return fallback;
    }
  },

  async deleteSessionData(sessionId: string, key: string): Promise<void> {
    try {
      const fullKey = `${sessionId}_${key}`;
      
      const { error } = await supabase
        .from('kv_store')
        .delete()
        .eq('key', fullKey);
      
      if (error) {
        throw new Error(`Failed to delete session data: ${error.message}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete session data for ${key}:`, error);
      throw error;
    }
  },

  async clearSessionData(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('kv_store')
        .delete()
        .like('key', `${sessionId}_%`);
      
      if (error) {
        throw new Error(`Failed to clear session data: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to clear session data:', error);
      throw error;
    }
  },


  // Save configuration (single) - now uses direct Supabase operations with audit fields
  async saveConfiguration(config: ConfigurationDefinition, simulatorId?: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      const configWithAudit = {
        ...config,
        simulator_id: simulatorId,
        created_by: user?.id,
        updated_by: user?.id,
        created_at: timestamp,
        updated_at: timestamp
      };

      const { error } = await supabase
        .from(TABLES.CONFIGURATIONS)
        .upsert(configWithAudit, { onConflict: 'id' });
      
      if (error) {
        throw new Error(`Failed to save configuration: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  },

  // Delete configuration - now uses soft delete with audit fields
  async deleteConfiguration(configId: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      if (!user) {
        throw new Error('User must be authenticated to delete configurations');
      }

      const { error } = await supabase
        .from(TABLES.CONFIGURATIONS)
        .update({
          deleted_at: timestamp,
          deleted_by: user.id,
          updated_by: user.id,
          updated_at: timestamp
        })
        .eq('id', configId);
      
      if (error) {
        throw new Error(`Failed to delete configuration: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to delete configuration:', error);
      throw error;
    }
  },

  // Get categories (alias for loadCategories)
  async getCategories(simulatorId?: string): Promise<Category[]> {
    return this.loadCategories(simulatorId);
  },

  // Get configurations (alias for loadConfigurations)
  async getConfigurations(simulatorId?: string): Promise<ConfigurationDefinition[]> {
    return this.loadConfigurations(simulatorId);
  },

  // Create pricing item - now uses direct Supabase operations with audit fields
  async createPricingItem(item: Partial<PricingItem>, simulatorId?: string): Promise<PricingItem> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      if (!user) {
        throw new Error('User must be authenticated to create pricing items');
      }

      const itemWithAudit = {
        ...item,
        simulator_id: simulatorId,
        created_by: user.id,
        updated_by: user.id,
        created_at: timestamp,
        updated_at: timestamp
      };

      const { data, error } = await supabase
        .from(TABLES.SERVICES)
        .insert(itemWithAudit)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create pricing item: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Failed to create pricing item:', error);
      throw error;
    }
  },

  // Update pricing item - now uses direct Supabase operations with audit fields
  async updatePricingItem(id: string, updates: Partial<PricingItem>): Promise<PricingItem> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      if (!user) {
        throw new Error('User must be authenticated to update pricing items');
      }

      const updatesWithAudit = {
        ...updates,
        updated_by: user.id,
        updated_at: timestamp
      };

      const { data, error } = await supabase
        .from(TABLES.SERVICES)
        .update(updatesWithAudit)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to update pricing item: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Failed to update pricing item:', error);
      throw error;
    }
  },

  // Delete pricing item - now uses soft delete with audit fields
  async deletePricingItem(id: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      if (!user) {
        throw new Error('User must be authenticated to delete pricing items');
      }

      const { error } = await supabase
        .from(TABLES.SERVICES)
        .update({
          deleted_at: timestamp,
          deleted_by: user.id,
          updated_by: user.id,
          updated_at: timestamp
        })
        .eq('id', id);
      
      if (error) {
        throw new Error(`Failed to delete pricing item: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to delete pricing item:', error);
      throw error;
    }
  },

  // Create category - now uses direct Supabase operations with audit fields
  async createCategory(category: Partial<Category>, simulatorId?: string): Promise<Category> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      if (!user) {
        throw new Error('User must be authenticated to create categories');
      }

      const categoryWithAudit = {
        ...category,
        simulator_id: simulatorId,
        created_by: user.id,
        updated_by: user.id,
        created_at: timestamp,
        updated_at: timestamp
      };

      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .insert(categoryWithAudit)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create category: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Failed to create category:', error);
      throw error;
    }
  },

  // Update category - now uses direct Supabase operations with audit fields
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      if (!user) {
        throw new Error('User must be authenticated to update categories');
      }

      const updatesWithAudit = {
        ...updates,
        updated_by: user.id,
        updated_at: timestamp
      };

      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .update(updatesWithAudit)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to update category: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Failed to update category:', error);
      throw error;
    }
  },

  // Delete category - now uses soft delete with audit fields
  async deleteCategory(id: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      if (!user) {
        throw new Error('User must be authenticated to delete categories');
      }

      const { error } = await supabase
        .from(TABLES.CATEGORIES)
        .update({
          deleted_at: timestamp,
          deleted_by: user.id,
          updated_by: user.id,
          updated_at: timestamp
        })
        .eq('id', id);
      
      if (error) {
        throw new Error(`Failed to delete category: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to delete category:', error);
      throw error;
    }
  },

  // Get tags (alias for loadTags)
  async getTags(simulatorId?: string): Promise<Tag[]> {
    return this.loadTags(simulatorId);
  },

  // Create tag - now uses direct Supabase operations with audit fields
  async createTag(tag: Partial<Tag>, simulatorId?: string): Promise<Tag> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      if (!user) {
        throw new Error('User must be authenticated to create tags');
      }

      const tagWithAudit = {
        ...tag,
        simulator_id: simulatorId,
        created_by: user.id,
        updated_by: user.id,
        created_at: timestamp,
        updated_at: timestamp
      };

      const { data, error } = await supabase
        .from(TABLES.TAGS)
        .insert(tagWithAudit)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create tag: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Failed to create tag:', error);
      throw error;
    }
  },

  // Update tag - now uses direct Supabase operations with audit fields
  async updateTag(id: string, updates: Partial<Tag>): Promise<Tag> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      if (!user) {
        throw new Error('User must be authenticated to update tags');
      }

      const updatesWithAudit = {
        ...updates,
        updated_by: user.id,
        updated_at: timestamp
      };

      const { data, error } = await supabase
        .from(TABLES.TAGS)
        .update(updatesWithAudit)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to update tag: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Failed to update tag:', error);
      throw error;
    }
  },

  // Delete tag - now uses soft delete with audit fields
  async deleteTag(id: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      if (!user) {
        throw new Error('User must be authenticated to delete tags');
      }

      const { error } = await supabase
        .from(TABLES.TAGS)
        .update({
          deleted_at: timestamp,
          deleted_by: user.id,
          updated_by: user.id,
          updated_at: timestamp
        })
        .eq('id', id);
      
      if (error) {
        throw new Error(`Failed to delete tag: ${error.message}`);
      }
    } catch (error) {
      console.error('❌ Failed to delete tag:', error);
      throw error;
    }
  },

  // User Management Functions
  async getUsers(filters?: { role?: string; is_active?: boolean }): Promise<any[]> {
    try {
      let query = supabase
        .from(TABLES.USER_PROFILES)
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
      
      return data || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  async getUser(id: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        throw new Error(`Failed to fetch user: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
  },

  async updateUser(id: string, updates: any): Promise<any> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated to update users');
      }

      const timestamp = getCurrentTimestamp();
      const updatesWithAudit = {
        ...updates,
        updated_by: user.id,
        updated_at: timestamp
      };

      const { data, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .update(updatesWithAudit)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated to delete users');
      }

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from(TABLES.USER_PROFILES)
        .update({ 
          is_active: false,
          updated_by: user.id,
          updated_at: getCurrentTimestamp()
        })
        .eq('id', id);
      
      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  },

  // Invite Management Functions
  async getInvites(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('admin_invites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to fetch invites: ${error.message}`);
      }
      
      return data || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch invites: ${error.message}`);
    }
  },

  async createInvite(inviteData: any): Promise<any> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated to create invites');
      }

      const timestamp = getCurrentTimestamp();
      const invite = {
        ...inviteData,
        created_by: user.id,
        created_at: timestamp,
        invite_code: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };

      const { data, error } = await supabase
        .from('admin_invites')
        .insert(invite)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create invite: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      throw new Error(`Failed to create invite: ${error.message}`);
    }
  },

  async deleteInvite(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_invites')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Failed to delete invite: ${error.message}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to delete invite: ${error.message}`);
    }
  },

  // Statistics Functions
  async getAdminStats(): Promise<any> {
    try {
      const [usersResult, scenariosResult, guestSubmissionsResult] = await Promise.all([
        supabase.from(TABLES.USER_PROFILES).select('id', { count: 'exact' }),
        supabase.from(TABLES.SIMULATOR_SUBMISSIONS).select('id', { count: 'exact' }),
        supabase.from(TABLES.GUEST_SCENARIOS).select('id', { count: 'exact' })
      ]);

      const totalUsers = usersResult.count || 0;
      const totalScenarios = scenariosResult.count || 0;
      const totalGuestSubmissions = guestSubmissionsResult.count || 0;

      // Calculate active users (users who logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers } = await supabase
        .from(TABLES.USER_PROFILES)
        .select('id', { count: 'exact' })
        .gte('last_login', thirtyDaysAgo.toISOString())
        .eq('is_active', true);

      // Calculate average scenario value
      const { data: scenarioValues } = await supabase
        .from(TABLES.SIMULATOR_SUBMISSIONS)
        .select('total_price')
        .not('total_price', 'is', null);

      const averageScenarioValue = scenarioValues?.length 
        ? scenarioValues.reduce((sum, s) => sum + (s.total_price || 0), 0) / scenarioValues.length 
        : 0;

      return {
        totalUsers,
        totalScenarios,
        totalGuestSubmissions,
        totalRevenue: scenarioValues?.reduce((sum, s) => sum + (s.total_price || 0), 0) || 0,
        activeUsers: activeUsers || 0,
        averageScenarioValue,
        recentActivity: [] // TODO: Implement recent activity tracking
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch admin stats: ${error.message}`);
    }
  }
};