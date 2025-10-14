/**
 * Database Schema Verification Script
 * 
 * Verifies that required database tables and columns exist
 * Run this before starting the application
 */

import { supabase } from '../supabase/client';
import { DatabaseConnectionError } from '../errors/InfrastructureError';

export interface SchemaVerificationResult {
  success: boolean;
  tables: {
    pricing_items: boolean;
    categories: boolean;
  };
  errors: string[];
}

/**
 * Verify database schema
 */
export async function verifyDatabaseSchema(): Promise<SchemaVerificationResult> {
  // Verifying database schema...
  
  const result: SchemaVerificationResult = {
    success: true,
    tables: {
      pricing_items: false,
      categories: false,
    },
    errors: [],
  };

  try {
    // Check pricing_items table
    try {
      const { data: pricingItems, error: pricingError } = await supabase
        .from('pricing_items')
        .select('id, name, base_price, currency, category_id')
        .limit(1);

      if (pricingError) {
        result.errors.push(`pricing_items table error: ${pricingError.message}`);
        result.success = false;
      } else {
        result.tables.pricing_items = true;
        // // console.log('✅ pricing_items table accessible');
      }
    } catch (error) {
      result.errors.push(`pricing_items table missing or inaccessible: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
    }

    // Check categories table
    try {
      const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, order')
        .limit(1);

      if (categoryError) {
        result.errors.push(`categories table error: ${categoryError.message}`);
        result.success = false;
      } else {
        result.tables.categories = true;
        // // console.log('✅ categories table accessible');
      }
    } catch (error) {
      result.errors.push(`categories table missing or inaccessible: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
    }

    // Check foreign key relationship
    if (result.tables.pricing_items && result.tables.categories) {
      try {
        const { data, error } = await supabase
          .from('pricing_items')
          .select(`
            id,
            name,
            categories (
              id,
              name
            )
          `)
          .limit(1);

        if (error) {
          result.errors.push(`Foreign key relationship error: ${error.message}`);
          result.success = false;
        } else {
          // // console.log('✅ Foreign key relationship working');
        }
      } catch (error) {
        result.errors.push(`Foreign key relationship failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.success = false;
      }
    }

    if (result.success) {
      // console.log('🎉 Database schema verification completed successfully');
    } else {
      // console.error('❌ Database schema verification failed:');
      result.errors.forEach(error => {
        // console.error(`  - ${error}`);
      });
    }

    return result;
  } catch (error) {
    const message = `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(message);
    result.success = false;
    // console.error('❌', message);
    return result;
  }
}

/**
 * Create required tables if they don't exist
 * This is a development helper - not for production
 */
export async function createRequiredTables(): Promise<void> {
  // // console.log('🔧 Creating required database tables...');
  
  try {
    // Note: In a real application, you would use Supabase migrations
    // This is just a development helper
    // // console.log('⚠️  Please ensure the following tables exist in your Supabase database:');
    // // console.log('');
    // // console.log('CREATE TABLE categories (');
    // // console.log('  id TEXT PRIMARY KEY,');
    // // console.log('  name TEXT NOT NULL,');
    // // console.log('  description TEXT,');
    // // console.log('  "order" INTEGER DEFAULT 0,');
    // // console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    // // console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    // // console.log(');');
    // // console.log('');
    // // console.log('CREATE TABLE pricing_items (');
    // // console.log('  id TEXT PRIMARY KEY,');
    // // console.log('  name TEXT NOT NULL,');
    // // console.log('  description TEXT,');
    // // console.log('  base_price DECIMAL NOT NULL,');
    // // console.log('  currency TEXT DEFAULT \'USD\',');
    // // console.log('  category_id TEXT REFERENCES categories(id),');
    // // console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    // // console.log('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    // // console.log(');');
    // // console.log('');
    // // console.log('Please run these SQL commands in your Supabase SQL editor.');
  } catch (error) {
    throw new DatabaseConnectionError(
      `Failed to create tables: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Run schema verification
 */
export async function runSchemaVerification(): Promise<void> {
  const result = await verifyDatabaseSchema();
  
  if (!result.success) {
    // // console.log('');
    // // console.log('🔧 Attempting to create required tables...');
    await createRequiredTables();
    
    // Try verification again
    const retryResult = await verifyDatabaseSchema();
    if (!retryResult.success) {
      throw new DatabaseConnectionError(
        `Database schema verification failed. Please check your database configuration.\nErrors: ${retryResult.errors.join(', ')}`
      );
    }
  }
}
