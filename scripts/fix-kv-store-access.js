#!/usr/bin/env node

/**
 * Fix KV Store Access Issues
 * 
 * This script applies the RLS policies for the kv_store table to resolve 406 errors
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // console.error('❌ Missing required environment variables:');
  // console.error('   VITE_SUPABASE_URL:', !!supabaseUrl);
  // console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSPolicies() {
  // console.log('🔧 Applying RLS policies for kv_store table...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250113000002_fix_kv_store_rls.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // console.error('❌ Failed to apply RLS policies:', error.message);
      return false;
    }
    
    // console.log('✅ RLS policies applied successfully');
    return true;
  } catch (err) {
    // console.error('❌ Error applying RLS policies:', err.message);
    return false;
  }
}

async function testKVStoreAccess() {
  // console.log('🧪 Testing kv_store table access...');
  
  try {
    // Test reading from kv_store
    const { data, error } = await supabase
      .from('kv_store')
      .select('key, value')
      .limit(1);
    
    if (error) {
      // console.error('❌ Failed to read from kv_store:', error.message);
      return false;
    }
    
    // console.log('✅ Successfully read from kv_store table');
    
    // Test writing to kv_store
    const testKey = `test_${Date.now()}`;
    const testValue = { test: true, timestamp: new Date().toISOString() };
    
    const { error: insertError } = await supabase
      .from('kv_store')
      .upsert({
        key: testKey,
        value: testValue
      });
    
    if (insertError) {
      // console.error('❌ Failed to write to kv_store:', insertError.message);
      return false;
    }
    
    // console.log('✅ Successfully wrote to kv_store table');
    
    // Clean up test data
    await supabase
      .from('kv_store')
      .delete()
      .eq('key', testKey);
    
    // console.log('✅ Successfully deleted test data from kv_store table');
    
    return true;
  } catch (err) {
    // console.error('❌ Error testing kv_store access:', err.message);
    return false;
  }
}

async function main() {
  // console.log('🚀 Starting kv_store access fix...\n');
  
  // Apply RLS policies
  const policiesApplied = await applyRLSPolicies();
  if (!policiesApplied) {
    // console.error('❌ Failed to apply RLS policies. Exiting.');
    process.exit(1);
  }
  
  // console.log('');
  
  // Test access
  const accessWorking = await testKVStoreAccess();
  if (!accessWorking) {
    // console.error('❌ kv_store access test failed. Please check your database configuration.');
    process.exit(1);
  }
  
  // console.log('\n🎉 kv_store access fix completed successfully!');
  // console.log('   The 406 errors should now be resolved.');
}

main().catch((error) => {
  // console.error('❌ Script failed:', error.message);
  process.exit(1);
});
