import { supabase } from '@/utils/supabase/client';

interface TableCheck {
  table: string;
  requiredColumns: string[];
}

const REQUIRED_TABLES: TableCheck[] = [
  {
    table: 'user_profiles',
    requiredColumns: ['id', 'email', 'role', 'created_at']
  },
  {
    table: 'user_invites',
    requiredColumns: ['id', 'email', 'role', 'invite_code', 'created_at']
  },
  {
    table: 'services',
    requiredColumns: ['id', 'name', 'category', 'default_price', 'simulator_id']
  },
  {
    table: 'categories',
    requiredColumns: ['id', 'name', 'simulator_id']
  },
  {
    table: 'simulator_submissions',
    requiredColumns: ['id', 'simulator_id', 'submission_code', 'created_at']
  },
  {
    table: 'guest_scenarios',
    requiredColumns: ['id', 'email', 'scenario_name', 'submission_code']
  },
  {
    table: 'pdf_templates',
    requiredColumns: ['id', 'template_name', 'simulator_type']
  },
  {
    table: 'configurations',
    requiredColumns: ['id', 'simulator_id', 'name', 'fields']
  }
];

export async function verifyDatabaseSchema(): Promise<{
  success: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  for (const { table, requiredColumns } of REQUIRED_TABLES) {
    try {
      // Check if table exists by querying it
      const { data, error } = await supabase
        .from(table)
        .select(requiredColumns.join(','))
        .limit(1);

      if (error) {
        // Check if error is "table not found" vs "column not found"
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          errors.push(`❌ Table "${table}" does not exist`);
        } else if (error.message.includes('column')) {
          errors.push(`❌ Table "${table}" missing required columns: ${error.message}`);
        } else {
          errors.push(`⚠️ Table "${table}" query failed: ${error.message}`);
        }
      }
    } catch (err) {
      errors.push(`❌ Failed to verify table "${table}": ${err}`);
    }
  }

  return {
    success: errors.length === 0,
    errors
  };
}

// Run verification in development only
export async function verifyDatabaseSchemaInDev() {
  if (import.meta.env.DEV) {
    console.log('🔍 Verifying database schema...');
    const result = await verifyDatabaseSchema();
    
    if (!result.success) {
      console.error('❌ Database schema verification failed:');
      result.errors.forEach(err => console.error(err));
      console.error('\n💡 Run: npm run db:types to regenerate types from database');
      console.error('💡 Check: DATABASE_SYNC.md for troubleshooting');
    } else {
      console.log('✅ Database schema verified - all tables accessible');
    }
  }
}