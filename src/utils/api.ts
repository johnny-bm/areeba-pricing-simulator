// Direct Supabase API - uses RLS policies and direct database queries
// Maps to the schema defined in /config/database.ts

import { PricingItem, Category, ScenarioData, ConfigurationDefinition, Tag, ClientConfig, SelectedItem, ScenarioSummary, UserProfile, Invite } from '../types/domain';
import { supabase } from './supabase/client';
import { TABLES, COLUMNS } from '../config/database';
import { PricingItemService, CategoryService, TagService, ConfigurationService } from './apiService';
import { rateLimiters, sanitize, permissions, audit } from './security';

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
      } catch (error) {
        
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
    } catch (error) {
      return false;
    }
  },

  // Load services - now uses direct Supabase queries with RLS
  async loadPricingItems(simulatorId?: string): Promise<PricingItem[]> {
    try {
      const pricingService = new PricingItemService();
      return await pricingService.loadPricingItems(simulatorId);
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
        // Apply rate limiting
        await rateLimiters.mutations(async () => {
          const user = await getCurrentUser();
          const timestamp = getCurrentTimestamp();
      
      // Sanitize and validate input
      const sanitizedItems = items.map(item => ({
        ...item,
        name: sanitize.text(item.name),
        description: sanitize.text(item.description || ''),
        unit: sanitize.text(item.unit),
        defaultPrice: sanitize.number(item.defaultPrice),
        categoryId: sanitize.uuid(item.categoryId || ''),
        pricingType: sanitize.text(item.pricingType),
        billingCycle: sanitize.text(item.billingCycle)
      }));

      // Validate required fields
      const invalidItems = sanitizedItems.filter(item => 
        !item.name || !item.categoryId || item.defaultPrice < 0
      );
      
      if (invalidItems.length > 0) {
        audit.logSuspiciousActivity('invalid_pricing_items', { 
          count: invalidItems.length,
          items: invalidItems.map(i => ({ id: i.id, name: i.name }))
        });
        throw new Error('Invalid pricing items detected. Please check your input.');
      }

      // Prepare items with audit fields and correct column mapping
      const itemsWithAudit = sanitizedItems.map(item => {
        const mappedItem = {
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.categoryId, // Map categoryId to category
          unit: item.unit,
          default_price: item.defaultPrice, // Map defaultPrice to default_price
          pricing_type: item.pricingType === 'tiered' ? 'tiered' : 'simple', // Map to database constraint values
          billing_cycle: item.billingCycle,
          is_active: item.is_active !== undefined ? item.is_active : true,
          tiered_pricing: (() => {
            return item.tiers ? { 
              type: 'tiered', 
              tiers: item.tiers,
              original_pricing_type: item.pricingType // Store original pricing type
            } : { 
              type: 'simple', 
              tiers: [], // Required by constraint
              original_pricing_type: item.pricingType // Store original pricing type for non-tiered items too
            };
          })(),
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
        if (!hasValidCategory) {
          // Service has invalid category - will be filtered out
        }
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

      // Skip category validation for better performance - let database constraints handle it
      // This reduces an extra database query on every save

      
      const { data, error } = await supabase
        .from(TABLES.SERVICES)
        .upsert(validItems, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();
      
      if (error) {
        console.error('❌ Database error:', error);
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

      // Optimize service-tag associations with batching
      const allTagNames = [...new Set(items.flatMap(item => item.tags || []))];
      
      if (allTagNames.length > 0) {
        // Batch create missing tags
        const { data: existingTags } = await supabase
          .from(TABLES.TAGS)
          .select('id, name')
          .in('name', allTagNames)
          .eq('simulator_id', simulatorId);
        
        const existingTagNames = existingTags?.map(tag => tag.name) || [];
        const missingTags = allTagNames.filter(name => !existingTagNames.includes(name));
        
        if (missingTags.length > 0) {
          const newTags = missingTags.map(tagName => ({
            id: `tag-${tagName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
            name: tagName,
            is_active: true,
            simulator_id: simulatorId,
            created_by: user?.id,
            updated_by: user?.id,
            created_at: timestamp,
            updated_at: timestamp
          }));
          
          await supabase.from(TABLES.TAGS).insert(newTags);
        }
      }
      
      // Batch delete all existing service-tag associations for these services
      const serviceIds = items.map(item => item.id);
      await supabase
        .from(TABLES.SERVICE_TAGS)
        .delete()
        .in('service_id', serviceIds);
      
      // Optimize service-tag associations with single query
      const allServiceTags = [];
      if (allTagNames.length > 0) {
        // Get all tag IDs in one query
        const { data: allTagData } = await supabase
          .from(TABLES.TAGS)
          .select('id, name')
          .in('name', allTagNames)
          .eq('simulator_id', simulatorId);
        
        if (allTagData && allTagData.length > 0) {
          // Create a map for quick lookup
          const tagMap = new Map(allTagData.map(tag => [tag.name, tag.id]));
          
          // Build service-tag associations
          for (const item of items) {
            if (item.tags && item.tags.length > 0) {
              const serviceTags = item.tags
                .map(tagName => tagMap.get(tagName))
                .filter(tagId => tagId) // Filter out undefined tags
                .map(tagId => ({
                  service_id: item.id,
                  tag_id: tagId,
                  created_by: user?.id,
                  updated_by: user?.id,
                  created_at: timestamp,
                  updated_at: timestamp
                }));
              allServiceTags.push(...serviceTags);
            }
          }
        }
      }
      
      // Optimize auto-add and quantity rules with batch operations
      // Batch delete all existing rules for these services
      await Promise.all([
        supabase.from('auto_add_rules').delete().in('service_id', serviceIds),
        supabase.from('quantity_rules').delete().in('service_id', serviceIds)
      ]);
      
      // Batch collect all rules to insert
      const allAutoAddRules = [];
      const allQuantityRules = [];
      
      for (const item of items) {
        const serviceId = item.id;
        
        // Collect auto-add rules
        const autoAddFields = item.autoAddServices || item.auto_add_trigger_fields || [];
        if (autoAddFields.length > 0) {
          const configFieldIds = autoAddFields.map(field => 
            typeof field === 'string' ? field : field.configFieldId
          ).filter(id => id && id !== null && id !== undefined);
          
          const autoAddRules = configFieldIds.map(configFieldId => ({
            service_id: serviceId,
            config_field_id: configFieldId,
            simulator_id: simulatorId,
            is_active: true
          }));
          allAutoAddRules.push(...autoAddRules);
        }
        
        // Collect quantity rules
        const quantityFields = item.quantitySourceFields || item.quantity_source_fields || [];
        if (quantityFields.length > 0) {
          const quantityRules = quantityFields.map(configFieldId => ({
            service_id: serviceId,
            config_field_id: configFieldId,
            simulator_id: simulatorId,
            multiplier: item.quantityMultiplier || 1.0,
            is_active: true
          }));
          allQuantityRules.push(...quantityRules);
        }
      }
      
      // Batch insert all rules
      const rulePromises = [];
      if (allAutoAddRules.length > 0) {
        rulePromises.push(supabase.from('auto_add_rules').insert(allAutoAddRules));
      }
      if (allQuantityRules.length > 0) {
        rulePromises.push(supabase.from('quantity_rules').insert(allQuantityRules));
      }
      
      if (rulePromises.length > 0) {
        await Promise.all(rulePromises);
      }
      
      if (allServiceTags.length > 0) {
        await supabase.from(TABLES.SERVICE_TAGS).insert(allServiceTags);
      }
        });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        audit.logRateLimit('savePricingItems');
      }
      throw error;
    }
  },

  // Load categories - now uses direct Supabase queries with RLS
  async loadCategories(simulatorId?: string): Promise<Category[]> {
    try {
      const categoryService = new CategoryService();
      return simulatorId 
        ? await categoryService.loadBySimulator(simulatorId)
        : await categoryService.loadAll();
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
      const tagService = new TagService();
      return simulatorId 
        ? await tagService.loadBySimulator(simulatorId)
        : await tagService.loadAll();
    } catch (error) {
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
      const configurationService = new ConfigurationService();
      return simulatorId 
        ? await configurationService.loadBySimulator(simulatorId)
        : await configurationService.loadAll();
    } catch (error) {
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
  config: ClientConfig;
  selectedItems: SelectedItem[];
  categories: Category[];
  globalDiscount: number;
  globalDiscountType: string;
  globalDiscountApplication: string;
  summary: ScenarioSummary;
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
  async saveSessionData(sessionId: string, key: string, value: unknown): Promise<void> {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch users: ${errorMessage}`);
    }
  },

  async getUser(id: string): Promise<UserProfile | null> {
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch user: ${errorMessage}`);
    }
  },

  async updateUser(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Apply rate limiting
      await rateLimiters.mutations(async () => {
        const user = await getCurrentUser();
        if (!user) {
          throw new Error('User must be authenticated to update users');
        }

        // Check permissions
        if (!permissions.hasAdminAccess(user.user_metadata?.role || 'member')) {
          throw new Error('Insufficient permissions to update users');
        }

        // Sanitize input
        const sanitizedUpdates = {
          ...updates,
          full_name: updates.full_name ? sanitize.text(updates.full_name) : updates.full_name,
          email: updates.email ? sanitize.email(updates.email) : updates.email,
          role: updates.role ? sanitize.text(updates.role) : updates.role
        };

        const timestamp = getCurrentTimestamp();
        const updatesWithAudit = {
          ...sanitizedUpdates,
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
        });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
        audit.logRateLimit('updateUser');
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update user: ${errorMessage}`);
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete user: ${errorMessage}`);
    }
  },

  // Invite Management Functions
  async getInvites(): Promise<Invite[]> {
    try {
      const { data, error } = await supabase
        .from('admin_invites')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to fetch invites: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch invites: ${errorMessage}`);
    }
  },

  async createInvite(inviteData: Partial<Invite>): Promise<Invite> {
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

  // Statistics Functions - Optimized with single query
  async getAdminStats(): Promise<any> {
    try {
      // Use a single optimized query with aggregations
      const { data: statsData, error } = await supabase
        .from(TABLES.USER_PROFILES)
        .select(`
          id,
          is_active,
          created_at
        `);

      if (error) throw error;

      // Calculate stats from the single query result
      const totalUsers = statsData?.length || 0;
      const activeUsers = statsData?.filter(user => user.is_active).length || 0;

      // Get scenario and guest submission counts in parallel
      const [scenariosResult, guestSubmissionsResult, scenarioValues] = await Promise.all([
        supabase.from(TABLES.SIMULATOR_SUBMISSIONS).select('id', { count: 'exact' }),
        supabase.from(TABLES.GUEST_SCENARIOS).select('id', { count: 'exact' }),
        supabase.from(TABLES.SIMULATOR_SUBMISSIONS).select('cost_summary').not('cost_summary', 'is', null)
      ]);

      const totalScenarios = scenariosResult.count || 0;
      const totalGuestSubmissions = guestSubmissionsResult.count || 0;
      
      const scenarioPrices = scenarioValues.data || [];
      const totalRevenue = scenarioPrices.reduce((sum, s) => {
        const costSummary = s.cost_summary;
        if (costSummary && typeof costSummary === 'object' && 'totalProjectCost' in costSummary) {
          return sum + (costSummary.totalProjectCost || 0);
        }
        return sum;
      }, 0);
      const averageScenarioValue = scenarioPrices.length 
        ? totalRevenue / scenarioPrices.length 
        : 0;

      return {
        totalUsers,
        totalScenarios,
        totalGuestSubmissions,
        totalRevenue,
        activeUsers,
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
    
    const { data, error } = await supabase
      .from('config_pricing_units')
      .select('*')
      .is('deleted_at', null)
      .order('display_order');
    
    if (error) {
      console.error('❌ Error loading pricing units:', error);
      throw error;
    }
    
    return data || [];
  },

  async savePricingUnit(unit: any) {
    
    // Validate required fields
    if (!unit.name || !unit.value) {
      throw new Error('Name and value are required for pricing units');
    }
    
    // Check for duplicate value only if it's not empty
    if (unit.value.trim() !== '') {
      const { data: existingUnits } = await supabase
        .from('config_pricing_units')
        .select('id, value')
        .eq('value', unit.value)
        .neq('id', unit.id || '');
      
      if (existingUnits && existingUnits.length > 0) {
        throw new Error(`A pricing unit with value "${unit.value}" already exists`);
      }
    }
    
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
      console.error('❌ Error saving pricing unit:', error);
      throw error;
    }
    
    return data;
  },

  async deletePricingUnit(unitId: string) {
    
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
    

  },

  async togglePricingUnitActive(unitId: string, isActive: boolean) {

    
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
    

  },

  // ============================================
  // Config Pricing Types API
  // ============================================

  async loadPricingTypes() {
    
    const { data, error } = await supabase
      .from('config_pricing_types')
      .select('*')
      .is('deleted_at', null)
      .order('display_order');
    
    if (error) {
      console.error('❌ Error loading pricing types:', error);
      throw error;
    }
    
    return data || [];
  },

  async savePricingType(type: any) {

    
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
    

    return data;
  },

  async deletePricingType(typeId: string) {

    
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
    

  },

  async togglePricingTypeActive(typeId: string, isActive: boolean) {

    
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
    

  },

  // ============================================
  // Config Pricing Cycles API
  // ============================================

  async loadPricingCycles() {
    
    const { data, error } = await supabase
      .from('config_pricing_cycles')
      .select('*')
      .is('deleted_at', null)
      .order('display_order');
    
    if (error) {
      console.error('❌ Error loading pricing cycles:', error);
      throw error;
    }
    
    return data || [];
  },

  async savePricingCycle(cycle: any) {

    
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
    

    return data;
  },

  async deletePricingCycle(cycleId: string) {

    
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
    

  },

  async togglePricingCycleActive(cycleId: string, isActive: boolean) {

    
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
    

  },

  // ============================================
  // Config Pricing Templates API
  // ============================================

  async loadPricingTemplates() {

    
    const { data, error } = await supabase
      .from('config_pricing_templates')
      .select('*')
      .is('deleted_at', null)
      .order('display_order');
    
    if (error) {
      // // // console.error('❌ Error loading pricing templates:', error);
      throw error;
    }
    

    return data || [];
  },

  async savePricingTemplate(template: any) {

    
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
    

    return data;
  },

  async deletePricingTemplate(templateId: string) {

    
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
    

  },

  async togglePricingTemplateActive(templateId: string, isActive: boolean) {

    
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
    

  },

};