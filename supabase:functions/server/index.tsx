import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { rateLimiter } from 'npm:hono-rate-limiter'; // Removed version to let Deno resolve
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

// Note: Database constants are defined in the frontend but we'll replicate the essential ones here
// to maintain server independence while ensuring consistency
const DB_TABLES = {
  SERVICES: 'services',
  CATEGORIES: 'categories',
  CONFIGURATIONS: 'configurations',
  KV_STORE: 'kv_store'
} as const;

const DB_COLUMNS = {
  SERVICES: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    CATEGORY: 'category',
    UNIT: 'unit',
    DEFAULT_PRICE: 'default_price',
    PRICING_TYPE: 'pricing_type',
    TIERED_PRICING: 'tiered_pricing',
    IS_ACTIVE: 'is_active',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
    // Note: TAGS are stored in service_tags junction table
    // Note: AUTO_ADD_TRIGGER_FIELDS and QUANTITY_SOURCE_FIELDS are managed by application state
  },
  CATEGORIES: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    COLOR: 'color',
    ORDER_INDEX: 'order_index',
    IS_ACTIVE: 'is_active',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  CONFIGURATIONS: {
    ID: 'id',
    NAME: 'name',
    DESCRIPTION: 'description',
    FIELDS: 'fields',
    IS_ACTIVE: 'is_active',
    SORT_ORDER: 'sort_order',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  }
} as const;

const app = new Hono();

// CORS middleware - OPEN FOR DEVELOPMENT (will be secured before production)
// TODO: Before production deployment, implement environment-aware CORS with allowlist
app.use('*', cors({
  origin: '*',
  credentials: true,
}));

// ===== RATE LIMITING CONFIGURATION =====

// Helper function to extract IP address from headers
const getRealIP = (c: any): string => {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 
         c.req.header('x-real-ip') || 
         c.req.header('cf-connecting-ip') || 
         'unknown';
};

// Rate limiter for guest submissions - 5 per hour per IP
const guestRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  standardHeaders: true,
  keyGenerator: (c) => {
    const ip = getRealIP(c);
    return `guest:${ip}`;
  },
  handler: (c) => {
    const ip = getRealIP(c);
    // console.log(`⏱️ Rate limit exceeded for guest submission from IP: ${ip}`);
    return c.json({ 
      error: 'Too many requests. Please try again later.',
      retryAfter: '1 hour',
      limit: 5,
      window: '1 hour'
    }, 429);
  },
});

// Rate limiter for authenticated endpoints - 100 per hour per user
const userRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 100,
  standardHeaders: true,
  keyGenerator: (c) => {
    // Try to get user ID from context (set by auth middleware)
    const user = c.get('user');
    if (user?.id) {
      return `user:${user.id}`;
    }
    // Fallback to IP if no user context
    const ip = getRealIP(c);
    return `user-fallback:${ip}`;
  },
  handler: (c) => {
    const user = c.get('user');
    const identifier = user?.id || getRealIP(c);
    // console.log(`⏱️ Rate limit exceeded for user: ${identifier}`);
    return c.json({ 
      error: 'Rate limit exceeded. Please slow down.',
      retryAfter: '1 hour',
      limit: 100,
      window: '1 hour'
    }, 429);
  },
});

// Rate limiter for general API - 200 per hour per IP
const generalRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 200,
  standardHeaders: true,
  keyGenerator: (c) => {
    const ip = getRealIP(c);
    return `general:${ip}`;
  },
  handler: (c) => {
    const ip = getRealIP(c);
    // console.log(`⏱️ General rate limit exceeded from IP: ${ip}`);
    return c.json({ 
      error: 'Too many requests from your IP address.',
      retryAfter: '1 hour',
      limit: 200,
      window: '1 hour'
    }, 429);
  },
});

// Apply general rate limiting to all routes except health/ping checks
app.use('/make-server-228aa219/*', async (c, next) => {
  const path = c.req.path;
  
  // Skip rate limiting for health and ping endpoints
  if (path.endsWith('/health') || 
      path.endsWith('/ping') || 
      path.endsWith('/check-setup') ||
      path === '/make-server-228aa219' || 
      path === '/make-server-228aa219/') {
    return next();
  }
  
  // Apply general rate limiter
  return generalRateLimiter(c, next);
});

// Disable caching globally to prevent stale data
app.use('*', async (c, next) => {
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');
  await next();
});

// Ensure all responses have correct JSON content-type
app.use('*', async (c, next) => {
  await next();
  if (!c.res.headers.get('Content-Type')) {
    c.header('Content-Type', 'application/json');
  }
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Audit logging helper removed - using existing function at line 2442

// Database operation wrapper with timeout
async function withTimeout<T>(operation: Promise<T>, timeoutMs: number = 20000): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Database timeout')), timeoutMs);
  });
  return Promise.race([operation, timeoutPromise]);
}

// ===== INPUT SANITIZATION =====

// Sanitize HTML to prevent XSS attacks
const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
};

// Sanitize object recursively
const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
};

// Email validation
const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

// Phone validation (basic - allows international format)
const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  // Allow digits, spaces, +, -, (, )
  return /^[\d\s\+\-\(\)]+$/.test(phone) && phone.length <= 20;
};

// Sanitize and validate input with length limits
const sanitizeString = (input: any, maxLength: number = 500): string => {
  if (!input) return '';
  const sanitized = sanitizeHtml(String(input));
  return sanitized.substring(0, maxLength);
};



// Root route for debugging
app.all('/make-server-228aa219', async (c) => {
  const method = c.req.method;
  const url = c.req.url;
  // console.log('🔧 Server: Root route hit - method:', method, 'url:', url);
  
  let body = null;
  if (method === 'POST' || method === 'PUT') {
    try {
      body = await c.req.json();
      // console.log('🔧 Server: Root route body:', body);
    } catch (e) {
      // console.log('🔧 Server: Could not parse body:', e.message);
    }
  }
  
  c.header('Content-Type', 'application/json');
  return c.json({
    error: 'No specific endpoint specified - requests should include full path',
    requestDetails: {
      method,
      url,
      body,
      timestamp: new Date().toISOString()
    },
    availableEndpoints: [
      'GET /make-server-228aa219/ping',
      'GET /make-server-228aa219/services-count',
      'GET /make-server-228aa219/schema-status',
      'GET /make-server-228aa219/services-overview',
      'GET /make-server-228aa219/services',
      'POST /make-server-228aa219/services',
      'GET /make-server-228aa219/categories',
      'POST /make-server-228aa219/categories',
      'GET /make-server-228aa219/scenarios',
      'POST /make-server-228aa219/scenarios',
      'GET /make-server-228aa219/scenarios/:id',
      'GET /make-server-228aa219/scenario/history',
      'POST /make-server-228aa219/saveSessionData', 
      'POST /make-server-228aa219/deleteSessionData',
      'GET /make-server-228aa219/loadSessionData',
      'POST /make-server-228aa219/auth/check-setup',
      'POST /make-server-228aa219/auth/login',
      'POST /make-server-228aa219/auth/test',
      'GET /make-server-228aa219/auth/users',
      'POST /make-server-228aa219/auth/users',
      'PUT /make-server-228aa219/auth/users/:id',
      'DELETE /make-server-228aa219/auth/users/:id',
      'POST /make-server-228aa219/auth/users/:id/reset-password',
      'ALL /make-server-228aa219/debug'
    ],
    hint: 'This suggests the client is not including the full endpoint path in requests'
  }, 400);
});

// Ping endpoint - Ultra lightweight, returns immediately
app.get('/make-server-228aa219/ping', (c) => {
  // console.log('🏓 Ping received from:', getRealIP(c));
  c.header('Content-Type', 'application/json');
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
  c.header('Pragma', 'no-cache');
  return c.json({ pong: true, ts: Date.now() });
});

// Debug services count endpoint
app.get('/make-server-228aa219/services-count', async (c) => {
  try {
    // console.log('🔍 Server: Checking services count...');
    
    const { count: servicesCount, error: servicesError } = await withTimeout(
      supabase.from(DB_TABLES.SERVICES).select('*', { count: 'exact', head: true }),
      10000
    );
    
    const { count: categoriesCount, error: categoriesError } = await withTimeout(
      supabase.from(DB_TABLES.CATEGORIES).select('*', { count: 'exact', head: true }),
      10000
    );
    
    // Also try to get a sample service
    const { data: sampleServices, error: sampleError } = await withTimeout(
      supabase.from(DB_TABLES.SERVICES).select(`${DB_COLUMNS.SERVICES.ID}, ${DB_COLUMNS.SERVICES.NAME}, ${DB_COLUMNS.SERVICES.CATEGORY}, ${DB_COLUMNS.SERVICES.DEFAULT_PRICE}, ${DB_COLUMNS.SERVICES.CREATED_AT}`).limit(3),
      10000
    );
    
    const result = {
      timestamp: new Date().toISOString(),
      counts: {
        services: servicesCount || 0,
        categories: categoriesCount || 0
      },
      errors: {
        services: servicesError?.message || null,
        categories: categoriesError?.message || null,
        sample: sampleError?.message || null
      },
      sampleServices: sampleServices || [],
      database_accessible: !servicesError && !categoriesError
    };
    
    // console.log('🔍 Server: Services count result:', result);
    
    c.header('Content-Type', 'application/json');
    return c.json(result);
  } catch (error) {
    // console.error('❌ Server: Services count error:', error);
    c.header('Content-Type', 'application/json');
    return c.json({
      error: 'Failed to check services count',
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Database health check endpoint
app.get('/make-server-228aa219/health-check', async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    );

    const health = {
      kv_store: false,
      user_profiles: false,
      admin_users: false,
      auth_working: false,
      timestamp: new Date().toISOString()
    };

    // Test kv_store table
    try {
      const { data: kvData, error: kvError } = await supabase
        .from(DB_TABLES.KV_STORE)
        .select('count')
        .limit(1);
      health.kv_store = !kvError;
    } catch (e) {
      health.kv_store = false;
    }

    // Test user_profiles table
    try {
      const { data: userProfilesData, error: userProfilesError } = await supabase
        .from(DB_TABLES.USER_PROFILES)
        .select('count')
        .limit(1);
      health.user_profiles = !userProfilesError;
    } catch (e) {
      health.user_profiles = false;
    }

    // Test admin_users table
    try {
      const { data: adminUsersData, error: adminUsersError } = await supabase
        .from(DB_TABLES.ADMIN_USERS)
        .select('count')
        .limit(1);
      health.admin_users = !adminUsersError;
    } catch (e) {
      health.admin_users = false;
    }

    // Test auth functionality
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      health.auth_working = !authError;
    } catch (e) {
      health.auth_working = false;
    }

    const allHealthy = health.kv_store && health.user_profiles && health.admin_users && health.auth_working;

    c.header('Content-Type', 'application/json');
    return c.json({
      success: allHealthy,
      health,
      message: allHealthy ? 'All systems healthy' : 'Some systems need attention'
    });
  } catch (error) {
    // console.error('Health check failed:', error);
    c.header('Content-Type', 'application/json');
    return c.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});



// Debug endpoint to test server responsiveness
app.all('/make-server-228aa219/debug', async (c) => {
  const method = c.req.method;
  const url = c.req.url;
  const timestamp = new Date().toISOString();
  
  // console.log(`🔧 Server: Debug endpoint hit - ${method} ${url} at ${timestamp}`);
  
  try {
    let body = null;
    if (method === 'POST' || method === 'PUT') {
      try {
        body = await c.req.json();
      } catch {
        body = 'Could not parse JSON body';
      }
    }
    
    c.header('Content-Type', 'application/json');
    return c.json({
      success: true,
      debug: {
        method,
        url,
        timestamp,
        body,
        headers: Object.fromEntries(c.req.headers.entries()),
        server: 'alive and responsive'
      }
    });
  } catch (error) {
    // console.error('❌ Server: Debug endpoint error:', error);
    c.header('Content-Type', 'application/json');
    return c.json({
      error: 'Debug endpoint failed',
      details: error.message,
      timestamp
    }, 500);
  }
});

// Schema status debug endpoint - comprehensive database schema verification
app.get('/make-server-228aa219/schema-status', async (c) => {
  const timestamp = new Date().toISOString();
  // console.log(`🔍 Server: Schema status check initiated at ${timestamp}`);
  
  try {
    const schemaStatus = {
      timestamp,
      overall_status: 'checking',
      services_overview_view: { exists: false, error: null },
      normalized_tables: {
        services: { exists: false, has_required_columns: false, error: null },
        categories: { exists: false, has_required_columns: false, error: null },
        tags: { exists: false, has_required_columns: false, error: null },
        service_tags: { exists: false, has_required_columns: false, error: null },
        auto_add_rules: { exists: false, has_required_columns: false, error: null },
        quantity_rules: { exists: false, has_required_columns: false, error: null }
      },
      data_counts: {},
      sample_data: {},
      issues: [],
      recommendations: []
    };

    // Check services_overview view
    try {
      const { data: viewData, error: viewError } = await withTimeout(
        supabase.from(DB_TABLES.SERVICES_OVERVIEW).select('*').limit(1),
        10000
      );
      
      if (!viewError && viewData !== null) {
        schemaStatus.services_overview_view.exists = true;
        // console.log('✅ services_overview view exists and accessible');
        
        // Get sample data from view
        const { data: sampleViewData } = await withTimeout(
          supabase.from(DB_TABLES.SERVICES_OVERVIEW).select('*').limit(3),
          10000
        );
        
        if (sampleViewData && sampleViewData.length > 0) {
          schemaStatus.sample_data.services_overview = sampleViewData.map(item => ({
            id: item.id,
            name: item.name,
            category_name: item.category_name,
            tags_count: item.tags ? item.tags.length : 0,
            auto_add_fields_count: item.auto_add_trigger_fields ? item.auto_add_trigger_fields.length : 0,
            quantity_fields_count: item.quantity_source_fields ? item.quantity_source_fields.length : 0
          }));
        }
      } else {
        schemaStatus.services_overview_view.error = viewError?.message || 'View not found';
        schemaStatus.issues.push('services_overview view is missing - run create_services_overview_view.sql');
        // console.log('❌ services_overview view not found:', viewError?.message);
      }
    } catch (error) {
      schemaStatus.services_overview_view.error = error.message;
      schemaStatus.issues.push(`services_overview view check failed: ${error.message}`);
    }

    // Check each normalized table
    const tablesToCheck = [
      { name: DB_TABLES.SERVICES, required_columns: [DB_COLUMNS.SERVICES.ID, DB_COLUMNS.SERVICES.NAME, DB_COLUMNS.SERVICES.CATEGORY, DB_COLUMNS.SERVICES.DEFAULT_PRICE, DB_COLUMNS.SERVICES.PRICING_TYPE] },
      { name: DB_TABLES.CATEGORIES, required_columns: [DB_COLUMNS.CATEGORIES.ID, DB_COLUMNS.CATEGORIES.NAME, DB_COLUMNS.CATEGORIES.ORDER_INDEX] },
      { name: 'tags', required_columns: ['id', 'name', 'is_active'] },
      { name: 'service_tags', required_columns: ['service_id', 'tag_id'] },
      { name: 'auto_add_rules', required_columns: ['service_id', 'config_field_id', 'is_active'] },
      { name: 'quantity_rules', required_columns: ['service_id', 'config_field_id', 'multiplier', 'is_active'] }
    ];

    for (const table of tablesToCheck) {
      const tableStatus = schemaStatus.normalized_tables[table.name];
      
      try {
        // Try to query the table
        const { data, error } = await withTimeout(
          supabase.from(table.name).select('*').limit(1),
          8000
        );
        
        if (!error) {
          tableStatus.exists = true;
          
          // Get count
          const { count } = await withTimeout(
            supabase.from(table.name).select('*', { count: 'exact', head: true }),
            8000
          );
          schemaStatus.data_counts[table.name] = count || 0;
          
          // Check for required columns by trying to select them
          try {
            const { error: columnError } = await withTimeout(
              supabase.from(table.name).select(table.required_columns.join(', ')).limit(1),
              5000
            );
            
            tableStatus.has_required_columns = !columnError;
            if (columnError) {
              tableStatus.error = `Missing columns: ${columnError.message}`;
              schemaStatus.issues.push(`${table.name} table missing required columns`);
            }
          } catch (columnCheckError) {
            tableStatus.error = `Column check failed: ${columnCheckError.message}`;
          }
          
          // console.log(`✅ ${table.name} table exists with ${count || 0} records`);
        } else {
          tableStatus.error = error.message;
          schemaStatus.issues.push(`${table.name} table not accessible: ${error.message}`);
          // console.log(`❌ ${table.name} table error:`, error.message);
        }
      } catch (error) {
        tableStatus.error = error.message;
        schemaStatus.issues.push(`${table.name} table check failed: ${error.message}`);
      }
    }

    // Test the new services endpoint
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-228aa219/services-overview`, {
        headers: { 'Authorization': `Bearer ${supabaseServiceKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        schemaStatus.sample_data.services_endpoint = {
          source: data.source,
          services_count: data.services?.length || 0,
          sample_service: data.services?.[0] ? {
            id: data.services[0].id,
            name: data.services[0].name,
            has_tags: Array.isArray(data.services[0].tags),
            has_auto_add_fields: Array.isArray(data.services[0].auto_add_trigger_fields)
          } : null
        };
        // console.log('✅ services-overview endpoint working:', data.source);
      } else {
        schemaStatus.issues.push('services-overview endpoint not responding correctly');
      }
    } catch (endpointError) {
      schemaStatus.issues.push(`services-overview endpoint test failed: ${endpointError.message}`);
    }

    // Determine overall status
    const criticalIssues = schemaStatus.issues.filter(issue => 
      issue.includes('services_overview view is missing') ||
      issue.includes('services table') ||
      issue.includes('categories table')
    );

    if (criticalIssues.length === 0 && schemaStatus.services_overview_view.exists) {
      schemaStatus.overall_status = 'healthy';
      schemaStatus.recommendations.push('Schema is properly normalized and ready for use');
    } else if (schemaStatus.services_overview_view.exists) {
      schemaStatus.overall_status = 'partial';
      schemaStatus.recommendations.push('Core functionality available but some optional features may not work');
    } else {
      schemaStatus.overall_status = 'needs_migration';
      schemaStatus.recommendations.push('Run the create_services_overview_view.sql script in your Supabase SQL editor');
      
      if (!schemaStatus.normalized_tables.services.exists) {
        schemaStatus.recommendations.push('Core services table is missing - run full schema migration');
      }
    }

    // console.log(`🔍 Schema status check completed: ${schemaStatus.overall_status}`);
    // console.log(`Issues found: ${schemaStatus.issues.length}`);
    
    c.header('Content-Type', 'application/json');
    return c.json(schemaStatus);
    
  } catch (error) {
    // console.error('❌ Server: Schema status check failed:', error);
    c.header('Content-Type', 'application/json');
    return c.json({
      timestamp,
      overall_status: 'error',
      error: 'Schema status check failed',
      details: error.message,
      issues: ['Failed to perform comprehensive schema check'],
      recommendations: ['Check database connectivity and permissions']
    }, 500);
  }
});

// Health check - Always returns 200 immediately to confirm server is running
// Does NOT check database to avoid timeouts
app.get('/make-server-228aa219/health', (c) => {
  // console.log('💚 Health check received from:', getRealIP(c));
  c.header('Content-Type', 'application/json');
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate');
  c.header('Pragma', 'no-cache');
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    server: 'running',
    rateLimiting: 'active',
    guestSessionTracking: 'active'
  });
});

// Get services with all related data (auto_add_rules, quantity_rules, tags)
app.get('/make-server-228aa219/services', async (c) => {
  try {
    // console.log('📤 Server: Loading services with related data...');
    
    // Fetch services with all relations in a single query
    const { data: dbServices, error: dbError } = await withTimeout(
      supabase
        .from(DB_TABLES.SERVICES)
        .select(`
          *,
          auto_add_rules:auto_add_rules(id, config_field_id),
          quantity_rules:quantity_rules(id, config_field_id, multiplier),
          service_tags:service_tags(tag:tags(id, name))
        `)
        .order(DB_COLUMNS.SERVICES.CREATED_AT, { ascending: true }),
      20000
    );
    
    // console.log('📤 Server: Services query result:', {
      servicesCount: dbServices?.length || 0,
      hasError: !!dbError,
      errorMessage: dbError?.message || null,
      sampleService: dbServices?.[0] ? {
        id: dbServices[0].id,
        name: dbServices[0].name,
        category: dbServices[0].category,
        hasAutoAddRules: !!dbServices[0].auto_add_rules?.length,
        hasQuantityRules: !!dbServices[0].quantity_rules?.length,
        hasTags: !!dbServices[0].service_tags?.length
      } : null
    });
    
    if (dbError) {
      // console.error('❌ Server: Services query failed:', dbError.message);
      return c.json({ 
        items: [], 
        error: 'Database query failed',
        details: dbError.message 
      });
    }
    
    // Transform the services with their related data
    const transformedServices = (dbServices || []).map(service => {
      // Extract auto-add rules (config field IDs that trigger auto-add)
      const autoAddFields = (service.auto_add_rules || []).map(rule => rule.config_field_id);
      
      // Extract quantity source fields from quantity rules
      const quantityFields = (service.quantity_rules || []).map(rule => rule.config_field_id);
      
      // Extract tags from service_tags junction table
      const tags = (service.service_tags || [])
        .map(st => st.tag?.name)
        .filter(name => !!name);
      
      const transformed = {
        ...service,
        // Map snake_case back to camelCase for frontend compatibility
        defaultPrice: service.default_price || service.price || 0,
        pricingType: service.pricing_type || 'simple',
        // Set auto-add fields from database
        autoAddServices: autoAddFields,
        quantitySourceFields: quantityFields,
        // Also provide for snake_case versions
        auto_add_trigger_fields: autoAddFields,
        quantity_source_fields: quantityFields,
        // Map tiered_pricing from database to tiers for frontend
        tiers: service.tiered_pricing || service.tiers || null,
        // Add tags array
        tags: tags
      };

      // Legacy support: Parse configuration_based_quantity if it exists
      if (service.configuration_based_quantity) {
        try {
          const quantityConfig = typeof service.configuration_based_quantity === 'string' 
            ? JSON.parse(service.configuration_based_quantity)
            : service.configuration_based_quantity;
          
          if (quantityConfig && quantityConfig.fields) {
            transformed.autoQuantitySources = quantityConfig.fields;
            transformed.quantityMultiplier = quantityConfig.multiplier || 1;
            // Merge with normalized fields (prefer database rules)
            if (transformed.quantitySourceFields.length === 0) {
              transformed.quantitySourceFields = quantityConfig.fields;
            }
          }
        } catch (parseError) {
          // console.warn('Failed to parse configuration_based_quantity for service:', service.id, parseError);
        }
      }

      // Legacy support: Parse auto_add_related_services if it exists
      if (service.auto_add_related_services) {
        try {
          const autoAddConfig = typeof service.auto_add_related_services === 'string'
            ? JSON.parse(service.auto_add_related_services)
            : service.auto_add_related_services;
          
          if (Array.isArray(autoAddConfig)) {
            // Merge with normalized fields (prefer database rules)
            if (transformed.autoAddServices.length === 0) {
              transformed.autoAddServices = autoAddConfig;
            }
          }
        } catch (parseError) {
          // console.warn('Failed to parse auto_add_related_services for service:', service.id, parseError);
        }
      }

      // Legacy support: Parse tiered_pricing if it exists
      if (service.tiered_pricing && !transformed.tiers) {
        try {
          const tieredPricingConfig = typeof service.tiered_pricing === 'string'
            ? JSON.parse(service.tiered_pricing)
            : service.tiered_pricing;
          
          if (tieredPricingConfig && tieredPricingConfig.type) {
            transformed.pricingType = tieredPricingConfig.type;
            
            if (tieredPricingConfig.type === 'tiered' && Array.isArray(tieredPricingConfig.tiers)) {
              transformed.tiers = tieredPricingConfig.tiers;
            }
          }
        } catch (parseError) {
          // console.warn('Failed to parse tiered_pricing for service:', service.id, parseError);
        }
      }

      // Clean up database-specific fields and junction table data
      delete transformed.default_price;
      delete transformed.configuration_based_quantity;
      delete transformed.auto_add_related_services;
      delete transformed.tiered_pricing;
      delete transformed.pricing_type;
      delete transformed.auto_add_rules;  // Remove junction data
      delete transformed.quantity_rules;   // Remove junction data
      delete transformed.service_tags;     // Remove junction data

      return transformed;
    });
    
    // console.log(`✅ Server: Transformed ${transformedServices.length} services with related data`);
    return c.json({ items: transformedServices });
  } catch (error) {
    // console.error('❌ Server: Failed to load services:', error);
    return c.json({ 
      items: [], 
      error: 'Failed to load services',
      details: error.message 
    }, 500);
  }
});

// Get services from normalized services_overview view (NEW)
app.get('/make-server-228aa219/services-overview', async (c) => {
  try {
    // console.log('🚀 Server: Loading services from services_overview view...');
    // console.log('🔍 Server: Current timestamp:', new Date().toISOString());
    
    // First, try to query the services_overview view
    const { data: viewServices, error: viewError } = await withTimeout(
      supabase.from(DB_TABLES.SERVICES_OVERVIEW).select('*').order(DB_COLUMNS.SERVICES.NAME),
      20000
    );
    
    if (viewError) {
      // If view doesn't exist, create a fallback query that mimics the view structure
      // console.log('⚠️ services_overview view not found, creating fallback query...');
      
      const { data: services, error: serviceError } = await withTimeout(
        supabase
          .from(DB_TABLES.SERVICES)
          .select(`
            *,
            categories!inner(name)
          `)
          .order('created_at', { ascending: true }),
        20000
      );
      
      if (serviceError) {
        throw new Error(`Failed to load services for overview: ${serviceError.message}`);
      }
      
      // Transform the joined data with only existing database fields
      const transformedServices = (services || []).map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        category_name: service.categories?.name || 'Unknown',
        category_order: service.categories?.display_order || 999,
        unit: service.unit,
        default_price: service.default_price,
        pricing_type: service.pricing_type || 'simple',
        tiers: service.tiered_pricing || service.tiers || null,
        tags: [], // Tags will be loaded from service_tags junction table
        // Note: auto_add_trigger_fields and quantity_source_fields are managed in application state
        auto_add_trigger_fields: [], // Empty arrays - managed by application, not stored in DB
        quantity_source_fields: [],  // Empty arrays - managed by application, not stored in DB
        created_at: service.created_at
      }));
      
      // console.log('✅ Server: Successfully loaded services using fallback query:', {
        servicesCount: transformedServices.length,
        usedFallback: true
      });
      
      return c.json({
        services: transformedServices,
        source: 'fallback_query',
        message: 'services_overview view not available, used fallback'
      });
    }
    
    // console.log('✅ Server: Successfully loaded services from services_overview view:', {
      servicesCount: viewServices?.length || 0,
      usedView: true,
      sampleService: viewServices?.[0] ? {
        id: viewServices[0].id,
        name: viewServices[0].name,
        category_name: viewServices[0].category_name,
        tags: viewServices[0].tags,
        auto_add_trigger_fields: viewServices[0].auto_add_trigger_fields
      } : null
    });
    
    return c.json({
      services: viewServices || [],
      source: 'services_overview_view',
      message: 'Loaded from normalized services_overview view'
    });
    
  } catch (error) {
    // console.error('❌ Server: Failed to load services overview:', error);
    return c.json({
      services: [],
      error: 'Failed to load services overview',
      details: error.message,
      source: 'error'
    }, 500);
  }
});

// Removed ensureServiceColumnsExist function since we're using application-level auto-add functionality

// Save services (with input sanitization)
app.post('/make-server-228aa219/services', async (c) => {
  try {
    // console.log('💾 Server: Saving services...');
    const requestData = await c.req.json();
    const { items } = requestData;

    // console.log('💾 Server: Received service save request:', {
      itemsCount: Array.isArray(items) ? items.length : 'not array',
      hasItems: !!items,
      itemsType: typeof items,
      requestDataKeys: Object.keys(requestData || {}),
      sampleItems: Array.isArray(items) ? items.slice(0, 2).map(item => ({
        id: item?.id,
        name: item?.name,
        category: item?.category,
        defaultPrice: item?.defaultPrice,
        price: item?.price
      })) : null
    });

    if (!Array.isArray(items)) {
      // console.error('❌ Server: Invalid items format - must be array');
      return c.json({ error: 'Invalid input: items must be an array' }, 400);
    }

    // Sanitize all service items
    const sanitizedItems = items.map((item: any) => ({
      ...item,
      name: sanitizeString(item.name || '', 200),
      description: sanitizeString(item.description || '', 1000),
      unit: sanitizeString(item.unit || '', 50),
      category: item.category, // UUID, validated separately
      // Keep numeric/boolean fields as-is
      default_price: typeof item.default_price === 'number' ? item.default_price : 0,
      pricing_type: ['fixed', 'tiered'].includes(item.pricing_type) ? item.pricing_type : 'fixed',
      is_active: typeof item.is_active === 'boolean' ? item.is_active : true,
      // Sanitize nested objects
      tiered_pricing: item.tiered_pricing ? sanitizeObject(item.tiered_pricing) : null,
      quantity_source_fields: item.quantity_source_fields ? sanitizeObject(item.quantity_source_fields) : null,
      auto_add_trigger_fields: item.auto_add_trigger_fields ? sanitizeObject(item.auto_add_trigger_fields) : null,
    }));

    // console.log('🧹 Input sanitization completed for', sanitizedItems.length, 'services');

    if (sanitizedItems.length === 0) {
      // console.log('📋 Server: No items to save, clearing all services');
    } else {
      // console.log('📋 Server: Will save', sanitizedItems.length, 'service(s)');
    }

    // Delete existing services
    // console.log('🗑️ Server: Clearing existing services...');
    const { error: deleteError } = await withTimeout(
      supabase.from(DB_TABLES.SERVICES).delete().neq(DB_COLUMNS.SERVICES.ID, ''),
      15000
    );

    if (deleteError) {
      // console.error('❌ Server: Failed to clear existing services:', deleteError.message);
      return c.json({ error: 'Failed to clear existing services', details: deleteError.message }, 500);
    }
    // console.log('✅ Server: Existing services cleared successfully');

    // Insert new services if any
    if (sanitizedItems.length > 0) {
      // Validate categories before attempting insert
      // console.log('🔍 Server: Validating categories before insert...');
      const { data: existingCategories, error: catError } = await withTimeout(
        supabase.from(DB_TABLES.CATEGORIES).select(DB_COLUMNS.CATEGORIES.ID),
        10000
      );

      if (catError) {
        // console.error('❌ Server: Failed to load categories for validation:', catError.message);
        return c.json({ 
          error: 'Failed to validate categories', 
          details: catError.message 
        }, 500);
      }

      const validCategoryIds = new Set((existingCategories || []).map(cat => cat.id));
      // console.log('✅ Server: Found', validCategoryIds.size, 'valid categories:', Array.from(validCategoryIds));

      // Check for invalid categories
      const invalidServices = [];
      for (const item of sanitizedItems) {
        if (!item.category || item.category.trim() === '') {
          invalidServices.push({
            service: item.name || item.id,
            issue: 'missing category'
          });
        } else if (!validCategoryIds.has(item.category)) {
          invalidServices.push({
            service: item.name || item.id,
            issue: `category "${item.category}" does not exist in database`
          });
        }
      }

      if (invalidServices.length > 0) {
        // console.error('❌ Server: Invalid categories detected:', invalidServices);
        return c.json({ 
          error: 'Invalid categories detected', 
          details: `${invalidServices.length} service(s) have invalid categories`,
          invalidServices: invalidServices,
          validCategories: Array.from(validCategoryIds)
        }, 400);
      }

      // console.log('✅ Server: All service categories validated successfully');

      // Clean and map fields for basic database schema (core fields only)
      // NOTE: auto_add_trigger_fields and quantity_source_fields are stored in junction tables,
      // not as columns in the services table. We'll log them for debugging but won't save them.
      const cleanedItems = sanitizedItems.map(item => {
        const {
          // Remove fields that don't exist in the database schema
          defaultPrice,
          pricingType,
          tiers,
          tags, // Remove tags - they're stored in service_tags junction table
          autoAddServices, // Remove - stored in auto_add_rules table
          auto_add_trigger_fields, // Remove - stored in auto_add_rules table
          autoQuantitySources, // Remove - stored in quantity_rules table
          quantitySourceFields, // Remove - stored in quantity_rules table
          quantity_source_fields, // Remove - stored in quantity_rules table
          quantityMultiplier,
          ...cleanItem
        } = item;
        
        // Extract auto-add and quantity fields for logging purposes only
        const autoAddFields = item.auto_add_trigger_fields || 
                             item.autoAddServices || 
                             autoAddServices || 
                             [];
        const quantityFields = item.quantity_source_fields || 
                              item.quantitySourceFields || 
                              quantitySourceFields || 
                              [];
        
        // console.log(`📝 Server: Preparing service "${item.name}" for save:`, {
          autoAddFields: autoAddFields,
          quantityFields: quantityFields,
          hasAutoAdd: autoAddFields.length > 0,
          hasQuantity: quantityFields.length > 0,
          note: 'Auto-add and quantity fields are managed by application state, not stored in DB'
        });
        
        // Only keep core database fields that we know exist
        const mappedItem = {
          ...cleanItem,
          // Map defaultPrice to default_price for database compatibility
          default_price: defaultPrice !== undefined ? defaultPrice : (item.price || 0),
          // Map pricing type to snake_case
          pricing_type: item.pricing_type || pricingType || 'simple',
          // Save tiers to tiered_pricing column (database column name)
          tiered_pricing: tiers || null
        };

        // Remove any fields that might not exist in the database
        delete mappedItem.price; // Remove the old price field if it exists
        delete mappedItem.tags; // Ensure tags is removed (stored in junction table)
        delete mappedItem.pricingType; // Remove camelCase version
        delete mappedItem.defaultPrice; // Remove camelCase version
        
        return mappedItem;
      });

      // console.log('💾 Server: Inserting services with core fields only...', {
        itemsToInsert: cleanedItems.length,
        sampleItem: cleanedItems[0] ? {
          id: cleanedItems[0].id,
          name: cleanedItems[0].name,
          category: cleanedItems[0].category,
          default_price: cleanedItems[0].default_price
        } : null
      });

      const { data: insertedData, error: insertError } = await withTimeout(
        supabase.from(DB_TABLES.SERVICES).insert(cleanedItems).select(),
        20000
      );

      if (insertError) {
        // console.error('❌ Server: Service insertion failed:', insertError.message);
        // console.error('❌ Server: Failed items sample:', cleanedItems.slice(0, 2));
        
        // Enhanced fallback - try with even more minimal fields
        if (insertError.message.includes('column') || insertError.message.includes('schema cache')) {
          // console.log('🔄 Attempting minimal field save fallback...');
          
          const minimalItems = items.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            category: item.category,
            default_price: item.defaultPrice !== undefined ? item.defaultPrice : (item.price || 0),
            unit: item.unit || 'per item'
            // Note: tags are stored in the service_tags junction table, not directly in services
          }));

          const { error: fallbackError } = await withTimeout(
            supabase.from(DB_TABLES.SERVICES).insert(minimalItems),
            20000
          );

          if (fallbackError) {
            return c.json({ error: 'Failed to save services', details: fallbackError.message }, 500);
          }
          
          // console.log('✅ Server: Services saved successfully using minimal field fallback');
          return c.json({ 
            success: true, 
            message: 'Services saved successfully (auto-add functionality works via application state)' 
          });
        }
        
        return c.json({ error: 'Failed to save services', details: insertError.message }, 500);
      }
      
      // console.log('✅ Server: Services saved successfully');
      
      // Now save auto-add rules, quantity rules, and tags to junction tables
      // console.log('📋 Server: Saving auto-add rules, quantity rules, and tags...');
      
      for (const item of items) {
        const serviceId = item.id;
        
        // Save auto-add rules
        const autoAddFields = item.auto_add_trigger_fields || item.autoAddServices || [];
        if (autoAddFields.length > 0) {
          // Delete existing auto-add rules for this service
          await supabase
            .from('auto_add_rules')
            .delete()
            .eq('service_id', serviceId);
          
          // Insert new auto-add rules
          const autoAddRules = autoAddFields.map(configFieldId => ({
            service_id: serviceId,
            config_field_id: configFieldId,
            is_active: true
          }));
          
          const { error: autoAddError } = await supabase
            .from('auto_add_rules')
            .insert(autoAddRules);
          
          if (autoAddError) {
            // console.warn(`⚠️ Server: Failed to save auto-add rules for service ${serviceId}:`, autoAddError.message);
          } else {
            // console.log(`✅ Server: Saved ${autoAddRules.length} auto-add rules for service ${serviceId}`);
          }
        } else {
          // Delete auto-add rules if none specified
          await supabase
            .from('auto_add_rules')
            .delete()
            .eq('service_id', serviceId);
        }
        
        // Save quantity rules
        const quantityFields = item.quantity_source_fields || item.quantitySourceFields || [];
        if (quantityFields.length > 0) {
          // Delete existing quantity rules for this service
          await supabase
            .from('quantity_rules')
            .delete()
            .eq('service_id', serviceId);
          
          // Insert new quantity rules
          const quantityRules = quantityFields.map(configFieldId => ({
            service_id: serviceId,
            config_field_id: configFieldId,
            multiplier: item.quantityMultiplier || 1.0,
            is_active: true
          }));
          
          const { error: quantityError } = await supabase
            .from('quantity_rules')
            .insert(quantityRules);
          
          if (quantityError) {
            // console.warn(`⚠️ Server: Failed to save quantity rules for service ${serviceId}:`, quantityError.message);
          } else {
            // console.log(`✅ Server: Saved ${quantityRules.length} quantity rules for service ${serviceId}`);
          }
        } else {
          // Delete quantity rules if none specified
          await supabase
            .from('quantity_rules')
            .delete()
            .eq('service_id', serviceId);
        }
        
        // Save tags
        const tags = item.tags || [];
        if (tags.length > 0) {
          // First, ensure all tags exist in the tags table
          for (const tagName of tags) {
            // Check if tag exists
            const { data: existingTag } = await supabase
              .from('tags')
              .select('id')
              .eq('name', tagName)
              .single();
            
            if (!existingTag) {
              // Create tag if it doesn't exist
              await supabase
                .from('tags')
                .insert({
                  id: `tag-${tagName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                  name: tagName,
                  is_active: true,
                  usage_count: 0
                });
            }
          }
          
          // Delete existing service-tag associations
          await supabase
            .from('service_tags')
            .delete()
            .eq('service_id', serviceId);
          
          // Get tag IDs for all tags
          const { data: tagData } = await supabase
            .from('tags')
            .select('id, name')
            .in('name', tags);
          
          if (tagData && tagData.length > 0) {
            // Create new service-tag associations
            const serviceTags = tagData.map(tag => ({
              service_id: serviceId,
              tag_id: tag.id
            }));
            
            const { error: tagError } = await supabase
              .from('service_tags')
              .insert(serviceTags);
            
            if (tagError) {
              // console.warn(`⚠️ Server: Failed to save tags for service ${serviceId}:`, tagError.message);
            } else {
              // console.log(`✅ Server: Saved ${serviceTags.length} tags for service ${serviceId}`);
            }
          }
        } else {
          // Delete service-tag associations if no tags specified
          await supabase
            .from('service_tags')
            .delete()
            .eq('service_id', serviceId);
        }
      }
      
      // console.log('✅ Server: All junction table data saved successfully');
      // console.log('📊 Server: Verification - services with auto-add:', 
        cleanedItems.filter(item => item.auto_add_trigger_fields && item.auto_add_trigger_fields.length > 0).length
      );
      // console.log('📊 Server: Verification - services with quantity rules:', 
        cleanedItems.filter(item => item.quantity_source_fields && item.quantity_source_fields.length > 0).length
      );
    }

    // Auto-add and quantity rules are handled in application state, not in database
    // console.log('💡 Server: Auto-add functionality is handled by application state');
    // console.log('💡 Server: Services saved successfully - auto-add rules will be managed by the frontend');

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Server error while saving services', details: error.message }, 500);
  }
});

// Get categories
app.get('/make-server-228aa219/categories', async (c) => {
  try {
    const { data: categories, error } = await withTimeout(
      supabase.from(DB_TABLES.CATEGORIES).select('*').order(DB_COLUMNS.CATEGORIES.ORDER_INDEX, { ascending: true }),
      15000
    );

    if (error) {
      return c.json({ error: 'Failed to load categories', details: error.message }, 500);
    }

    return c.json({ categories: categories || [] });
  } catch (error) {
    return c.json({ error: 'Server error while loading categories', details: error.message }, 500);
  }
});

// Save categories
app.post('/make-server-228aa219/categories', async (c) => {
  try {
    const { categories } = await c.req.json();

    if (!Array.isArray(categories)) {
      return c.json({ error: 'Invalid input: categories must be an array' }, 400);
    }

    if (categories.length === 0) {
      // If no categories provided, try to safely delete all categories
      // First check if any services reference categories
      const { data: referencedCategories, error: refCheckError } = await withTimeout(
        supabase.from(DB_TABLES.SERVICES).select(DB_COLUMNS.SERVICES.CATEGORY).neq(DB_COLUMNS.SERVICES.CATEGORY, null),
        10000
      );

      if (refCheckError) {
        return c.json({ error: 'Failed to check category references', details: refCheckError.message }, 500);
      }

      if (referencedCategories && referencedCategories.length > 0) {
        return c.json({ 
          error: 'Cannot delete categories: some services still reference them', 
          details: 'Please update or delete the services first, or provide replacement categories' 
        }, 400);
      }

      // Safe to delete all categories
      const { error: deleteError } = await withTimeout(
        supabase.from(DB_TABLES.CATEGORIES).delete().neq(DB_COLUMNS.CATEGORIES.ID, ''),
        15000
      );

      if (deleteError) {
        return c.json({ error: 'Failed to clear existing categories', details: deleteError.message }, 500);
      }

      return c.json({ success: true });
    }

    // Get existing categories
    const { data: existingCategories, error: fetchError } = await withTimeout(
      supabase.from(DB_TABLES.CATEGORIES).select('*'),
      10000
    );

    if (fetchError) {
      return c.json({ error: 'Failed to fetch existing categories', details: fetchError.message }, 500);
    }

    const existingCategoryIds = new Set((existingCategories || []).map(cat => cat.id));
    const newCategoryIds = new Set(categories.map(cat => cat.id));

    // Categories to insert (new ones)
    const categoriesToInsert = categories.filter(cat => !existingCategoryIds.has(cat.id));
    
    // Categories to update (existing ones)
    const categoriesToUpdate = categories.filter(cat => existingCategoryIds.has(cat.id));
    
    // Categories to delete (no longer in the new list, but check for references first)
    const categoriesIdsToDelete = [...existingCategoryIds].filter(id => !newCategoryIds.has(id));

    // Handle deletions safely
    if (categoriesIdsToDelete.length > 0) {
      // Check which categories are still referenced by services
      const { data: referencedCategories, error: refCheckError } = await withTimeout(
        supabase.from(DB_TABLES.SERVICES).select(DB_COLUMNS.SERVICES.CATEGORY).in(DB_COLUMNS.SERVICES.CATEGORY, categoriesIdsToDelete),
        10000
      );

      if (refCheckError) {
        return c.json({ error: 'Failed to check category references', details: refCheckError.message }, 500);
      }

      if (referencedCategories && referencedCategories.length > 0) {
        const stillReferencedIds = [...new Set(referencedCategories.map(s => s.category))];
        const safeToDeleteIds = categoriesIdsToDelete.filter(id => !stillReferencedIds.includes(id));
        
        // Only delete categories that are not referenced
        if (safeToDeleteIds.length > 0) {
          const { error: deleteError } = await withTimeout(
            supabase.from(DB_TABLES.CATEGORIES).delete().in(DB_COLUMNS.CATEGORIES.ID, safeToDeleteIds),
            15000
          );

          if (deleteError) {
            return c.json({ error: 'Failed to delete unreferenced categories', details: deleteError.message }, 500);
          }
        }

        // Warn about categories that couldn't be deleted
        if (stillReferencedIds.length > 0) {
          // console.warn('Cannot delete categories still referenced by services:', stillReferencedIds);
        }
      } else {
        // Safe to delete all categories marked for deletion
        const { error: deleteError } = await withTimeout(
          supabase.from(DB_TABLES.CATEGORIES).delete().in(DB_COLUMNS.CATEGORIES.ID, categoriesIdsToDelete),
          15000
        );

        if (deleteError) {
          return c.json({ error: 'Failed to delete categories', details: deleteError.message }, 500);
        }
      }
    }

    // Insert new categories
    if (categoriesToInsert.length > 0) {
      const { error: insertError } = await withTimeout(
        supabase.from(DB_TABLES.CATEGORIES).insert(categoriesToInsert),
        15000
      );

      if (insertError) {
        return c.json({ error: 'Failed to insert new categories', details: insertError.message }, 500);
      }
    }

    // Update existing categories
    for (const category of categoriesToUpdate) {
      const { error: updateError } = await withTimeout(
        supabase.from(DB_TABLES.CATEGORIES).update(category).eq(DB_COLUMNS.CATEGORIES.ID, category.id),
        10000
      );

      if (updateError) {
        // console.warn('Failed to update category:', category.id, updateError.message);
        // Continue with other updates rather than failing completely
      }
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Server error while saving categories', details: error.message }, 500);
  }
});

// Get configurations - Updated to use dedicated configurations table
app.get('/make-server-228aa219/configurations', async (c) => {
  try {
    // Try the new configurations table first
    const { data: configData, error: configError } = await withTimeout(
      supabase
        .from(DB_TABLES.CONFIGURATIONS)
        .select('*')
        .order(DB_COLUMNS.CONFIGURATIONS.SORT_ORDER, { ascending: true })
        .order(DB_COLUMNS.CONFIGURATIONS.NAME, { ascending: true }),
      10000
    );

    if (!configError && configData) {
      // Convert database format to API format
      const configurations = configData.map(config => ({
        id: config.id,
        name: config.name,
        description: config.description,
        order: config.sort_order,
        isActive: config.is_active,
        fields: config.fields || [],
        createdAt: config.created_at,
        updatedAt: config.updated_at
      }));
      return c.json({ configurations });
    }

    // Fallback to KV store if table doesn't exist or is empty
    // console.log('Falling back to KV store for configurations');
    const configurations = await kv.get(KV_KEYS.CONFIGURATIONS);
    return c.json({ configurations: configurations || [] });
  } catch (error) {
    // Final fallback to KV store
    try {
      const configurations = await kv.get(KV_KEYS.CONFIGURATIONS);
      return c.json({ configurations: configurations || [] });
    } catch (kvError) {
      return c.json({ error: 'Server error while loading configurations', details: error.message }, 500);
    }
  }
});

// Save configurations - Updated to use dedicated configurations table
app.post('/make-server-228aa219/configurations', async (c) => {
  try {
    const { configurations } = await c.req.json();

    if (!Array.isArray(configurations)) {
      return c.json({ error: 'Invalid input: configurations must be an array' }, 400);
    }

    // Try to save to the new configurations table first
    try {
      // Delete existing configurations
      await withTimeout(
        supabase.from(DB_TABLES.CONFIGURATIONS).delete().neq(DB_COLUMNS.CONFIGURATIONS.ID, ''),
        10000
      );

      // Insert new configurations
      if (configurations.length > 0) {
        const dbConfigurations = configurations.map(config => ({
          id: config.id,
          name: config.name,
          description: config.description || '',
          sort_order: config.order || 0,
          is_active: config.isActive !== false, // Default to true
          fields: config.fields || [],
          created_at: config.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: insertError } = await withTimeout(
          supabase.from(DB_TABLES.CONFIGURATIONS).insert(dbConfigurations),
          15000
        );

        if (insertError) {
          throw insertError;
        }
      }

      return c.json({ success: true, method: 'database' });
    } catch (dbError) {
      // console.log('Database save failed, using KV store fallback:', dbError.message);
      
      // Fallback to KV store
      await kv.set(KV_KEYS.CONFIGURATIONS, configurations);
      return c.json({ success: true, method: 'kv_fallback' });
    }
  } catch (error) {
    return c.json({ error: 'Server error while saving configurations', details: error.message }, 500);
  }
});

// Get tags - New endpoint for dedicated tags table
app.get('/make-server-228aa219/tags', async (c) => {
  try {
    // Try the new tags table first
    const { data: tagData, error: tagError } = await withTimeout(
      supabase
        .from(DB_TABLES.TAGS)
        .select('*')
        .order(DB_COLUMNS.TAGS.NAME, { ascending: true }),
      10000
    );

    if (!tagError && tagData) {
      const tags = tagData.map(tag => ({
        id: tag.id,
        name: tag.name,
        usageCount: tag.usage_count || 0, // Include usage count/quantity
        usedInItems: tag.used_in_items || [], // Include list of service IDs using this tag
        createdAt: tag.created_at,
        updatedAt: tag.updated_at
      }));
      
      // console.log(`Loaded ${tags.length} tags from database`);
      return c.json({ tags });
    }

    if (tagError) {
      // console.log('Tags table query error:', tagError.message);
    }

    // Fallback: extract tags from services in KV store and calculate usage
    // console.log('Extracting tags from services in KV store');
    const services = await kv.get(KV_KEYS.SERVICES) || [];
    const tagUsage = new Map();
    
    if (Array.isArray(services)) {
      services.forEach(service => {
        if (service.tags && Array.isArray(service.tags)) {
          service.tags.forEach(tag => {
            if (tag && typeof tag === 'string' && tag.trim()) {
              const tagName = tag.trim();
              tagUsage.set(tagName, (tagUsage.get(tagName) || 0) + 1);
            }
          });
        }
      });
    }

    const tags = Array.from(tagUsage.entries()).map(([name, usageCount]) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name,
      description: '',
      color: null,
      orderIndex: 0,
      isActive: true,
      usageCount: usageCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    return c.json({ tags });
  } catch (error) {
    return c.json({ error: 'Server error while loading tags', details: error.message }, 500);
  }
});

// Save tags - New endpoint for dedicated tags table
app.post('/make-server-228aa219/tags', async (c) => {
  try {
    const { tags } = await c.req.json();

    if (!Array.isArray(tags)) {
      return c.json({ error: 'Invalid input: tags must be an array' }, 400);
    }

    // Try to save to the new tags table
    try {
      // Delete existing tags
      await withTimeout(
        supabase.from(DB_TABLES.TAGS).delete().neq(DB_COLUMNS.TAGS.ID, ''),
        10000
      );

      // Insert new tags
      if (tags.length > 0) {
        const dbTags = tags.map(tag => ({
          id: tag.id || tag.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          name: tag.name,
          usage_count: tag.usageCount || tag.usage_count || 0, // Handle usage count/quantity
          used_in_items: tag.usedInItems || tag.used_in_items || [], // Handle service IDs using this tag
          created_at: tag.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: insertError } = await withTimeout(
          supabase.from(DB_TABLES.TAGS).insert(dbTags),
          15000
        );

        if (insertError) {
          // If insert fails due to missing usage_count column, try without it
          if (insertError.message.includes('usage_count')) {
            // console.log('🔄 Retrying tag save without usage_count column...');
            
            const basicDbTags = dbTags.map(tag => {
              const { usage_count, ...basicTag } = tag;
              return basicTag;
            });

            const { error: basicInsertError } = await withTimeout(
              supabase.from(DB_TABLES.TAGS).insert(basicDbTags),
              15000
            );

            if (basicInsertError) {
              throw basicInsertError;
            }
            
            // console.log('✅ Tags saved without usage_count column');
          } else {
            throw insertError;
          }
        } else {
          // console.log('✅ Tags saved with all columns including usage_count');
        }
      }

      return c.json({ success: true, method: 'database' });
    } catch (dbError) {
      // console.log('Database save failed for tags:', dbError.message);
      return c.json({ error: 'Failed to save tags to database', details: dbError.message }, 500);
    }
  } catch (error) {
    return c.json({ error: 'Server error while saving tags', details: error.message }, 500);
  }
});

// Save session data
app.post('/make-server-228aa219/saveSessionData', async (c) => {
  try {
    // console.log('🚀 Server: Save session data request received');
    const body = await c.req.json();
    // console.log('🚀 Server: Request body:', { keyPresent: !!body.key, dataType: typeof body.data });
    
    const { key, data } = body;
    
    if (!key || typeof key !== 'string') {
      // console.log('❌ Server: Invalid key provided:', key);
      c.header('Content-Type', 'application/json');
      return c.json({ error: 'Invalid key provided' }, 400);
    }
    
    // console.log('🚀 Server: Saving to KV store with key:', key.substring(0, 20) + '...');
    await kv.set(key, data);
    // console.log('✅ Server: Session data saved successfully');
    
    c.header('Content-Type', 'application/json');
    return c.json({ success: true });
  } catch (error) {
    // console.error('❌ Server: Save session data error:', error);
    c.header('Content-Type', 'application/json');
    return c.json({ 
      error: 'Failed to save session data', 
      details: error.message || 'Unknown error',
      stack: error.stack
    }, 500);
  }
});

// Load session data
app.get('/make-server-228aa219/loadSessionData', async (c) => {
  try {
    const key = c.req.query('key');
    
    if (!key || typeof key !== 'string') {
      c.header('Content-Type', 'application/json');
      return c.json({ error: 'Invalid key provided' }, 400);
    }
    
    const data = await kv.get(key);
    c.header('Content-Type', 'application/json');
    return c.json({ success: true, data: data || null });
  } catch (error) {
    c.header('Content-Type', 'application/json');
    return c.json({ error: 'Failed to load session data', details: error.message }, 500);
  }
});

// Delete session data
app.post('/make-server-228aa219/deleteSessionData', async (c) => {
  try {
    // console.log('🚀 Server: Delete session data request received');
    const body = await c.req.json();
    // console.log('🚀 Server: Request body:', { keyPresent: !!body.key });
    
    const { key } = body;
    
    if (!key || typeof key !== 'string') {
      // console.log('❌ Server: Invalid key provided:', key);
      c.header('Content-Type', 'application/json');
      return c.json({ error: 'Invalid key provided' }, 400);
    }
    
    // console.log('🚀 Server: Deleting from KV store with key:', key.substring(0, 20) + '...');
    await kv.del(key);
    // console.log('✅ Server: Session data deleted successfully');
    
    c.header('Content-Type', 'application/json');
    return c.json({ success: true });
  } catch (error) {
    // console.error('❌ Server: Delete session data error:', error);
    c.header('Content-Type', 'application/json');
    return c.json({ 
      error: 'Failed to delete session data', 
      details: error.message || 'Unknown error',
      stack: error.stack
    }, 500);
  }
});

// Admin login
app.post('/make-server-228aa219/admin/login', async (c) => {
  try {
    const { password } = await c.req.json();
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    
    if (!adminPassword) {
      return c.json({ error: 'Server configuration error' }, 500);
    }
    
    if (password !== adminPassword) {
      // console.log('❌ Server: Invalid password provided');
      return c.json({ error: 'Invalid password' }, 401);
    }
    
    const token = crypto.randomUUID();
    const sessionKey = `areeba_admin_session_${token}`;
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
    const sessionData = { 
      token,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    };
    
    // console.log('✅ Server: Creating admin session:', sessionKey);
    await kv.set(sessionKey, sessionData);
    // console.log('✅ Server: Session created successfully');
    
    // 🔧 CRITICAL DEBUG: Immediately verify the session was saved
    const verifySession = await kv.get(sessionKey);
    // console.log('🔧 Server: Session verification after creation:', {
      sessionKey,
      sessionExists: !!verifySession,
      sessionData: verifySession
    });
    
    return c.json({ token });
  } catch (error) {
    return c.json({ error: 'Login failed', details: error.message }, 500);
  }
});

// Admin logout
app.post('/make-server-228aa219/admin/logout', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid authorization header' }, 401);
    }
    
    const token = authHeader.substring(7);
    await kv.del(`areeba_admin_session_${token}`);
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Logout failed', details: error.message }, 500);
  }
});

// Check admin session
app.post('/make-server-228aa219/admin/check-session', async (c) => {
  try {
    // Run periodic cleanup
    periodicSessionCleanup();
    
    const { token } = await c.req.json();
    const session = await kv.get(`areeba_admin_session_${token}`);
    
    if (!session) {
      return c.json({ valid: false });
    }
    
    // Check if session is expired using proper ISO date
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) {
      await kv.del(`areeba_admin_session_${token}`);
      return c.json({ valid: false });
    }
    
    return c.json({ valid: true });
  } catch (error) {
    return c.json({ valid: false });
  }
});

// Get admin session (for checkSession API calls)
app.get('/make-server-228aa219/admin/session/:token', async (c) => {
  try {
    const token = c.req.param('token');
    // console.log('🔧 Server: Session check for token:', token ? `${token.substring(0, 8)}...` : 'NULL');
    
    const session = await kv.get(`areeba_admin_session_${token}`);
    // console.log('🔧 Server: Session found:', !!session);
    
    if (!session) {
      // console.log('❌ Server: Session not found');
      return c.json({ valid: false }, 404);
    }
    
    // Check if session is expired using proper ISO date
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < new Date()) {
      // console.log('❌ Server: Session is expired');
      await kv.del(`areeba_admin_session_${token}`);
      return c.json({ valid: false }, 404);
    }
    
    // console.log('✅ Server: Session is valid');
    return c.json({ valid: true });
  } catch (error) {
    // console.log('❌ Server: Session check error:', error);
    return c.json({ valid: false }, 500);
  }
});

// Save scenario data
app.post('/make-server-228aa219/scenario/save', async (c) => {
  try {
    const scenarioData = await c.req.json();
    const timestamp = new Date().toISOString();
    const scenarioId = `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(scenarioId, {
      ...scenarioData,
      id: scenarioId,
      savedAt: timestamp
    });
    
    return c.json({ success: true, scenarioId });
  } catch (error) {
    return c.json({ error: 'Failed to save scenario data', details: error.message }, 500);
  }
});

// Get scenario history
app.get('/make-server-228aa219/scenario/history', async (c) => {
  try {
    const scenarios = await kv.getByPrefix('scenario_');
    
    // Sort by savedAt timestamp (newest first)
    const sortedScenarios = scenarios
      .filter(scenario => scenario.savedAt)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
      .slice(0, 50); // Limit to last 50 scenarios
    
    return c.json({ scenarios: sortedScenarios });
  } catch (error) {
    return c.json({ error: 'Failed to load scenario history', details: error.message }, 500);
  }
});

// Test endpoint to verify new columns are working
app.get('/make-server-228aa219/test-columns', async (c) => {
  try {
    // Test if we can query the core service columns
    const { data, error } = await withTimeout(
      supabase.from(DB_TABLES.SERVICES).select(`${DB_COLUMNS.SERVICES.ID}, ${DB_COLUMNS.SERVICES.NAME}, ${DB_COLUMNS.SERVICES.TIERS}, ${DB_COLUMNS.SERVICES.PRICING_TYPE}`).limit(3),
      10000
    );
    
    if (error) {
      return c.json({ 
        success: false, 
        error: 'Failed to query service columns',
        details: error.message,
        columnsExist: false
      });
    }
    
    return c.json({ 
      success: true, 
      columnsExist: true,
      message: 'Service columns are working correctly',
      sampleData: data || [],
      testResult: 'Columns accessible and functional',
      note: 'Auto-add and quantity fields are managed by application state'
    });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Column test failed',
      details: error.message,
      columnsExist: false
    }, 500);
  }
});

// Database schema management endpoint
app.post('/make-server-228aa219/admin/add-service-columns', async (c) => {
  try {
    // console.log('🔧 Server: Received add-service-columns request');
    // console.log('🔧 Server: Request headers:', Object.fromEntries(c.req.headers.entries()));
    
    const authHeader = c.req.header('Authorization');
    // console.log('🔧 Server: Auth header present:', !!authHeader);
    // console.log('🔧 Server: Auth header value:', authHeader ? `${authHeader.substring(0, 20)}...` : 'NULL');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // console.log('❌ Server: Missing or invalid authorization header');
      // console.log('🔍 Server: All request headers for debugging:', {
        authorization: c.req.header('Authorization'),
        contentType: c.req.header('Content-Type'),
        userAgent: c.req.header('User-Agent'),
        origin: c.req.header('Origin')
      });
      
      // Check if there are any admin sessions in the KV store
      const allSessions = await kv.getByPrefix('areeba_admin_session_');
      // console.log('🔧 Server: Total admin sessions in KV store:', allSessions.length);
      
      return c.json({ 
        error: 'Missing or invalid authorization header',
        debug: {
          headerPresent: !!authHeader,
          headerValue: authHeader ? `${authHeader.substring(0, 20)}...` : 'NULL',
          totalActiveSessions: allSessions.length
        }
      }, 401);
    }
    
    const token = authHeader.substring(7);
    // console.log('���� Server: Extracted token:', token ? `${token.substring(0, 8)}...` : 'NULL');
    // console.log('🔧 Server: Token length:', token?.length || 0);
    // console.log('🔧 Server: Token type:', typeof token);
    
    const sessionKey = `areeba_admin_session_${token}`;
    // console.log('🔧 Server: Looking for session with key:', sessionKey);
    
    const session = await kv.get(sessionKey);
    // console.log('🔧 Server: Session found:', !!session);
    // console.log('🔧 Server: Session data:', session);
    
    if (!session) {
      // console.log('❌ Server: Session not found in KV store');
      
      // Debug: Check what sessions actually exist
      const allSessions = await kv.getByPrefix('areeba_admin_session_');
      // console.log('���� Server: Total admin sessions in KV store:', allSessions.length);
      // console.log('🔧 Server: Session keys in KV store:', allSessions.map(s => s.key || 'no-key').slice(0, 5));
      
      return c.json({ 
        error: 'Session not found',
        debug: {
          sessionKey,
          tokenProvided: token ? `${token.substring(0, 8)}...` : 'NULL',
          tokenLength: token?.length || 0,
          totalActiveSessions: allSessions.length,
          existingSessionKeys: allSessions.map(s => s.key || 'no-key').slice(0, 3)
        }
      }, 401);
    }
    
    if (!session.valid) {
      // console.log('❌ Server: Session exists but marked invalid');
      return c.json({ 
        error: 'Session marked invalid',
        debug: {
          sessionData: session,
          sessionKey
        }
      }, 401);
    }
    
    // Check session age
    const sessionAge = Date.now() - session.created;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    // console.log('🔧 Server: Session age check:', {
      sessionAge,
      maxAge,
      expired: sessionAge > maxAge,
      createdAt: new Date(session.created).toISOString()
    });
    
    if (sessionAge > maxAge) {
      // console.log('❌ Server: Session expired, deleting');
      await kv.del(sessionKey);
      return c.json({ 
        error: 'Session expired',
        debug: {
          sessionAge,
          maxAge,
          createdAt: new Date(session.created).toISOString()
        }
      }, 401);
    }
    
    // console.log('✅ Server: Session validation passed, proceeding with column addition');

    // console.log('🔧 Admin requesting to add service columns...');
    
    // Check if columns already exist
    const { error: checkError } = await withTimeout(
      supabase.from(DB_TABLES.SERVICES).select(`${DB_COLUMNS.SERVICES.AUTO_ADD_TRIGGER_FIELDS}, ${DB_COLUMNS.SERVICES.QUANTITY_SOURCE_FIELDS}`).limit(1),
      10000
    );
    
    if (!checkError) {
      return c.json({ 
        success: true, 
        message: 'Columns already exist',
        columnsAdded: false 
      });
    }

    if (!checkError.message.includes('column')) {
      return c.json({ 
        error: 'Unexpected database error', 
        details: checkError.message 
      }, 500);
    }

    // Try to add columns using direct SQL
    try {
      // Add configuration_based_quantity column
      const { error: alterError1 } = await withTimeout(
        supabase.rpc('exec_sql', {
          sql: `ALTER TABLE services ADD COLUMN configuration_based_quantity jsonb DEFAULT '[]';`
        }),
        15000
      );

      // Add auto_add_related_services column  
      const { error: alterError2 } = await withTimeout(
        supabase.rpc('exec_sql', {
          sql: `ALTER TABLE services ADD COLUMN auto_add_related_services jsonb DEFAULT '[]';`
        }),
        15000
      );

      if (alterError1 || alterError2) {
        // console.warn('RPC SQL execution failed:', { alterError1, alterError2 });
        
        // Fallback: Try using Supabase's built-in schema modification (if available)
        return c.json({
          success: false,
          error: 'Unable to add columns automatically',
          message: 'Manual database migration required',
          instructions: [
            'Connect to your Supabase database',
            'Run the following SQL commands:',
            'ALTER TABLE services ADD COLUMN configuration_based_quantity jsonb DEFAULT \'[]\';',
            'ALTER TABLE services ADD COLUMN auto_add_related_services jsonb DEFAULT \'[]\';'
          ]
        }, 500);
      }

      // Verify columns were added
      const { error: verifyError } = await withTimeout(
        supabase.from(DB_TABLES.SERVICES).select(`${DB_COLUMNS.SERVICES.AUTO_ADD_TRIGGER_FIELDS}, ${DB_COLUMNS.SERVICES.QUANTITY_SOURCE_FIELDS}`).limit(1),
        10000
      );

      if (verifyError) {
        return c.json({
          success: false,
          error: 'Column addition verification failed',
          details: verifyError.message
        }, 500);
      }

      // console.log('✅ Successfully added service columns');
      return c.json({ 
        success: true, 
        message: 'Successfully added new columns to services table',
        columnsAdded: true 
      });

    } catch (sqlError) {
      // console.error('SQL execution error:', sqlError);
      return c.json({
        success: false,
        error: 'Failed to execute SQL commands',
        details: sqlError.message,
        instructions: [
          'Manual database migration required',
          'Connect to your Supabase database and run:',
          'ALTER TABLE services ADD COLUMN configuration_based_quantity jsonb DEFAULT \'[]\';',
          'ALTER TABLE services ADD COLUMN auto_add_related_services jsonb DEFAULT \'[]\';'
        ]
      }, 500);
    }

  } catch (error) {
    // console.error('Add columns endpoint error:', error);
    return c.json({ 
      error: 'Failed to add service columns', 
      details: error.message 
    }, 500);
  }
});

// Debug endpoint for KV session inspection
app.post('/make-server-228aa219/admin/debug-session', async (c) => {
  try {
    const { token } = await c.req.json();
    // console.log('🔧 Debug: Inspecting session for token:', token ? `${token.substring(0, 8)}...` : 'NULL');
    
    if (!token) {
      return c.json({ error: 'No token provided' }, 400);
    }
    
    const sessionKey = `areeba_admin_session_${token}`;
    // console.log('🔧 Debug: Looking up session key:', sessionKey);
    
    const session = await kv.get(sessionKey);
    // console.log('🔧 Debug: Session found:', !!session);
    // console.log('🔧 Debug: Session data:', session);
    
    // Also get all admin sessions to see what's in the KV store
    const allAdminSessions = await kv.getByPrefix('areeba_admin_session_');
    // console.log('🔧 Debug: All admin sessions count:', allAdminSessions.length);
    // console.log('🔧 Debug: All admin session keys:', allAdminSessions.map(s => s.key || 'no-key'));
    
    return c.json({
      sessionKey,
      sessionExists: !!session,
      sessionData: session,
      allAdminSessionsCount: allAdminSessions.length,
      allSessionKeys: allAdminSessions.map(s => s.key || 'no-key'),
      tokenProvided: token ? `${token.substring(0, 8)}...` : 'NULL',
      tokenLength: token?.length || 0
    });
  } catch (error) {
    // console.error('Debug session endpoint error:', error);
    return c.json({ 
      error: 'Debug session failed', 
      details: error.message 
    }, 500);
  }
});

// Session cleanup endpoint - removes expired sessions
app.post('/make-server-228aa219/admin/cleanup-sessions', async (c) => {
  try {
    // console.log('🧹 Server: Starting session cleanup...');
    
    // Get all sessions
    const allSessions = await kv.getByPrefix('areeba_admin_session_');
    // console.log('🧹 Server: Found', allSessions.length, 'total sessions');
    
    let expiredCount = 0;
    let oldFormatCount = 0;
    
    for (const sessionEntry of allSessions) {
      const { key, value } = sessionEntry;
      
      try {
        const session = typeof value === 'string' ? JSON.parse(value) : value;
        
        // Remove old format sessions (they don't have expiresAt)
        if (!session.expiresAt) {
          await kv.del(key);
          oldFormatCount++;
          continue;
        }
        
        // Remove expired sessions
        const expiresAt = new Date(session.expiresAt);
        if (expiresAt < new Date()) {
          await kv.del(key);
          expiredCount++;
        }
      } catch (parseError) {
        // Remove malformed session data
        await kv.del(key);
        expiredCount++;
      }
    }
    
    // console.log('🧹 Server: Cleanup complete. Removed:', expiredCount, 'expired,', oldFormatCount, 'old format');
    
    return c.json({
      success: true,
      totalSessionsBefore: allSessions.length,
      expiredRemoved: expiredCount,
      oldFormatRemoved: oldFormatCount,
      totalRemoved: expiredCount + oldFormatCount
    });
    
  } catch (error) {
    // console.error('❌ Server: Session cleanup failed:', error);
    return c.json({ error: 'Session cleanup failed' }, 500);
  }
});

// Enhanced session check with detailed logging for debugging
app.get('/make-server-228aa219/admin/debug-session-check/:token', async (c) => {
  try {
    const token = c.req.param('token');
    // console.log('🔧 Debug Session Check: Token received:', token ? `${token.substring(0, 8)}...` : 'NULL');
    
    const sessionKey = `areeba_admin_session_${token}`;
    // console.log('🔧 Debug Session Check: Session key:', sessionKey);
    
    const session = await kv.get(sessionKey);
    // console.log('🔧 Debug Session Check: Session exists:', !!session);
    // console.log('🔧 Debug Session Check: Session data:', session);
    
    if (!session) {
      // Check if there are any admin sessions at all
      const allSessions = await kv.getByPrefix('areeba_admin_session_');
      // console.log('🔧 Debug Session Check: Total admin sessions in KV:', allSessions.length);
      
      return c.json({ 
        valid: false, 
        error: 'Session not found',
        sessionKey,
        totalAdminSessions: allSessions.length,
        allSessionKeys: allSessions.map(s => s.key || 'no-key').slice(0, 5) // Show first 5
      }, 404);
    }
    
    if (!session.valid) {
      // console.log('🔧 Debug Session Check: Session exists but marked invalid');
      return c.json({ 
        valid: false, 
        error: 'Session marked invalid',
        sessionData: session 
      }, 401);
    }
    
    // Check session age
    const sessionAge = Date.now() - session.created;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    // console.log('🔧 Debug Session Check: Session age (ms):', sessionAge);
    // console.log('🔧 Debug Session Check: Max age (ms):', maxAge);
    // console.log('🔧 Debug Session Check: Session expired:', sessionAge > maxAge);
    
    if (sessionAge > maxAge) {
      // console.log('🔧 Debug Session Check: Session expired, deleting');
      await kv.del(sessionKey);
      return c.json({ 
        valid: false, 
        error: 'Session expired',
        sessionAge,
        maxAge 
      }, 401);
    }
    
    // console.log('✅ Debug Session Check: Session is valid');
    return c.json({ 
      valid: true,
      sessionAge,
      sessionData: session 
    });
  } catch (error) {
    // console.error('Debug session check error:', error);
    return c.json({ 
      valid: false, 
      error: 'Debug session check failed',
      details: error.message 
    }, 500);
  }
});

// Database analysis endpoint for health checking
app.post('/make-server-228aa219/debug/database-analysis', async (c) => {
  try {
    // console.log('🔍 Starting database health analysis...');
    
    const analysis = {
      timestamp: new Date().toISOString(),
      tables: {},
      foreignKeyIssues: 0,
      issues: [],
      summary: 'Database analysis complete'
    };
    
    // Check services table
    try {
      const { data: services, error: servicesError } = await withTimeout(
        supabase.from(DB_TABLES.SERVICES).select('*').limit(5),
        10000
      );
      
      analysis.tables.services = {
        accessible: !servicesError,
        count: services?.length || 0,
        error: servicesError?.message || null
      };
      
      if (servicesError) {
        analysis.issues.push(`Services table error: ${servicesError.message}`);
      }
    } catch (servicesTimeout) {
      analysis.tables.services = {
        accessible: false,
        count: 0,
        error: 'Timeout accessing services table'
      };
      analysis.issues.push('Services table timeout');
    }
    
    // Check categories table
    try {
      const { data: categories, error: categoriesError } = await withTimeout(
        supabase.from(DB_TABLES.CATEGORIES).select('*').limit(5),
        10000
      );
      
      analysis.tables.categories = {
        accessible: !categoriesError,
        count: categories?.length || 0,
        error: categoriesError?.message || null
      };
      
      if (categoriesError) {
        analysis.issues.push(`Categories table error: ${categoriesError.message}`);
        analysis.foreignKeyIssues++;
      }
    } catch (categoriesTimeout) {
      analysis.tables.categories = {
        accessible: false,
        count: 0,
        error: 'Timeout accessing categories table'
      };
      analysis.issues.push('Categories table timeout');
    }
    
    // Check KV store
    try {
      const kvTest = await kv.get('test_key');
      analysis.tables.kv_store = {
        accessible: true,
        error: null
      };
    } catch (kvError) {
      analysis.tables.kv_store = {
        accessible: false,
        error: kvError.message
      };
      analysis.issues.push(`KV store error: ${kvError.message}`);
    }
    
    // Update summary
    analysis.summary = `Found ${analysis.issues.length} issues, ${analysis.foreignKeyIssues} foreign key problems`;
    
    // console.log('✅ Database analysis complete:', analysis);
    return c.json(analysis);
    
  } catch (error) {
    // console.error('Database analysis failed:', error);
    return c.json({
      timestamp: new Date().toISOString(),
      error: 'Database analysis failed',
      details: error.message,
      tables: {},
      foreignKeyIssues: 1,
      issues: [`Analysis error: ${error.message}`],
      summary: 'Database analysis failed'
    }, 500);
  }
});

// Sync tag usage counts from services to database
app.post('/make-server-228aa219/sync-tag-usage', async (c) => {
  try {
    // console.log('🔄 Syncing tag usage counts and service mappings from services to database...');
    
    // First, ensure the required columns exist in the tags table
    try {
      const { error: checkColumnError } = await withTimeout(
        supabase.from('tags').select('usage_count, used_in_items').limit(1),
        5000
      );
      
      if (checkColumnError && checkColumnError.message.includes('column')) {
        // console.log('🔧 Adding missing columns to tags table...');
        
        // Add the required columns
        const { error: alterError1 } = await withTimeout(
          supabase.rpc('exec_sql', {
            sql: `ALTER TABLE tags ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;`
          }),
          10000
        );
        
        const { error: alterError2 } = await withTimeout(
          supabase.rpc('exec_sql', {
            sql: `ALTER TABLE tags ADD COLUMN IF NOT EXISTS used_in_items TEXT[] DEFAULT '{}';`
          }),
          10000
        );
        
        if (alterError1 || alterError2) {
          // console.warn('Could not add required columns via RPC');
        } else {
          // console.log('✅ Successfully added required columns to tags table');
        }
      }
    } catch (columnError) {
      // console.warn('Column check failed, proceeding anyway:', columnError.message);
    }

    
    // Get all services from the database (not KV store since we've migrated)
    const { data: services, error: servicesError } = await withTimeout(
      supabase.from(DB_TABLES.SERVICES).select(`${DB_COLUMNS.SERVICES.ID}, ${DB_COLUMNS.SERVICES.NAME}`),
      15000
    );
    
    if (servicesError) {
      throw new Error(`Failed to fetch services: ${servicesError.message}`);
    }
    
    // console.log(`📋 Found ${services?.length || 0} services in database`);
    
    // Calculate real tag usage and service mappings from service_tags junction table
    const tagUsage = new Map<string, { count: number; serviceIds: string[] }>();
    
    // Since services don't have a direct tags column, we'll calculate usage from the service_tags junction table
    try {
      const { data: serviceTags, error: serviceTagsError } = await withTimeout(
        supabase
          .from('service_tags')
          .select(`
            service_id,
            tags(id, name)
          `),
        10000
      );
      
      if (serviceTagsError) {
        // console.log('⚠️ service_tags table not available, skipping tag usage calculation');
      } else if (serviceTags) {
        serviceTags.forEach(serviceTag => {
          if (serviceTag.tags && serviceTag.tags.name) {
            const tagName = serviceTag.tags.name.trim();
            if (tagName) {
              const existing = tagUsage.get(tagName) || { count: 0, serviceIds: [] };
              existing.count += 1;
              if (!existing.serviceIds.includes(serviceTag.service_id)) {
                existing.serviceIds.push(serviceTag.service_id);
              }
              tagUsage.set(tagName, existing);
            }
          }
        });
      }
    } catch (junctionError) {
      // console.log('⚠️ Could not calculate tag usage from service_tags table:', junctionError.message);
    }
    
    // console.log('📊 Real tag usage calculated:', Object.fromEntries(
      Array.from(tagUsage.entries()).map(([name, data]) => [name, { count: data.count, services: data.serviceIds }])
    ));
    
    // Get current tags from database 
    const { data: currentTags, error: fetchError } = await withTimeout(
      supabase
        .from('tags')
        .select('id, name, usage_count, used_in_items, created_at, updated_at'),
      10000
    );
    
    if (fetchError) {
      throw new Error(`Failed to fetch tags: ${fetchError.message}`);
    }
    
    // console.log(`🏷️ Found ${currentTags?.length || 0} tags in database`);
    
    // Create missing tags from service tags
    const existingTagNames = new Set(currentTags?.map(tag => tag.name) || []);
    const existingTagIds = new Set(currentTags?.map(tag => tag.id) || []);
    const missingTags = [];
    
    for (const [tagName, tagData] of tagUsage) {
      if (!existingTagNames.has(tagName)) {
        // Generate a unique ID by ensuring it doesn't conflict
        let baseId = tagName.toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
        
        // Ensure we have a reasonable base ID
        if (!baseId || baseId.length < 2) {
          baseId = `tag_${Math.random().toString(36).substr(2, 8)}`;
        }
        
        let uniqueId = baseId;
        let counter = 1;
        
        // If this ID already exists (either in database or in our current batch), add a suffix
        while (existingTagIds.has(uniqueId) || missingTags.some(tag => tag.id === uniqueId)) {
          uniqueId = `${baseId}_${counter}`;
          counter++;
        }
        
        const newTag = {
          id: uniqueId,
          name: tagName,
          usage_count: tagData.count,
          used_in_items: tagData.serviceIds,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        missingTags.push(newTag);
        existingTagIds.add(uniqueId); // Track this ID to prevent duplicates in this batch
        
        // console.log(`🏷️ Preparing new tag: "${tagName}" -> ID: "${uniqueId}" (usage: ${newTag.usage_count}, services: ${newTag.used_in_items.join(', ')})`);
      }
    }
    
    // Insert missing tags
    let successfulInserts = 0;
    let failedInserts = 0;
    
    if (missingTags.length > 0) {
      // console.log(`➕ Creating ${missingTags.length} missing tags:`, missingTags.map(t => t.name));
      
      // Process tags one by one to handle conflicts gracefully
      for (const tag of missingTags) {
        try {
          const { error: upsertError } = await withTimeout(
            supabase
              .from('tags')
              .upsert(tag, { 
                onConflict: 'id',
                ignoreDuplicates: false 
              }),
            10000
          );
          
          if (upsertError) {
            // console.error(`Failed to upsert tag ${tag.name}:`, upsertError.message);
            failedInserts++;
          } else {
            // console.log(`✅ Successfully upserted tag ${tag.name}`);
            successfulInserts++;
          }
        } catch (tagError) {
          // console.error(`Exception during tag upsert for ${tag.name}:`, tagError.message);
          failedInserts++;
        }
      }
      
      // console.log(`📊 Tag creation results: ${successfulInserts} successful, ${failedInserts} failed`);
    }
    
    // Update usage counts and service mappings for existing tags
    const updatePromises = [];
    let updatedCount = 0;
    
    if (currentTags) {
      for (const tag of currentTags) {
        const tagData = tagUsage.get(tag.name);
        const realUsageCount = tagData ? tagData.count : 0;
        const realServiceIds = tagData ? tagData.serviceIds : [];
        
        // Check if usage count or service mappings need updating
        const needsUsageUpdate = tag.usage_count !== realUsageCount;
        const needsServiceUpdate = JSON.stringify(tag.used_in_items || []) !== JSON.stringify(realServiceIds);
        
        if (needsUsageUpdate || needsServiceUpdate) {
          // console.log(`📝 Updating ${tag.name}: usage ${tag.usage_count || 0} → ${realUsageCount}, services: [${(tag.used_in_items || []).join(', ')}] → [${realServiceIds.join(', ')}]`);
          
          const updatePromise = supabase
            .from('tags')
            .update({
              usage_count: realUsageCount,
              used_in_items: realServiceIds,
              updated_at: new Date().toISOString()
            })
            .eq('id', tag.id);
          
          updatePromises.push(updatePromise);
          updatedCount++;
        }
      }
    }
    
    // Execute all updates
    if (updatePromises.length > 0) {
      const results = await Promise.allSettled(updatePromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      // console.log(`✅ Successfully updated ${successful}/${updatePromises.length} tags`);
      
      if (failed > 0) {
        // console.warn(`⚠️ ${failed} tag updates failed`);
        // Log details of failed updates
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            // console.warn(`Failed update ${index}:`, result.reason);
          }
        });
      }
    } else {
      // console.log('✅ All tag usage counts and service mappings are already up to date');
    }
    
    // Get final updated tags from database
    const { data: finalTags, error: finalFetchError } = await withTimeout(
      supabase
        .from('tags')
        .select('id, name, usage_count, used_in_items'),
      10000
    );
    
    if (finalFetchError) {
      // console.warn('Could not fetch final tags, but sync completed:', finalFetchError.message);
    }
    
    // console.log('🎯 Tag usage and service mapping sync complete');
    
    return c.json({
      success: true,
      message: 'Tag usage counts and service mappings synchronized successfully',
      servicesAnalyzed: services?.length || 0,
      tagsUpdated: updatedCount,
      tagsCreated: successfulInserts,
      tagUsageFromServices: Object.fromEntries(
        Array.from(tagUsage.entries()).map(([name, data]) => [name, { count: data.count, services: data.serviceIds }])
      ),
      finalTagsCount: finalTags?.length || 0
    });
    
  } catch (error) {
    // console.error('❌ Tag usage sync failed:', error);
    return c.json({
      success: false,
      error: 'Failed to sync tag usage counts and service mappings',
      details: error.message
    }, 500);
  }
});

// =============================================================================
// NORMALIZED SCHEMA ENDPOINTS
// =============================================================================

// Sync tag usage using normalized service_tags table
app.post('/make-server-228aa219/sync-tag-usage-normalized', async (c) => {
  try {
    // console.log('🔄 Server: Starting normalized tag usage sync...');
    
    // Check if normalized tables exist
    const { data: tableCheck } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['service_tags', 'auto_add_rules', 'quantity_rules']);
    
    const hasNormalizedTables = tableCheck && tableCheck.length >= 2;
    
    if (!hasNormalizedTables) {
      // console.log('⚠️ Server: Normalized tables not found, falling back to legacy sync');
      return c.json({
        success: false,
        error: 'Normalized tables not found. Please run schema migration first.',
        suggestion: 'Run database_schema_optimization.sql to create normalized tables'
      }, 400);
    }
    
    // Get tag usage from normalized service_tags table
    const { data: tagRelationships, error: relationshipError } = await supabase
      .from('service_tags')
      .select(`
        service_id,
        tags!inner(id, name)
      `);
    
    if (relationshipError) {
      throw new Error(`Failed to fetch tag relationships: ${relationshipError.message}`);
    }
    
    // console.log(`📋 Found ${tagRelationships?.length || 0} service-tag relationships in normalized table`);
    
    // Count tag usage from relationships
    const tagUsageMap = new Map();
    
    for (const relationship of tagRelationships || []) {
      const tagName = relationship.tags.name;
      if (!tagUsageMap.has(tagName)) {
        tagUsageMap.set(tagName, {
          id: relationship.tags.id,
          count: 0,
          serviceIds: []
        });
      }
      
      const tagData = tagUsageMap.get(tagName);
      tagData.count++;
      tagData.serviceIds.push(relationship.service_id);
    }
    
    let tagsUpdated = 0;
    
    // Update tag usage counts in tags table
    for (const [tagName, tagData] of tagUsageMap) {
      const { error: updateError } = await supabase
        .from('tags')
        .update({
          usage_count: tagData.count,
          used_in_items: tagData.serviceIds
        })
        .eq('id', tagData.id);
      
      if (updateError) {
        // console.warn(`Failed to update tag ${tagName}:`, updateError.message);
      } else {
        tagsUpdated++;
        // console.log(`✅ Updated tag ${tagName}: ${tagData.count} usages in [${tagData.serviceIds.join(', ')}]`);
      }
    }
    
    // console.log('✅ Normalized tag sync completed');
    
    return c.json({
      success: true,
      message: 'Tag usage counts synchronized using normalized schema',
      relationshipsAnalyzed: tagRelationships?.length || 0,
      tagsUpdated,
      usesNormalizedSchema: true
    });
    
  } catch (error) {
    // console.error('❌ Normalized tag sync failed:', error);
    return c.json({
      success: false,
      error: 'Failed to sync using normalized schema',
      details: error.message
    }, 500);
  }
});

// Migrate existing JSONB data to normalized schema
app.post('/make-server-228aa219/migrate-tag-schema', async (c) => {
  try {
    // console.log('🔄 Server: Starting schema migration to normalized tables...');
    
    // Check if migration functions exist
    const { error: functionCheck } = await supabase.rpc('migrate_auto_add_data');
    
    if (functionCheck && functionCheck.message.includes('function') && functionCheck.message.includes('does not exist')) {
      return c.json({
        success: false,
        error: 'Migration functions not found. Please run database_schema_optimization.sql first.',
        details: 'The required migration functions have not been created in the database.'
      }, 400);
    }
    
    // Run the migration functions
    const { data: autoAddMigration } = await supabase.rpc('migrate_auto_add_data');
    const { data: tagRelationMigration } = await supabase.rpc('migrate_service_tags');
    const { data: usageUpdate } = await supabase.rpc('update_tag_usage_counts');
    
    // console.log('✅ Schema migration completed');
    
    return c.json({
      success: true,
      message: 'Successfully migrated to normalized schema',
      autoAddRulesMigrated: autoAddMigration || 0,
      tagRelationshipsMigrated: tagRelationMigration || 0,
      tagUsageUpdated: usageUpdate || 0
    });
    
  } catch (error) {
    // console.error('❌ Schema migration failed:', error);
    return c.json({
      success: false,
      error: 'Failed to migrate to normalized schema',
      details: error.message
    }, 500);
  }
});

// Cleanup orphaned data in normalized tables
app.post('/make-server-228aa219/cleanup-normalized-data', async (c) => {
  try {
    // console.log('🔄 Server: Starting normalized data cleanup...');
    
    const { data: result, error } = await supabase.rpc('cleanup_orphaned_data');
    
    if (error) {
      throw new Error(`Cleanup failed: ${error.message}`);
    }
    
    // console.log('✅ Normalized data cleanup completed');
    
    return c.json({
      success: true,
      message: 'Orphaned data cleanup completed successfully',
      details: result
    });
    
  } catch (error) {
    // console.error('❌ Normalized data cleanup failed:', error);
    return c.json({
      success: false,
      error: 'Failed to cleanup normalized data',
      details: error.message
    }, 500);
  }
});

// Debug endpoint to check schema status
app.get('/make-server-228aa219/debug/schema-status', async (c) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      tables: {},
      views: {},
      functions: {},
      ready: false
    };
    
    // Check if services_overview view exists
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('services_overview')
        .select('id, name, tags, auto_add_trigger_fields, quantity_source_fields')
        .limit(1);
      
      status.views.services_overview = {
        exists: !viewError,
        error: viewError?.message || null,
        sampleRecord: viewData?.[0] || null
      };
    } catch (error) {
      status.views.services_overview = {
        exists: false,
        error: error.message
      };
    }
    
    // Check normalized tables
    const tablesToCheck = [DB_TABLES.SERVICE_TAGS, DB_TABLES.AUTO_ADD_RULES, DB_TABLES.QUANTITY_RULES, DB_TABLES.TAGS, DB_TABLES.SERVICES, DB_TABLES.CATEGORIES];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        status.tables[tableName] = {
          exists: !error,
          hasData: data && data.length > 0,
          error: error?.message || null
        };
      } catch (error) {
        status.tables[tableName] = {
          exists: false,
          hasData: false,
          error: error.message
        };
      }
    }
    
    // Determine if schema is ready
    status.ready = status.views.services_overview?.exists && 
                   status.tables.services?.exists && 
                   status.tables.categories?.exists;
    
    return c.json(status);
  } catch (error) {
    return c.json({
      timestamp: new Date().toISOString(),
      error: 'Failed to check schema status',
      details: error.message
    }, 500);
  }
});

// ===== SUPABASE AUTH ENDPOINTS =====

// Helper function to create audit log entry (updated to not use session_id)
async function createAuditLog(userId: string | null, action: string, resourceType?: string, resourceId?: string, details?: any, ipAddress?: string, userAgent?: string) {
  try {
    await supabase.from('admin_audit_log').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details ? JSON.stringify(details) : null,
      ip_address: ipAddress || 'unknown',
      user_agent: userAgent || 'unknown',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    // console.warn('Failed to create audit log:', error.message);
    // Don't throw - audit logging failures shouldn't break operations
  }
}

// JWT authentication middleware
const requireAuth = async (c, next) => {
  try {
    const authHeader = c.req.header('authorization');
    if (!authHeader) {
      return c.json({ error: 'Authorization header required' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: 'Invalid JWT', code: 401, message: 'Invalid JWT' }, 401);
    }

    // Get user profile from user_profiles table with fallback
    let profile, profileError;
    
    try {
      const result = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .eq('is_active', true)
        .single();
      
      profile = result.data;
      profileError = result.error;
    } catch (dbError) {
      profileError = dbError;
    }

    // If no profile found, create one automatically
    if (profileError || !profile) {
      // console.warn('User profile not found, creating one automatically');
      
      // Create a new profile
      const newProfile = {
        id: user.id,
        username: user.email?.split('@')[0] || 'user',
        email: user.email || '',
        role: 'user', // Default to user role
        is_active: true,
        created_at: new Date().toISOString()
      };

      try {
        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (!createError && createdProfile) {
          profile = createdProfile;
          profileError = null;
        } else {
          // Fallback if database insert fails
          profile = newProfile;
          profileError = null;
        }
      } catch {
        // Use the new profile data as fallback
        profile = newProfile;
        profileError = null;
      }
    }

    if (profileError || !profile) {
      // console.error('User profile not found or inactive:', profileError);
      return c.json({ error: 'User profile not found or inactive' }, 403);
    }

    // Add user info to request context
    c.set('user', profile);
    c.set('authUser', user);
    
    await next();
  } catch (error) {
    // console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed', code: 401, message: 'Invalid JWT' }, 401);
  }
};

// Admin-only middleware
const requireAdmin = async (c, next) => {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Admin access required. You do not have permission to manage users.' }, 403);
  }
  await next();
};

// Check authentication setup status
app.post('/make-server-228aa219/auth/check-setup', async (c) => {
  try {
    // Check if there are any admin users
    const { data: adminUsers, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'admin')
      .eq('is_active', true)
      .limit(1);

    const setupRequired = !adminUsers || adminUsers.length === 0;

    return c.json({
      setupRequired,
      message: setupRequired ? 'No admin users found - setup required' : 'Setup complete'
    });
  } catch (error) {
    // console.error('Setup check error:', error);
    return c.json({
      setupRequired: false, // Don't block if check fails
      error: 'Failed to check setup status',
      details: error.message
    });
  }
});

// Diagnostic endpoint for auth database issues
app.post('/make-server-228aa219/auth/diagnose', async (c) => {
  try {
    // console.log('🔍 Running auth database diagnostics...');
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      database_connection: 'active',
      service_role_available: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      supabase_url: !!Deno.env.get('SUPABASE_URL')
    };

    // Check if user_profiles table exists
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('user_profiles')
        .select('count', { count: 'exact', head: true });
      
      diagnostics.table_exists = !tableError;
      diagnostics.table_error = tableError?.message;
      diagnostics.user_count = tableCheck ? 'accessible' : 'error';
    } catch (error) {
      diagnostics.table_exists = false;
      diagnostics.table_error = error.message;
    }

    // Check if functions exist
    try {
      const { data: funcResult, error: funcError } = await supabase.rpc('create_admin_super_simple', {
        admin_username: 'test',
        admin_email: 'test@test.com'
      });
      
      diagnostics.super_simple_function = !funcError;
      diagnostics.function_test_result = funcResult;
    } catch (error) {
      diagnostics.super_simple_function = false;
      diagnostics.function_error = error.message;
    }
    
    return c.json({
      success: true,
      diagnostics: diagnostics,
      message: 'Database diagnostics completed',
      recommendations: diagnostics.table_exists 
        ? ['Database setup appears complete']
        : ['Execute NUCLEAR_DATABASE_SETUP.sql to create required tables and functions']
    });
    
  } catch (error) {
    // console.error('Auth diagnostic error:', error);
    return c.json({
      success: false,
      error: 'Failed to run auth diagnostics',
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Emergency admin creation endpoint (bypasses all normal methods)
app.post('/make-server-228aa219/auth/emergency-admin', async (c) => {
  try {
    // console.log('🚨 EMERGENCY: Creating admin using fallback method...');
    
    // Try the emergency function first
    try {
      const { data: emergencyResult, error: emergencyError } = await supabase.rpc('emergency_admin_insert');
      
      if (!emergencyError && emergencyResult && emergencyResult.startsWith('EMERGENCY:')) {
        // console.log('✅ Emergency function succeeded:', emergencyResult);
        return c.json({
          success: true,
          method: 'emergency_function',
          message: 'Emergency admin created successfully',
          result: emergencyResult,
          user: {
            id: 'emergency-admin',
            username: 'admin',
            email: 'admin@company.com',
            role: 'admin'
          }
        });
      }
    } catch (funcError) {
      // console.warn('Emergency function failed:', funcError);
    }

    // If function fails, try direct table access
    try {
      // First clear any existing admin users
      await supabase.from('user_profiles').delete().eq('role', 'admin');
      
      // Insert emergency admin
      const { data: directResult, error: directError } = await supabase
        .from('user_profiles')
        .insert({
          id: 'emergency-admin-direct',
          username: 'admin',
          email: 'admin@emergency.com',
          role: 'admin',
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!directError) {
        // console.log('✅ Direct emergency admin creation succeeded');
        return c.json({
          success: true,
          method: 'direct_emergency_insert',
          message: 'Emergency admin created via direct insert',
          user: {
            id: 'emergency-admin-direct',
            username: 'admin',
            email: 'admin@emergency.com',
            role: 'admin'
          }
        });
      }
    } catch (directError) {
      // console.error('Direct emergency insert failed:', directError);
    }

    // If everything fails
    return c.json({
      success: false,
      error: 'All emergency methods failed',
      details: 'Database or table may not exist',
      instruction: 'Execute NUCLEAR_DATABASE_SETUP.sql immediately'
    }, 500);

  } catch (error) {
    // console.error('Emergency admin creation error:', error);
    return c.json({
      success: false,
      error: 'Emergency admin creation failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Create initial admin user (ULTIMATE - uses super simple functions)
app.post('/make-server-228aa219/auth/create-initial-admin', async (c) => {
  try {
    const { username, email, password, fullName } = await c.req.json();

    if (!username || !email || !password || !fullName) {
      return c.json({
        success: false,
        error: 'Username, email, password, and full name are required'
      }, 400);
    }

    // console.log('🔧 Creating initial admin user with ultimate fallbacks:', { username, email });

    let adminCreated = false;
    let userId = null;
    let creationMethod = '';
    let creationResult = '';
    
    // Method 1: Super simple admin function (profile only)
    let method1Error = '';
    try {
      // console.log('🎯 Trying super simple admin creation...');
      const { data: simpleResult, error: simpleError } = await supabase.rpc('create_admin_super_simple', {
        admin_username: username,
        admin_email: email
      });

      if (simpleError) {
        method1Error = `Function error: ${simpleError.message} (Code: ${simpleError.code})`;
        // console.warn('Super simple function failed:', simpleError);
      } else if (simpleResult && typeof simpleResult === 'string') {
        if (simpleResult.startsWith('SUCCESS:')) {
          // Extract ID from result (now uses text IDs instead of UUIDs)
          const idMatch = simpleResult.match(/admin-\d+/);
          userId = idMatch ? idMatch[0] : 'admin-created';
          adminCreated = true;
          creationMethod = 'super_simple_function';
          creationResult = simpleResult;
          // console.log('✅ Super simple admin creation succeeded:', simpleResult);
        } else {
          method1Error = `Function returned: ${simpleResult}`;
          // console.warn('Super simple function returned error:', simpleResult);
        }
      } else {
        method1Error = `Unexpected result type: ${typeof simpleResult}`;
      }
    } catch (error) {
      method1Error = `Exception: ${error.message}`;
      // console.warn('Super simple function exception:', error);
    }

    // Method 2: Force create admin function (overwrites existing)
    let method2Error = '';
    if (!adminCreated) {
      try {
        // console.log('💪 Trying force create admin...');
        const { data: forceResult, error: forceError } = await supabase.rpc('force_create_admin', {
          admin_username: username,
          admin_email: email
        });

        if (forceError) {
          method2Error = `Function error: ${forceError.message} (Code: ${forceError.code})`;
          // console.warn('Force create function failed:', forceError);
        } else if (forceResult && typeof forceResult === 'string') {
          if (forceResult.startsWith('FORCED:')) {
            const idMatch = forceResult.match(/forced-admin-\d+/);
            userId = idMatch ? idMatch[0] : 'forced-admin';
            adminCreated = true;
            creationMethod = 'force_create_function';
            creationResult = forceResult;
            // console.log('✅ Force create admin succeeded:', forceResult);
          } else {
            method2Error = `Function returned: ${forceResult}`;
            // console.warn('Force create function returned error:', forceResult);
          }
        } else {
          method2Error = `Unexpected result type: ${typeof forceResult}`;
        }
      } catch (error) {
        method2Error = `Exception: ${error.message}`;
        // console.warn('Force create function exception:', error);
      }
    }

    // Method 3: Direct SQL insert (bypasses all functions)
    let method3Error = '';
    if (!adminCreated) {
      try {
        // console.log('⚡ Trying direct SQL insert...');
        
        // Use simple text ID instead of UUID to avoid any issues
        const directUserId = `direct-admin-${Date.now()}`;
        
        const { data: directResult, error: directError } = await supabase
          .from('user_profiles')
          .insert({
            id: directUserId,
            username: username,
            email: email,
            role: 'admin',
            is_active: true,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (directError) {
          method3Error = `Insert error: ${directError.message} (Code: ${directError.code || 'unknown'})`;
          // console.error('Direct SQL insert failed:', directError);
        } else {
          userId = directUserId;
          adminCreated = true;
          creationMethod = 'direct_sql_insert';
          creationResult = 'Direct SQL insert successful';
          // console.log('✅ Direct SQL insert succeeded');
        }
      } catch (error) {
        method3Error = `Exception: ${error.message}`;
        // console.error('Direct SQL insert exception:', error);
      }
    }

    // Method 4: Ultimate fallback - try Supabase Auth API (even though it's been failing)
    if (!adminCreated) {
      try {
        // console.log('🔄 Trying Supabase Auth API as absolute last resort...');
        
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName
          }
        });

        if (authError) {
          // console.error('Supabase Auth API failed (expected):', authError);
        } else if (authData.user) {
          // Try to create profile for auth user
          const { data: profileResult, error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authData.user.id,
              username: username,
              email: email,
              role: 'admin',
              is_active: true,
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (!profileError) {
            userId = authData.user.id;
            adminCreated = true;
            creationMethod = 'supabase_auth_api';
            creationResult = 'Supabase Auth + profile creation successful';
            // console.log('✅ Supabase Auth API unexpectedly succeeded');
          }
        }
      } catch (error) {
        // console.error('Supabase Auth API method failed (expected):', error);
      }
    }

    if (!adminCreated) {
      return c.json({
        success: false,
        error: 'ALL admin creation methods failed',
        details: 'Database setup is required - functions or table missing',
        specific_errors: {
          method1_super_simple: method1Error || 'Not attempted',
          method2_force_create: method2Error || 'Not attempted', 
          method3_direct_insert: method3Error || 'Not attempted',
          method4_supabase_auth: 'Not attempted due to previous failures'
        },
        instructions: [
          '1. IMMEDIATE FIX: Execute NUCLEAR_DATABASE_SETUP.sql in Supabase SQL editor',
          '2. Alternative: Run manually: SELECT create_admin_super_simple(\'admin\', \'admin@yourcompany.com\');',
          '3. Emergency: Run: SELECT emergency_admin_insert();',
          '4. Last resort: INSERT INTO user_profiles (id, username, email, role, is_active, created_at) VALUES (\'manual-admin\', \'admin\', \'admin@yourcompany.com\', \'admin\', true, now()::text);'
        ],
        database_diagnostics: {
          timestamp: new Date().toISOString(),
          attempted_methods: ['super_simple_function', 'force_create_function', 'direct_sql_insert'],
          database_connection: 'active',
          service_role_available: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
          supabase_url: !!Deno.env.get('SUPABASE_URL'),
          functions_attempted: 2,
          direct_insert_attempted: true
        },
        next_steps: [
          'The database setup script (NUCLEAR_DATABASE_SETUP.sql) has not been executed',
          'This script creates the user_profiles table and required functions',
          'Without this setup, admin creation cannot work',
          'Execute the script immediately to resolve all issues'
        ]
      }, 500);
    }

    // console.log('✅ Admin user created successfully using:', creationMethod);

    // Create audit log (best effort)
    try {
      await createAuditLog(
        userId,
        'initial_admin_created',
        'admin_users',
        userId,
        { username, email, fullName, setup: true, method: creationMethod, result: creationResult }
      );
    } catch (auditError) {
      // console.warn('Audit log creation failed (non-critical):', auditError);
    }

    return c.json({
      success: true,
      message: 'Initial admin user created successfully',
      method: creationMethod,
      result: creationResult,
      user: {
        id: userId,
        username: username,
        email: email,
        role: 'admin'
      },
      notes: creationMethod.includes('simple') || creationMethod.includes('force') || creationMethod.includes('direct')
        ? 'Profile created successfully - user will need Supabase Auth account for login'
        : 'User can login immediately'
    });

  } catch (error) {
    // console.error('Ultimate admin creation error:', error);

    return c.json({
      success: false,
      error: 'Failed to create initial admin user',
      details: error.message,
      timestamp: new Date().toISOString(),
      critical_instruction: 'Execute ULTIMATE_ADMIN_CREATION_FIX.sql immediately to resolve all issues'
    }, 500);
  }
});

// Admin user management endpoints with simplified user_profiles table
app.get('/make-server-228aa219/admin/users', requireAuth, requireAdmin, async (c) => {
  try {
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return c.json({ users });
  } catch (error) {
    // console.error('Failed to load users:', error);
    return c.json({ 
      error: 'Failed to load users', 
      details: error.message 
    }, 500);
  }
});

// Create new user (admin only)
app.post('/make-server-228aa219/admin/users', requireAuth, requireAdmin, async (c) => {
  try {
    const userData = await c.req.json();
    const currentUser = c.get('user');

    // Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: userData.username
      }
    });

    if (authError) {
      throw new Error(`Auth user creation failed: ${authError.message}`);
    }

    // Create profile in user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        id: authData.user.id, // Use same ID as Supabase Auth user
        username: userData.username,
        email: userData.email,
        role: userData.role,
        is_active: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    return c.json({ success: true, user: profile });
  } catch (error) {
    // console.error('User creation error:', error);
    return c.json({ 
      error: 'Failed to create user', 
      details: error.message 
    }, 500);
  }
});

// Update user (admin only)
app.put('/make-server-228aa219/admin/users/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const userId = c.req.param('id');
    const updates = await c.req.json();

    // Update profile in user_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .update({
        username: updates.username,
        role: updates.role,
        is_active: updates.is_active
      })
      .eq('id', userId)
      .select()
      .single();

    if (profileError) {
      throw new Error(`Profile update failed: ${profileError.message}`);
    }

    return c.json({ success: true, user: profile });
  } catch (error) {
    // console.error('User update error:', error);
    return c.json({ 
      error: 'Failed to update user', 
      details: error.message 
    }, 500);
  }
});

// Reset user password (admin only)
app.post('/make-server-228aa219/admin/users/:id/reset-password', requireAuth, requireAdmin, async (c) => {
  try {
    const userId = c.req.param('id');
    const { password } = await c.req.json();

    // Update password in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      password: password
    });

    if (authError) {
      throw new Error(`Password reset failed: ${authError.message}`);
    }

    return c.json({ success: true });
  } catch (error) {
    // console.error('Password reset error:', error);
    return c.json({ 
      error: 'Failed to reset password', 
      details: error.message 
    }, 500);
  }
});

// Delete user (admin only)
app.delete('/make-server-228aa219/admin/users/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const userId = c.req.param('id');
    const currentUser = c.get('user');

    if (currentUser.id === userId) {
      return c.json({ error: 'Cannot delete your own account' }, 400);
    }

    // Delete from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      throw new Error(`Auth user deletion failed: ${authError.message}`);
    }

    // Delete from user_profiles (may auto-cascade)
    await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    return c.json({ success: true });
  } catch (error) {
    // console.error('User deletion error:', error);
    return c.json({ 
      error: 'Failed to delete user', 
      details: error.message 
    }, 500);
  }
});

// Login endpoint
app.post('/make-server-228aa219/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ 
        success: false, 
        error: 'Username and password are required' 
      }, 400);
    }

    // console.log('🔐 Login attempt for:', username);

    // Look up user by username or email
    let email = username;
    let userProfile = null;

    // If it's not an email, look up by username
    if (!username.includes('@')) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (profileError || !profile) {
        // console.log('🔐 Username not found:', username);
        return c.json({ 
          success: false, 
          error: 'Invalid username or password' 
        }, 401);
      }

      email = profile.email;
      userProfile = profile;
    } else {
      // Look up by email
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (profileError || !profile) {
        // console.log('🔐 Email not found:', email);
        return c.json({ 
          success: false, 
          error: 'Invalid username or password' 
        }, 401);
      }

      userProfile = profile;
    }

    // Attempt to sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (authError || !authData.user || !authData.session) {
      // console.log('🔐 Authentication failed for:', email, authError?.message);
      
      // Don't expose specific auth errors to prevent user enumeration
      return c.json({ 
        success: false, 
        error: 'Invalid username or password' 
      }, 401);
    }

    // Update last login (optional - user_profiles may not have this field)
    try {
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userProfile.id);
    } catch (error) {
      // Ignore if last_login field doesn't exist
    }

    // Log successful login
    await createAuditLog(
      userProfile.id, 
      'user_login', 
      'auth',
      userProfile.id,
      { username: userProfile.username, email: userProfile.email }
    );

    // console.log('✅ Login successful for:', userProfile.username);

    // Return successful login response
    return c.json({
      success: true,
      user: {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        role: userProfile.role,
        isActive: userProfile.is_active
      },
      sessionToken: authData.session.access_token,
      expiresAt: authData.session.expires_at
    });

  } catch (error) {
    // console.error('Login endpoint error:', error);
    return c.json({ 
      success: false, 
      error: 'Login service temporarily unavailable' 
    }, 500);
  }
});

// Authentication middleware - using existing middleware at line 2459

// Test authentication endpoint
app.post('/make-server-228aa219/auth/test', requireAuth, async (c) => {
  const user = c.get('user');
  return c.json({ 
    success: true, 
    message: 'Authentication successful',
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

// Get all users (Admin only)
app.get('/make-server-228aa219/auth/users', requireAuth, requireAdmin, async (c) => {
  try {
    const { data: users, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // console.error('Error fetching users:', error);
      return c.json({ error: 'Failed to load users' }, 500);
    }

    // Transform user data for client
    const transformedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active,
      forcePasswordChange: user.force_password_change || false,
      lastLogin: user.last_login,
      loginAttempts: user.login_attempts || 0,
      lockedUntil: user.locked_until,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    return c.json({ users: transformedUsers });
  } catch (error) {
    // console.error('Users endpoint error:', error);
    return c.json({ error: 'Failed to load users' }, 500);
  }
});

// Create new user (Admin only)
app.post('/make-server-228aa219/auth/users', requireAuth, requireAdmin, async (c) => {
  try {
    const currentUser = c.get('user');
    const userData = await c.req.json();

    // Validate required fields
    if (!userData.username || !userData.email || !userData.password || !userData.fullName) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Check if username or email already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id, username, email')
      .or(`username.eq.${userData.username},email.eq.${userData.email}`)
      .single();

    if (existingUser) {
      if (existingUser.username === userData.username) {
        return c.json({ error: 'Username already exists' }, 400);
      }
      if (existingUser.email === userData.email) {
        return c.json({ error: 'Email already exists' }, 400);
      }
    }

    // Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.fullName
      }
    });

    if (authError || !authData.user) {
      // console.error('Auth user creation error:', authError);
      return c.json({ error: authError?.message || 'Failed to create auth user' }, 500);
    }

    // Create profile in admin_users table
    const { data: profile, error: profileError } = await supabase
      .from('admin_users')
      .insert([{
        id: authData.user.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.fullName,
        phone: userData.phone,
        role: userData.role || 'user',
        is_active: true,
        force_password_change: userData.forcePasswordChange || false,
        created_by: currentUser.id
      }])
      .select()
      .single();

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      // console.error('Profile creation error:', profileError);
      return c.json({ error: profileError.message }, 500);
    }

    // Log action
    await createAuditLog(
      currentUser.id,
      'user_created',
      'admin_users',
      authData.user.id,
      { username: userData.username, email: userData.email, role: userData.role }
    );

    // Transform response
    const responseUser = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      fullName: profile.full_name,
      phone: profile.phone,
      role: profile.role,
      isActive: profile.is_active,
      forcePasswordChange: profile.force_password_change,
      lastLogin: profile.last_login,
      loginAttempts: profile.login_attempts || 0,
      lockedUntil: profile.locked_until,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };

    return c.json({ user: responseUser });
  } catch (error) {
    // console.error('User creation error:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Update user (Admin only)
app.put('/make-server-228aa219/auth/users/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const currentUser = c.get('user');
    const userId = c.req.param('id');
    const updateData = await c.req.json();

    // Get existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !existingUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Prevent self-modification of critical fields
    if (currentUser.id === userId) {
      if (updateData.role !== undefined && updateData.role !== existingUser.role) {
        return c.json({ error: 'Cannot change your own role' }, 400);
      }
      if (updateData.isActive !== undefined && !updateData.isActive) {
        return c.json({ error: 'Cannot deactivate your own account' }, 400);
      }
    }

    // Check for username/email conflicts (if being updated)
    if (updateData.username && updateData.username !== existingUser.username) {
      const { data: usernameConflict } = await supabase
        .from('admin_users')
        .select('id')
        .eq('username', updateData.username)
        .neq('id', userId)
        .single();

      if (usernameConflict) {
        return c.json({ error: 'Username already exists' }, 400);
      }
    }

    if (updateData.email && updateData.email !== existingUser.email) {
      const { data: emailConflict } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', updateData.email)
        .neq('id', userId)
        .single();

      if (emailConflict) {
        return c.json({ error: 'Email already exists' }, 400);
      }
    }

    // Prepare update object
    const updateFields = {
      updated_at: new Date().toISOString()
    };

    if (updateData.username !== undefined) updateFields.username = updateData.username;
    if (updateData.email !== undefined) updateFields.email = updateData.email;
    if (updateData.fullName !== undefined) updateFields.full_name = updateData.fullName;
    if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
    if (updateData.role !== undefined) updateFields.role = updateData.role;
    if (updateData.isActive !== undefined) updateFields.is_active = updateData.isActive;
    if (updateData.forcePasswordChange !== undefined) updateFields.force_password_change = updateData.forcePasswordChange;

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('admin_users')
      .update(updateFields)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      // console.error('Profile update error:', updateError);
      return c.json({ error: updateError.message }, 500);
    }

    // Update Supabase Auth user if email changed
    if (updateData.email && updateData.email !== existingUser.email) {
      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(userId, {
        email: updateData.email
      });

      if (authUpdateError) {
        // console.warn('Auth email update failed:', authUpdateError.message);
        // Don't fail the entire operation for this
      }
    }

    // Log action
    await createAuditLog(
      currentUser.id,
      'user_updated',
      'admin_users',
      userId,
      { 
        updatedFields: Object.keys(updateFields).filter(key => key !== 'updated_at'),
        oldUsername: existingUser.username,
        newUsername: updateData.username || existingUser.username
      }
    );

    // Transform response
    const responseUser = {
      id: updatedProfile.id,
      username: updatedProfile.username,
      email: updatedProfile.email,
      fullName: updatedProfile.full_name,
      phone: updatedProfile.phone,
      role: updatedProfile.role,
      isActive: updatedProfile.is_active,
      forcePasswordChange: updatedProfile.force_password_change,
      lastLogin: updatedProfile.last_login,
      loginAttempts: updatedProfile.login_attempts || 0,
      lockedUntil: updatedProfile.locked_until,
      createdAt: updatedProfile.created_at,
      updatedAt: updatedProfile.updated_at
    };

    return c.json({ user: responseUser });
  } catch (error) {
    // console.error('User update error:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Delete user (Admin only)
app.delete('/make-server-228aa219/auth/users/:id', requireAuth, requireAdmin, async (c) => {
  try {
    const currentUser = c.get('user');
    const userId = c.req.param('id');

    // Prevent self-deletion
    if (currentUser.id === userId) {
      return c.json({ error: 'Cannot delete your own account' }, 400);
    }

    // Get user info for logging
    const { data: userToDelete } = await supabase
      .from('admin_users')
      .select('username, email')
      .eq('id', userId)
      .single();

    // Delete from Supabase Auth first
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      // console.error('Auth user deletion error:', authError);
      return c.json({ error: authError.message }, 500);
    }

    // Delete from admin_users (may auto-cascade depending on FK setup)
    const { error: profileError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userId);

    if (profileError) {
      // console.error('Profile deletion error:', profileError);
      // Auth user is already deleted, but log the profile error
    }

    // Log action
    await createAuditLog(
      currentUser.id,
      'user_deleted',
      'admin_users',
      userId,
      { username: userToDelete?.username, email: userToDelete?.email }
    );

    return c.json({ success: true });
  } catch (error) {
    // console.error('User deletion error:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// Create missing user profile (for authenticated users) - Enhanced version
app.post('/make-server-228aa219/auth/ensure-profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authorization header required' }, 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the user with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return c.json({ error: 'Invalid authentication token' }, 401);
    }

    // console.log('🔐 Enhanced: Ensuring profile exists for user:', user.id, user.email);

    // Use the ULTIMATE RLS-safe function
    try {
      const { data: profileResult, error: ensureError } = await supabase
        .rpc('ensure_user_profile_ultimate', { 
          user_id_param: user.id,
          user_email_param: user.email,
          user_metadata: user.user_metadata || {}
        });

      if (ensureError) {
        // console.error('ULTIMATE ensure profile function error:', ensureError);
        throw ensureError;
      }

      if (profileResult && profileResult.length > 0) {
        const profileData = profileResult[0];
        // console.log('✅ ULTIMATE: Profile ensured for user:', user.id, 'Created:', profileData.created);
        
        return c.json({ 
          profile: {
            id: profileData.id,
            username: profileData.username,
            email: profileData.email,
            fullName: profileData.full_name,
            role: profileData.role,
            forcePasswordChange: profileData.force_password_change || false
          },
          created: profileData.created
        });
      }
    } catch (enhancedError) {
      // console.warn('ULTIMATE profile function failed, using fallback:', enhancedError);
    }

    // Fallback to ULTIMATE profile loading
    try {
      const { data: enhancedProfile, error: enhancedError } = await supabase
        .rpc('get_user_profile_ultimate', { user_id_param: user.id });

      if (!enhancedError && enhancedProfile && enhancedProfile.length > 0) {
        const profileData = enhancedProfile[0];
        // console.log('✅ ULTIMATE: Profile found using ULTIMATE function for user:', user.id);
        return c.json({ 
          profile: {
            id: profileData.id,
            username: profileData.username,
            email: profileData.email,
            fullName: profileData.full_name,
            role: profileData.role,
            forcePasswordChange: profileData.force_password_change || false
          },
          created: false
        });
      }
    } catch (enhancedError) {
      // console.warn('ULTIMATE profile loading failed:', enhancedError);
    }

    // Last resort: try the old safe function
    try {
      const { data: safeProfile, error: safeError } = await supabase
        .rpc('get_user_profile_safe', { user_id: user.id });

      if (!safeError && safeProfile && safeProfile.length > 0) {
        const profileData = safeProfile[0];
        // console.log('✅ Profile found using old safe function for user:', user.id);
        return c.json({ 
          profile: {
            id: profileData.id,
            username: profileData.username,
            email: profileData.email,
            fullName: profileData.full_name,
            role: profileData.role,
            forcePasswordChange: profileData.force_password_change || false
          },
          created: false
        });
      }
    } catch (safeError) {
      // console.warn('Old safe function also failed:', safeError);
    }

    // Emergency fallback: create profile directly with admin privileges
    // console.warn('🚨 All profile functions failed, creating emergency profile for user:', user.id);
    
    const username = user.email?.split('@')[0] || 'user';
    const fullName = user.user_metadata?.full_name || username || 'User';
    
    const { data: newProfile, error: createError } = await supabase
      .from('admin_users')
      .insert([{
        id: user.id,
        username: username,
        email: user.email || '',
        password_hash: 'SUPABASE_AUTH', // Special marker
        salt: 'SUPABASE_AUTH',
        full_name: fullName,
        role: 'admin', // Default to admin role
        is_active: true,
        force_password_change: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      // console.error('Emergency profile creation error:', createError);
      
      // Handle duplicate key error - profile already exists
      if (createError.code === '23505') {
        // console.log('Profile already exists (duplicate key), trying to fetch existing profile');
        
        // Try to fetch the existing profile using safe function
        try {
          const { data: existingSafeProfile, error: safeError } = await supabase
            .rpc('get_user_profile_safe', { user_id: user.id });

          if (!safeError && existingSafeProfile && existingSafeProfile.length > 0) {
            const profileData = existingSafeProfile[0];
            return c.json({ 
              profile: {
                id: profileData.id,
                username: profileData.username,
                email: profileData.email,
                fullName: profileData.full_name,
                role: profileData.role,
                forcePasswordChange: profileData.force_password_change || false
              },
              created: false,
              message: 'Profile already existed'
            });
          }
        } catch (safeError) {
          // console.error('Safe function failed after duplicate key:', safeError);
        }
        
        return c.json({ 
          error: 'Profile already exists but cannot be accessed due to database permissions',
          details: 'Please contact administrator to resolve authentication issues'
        }, 409);
      }
      
      return c.json({ error: 'Failed to create user profile', details: createError.message }, 500);
    }

    // console.log('✅ Created new profile for user:', user.id);

    return c.json({ 
      profile: {
        id: newProfile.id,
        username: newProfile.username,
        email: newProfile.email,
        fullName: newProfile.full_name,
        role: newProfile.role,
        forcePasswordChange: newProfile.force_password_change || false
      },
      created: true
    });

  } catch (error) {
    // console.error('Ensure profile error:', error);
    return c.json({ error: 'Failed to ensure user profile', details: error.message }, 500);
  }
});

// Reset user password (Admin only)
app.post('/make-server-228aa219/auth/users/:id/reset-password', requireAuth, requireAdmin, async (c) => {
  try {
    const currentUser = c.get('user');
    const userId = c.req.param('id');
    const { newPassword } = await c.req.json();

    if (!newPassword || newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters long' }, 400);
    }

    // Update password in Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (authError) {
      // console.error('Password reset error:', authError);
      return c.json({ error: authError.message }, 500);
    }

    // Update force_password_change flag
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ 
        force_password_change: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      // console.warn('Failed to set force_password_change flag:', updateError);
    }

    // Log action
    await createAuditLog(
      currentUser.id,
      'password_reset',
      'admin_users',
      userId
    );

    return c.json({ success: true });
  } catch (error) {
    // console.error('Password reset error:', error);
    return c.json({ error: 'Failed to reset password' }, 500);
  }
});

// ===== SCENARIO ENDPOINTS =====

// Load scenarios
app.get('/make-server-228aa219/scenarios', async (c) => {
  try {
    // console.log('🚀 Server: Loading scenarios from simulator_submissions table...');
    
    const { data: scenarios, error } = await supabase
      .from('simulator_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      // console.error('❌ Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    // console.log('✅ Server: Successfully loaded scenarios:', { scenariosCount: scenarios?.length || 0 });
    
    return c.json({
      scenarios: (scenarios || []).map(scenario => ({
        scenarioId: scenario.id,
        submissionCode: scenario.submission_code,
        clientName: scenario.client_name || 'Unknown Client',
        projectName: scenario.project_name || 'Unknown Project',
        preparedBy: scenario.prepared_by || 'Unknown',
        createdAt: scenario.created_at,
        status: scenario.status,
        itemCount: Array.isArray(scenario.selected_services) ? scenario.selected_services.length : 0,
        oneTimeTotal: scenario.cost_summary?.oneTimeTotal || 0,
        monthlyTotal: scenario.cost_summary?.monthlyTotal || 0,
        totalProjectCost: scenario.cost_summary?.totalProjectCost || 0,
        globalDiscount: scenario.global_discount || 0,
        globalDiscountType: scenario.global_discount_type || 'percentage',
        globalDiscountApplication: scenario.global_discount_application || 'none',
        summary: scenario.cost_summary || {
          oneTimeTotal: 0,
          monthlyTotal: 0,
          yearlyTotal: 0,
          totalProjectCost: 0
        }
      }))
    });
  } catch (error) {
    // console.error('❌ Server: Failed to load scenarios:', error);
    return c.json({
      scenarios: [],
      error: 'Failed to load scenarios',
      details: error.message
    }, 500);
  }
});

// Save scenario data (with rate limiting and input sanitization)
app.post('/make-server-228aa219/scenarios', userRateLimiter, async (c) => {
  try {
    const ip = getRealIP(c);
    const userId = c.req.header('x-user-id') || 'unknown';
    // console.log(`🚀 Server: Saving scenario from user: ${userId}, IP: ${ip}`);
    
    const scenarioData = await c.req.json();
    
    // Sanitize config object
    const sanitizedConfig = sanitizeObject(scenarioData.config || {});
    
    // Sanitize selected items
    const sanitizedSelectedItems = sanitizeObject(scenarioData.selectedItems || []);
    
    // Sanitize categories
    const sanitizedCategories = sanitizeObject(scenarioData.categories || []);
    
    // console.log('🧹 Input sanitization completed for authenticated scenario');
    
    // Prepare submission data for the database
    const submissionData = {
      user_id: scenarioData.userId,  // UUID, no sanitization needed
      client_name: sanitizeString(sanitizedConfig.clientName || 'Unknown', 200),
      project_name: sanitizeString(sanitizedConfig.projectName || 'Unknown', 200),
      prepared_by: sanitizeString(sanitizedConfig.preparedBy || 'Unknown', 200),
      status: 'submitted',
      
      // Store sanitized configuration as JSONB
      client_configuration: sanitizedConfig,
      
      // Store sanitized selected items as JSONB
      selected_services: sanitizedSelectedItems,
      
      // Store discount settings (validated)
      global_discount: typeof scenarioData.globalDiscount === 'number' ? scenarioData.globalDiscount : 0,
      global_discount_type: ['percentage', 'fixed'].includes(scenarioData.globalDiscountType) 
        ? scenarioData.globalDiscountType 
        : 'percentage',
      global_discount_application: ['none', 'both', 'monthly', 'onetime'].includes(scenarioData.globalDiscountApplication)
        ? scenarioData.globalDiscountApplication
        : 'none',
      
      // Store summary as JSONB
      cost_summary: scenarioData.summary || {
        oneTimeTotal: 0,
        monthlyTotal: 0,
        yearlyTotal: 0,
        totalProjectCost: 0
      }
    };
    
    // console.log('💾 Inserting submission with user_id:', submissionData.user_id);
    // console.log('💾 Inserting submission:', {
      userId: submissionData.user_id,
      clientName: submissionData.client_name,
      projectName: submissionData.project_name,
      servicesCount: submissionData.selected_services.length
    });
    
    const { data, error } = await supabase
      .from('simulator_submissions')
      .insert(submissionData)
      .select()
      .single();
    
    if (error) {
      // console.error('❌ Database insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        submissionDataKeys: Object.keys(submissionData)
      });
      throw new Error(`Database error: ${error.message}${error.details ? ` | Details: ${error.details}` : ''}${error.hint ? ` | Hint: ${error.hint}` : ''}`);
    }
    
    // console.log('✅ Server: Scenario saved successfully to simulator_submissions:', { 
      id: data.id,
      clientName: data.client_name,
      projectName: data.project_name
    });
    
    return c.json({
      success: true,
      scenarioId: data.id,
      message: 'Scenario saved successfully',
      data: {
        id: data.id,
        clientName: data.client_name,
        projectName: data.project_name,
        preparedBy: data.prepared_by,
        createdAt: data.created_at
      }
    });
  } catch (error) {
    // console.error('❌ Server: Failed to save scenario:', error);
    return c.json({
      success: false,
      error: 'Failed to save scenario',
      details: error.message
    }, 500);
  }
});

// Get scenario data by ID
app.get('/make-server-228aa219/scenarios/:id', async (c) => {
  try {
    const scenarioId = c.req.param('id');
    // console.log(`🚀 Server: Loading scenario data for ID: ${scenarioId}`);
    
    const { data: scenario, error } = await supabase
      .from('simulator_submissions')
      .select('*')
      .eq('id', scenarioId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // console.warn(`Scenario not found: ${scenarioId}`);
        return c.json({ error: 'Scenario not found' }, 404);
      }
      // console.error('❌ Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!scenario) {
      // console.warn(`Scenario not found: ${scenarioId}`);
      return c.json({ error: 'Scenario not found' }, 404);
    }
    
    // console.log('✅ Server: Successfully loaded scenario:', { 
      id: scenario.id,
      clientName: scenario.client_name,
      projectName: scenario.project_name
    });
    
    // Return scenario data in the format expected by the PDF generator
    return c.json({
      scenario: {
        config: scenario.client_configuration || {},
        selectedItems: scenario.selected_services || [],
        categories: [], // Categories are not stored in scenario, will be loaded separately
        globalDiscount: scenario.global_discount || 0,
        globalDiscountType: scenario.global_discount_type || 'percentage',
        globalDiscountApplication: scenario.global_discount_application || 'none',
        summary: scenario.cost_summary || {
          oneTimeTotal: 0,
          monthlyTotal: 0,
          yearlyTotal: 0,
          totalProjectCost: 0
        }
      }
    });
  } catch (error) {
    // console.error(`❌ Server: Failed to load scenario:`, error);
    return c.json({
      error: 'Failed to load scenario',
      details: error.message
    }, 500);
  }
});

// Save guest scenario data (with rate limiting and input sanitization)
app.post('/make-server-228aa219/guest-scenarios', guestRateLimiter, async (c) => {
  try {
    const ip = getRealIP(c);
    // console.log('🚀 Server: Saving guest scenario from IP:', ip);
    
    const requestData = await c.req.json();
    
    // Extract and sanitize all string inputs
    const sessionId = requestData.sessionId; // UUID, no sanitization needed
    const email = sanitizeString(requestData.email, 255);
    const phoneNumber = sanitizeString(requestData.phoneNumber, 20);
    const firstName = sanitizeString(requestData.firstName, 100);
    const lastName = sanitizeString(requestData.lastName, 100);
    const companyName = sanitizeString(requestData.companyName, 200);
    const scenarioName = sanitizeString(requestData.scenarioName, 500);
    
    // Sanitize complex objects
    const config = sanitizeObject(requestData.config || {});
    const selectedItems = sanitizeObject(requestData.selectedItems || []);
    const categories = sanitizeObject(requestData.categories || []);
    
    // Numbers and enums - validate but don't sanitize
    const globalDiscount = typeof requestData.globalDiscount === 'number' ? requestData.globalDiscount : 0;
    const globalDiscountType = ['percentage', 'fixed'].includes(requestData.globalDiscountType) 
      ? requestData.globalDiscountType 
      : 'percentage';
    const globalDiscountApplication = ['none', 'both', 'monthly', 'onetime'].includes(requestData.globalDiscountApplication)
      ? requestData.globalDiscountApplication
      : 'none';
    const summary = requestData.summary || {};
    
    // console.log('🧹 Input sanitization completed for guest scenario');
    
    // Validate required fields
    if (!email || !phoneNumber || !firstName || !lastName || !companyName) {
      return c.json({ error: 'Missing required contact information' }, 400);
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      // console.warn('⚠️ Invalid email format attempted:', email);
      return c.json({ error: 'Invalid email format' }, 400);
    }
    
    // Validate phone format
    if (!isValidPhone(phoneNumber)) {
      // console.warn('⚠️ Invalid phone number format attempted:', phoneNumber);
      return c.json({ error: 'Invalid phone number format' }, 400);
    }
    
    // Generate submission code
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const submissionCode = `ISS-${dateStr}-${randomChars}`;
    
    // Prepare scenario data as JSONB
    const scenarioData = {
      config: config || {},
      selectedItems: selectedItems || [],
      categories: categories || [],
      globalDiscount: globalDiscount || 0,
      globalDiscountType: globalDiscountType || 'percentage',
      globalDiscountApplication: globalDiscountApplication || 'none',
      summary: summary || {}
    };
    
    // Extract user agent from headers
    const userAgent = c.req.header('user-agent') || 'unknown';
    
    // console.log('💾 Inserting guest scenario with submission code:', submissionCode);
    // console.log('📊 Session tracking:', {
      sessionId: sessionId || 'none',
      ip,
      userAgent: userAgent.substring(0, 50) + '...'
    });
    
    // Insert into guest_scenarios table with session tracking
    const { data, error } = await supabase
      .from('guest_scenarios')
      .insert({
        submission_code: submissionCode,
        session_id: sessionId,
        ip_address: ip,
        user_agent: userAgent,
        email,
        phone_number: phoneNumber,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        scenario_name: scenarioName || `${companyName} - ${config?.projectName || 'Quote'}`,
        scenario_data: scenarioData,
        total_price: summary?.totalProjectCost || 0,
        status: 'submitted'
      })
      .select()
      .single();
    
    if (error) {
      // console.error('❌ Database error:', error);
      return c.json({ error: error.message }, 500);
    }
    
    // console.log('✅ Guest scenario saved:', {
      id: data.id,
      submissionCode: submissionCode,
      email: email,
      company: companyName
    });
    
    return c.json({ 
      success: true, 
      submissionCode: submissionCode,
      scenarioId: data.id 
    });
    
  } catch (error: any) {
    // console.error('❌ Server: Failed to save guest scenario:', error);
    return c.json({ error: error.message || 'Failed to save guest scenario' }, 500);
  }
});

// Get guest submissions
app.get('/make-server-228aa219/guest-submissions', async (c) => {
  try {
    // console.log('📥 Server: Loading guest submissions...');
    
    const { data: submissions, error } = await supabase
      .from('guest_scenarios')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      // console.error('❌ Database error:', error);
      throw error;
    }
    
    const formattedSubmissions = (submissions || []).map(sub => ({
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
      scenario_data: sub.scenario_data || {} // Include full scenario data for dialog display
    }));
    
    // console.log(`✅ Server: Loaded ${formattedSubmissions.length} guest submissions`);
    
    return c.json({ submissions: formattedSubmissions });
  } catch (error: any) {
    // console.error('❌ Server: Failed to load guest submissions:', error);
    return c.json({ 
      error: 'Failed to load guest submissions',
      details: error.message 
    }, 500);
  }
});

// Get guest submission by ID
app.get('/make-server-228aa219/guest-submissions/:id', async (c) => {
  try {
    const submissionId = c.req.param('id');
    // console.log(`📥 Server: Loading guest submission data for ID: ${submissionId}`);
    
    const { data: submission, error } = await supabase
      .from('guest_scenarios')
      .select('*')
      .eq('id', submissionId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // console.warn(`Guest submission not found: ${submissionId}`);
        return c.json({ error: 'Guest submission not found' }, 404);
      }
      // console.error('❌ Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!submission) {
      // console.warn(`Guest submission not found: ${submissionId}`);
      return c.json({ error: 'Guest submission not found' }, 404);
    }
    
    // console.log('✅ Server: Successfully loaded guest submission:', { 
      id: submission.id,
      email: submission.email,
      company: submission.company_name
    });
    
    // Return submission data in the format expected by the PDF generator
    return c.json({
      submission: {
        id: submission.id,
        submissionCode: submission.submission_code,
        firstName: submission.first_name,
        lastName: submission.last_name,
        email: submission.email,
        phoneNumber: submission.phone_number,
        companyName: submission.company_name,
        scenarioName: submission.scenario_name,
        totalPrice: submission.total_price || 0,
        status: submission.status || 'submitted',
        createdAt: submission.created_at,
        scenarioData: submission.scenario_data,
        config: submission.scenario_data?.config || {},
        selectedItems: submission.scenario_data?.selectedItems || [],
        categories: submission.scenario_data?.categories || [],
        globalDiscount: submission.scenario_data?.globalDiscount || 0,
        globalDiscountType: submission.scenario_data?.globalDiscountType || 'percentage',
        globalDiscountApplication: submission.scenario_data?.globalDiscountApplication || 'none',
        summary: submission.scenario_data?.summary || {
          oneTimeTotal: 0,
          monthlyTotal: 0,
          yearlyTotal: 0,
          totalProjectCost: 0
        }
      }
    });
  } catch (error: any) {
    // console.error(`❌ Server: Failed to load guest submission:`, error);
    return c.json({
      error: 'Failed to load guest submission',
      details: error.message
    }, 500);
  }
});

// Get specific scenario data
app.get('/make-server-228aa219/scenarios/:id', async (c) => {
  try {
    const scenarioId = c.req.param('id');
    // console.log('🚀 Server: Loading scenario data for ID:', scenarioId);
    
    const scenarioData = await kv.get(scenarioId);
    
    if (!scenarioData) {
      return c.json({
        error: 'Scenario not found',
        details: `No scenario found with ID: ${scenarioId}`
      }, 404);
    }
    
    // console.log('✅ Server: Successfully loaded scenario data:', { scenarioId });
    
    return c.json(scenarioData);
  } catch (error) {
    // console.error('❌ Server: Failed to load scenario data:', error);
    return c.json({
      error: 'Failed to load scenario data',
      details: error.message
    }, 500);
  }
});

// Get scenario history (alternative endpoint for getAllScenarios)
app.get('/make-server-228aa219/scenario/history', async (c) => {
  try {
    // console.log('🚀 Server: Loading scenario history...');
    
    const scenarios = await kv.getByPrefix('scenario_');
    
    // console.log('✅ Server: Successfully loaded scenario history:', { scenariosCount: scenarios.length });
    
    return c.json({
      scenarios: scenarios.map(scenario => {
        const data = scenario.value;
        return {
          scenarioId: scenario.key,
          clientName: data.config?.clientName || 'Unknown Client',
          projectName: data.config?.projectName || 'Unknown Project',
          preparedBy: data.config?.preparedBy || 'Unknown',
          createdAt: data.createdAt || new Date().toISOString(),
          summary: data.summary || {
            oneTimeTotal: 0,
            monthlyTotal: 0,
            yearlyTotal: 0,
            totalProjectCost: 0
          }
        };
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  } catch (error) {
    // console.error('❌ Server: Failed to load scenario history:', error);
    return c.json({
      scenarios: [],
      error: 'Failed to load scenario history',
      details: error.message
    }, 500);
  }
});

// Create user with credentials (uses service role key)
app.post('/make-server-228aa219/auth/create-user-with-password', async (c) => {
  try {
    const { email, password, firstName, lastName, role } = await c.req.json();

    // Validate inputs
    if (!email || !password || !role) {
      return c.json({ error: 'Email, password, and role are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // console.log('Creating user with credentials:', email, role);

    // Create user in Supabase Auth (using service role key from server)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    });

    if (authError) {
      // console.error('Auth user creation failed:', authError);
      return c.json({ 
        error: 'Failed to create auth user', 
        details: authError.message 
      }, 500);
    }

    if (!authData.user) {
      return c.json({ error: 'User creation failed - no user returned' }, 500);
    }

    // Create profile in user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: firstName || null,
        last_name: lastName || null,
        role: role,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      // console.error('Profile creation failed:', profileError);
      
      // Try to clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return c.json({ 
        error: 'Failed to create user profile', 
        details: profileError.message 
      }, 500);
    }

    // console.log('User created successfully:', authData.user.id);

    return c.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role
      }
    });

  } catch (error) {
    // console.error('Create user endpoint error:', error);
    return c.json({ 
      error: 'Failed to create user', 
      details: error.message 
    }, 500);
  }
});

// Start the server
// console.log('🚀 Server starting...');
// console.log('✅ Rate limiting configured');
// console.log('✅ CORS configured');
// console.log('✅ Guest session tracking configured');
// console.log('🌐 Server ready to accept requests');

Deno.serve(app.fetch);