#!/usr/bin/env tsx

import { verifyDatabaseSchema } from '../src/core/infrastructure/database/scripts/verifySchema';

async function main() {
  // console.log('🔍 Verifying database schema...\n');
  
  try {
    await verifyDatabaseSchema();
    // console.log('\n✅ Schema verification complete!');
    process.exit(0);
  } catch (error) {
    // console.error('\n❌ Schema verification failed:', error);
    process.exit(1);
  }
}

main();
