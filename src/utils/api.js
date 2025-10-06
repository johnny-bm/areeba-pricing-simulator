// Simplified API - loads data directly from database without transformations
// Maps to the schema defined in /config/database.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}
const API_BASE_URL = `${supabaseUrl}/functions/v1/make-server-228aa219`;
const getHeaders = () => ({
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
});
const createApiRequest = async (url, options = {}, timeoutMs = 30000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeoutMs);
    // Add cache-busting parameter for GET requests
    let finalUrl = url;
    if (!options.method || options.method === 'GET') {
        const separator = url.includes('?') ? '&' : '?';
        finalUrl = `${url}${separator}_t=${Date.now()}`;
    }
    try {
        const response = await fetch(finalUrl, {
            ...options,
            signal: controller.signal,
            headers: getHeaders(),
        });
        clearTimeout(timeoutId);
        return response;
    }
    catch (error) {
        clearTimeout(timeoutId);
        // Provide better error messages for common issues
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeoutMs}ms - server may be slow or unreachable`);
        }
        if (error.message && error.message.includes('Failed to fetch')) {
            throw new Error('Failed to connect to server - check your network connection');
        }
        throw error;
    }
};
export const api = {
    // Health check with retry logic
    async healthCheck(retries = 2) {
        for (let i = 0; i <= retries; i++) {
            try {
                // Increased timeout to 15 seconds on first attempt to handle Edge Function cold starts
                const timeoutMs = i === 0 ? 15000 : 10000;
                const response = await createApiRequest(`${API_BASE_URL}/health`, { method: 'GET' }, timeoutMs);
                if (response.ok) {
                    console.log(`✅ Health check passed on attempt ${i + 1}`);
                    return true;
                }
            }
            catch (error) {
                console.warn(`Health check attempt ${i + 1}/${retries + 1} failed:`, error.message);
                // If this is the last retry, log the full error
                if (i === retries) {
                    console.error('Health check failed after all retries:', error);
                    return false;
                }
                // Wait a bit before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 3000)));
            }
        }
        return false;
    },
    // Ping check (simple connectivity test)
    async ping() {
        try {
            // Increased timeout to 10 seconds to handle Edge Function cold starts
            const response = await createApiRequest(`${API_BASE_URL}/ping`, { method: 'GET' }, 10000);
            return response.ok;
        }
        catch (error) {
            console.error('Ping check failed:', error.message || error);
            return false;
        }
    },
    // Load services
    async loadPricingItems() {
        try {
            console.log('📡 Loading services from database...');
            const response = await createApiRequest(`${API_BASE_URL}/services`);
            if (!response.ok) {
                throw new Error(`Failed to load services: ${response.status}`);
            }
            const data = await response.json();
            const services = data.items || [];
            console.log(`✅ Loaded ${services.length} services`);
            return services;
        }
        catch (error) {
            console.error('❌ Failed to load services:', error);
            throw error;
        }
    },
    // Get pricing items (alias for loadPricingItems)
    async getPricingItems() {
        return this.loadPricingItems();
    },
    // Save services
    async savePricingItems(items) {
        try {
            console.log(`📡 Saving ${items.length} services...`);
            const response = await createApiRequest(`${API_BASE_URL}/services`, {
                method: 'POST',
                body: JSON.stringify({ items }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to save services: ${response.status}`);
            }
            console.log('✅ Services saved successfully');
        }
        catch (error) {
            console.error('❌ Failed to save services:', error);
            throw error;
        }
    },
    // Load categories
    async loadCategories() {
        try {
            console.log('📡 Loading categories from database...');
            const response = await createApiRequest(`${API_BASE_URL}/categories`);
            if (!response.ok) {
                throw new Error(`Failed to load categories: ${response.status}`);
            }
            const data = await response.json();
            const categories = data.categories || [];
            console.log(`✅ Loaded ${categories.length} categories`);
            return categories;
        }
        catch (error) {
            console.error('❌ Failed to load categories:', error);
            throw error;
        }
    },
    // Save categories
    async saveCategories(categories) {
        try {
            console.log(`📡 Saving ${categories.length} categories...`);
            const response = await createApiRequest(`${API_BASE_URL}/categories`, {
                method: 'POST',
                body: JSON.stringify({ categories }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to save categories: ${response.status}`);
            }
            console.log('✅ Categories saved successfully');
        }
        catch (error) {
            console.error('❌ Failed to save categories:', error);
            throw error;
        }
    },
    // Load tags
    async loadTags() {
        try {
            console.log('📡 Loading tags from database...');
            const response = await createApiRequest(`${API_BASE_URL}/tags`);
            if (!response.ok) {
                throw new Error(`Failed to load tags: ${response.status}`);
            }
            const data = await response.json();
            const tags = data.tags || [];
            console.log(`✅ Loaded ${tags.length} tags`);
            return tags;
        }
        catch (error) {
            console.error('❌ Failed to load tags:', error);
            throw error;
        }
    },
    // Save tags
    async saveTags(tags) {
        try {
            console.log(`📡 Saving ${tags.length} tags...`);
            const response = await createApiRequest(`${API_BASE_URL}/tags`, {
                method: 'POST',
                body: JSON.stringify({ tags }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to save tags: ${response.status}`);
            }
            console.log('✅ Tags saved successfully');
        }
        catch (error) {
            console.error('❌ Failed to save tags:', error);
            throw error;
        }
    },
    // Load configurations
    async loadConfigurations() {
        try {
            console.log('📡 Loading configurations from database...');
            const response = await createApiRequest(`${API_BASE_URL}/configurations`);
            if (!response.ok) {
                throw new Error(`Failed to load configurations: ${response.status}`);
            }
            const data = await response.json();
            const configurations = data.configurations || [];
            console.log(`✅ Loaded ${configurations.length} configurations`);
            return configurations;
        }
        catch (error) {
            console.error('❌ Failed to load configurations:', error);
            throw error;
        }
    },
    // Save configurations
    async saveConfigurations(configurations) {
        try {
            console.log(`📡 Saving ${configurations.length} configurations...`);
            const response = await createApiRequest(`${API_BASE_URL}/configurations`, {
                method: 'POST',
                body: JSON.stringify({ configurations }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to save configurations: ${response.status}`);
            }
            console.log('✅ Configurations saved successfully');
        }
        catch (error) {
            console.error('❌ Failed to save configurations:', error);
            throw error;
        }
    },
    // Save scenario data
    async saveScenarioData(data) {
        try {
            console.log('📡 Saving scenario data...');
            const response = await createApiRequest(`${API_BASE_URL}/scenarios`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to save scenario: ${response.status}`);
            }
            console.log('✅ Scenario saved successfully');
        }
        catch (error) {
            console.error('❌ Failed to save scenario:', error);
            throw error;
        }
    },
    // Save guest scenario data
    async saveGuestScenario(data) {
        try {
            console.log('📡 Saving guest scenario data...');
            const response = await createApiRequest(`${API_BASE_URL}/guest-scenarios`, {
                method: 'POST',
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to save guest scenario: ${response.status}`);
            }
            const result = await response.json();
            console.log('✅ Guest scenario saved successfully');
            return result;
        }
        catch (error) {
            console.error('❌ Failed to save guest scenario:', error);
            throw error;
        }
    },
    // Load scenarios
    async loadScenarios() {
        try {
            console.log('📡 Loading scenarios from database...');
            const response = await createApiRequest(`${API_BASE_URL}/scenarios`);
            if (!response.ok) {
                throw new Error(`Failed to load scenarios: ${response.status}`);
            }
            const data = await response.json();
            const scenarios = data.scenarios || [];
            console.log(`✅ Loaded ${scenarios.length} scenarios`);
            return scenarios;
        }
        catch (error) {
            console.error('❌ Failed to load scenarios:', error);
            throw error;
        }
    },
    // Get scenario data by ID
    async getScenarioData(scenarioId) {
        try {
            console.log(`📡 Loading scenario data for ID: ${scenarioId}`);
            const response = await createApiRequest(`${API_BASE_URL}/scenarios/${scenarioId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Scenario not found: ${scenarioId}`);
                    return null;
                }
                throw new Error(`Failed to load scenario: ${response.status}`);
            }
            const data = await response.json();
            console.log(`✅ Loaded scenario data for ${scenarioId}`);
            return data.scenario || null;
        }
        catch (error) {
            console.error(`❌ Failed to load scenario ${scenarioId}:`, error);
            throw error;
        }
    },
    // Load guest submissions
    async loadGuestSubmissions() {
        try {
            console.log('📡 Loading guest submissions from database...');
            const response = await createApiRequest(`${API_BASE_URL}/guest-submissions`);
            if (!response.ok) {
                throw new Error(`Failed to load guest submissions: ${response.status}`);
            }
            const data = await response.json();
            const submissions = data.submissions || [];
            console.log(`✅ Loaded ${submissions.length} guest submissions`);
            return submissions;
        }
        catch (error) {
            console.error('❌ Failed to load guest submissions:', error);
            throw error;
        }
    },
    // Get guest scenario data by ID
    async getGuestScenarioData(submissionId) {
        try {
            console.log(`📡 Loading guest scenario data for ID: ${submissionId}`);
            const response = await createApiRequest(`${API_BASE_URL}/guest-submissions/${submissionId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Guest scenario not found: ${submissionId}`);
                    return null;
                }
                throw new Error(`Failed to load guest scenario: ${response.status}`);
            }
            const data = await response.json();
            console.log(`✅ Loaded guest scenario data for ${submissionId}`);
            return data.submission || null;
        }
        catch (error) {
            console.error(`❌ Failed to load guest scenario ${submissionId}:`, error);
            throw error;
        }
    },
    // Delete scenario
    async deleteScenario(scenarioId) {
        try {
            console.log(`📡 Deleting scenario ${scenarioId}...`);
            const response = await createApiRequest(`${API_BASE_URL}/scenarios/${scenarioId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to delete scenario: ${response.status}`);
            }
            console.log('✅ Scenario deleted successfully');
        }
        catch (error) {
            console.error('❌ Failed to delete scenario:', error);
            throw error;
        }
    },
    // Session data persistence for multi-user support
    async saveSessionData(sessionId, key, value) {
        try {
            const fullKey = `${sessionId}_${key}`;
            const response = await createApiRequest(`${API_BASE_URL}/saveSessionData`, {
                method: 'POST',
                body: JSON.stringify({ key: fullKey, data: value }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to save session data: ${response.status}`);
            }
        }
        catch (error) {
            console.error(`❌ Failed to save session data for ${key}:`, error);
            throw error;
        }
    },
    async loadSessionData(sessionId, key, fallback) {
        try {
            const fullKey = `${sessionId}_${key}`;
            const response = await createApiRequest(`${API_BASE_URL}/loadSessionData?key=${encodeURIComponent(fullKey)}`);
            if (!response.ok) {
                return fallback;
            }
            const result = await response.json();
            return result.data !== null && result.data !== undefined ? result.data : fallback;
        }
        catch (error) {
            console.warn(`Failed to load session data for ${key}:`, error);
            return fallback;
        }
    },
    async deleteSessionData(sessionId, key) {
        try {
            const fullKey = `${sessionId}_${key}`;
            const response = await createApiRequest(`${API_BASE_URL}/deleteSessionData`, {
                method: 'POST',
                body: JSON.stringify({ key: fullKey }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to delete session data: ${response.status}`);
            }
        }
        catch (error) {
            console.error(`❌ Failed to delete session data for ${key}:`, error);
            throw error;
        }
    },
    async clearSessionData(sessionId) {
        try {
            // This would require a backend endpoint to clear all keys for a session
            // For now, we'll just skip it or implement individual key deletion
            console.warn('clearSessionData: Not fully implemented');
        }
        catch (error) {
            console.error('Failed to clear session data:', error);
        }
    },
    // Save configuration (single) - works by loading all, updating one, and saving all
    async saveConfiguration(config) {
        try {
            // Load all configurations
            const allConfigs = await this.loadConfigurations();
            // Find and update or add the configuration
            const existingIndex = allConfigs.findIndex(c => c.id === config.id);
            if (existingIndex >= 0) {
                allConfigs[existingIndex] = config;
            }
            else {
                allConfigs.push(config);
            }
            // Save all configurations
            await this.saveConfigurations(allConfigs);
        }
        catch (error) {
            console.error('Failed to save configuration:', error);
            throw error;
        }
    },
    // Delete configuration - works by loading all, removing one, and saving all
    async deleteConfiguration(configId) {
        try {
            // Load all configurations
            const allConfigs = await this.loadConfigurations();
            // Filter out the configuration to delete
            const filteredConfigs = allConfigs.filter(c => c.id !== configId);
            // Save remaining configurations
            await this.saveConfigurations(filteredConfigs);
        }
        catch (error) {
            console.error('Failed to delete configuration:', error);
            throw error;
        }
    },
    // Get categories (alias for loadCategories)
    async getCategories() {
        return this.loadCategories();
    },
    // Get configurations (alias for loadConfigurations)
    async getConfigurations() {
        return this.loadConfigurations();
    },
    // Create pricing item
    async createPricingItem(item) {
        try {
            console.log('📡 Creating pricing item...');
            const response = await createApiRequest(`${API_BASE_URL}/services`, {
                method: 'POST',
                body: JSON.stringify(item),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to create pricing item: ${response.status}`);
            }
            const data = await response.json();
            console.log('✅ Pricing item created successfully');
            return data;
        }
        catch (error) {
            console.error('❌ Failed to create pricing item:', error);
            throw error;
        }
    },
    // Update pricing item
    async updatePricingItem(id, updates) {
        try {
            console.log(`📡 Updating pricing item ${id}...`);
            const response = await createApiRequest(`${API_BASE_URL}/services/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update pricing item: ${response.status}`);
            }
            const data = await response.json();
            console.log('✅ Pricing item updated successfully');
            return data;
        }
        catch (error) {
            console.error('❌ Failed to update pricing item:', error);
            throw error;
        }
    },
    // Delete pricing item
    async deletePricingItem(id) {
        try {
            console.log(`📡 Deleting pricing item ${id}...`);
            const response = await createApiRequest(`${API_BASE_URL}/services/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to delete pricing item: ${response.status}`);
            }
            console.log('✅ Pricing item deleted successfully');
        }
        catch (error) {
            console.error('❌ Failed to delete pricing item:', error);
            throw error;
        }
    },
    // Create category
    async createCategory(category) {
        try {
            console.log('📡 Creating category...');
            const response = await createApiRequest(`${API_BASE_URL}/categories`, {
                method: 'POST',
                body: JSON.stringify(category),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to create category: ${response.status}`);
            }
            const data = await response.json();
            console.log('✅ Category created successfully');
            return data;
        }
        catch (error) {
            console.error('❌ Failed to create category:', error);
            throw error;
        }
    },
    // Update category
    async updateCategory(id, updates) {
        try {
            console.log(`📡 Updating category ${id}...`);
            const response = await createApiRequest(`${API_BASE_URL}/categories/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update category: ${response.status}`);
            }
            const data = await response.json();
            console.log('✅ Category updated successfully');
            return data;
        }
        catch (error) {
            console.error('❌ Failed to update category:', error);
            throw error;
        }
    },
    // Delete category
    async deleteCategory(id) {
        try {
            console.log(`📡 Deleting category ${id}...`);
            const response = await createApiRequest(`${API_BASE_URL}/categories/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to delete category: ${response.status}`);
            }
            console.log('✅ Category deleted successfully');
        }
        catch (error) {
            console.error('❌ Failed to delete category:', error);
            throw error;
        }
    },
    // Get tags
    async getTags() {
        try {
            console.log('📡 Loading tags from database...');
            const response = await createApiRequest(`${API_BASE_URL}/tags`);
            if (!response.ok) {
                throw new Error(`Failed to load tags: ${response.status}`);
            }
            const data = await response.json();
            const tags = data.tags || [];
            console.log(`✅ Loaded ${tags.length} tags`);
            return tags;
        }
        catch (error) {
            console.error('❌ Failed to load tags:', error);
            throw error;
        }
    },
    // Create tag
    async createTag(tag) {
        try {
            console.log('📡 Creating tag...');
            const response = await createApiRequest(`${API_BASE_URL}/tags`, {
                method: 'POST',
                body: JSON.stringify(tag),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to create tag: ${response.status}`);
            }
            const data = await response.json();
            console.log('✅ Tag created successfully');
            return data;
        }
        catch (error) {
            console.error('❌ Failed to create tag:', error);
            throw error;
        }
    },
    // Update tag
    async updateTag(id, updates) {
        try {
            console.log(`📡 Updating tag ${id}...`);
            const response = await createApiRequest(`${API_BASE_URL}/tags/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update tag: ${response.status}`);
            }
            const data = await response.json();
            console.log('✅ Tag updated successfully');
            return data;
        }
        catch (error) {
            console.error('❌ Failed to update tag:', error);
            throw error;
        }
    },
    // Delete tag
    async deleteTag(id) {
        try {
            console.log(`📡 Deleting tag ${id}...`);
            const response = await createApiRequest(`${API_BASE_URL}/tags/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to delete tag: ${response.status}`);
            }
            console.log('✅ Tag deleted successfully');
        }
        catch (error) {
            console.error('❌ Failed to delete tag:', error);
            throw error;
        }
    }
};
