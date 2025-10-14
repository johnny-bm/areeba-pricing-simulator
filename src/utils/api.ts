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
        
        if (i === retries) {
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
      return false;
    }
  },

  // Load services - now uses direct Supabase queries with RLS
  async loadPricingItems(simulatorId?: string): Promise<PricingItem[]> {
    try {
      console.log('🔍 loadPricingItems called with simulatorId:', simulatorId);
      
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
        .order('created_at', { ascending: false }); // Changed to desc for cache busting

      // Filter by simulator if provided
      if (simulatorId) {
        query = query.eq('simulator_id', simulatorId);
        console.log('🔍 Filtering services by simulator_id:', simulatorId);
      } else {
        console.log('🔍 Loading all services (no simulator filter)');
      }

      const { data: services, error } = await query;
      
      console.log('🔍 Services query result:', { 
        data: services, 
        error,
        count: services?.length || 0,
        firstServiceSimulatorId: services?.[0]?.simulator_id,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        throw new Error(`Failed to load services: ${error.message}`);
      }
      
      // Transform the data to match frontend expectations
      const transformedServices = (services || []).map(service => {
        const transformed = {
          ...service,
          // Map database fields to frontend fields
          categoryId: service.category?.id || null,
          defaultPrice: service.default_price || 0,
          pricingType: service.pricing_type === 'simple' ? 'one_time' : service.pricing_type,
          billingCycle: service.billing_cycle,
          // Transform tags from service_tags relationship
          tags: service.service_tags?.map((st: any) => st.tag?.name).filter(Boolean) || []
        };
        
        return transformed;
      });
      
      return transformedServices;
    } catch (error) {
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
      
      // Prepare items with audit fields and correct column mapping
      const itemsWithAudit = items.map(item => {
        const mappedItem = {
          id: item.id,
          name: item.name,
          description: item.description || '',
          category: item.categoryId, // Map categoryId to category
          unit: item.unit,
          default_price: item.defaultPrice, // Map defaultPrice to default_price
          pricing_type: item.pricingType === 'one_time' ? 'simple' : item.pricingType, // Map 'one_time' to 'simple' for database
          billing_cycle: item.billingCycle,
          is_active: item.is_active !== undefined ? item.is_active : true,
          tiered_pricing: item.tiers ? { type: 'tiered', tiers: item.tiers } : null,
          simulator_id: simulatorId,
          created_by: user?.id,
          updated_by: user?.id,
          created_at: timestamp,
          updated_at: timestamp
        };

        return mappedItem;
      });

      // Filter out services without valid categories first
      const validItems = itemsWithAudit.filter(item => {
        const hasValidCategory = item.category && item.category !== 'undefined' && item.category !== 'null';
        return hasValidCategory;
      });

      if (validItems.length === 0 && itemsWithAudit.length > 0) {
        throw new Error('No services with valid categories found. Please assign categories to your services.');
      }

      if (validItems.length !== itemsWithAudit.length) {
      }

      // Handle empty array case (all services deleted)
      if (validItems.length === 0) {
        // Soft-delete all services for this simulator
        const { error: deleteError } = await supabase
          .from(TABLES.SERVICES)
          .update({
            deleted_at: timestamp,
            deleted_by: user?.id,
            updated_by: user?.id,
            updated_at: timestamp
          })
          .eq('simulator_id', simulatorId)
          .is('deleted_at', null);
        
        if (deleteError) {
          throw new Error(`Failed to delete services: ${deleteError.message}`);
        }
        
        return;
      }

      // Validate that all categories exist before saving services
      const categoryIds = [...new Set(validItems.map(item => item.category))];
      
      const { data: existingCategories, error: categoryCheckError } = await supabase
        .from(TABLES.CATEGORIES)
        .select('id, name')
        .in('id', categoryIds)
        .is('deleted_at', null);
      
      if (categoryCheckError) {
        throw new Error(`Failed to validate categories: ${categoryCheckError.message}`);
      }
      
      const existingCategoryIds = existingCategories?.map(cat => cat.id) || [];
      const missingCategories = categoryIds.filter(id => !existingCategoryIds.includes(id));
      
      if (missingCategories.length > 0) {
        throw new Error(`Categories not found: ${missingCategories.join(', ')}. Please create these categories first.`);
      }

      const { data, error } = await supabase
        .from(TABLES.SERVICES)
        .upsert(validItems, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) {
        throw new Error(`Failed to save services: ${error.message}`);
      }

      // Soft-delete services that are no longer in the array
      const savedServiceIds = validItems.map(item => item.id);
      
      const { data: servicesToDelete, error: queryError } = await supabase
        .from(TABLES.SERVICES)
        .select('id, name')
        .eq('simulator_id', simulatorId)
        .not('id', 'in', `(${savedServiceIds.join(',')})`)
        .is('deleted_at', null);
      
      if (queryError) {
      } else if (servicesToDelete && servicesToDelete.length > 0) {
        const { error: softDeleteError } = await supabase
          .from(TABLES.SERVICES)
          .update({
            deleted_at: timestamp,
            deleted_by: user?.id,
            updated_by: user?.id,
            updated_at: timestamp
          })
          .eq('simulator_id', simulatorId)
          .not('id', 'in', `(${savedServiceIds.join(',')})`)
          .is('deleted_at', null);
        
        if (softDeleteError) {
        }
      }

      // Save service-tag associations
      for (const item of items) {
        if (item.tags && item.tags.length > 0) {
          // First, ensure all tags exist in the tags table
          for (const tagName of item.tags) {
            // Check if tag exists
            const { data: existingTag } = await supabase
              .from(TABLES.TAGS)
              .select('id')
              .eq('name', tagName)
              .maybeSingle();
            
            if (!existingTag) {
              // Create tag if it doesn't exist
              const { error: tagCreateError } = await supabase
                .from(TABLES.TAGS)
                .insert({
                  id: `tag-${tagName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                  name: tagName,
                  is_active: true,
                  simulator_id: simulatorId,
                  created_by: user?.id,
                  updated_by: user?.id,
                  created_at: timestamp,
                  updated_at: timestamp
                });
              
              if (tagCreateError) {
              }
            }
          }
          
          // Delete existing service-tag associations
          const { error: deleteError } = await supabase
            .from(TABLES.SERVICE_TAGS)
            .delete()
            .eq('service_id', item.id);
          
          if (deleteError) {
          }
          
          // Get tag IDs for all tags
          const { data: tagData } = await supabase
            .from(TABLES.TAGS)
            .select('id, name')
            .in('name', item.tags);
          
          if (tagData && tagData.length > 0) {
            // Create new service-tag associations
            const serviceTags = tagData.map(tag => ({
              service_id: item.id,
              tag_id: tag.id,
              created_by: user?.id,
              updated_by: user?.id,
              created_at: timestamp,
              updated_at: timestamp
            }));
            
            const { error: tagError } = await supabase
              .from(TABLES.SERVICE_TAGS)
              .insert(serviceTags);
            
            if (tagError) {
            }
          }
        } else {
          // Delete service-tag associations if no tags specified
          const { error: deleteError } = await supabase
            .from(TABLES.SERVICE_TAGS)
            .delete()
            .eq('service_id', item.id);
          
          if (deleteError) {
          }
        }
      }
    } catch (error) {
      throw error;
    }
  },

  // Load categories - now uses direct Supabase queries with RLS
  async loadCategories(simulatorId?: string): Promise<Category[]> {
    try {
      console.log('🔍 loadCategories called with simulatorId:', simulatorId);
      
      let query = supabase
        .from(TABLES.CATEGORIES)
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false }); // Changed for cache busting

      // Filter by simulator if provided
      if (simulatorId) {
        query = query.eq('simulator_id', simulatorId);
        console.log('🔍 Filtering categories by simulator_id:', simulatorId);
      } else {
        console.log('🔍 Loading all categories (no simulator filter)');
      }

      const { data: categories, error } = await query;
      
      console.log('🔍 Categories query result:', { 
        data: categories, 
        error,
        count: categories?.length || 0,
        firstCategorySimulatorId: categories?.[0]?.simulator_id,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        throw new Error(`Failed to load categories: ${error.message}`);
      }
      
      return categories || [];
    } catch (error) {
      throw error;
    }
  },

  // Save categories - now uses direct Supabase operations with audit fields
  async saveCategories(categories: Category[], simulatorId?: string): Promise<void> {
    try {
      const user = await getCurrentUser();
      const timestamp = getCurrentTimestamp();
      
      // Prepare categories with audit fields and correct field mapping
      const categoriesWithAudit = categories.map(category => {
        const mappedCategory = {
          id: category.id,
          name: category.name,
          description: category.description || '', // Required field - provide default
          color: category.color || '#6B7280', // Default color
          order_index: category.order_index || 1, // Default order
          display_order: category.display_order || 0, // Default display order
          is_active: category.is_active !== undefined ? category.is_active : true,
          simulator_id: simulatorId,
          created_by: user?.id,
          updated_by: user?.id,
          created_at: timestamp,
          updated_at: timestamp
        };

        return mappedCategory;
      });

      const { data, error } = await supabase
        .from(TABLES.CATEGORIES)
        .upsert(categoriesWithAudit, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) {
        throw new Error(`Failed to save categories: ${error.message}`);
      }
    } catch (error) {
      // // // console.error('❌ Failed to save categories:', error);
      throw error;
    }
  },

  // Load tags - now uses direct Supabase queries with RLS
  async loadTags(simulatorId?: string): Promise<Tag[]> {
    try {
      console.log('🔍 loadTags called with simulatorId:', simulatorId);
      
      let query = supabase
        .from(TABLES.TAGS)
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false }); // Changed for cache busting

      // Filter by simulator if provided
      if (simulatorId) {
        query = query.eq('simulator_id', simulatorId);
        console.log('🔍 Filtering tags by simulator_id:', simulatorId);
      } else {
        console.log('🔍 Loading all tags (no simulator filter)');
      }

      const { data: tags, error } = await query;
      
      console.log('🔍 Tags query result:', { 
        data: tags, 
        error,
        count: tags?.length || 0,
        firstTagSimulatorId: tags?.[0]?.simulator_id,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        throw new Error(`Failed to load tags: ${error.message}`);
      }
      
      return tags || [];
    } catch (error) {
      // // // console.error('❌ Failed to load tags:', error);
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
      // // // console.error('❌ Failed to save tags:', error);
      throw error;
    }
  },

  // Load configurations - now uses direct Supabase queries with RLS
  async loadConfigurations(simulatorId?: string): Promise<ConfigurationDefinition[]> {
    try {
      console.log('🔍 loadConfigurations called with simulatorId:', simulatorId);
      
      let query = supabase
        .from(TABLES.CONFIGURATIONS)
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false }); // Changed for cache busting

      // Filter by simulator if provided
      if (simulatorId) {
        query = query.eq('simulator_id', simulatorId);
        console.log('🔍 Filtering configurations by simulator_id:', simulatorId);
      } else {
        console.log('🔍 Loading all configurations (no simulator filter)');
      }

      const { data: configurations, error } = await query;
      
      console.log('🔍 Configurations query result:', { 
        data: configurations, 
        error,
        count: configurations?.length || 0,
        firstConfigSimulatorId: configurations?.[0]?.simulator_id,
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        throw new Error(`Failed to load configurations: ${error.message}`);
      }
      
      return configurations || [];
    } catch (error) {
      // // // console.error('❌ Failed to load configurations:', error);
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
      // // // console.error('❌ Failed to save configurations:', error);
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
      // // // console.error('❌ Failed to save scenario:', error);
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
    // // // console.error('❌ Failed to save guest scenario:', error);
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
      // // // console.error('❌ Failed to load scenarios:', error);
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
      // // // console.error(`❌ Failed to load scenario ${scenarioId}:`, error);
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
      // // // console.error('❌ Failed to load guest submissions:', error);
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
      // // // console.error(`❌ Failed to load guest scenario ${submissionId}:`, error);
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
      // // // console.error('❌ Failed to delete scenario:', error);
      throw error;
    }
  },

  // Session data persistence - now uses KV store with direct Supabase queries
  async saveSessionData(sessionId: string, key: string, value: any): Promise<void> {
    try {
      const fullKey = `${sessionId}_${key}`;
      
      const { error } = await supabase
        .from('kv_store')
        .upsert({
          key: fullKey,
          value: value
        }, { onConflict: 'key' });
      
      if (error) {
        throw new Error(`Failed to save session data: ${error.message}`);
      }
    } catch (error) {
      // // // console.error(`❌ Failed to save session data for ${key}:`, error);
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
      // // // console.warn(`Failed to load session data for ${key}:`, error);
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
      // // // console.error(`❌ Failed to delete session data for ${key}:`, error);
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
      // // // console.error('Failed to clear session data:', error);
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
        // Use config's simulator_id if provided, otherwise fall back to parameter
        // This prevents accidentally overwriting the config value with undefined
        simulator_id: config.simulator_id || simulatorId,
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
      // // // console.error('Failed to save configuration:', error);
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
      // // // console.error('Failed to delete configuration:', error);
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
      // // // console.error('❌ Failed to create pricing item:', error);
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
      // // // console.error('❌ Failed to update pricing item:', error);
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
      // // // console.error('❌ Failed to delete pricing item:', error);
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
      // // // console.error('❌ Failed to create category:', error);
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
      // // // console.error('❌ Failed to update category:', error);
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
      // // // console.error('❌ Failed to delete category:', error);
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
      // // // console.error('❌ Failed to create tag:', error);
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
      // // // console.error('❌ Failed to update tag:', error);
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
      // // // console.error('❌ Failed to delete tag:', error);
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
  },

  // ============================================
  // Config Pricing Units API
  // ============================================

  async loadPricingUnits() {
    // // // console.log('🔍 Loading pricing units (global config)');
    
    const { data, error } = await supabase
      .from('config_pricing_units')
      .select('*')
      .is('deleted_at', null)
      .order('display_order');
    
    if (error) {
      // // // console.error('❌ Error loading pricing units:', error);
      throw error;
    }
    
    // // // console.log('✅ Loaded pricing units:', data?.length);
    return data || [];
  },

  async savePricingUnit(unit: any) {
    // // // console.log('🔍 Saving pricing unit:', unit);
    
    const user = await getCurrentUser();
    const now = getCurrentTimestamp();
    
    const payload = {
      id: unit.id,
      name: unit.name,
      value: unit.value,
      description: unit.description || '',
      category: unit.category || '',
      display_order: unit.displayOrder || unit.display_order || 0,
      is_active: unit.isActive ?? unit.is_active ?? true,
      created_by: user?.id,
      updated_by: user?.id,
      created_at: unit.id ? undefined : now,
      updated_at: now
    };
    
    const { data, error } = await supabase
      .from('config_pricing_units')
      .upsert(payload)
      .select()
      .single();
    
    if (error) {
      // // // console.error('❌ Error saving pricing unit:', error);
      throw error;
    }
    
    // // // console.log('✅ Pricing unit saved:', data);
    return data;
  },

  async deletePricingUnit(unitId: string) {
    // // // console.log('🔍 Deleting pricing unit:', unitId);
    
    const user = await getCurrentUser();
    const now = getCurrentTimestamp();
    
    // Soft delete
    const { error } = await supabase
      .from('config_pricing_units')
      .update({ 
        deleted_at: now,
        deleted_by: user?.id,
        updated_at: now
      })
      .eq('id', unitId);
    
    if (error) {
      // // // console.error('❌ Error deleting pricing unit:', error);
      throw error;
    }
    
    // // // console.log('✅ Pricing unit deleted');
  },

  async togglePricingUnitActive(unitId: string, isActive: boolean) {
    // // // console.log('🔍 Toggling pricing unit active:', unitId, isActive);
    
    const user = await getCurrentUser();
    const now = getCurrentTimestamp();
    
    const { error } = await supabase
      .from('config_pricing_units')
      .update({ 
        is_active: isActive,
        updated_by: user?.id,
        updated_at: now
      })
      .eq('id', unitId);
    
    if (error) {
      // // // console.error('❌ Error toggling pricing unit:', error);
      throw error;
    }
    
    // // // console.log('✅ Pricing unit active status toggled');
  },

  // ============================================
  // Config Pricing Types API
  // ============================================

  async loadPricingTypes() {
    // // // console.log('🔍 Loading pricing types (global config)');
    
    const { data, error } = await supabase
      .from('config_pricing_types')
      .select('*')
      .is('deleted_at', null)
      .order('display_order');
    
    if (error) {
      // // // console.error('❌ Error loading pricing types:', error);
      throw error;
    }
    
    // // // console.log('✅ Loaded pricing types:', data?.length);
    return data || [];
  },

  async savePricingType(type: any) {
    // // // console.log('🔍 Saving pricing type:', type);
    
    const user = await getCurrentUser();
    const now = getCurrentTimestamp();
    
    const payload = {
      id: type.id,
      name: type.name,
      value: type.value,
      description: type.description || '',
      supports_recurring: type.supportsRecurring ?? false,
      supports_tiered: type.supportsTiered ?? false,
      display_order: type.displayOrder || type.display_order || 0,
      is_active: type.isActive ?? type.is_active ?? true,
      created_by: user?.id,
      updated_by: user?.id,
      created_at: type.id ? undefined : now,
      updated_at: now
    };
    
    const { data, error } = await supabase
      .from('config_pricing_types')
      .upsert(payload)
      .select()
      .single();
    
    if (error) {
      // // // console.error('❌ Error saving pricing type:', error);
      throw error;
    }
    
    // // // console.log('✅ Pricing type saved:', data);
    return data;
  },

  async deletePricingType(typeId: string) {
    // // // console.log('🔍 Deleting pricing type:', typeId);
    
    const user = await getCurrentUser();
    const now = getCurrentTimestamp();
    
    // Soft delete
    const { error } = await supabase
      .from('config_pricing_types')
      .update({ 
        deleted_at: now,
        deleted_by: user?.id,
        updated_at: now
      })
      .eq('id', typeId);
    
    if (error) {
      // // // console.error('❌ Error deleting pricing type:', error);
      throw error;
    }
    
    // // // console.log('✅ Pricing type deleted');
  },

  async togglePricingTypeActive(typeId: string, isActive: boolean) {
    // // // console.log('🔍 Toggling pricing type active:', typeId, isActive);
    
    const user = await getCurrentUser();
    const now = getCurrentTimestamp();
    
    const { error } = await supabase
      .from('config_pricing_types')
      .update({ 
        is_active: isActive,
        updated_by: user?.id,
        updated_at: now
      })
      .eq('id', typeId);
    
    if (error) {
      // // // console.error('❌ Error toggling pricing type:', error);
      throw error;
    }
    
    // // // console.log('✅ Pricing type active status toggled');
  },

  // ============================================
  // Config Pricing Cycles API
  // ============================================

  async loadPricingCycles() {
    // // // console.log('🔍 Loading pricing cycles (global config)');
    
    const { data, error } = await supabase
      .from('config_pricing_cycles')
      .select('*')
      .is('deleted_at', null)
      .order('display_order');
    
    if (error) {
      // // // console.error('❌ Error loading pricing cycles:', error);
      throw error;
    }
    
    // // // console.log('✅ Loaded pricing cycles:', data?.length);
    return data || [];
  },

  async savePricingCycle(cycle: any) {
    // // // console.log('🔍 Saving pricing cycle:', cycle);
    
    const user = await getCurrentUser();
    const now = getCurrentTimestamp();
    
    const payload = {
      id: cycle.id,
      name: cycle.name,
      value: cycle.value,
      description: cycle.description || '',
      months: cycle.months || null,
      display_order: cycle.displayOrder || cycle.display_order || 0,
      is_active: cycle.isActive ?? cycle.is_active ?? true,
      created_by: user?.id,
      updated_by: user?.id,
      created_at: cycle.id ? undefined : now,
      updated_at: now
    };
    
    const { data, error } = await supabase
      .from('config_pricing_cycles')
      .upsert(payload)
      .select()
      .single();
    
    if (error) {
      // // // console.error('❌ Error saving pricing cycle:', error);
      throw error;
    }
    
    // // // console.log('✅ Pricing cycle saved:', data);
    return data;
  },

  async deletePricingCycle(cycleId: string) {
    // // // console.log('🔍 Deleting pricing cycle:', cycleId);
    
    const user = await getCurrentUser();
    const now = getCurrentTimestamp();
    
    // Soft delete
    const { error } = await supabase
      .from('config_pricing_cycles')
      .update({ 
        deleted_at: now,
        deleted_by: user?.id,
        updated_at: now
      })
      .eq('id', cycleId);
    
    if (error) {
      // // // console.error('❌ Error deleting pricing cycle:', error);
      throw error;
    }
    
    // // // console.log('✅ Pricing cycle deleted');
  },

  async togglePricingCycleActive(cycleId: string, isActive: boolean) {
    // // // console.log('🔍 Toggling pricing cycle active:', cycleId, isActive);
    
    const user = await getCurrentUser();
    const now = getCurrentTimestamp();
    
    const { error } = await supabase
      .from('config_pricing_cycles')
      .update({ 
        is_active: isActive,
        updated_by: user?.id,
        updated_at: now
      })
      .eq('id', cycleId);
    
    if (error) {
      // // // console.error('❌ Error toggling pricing cycle:', error);
      throw error;
    }
    
    // // // console.log('✅ Pricing cycle active status toggled');
  },

  // ============================================
  // Config Pricing Templates API
  // ============================================

  async loadPricingTemplates() {
    // // // console.log('🔍 Loading pricing templates (global config)');
    
    const { data, error } = await supabase
      .from('config_pricing_templates')
      .select('*')
      .is('deleted_at', null)
      .order('display_order');
    
    if (error) {
      // // // console.error('❌ Error loading pricing templates:', error);
      throw error;
    }
    
    // // // console.log('✅ Loaded pricing templates:', data?.length);
    return data || [];
  },

  async savePricingTemplate(template: any) {
    // // // console.log('🔍 Saving pricing template:', template);
    
    const user = await getCurrentUser();
    const now = getCurrentTimestamp();
    
    const payload = {
      id: template.id,
      name: template.name,
      description: template.description || '',
      tiers: template.tiers || [],
      display_order: template.displayOrder || template.display_order || 0,
      is_active: template.isActive ?? template.is_active ?? true,
      created_by: user?.id,
      updated_by: user?.id,
      created_at: template.id ? undefined : now,
      updated_at: now
    };
    
    const { data, error } = await supabase
      .from('config_pricing_templates')
      .upsert(payload)
      .select()
      .single();
    
    if (error) {
      // // // console.error('❌ Error saving pricing template:', error);
      throw error;
    }
    
    // // // console.log('✅ Pricing template saved:', data);
    return data;
  },

  async deletePricingTemplate(templateId: string) {
    // // // console.log('🔍 Deleting pricing template:', templateId);
    
    const user = await getCurrentUser();
    const now = getCurrentTimestamp();
    
    // Soft delete
    const { error } = await supabase
      .from('config_pricing_templates')
      .update({ 
        deleted_at: now,
        deleted_by: user?.id,
        updated_at: now
      })
      .eq('id', templateId);
    
    if (error) {
      // // // console.error('❌ Error deleting pricing template:', error);
      throw error;
    }
    
    // // // console.log('✅ Pricing template deleted');
  },

  async togglePricingTemplateActive(templateId: string, isActive: boolean) {
    // // // console.log('🔍 Toggling pricing template active:', templateId, isActive);
    
    const user = await getCurrentUser();
    const now = getCurrentTimestamp();
    
    const { error } = await supabase
      .from('config_pricing_templates')
      .update({ 
        is_active: isActive,
        updated_by: user?.id,
        updated_at: now
      })
      .eq('id', templateId);
    
    if (error) {
      // // // console.error('❌ Error toggling pricing template:', error);
      throw error;
    }
    
    // // // console.log('✅ Pricing template active status toggled');
  },

};