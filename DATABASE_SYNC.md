# Database Synchronization Guide

## Overview
This project uses Supabase for the database. TypeScript types are auto-generated from the live database schema to ensure code and database stay in sync.

## Daily Workflow

### Before Starting Development
```bash
# Pull latest database types
npm run db:types
npm run type-check
If TypeScript errors appear, your code needs updates to match the database schema.

When Database Schema Changes
After Creating/Modifying Tables in Supabase
Step 1: Pull the schema as a migration
bashnpm run db:pull
This creates a migration file in supabase/migrations/
Step 2: Regenerate TypeScript types
bashnpm run db:types
Step 3: Verify code still compiles
bashnpm run type-check
Step 4: Fix any TypeScript errors
If errors appear, update your code to match the new schema.
Step 5: Commit changes
bashgit add supabase/migrations/*.sql src/types/database.ts
git commit -m "chore: update database schema and types"

Available Scripts
CommandPurposenpm run db:typesRegenerate types from live databasenpm run db:types:checkCheck if types are in sync (CI/CD)npm run db:pullPull database schema as migration files

Troubleshooting
"Types are out of sync" error
bashnpm run db:types
npm run type-check
"Permission denied" on Supabase
bashnpx supabase login
npx supabase link --project-ref ajeakgiahmhqekntpzgl
TypeScript errors after regenerating types
This means your code references tables/columns that no longer exist or have changed.

Read the TypeScript error carefully
Update your code to match the new schema
If a table was renamed, update all references


Important Tables

user_profiles - User management
user_invites - Invite system
services - Pricing services
categories - Service categories
simulator_submissions - User submissions
guest_scenarios - Guest submissions
pdf_templates - PDF templates
configurations - Simulator configurations


Best Practices
✅ DO:

Run npm run db:types after any database changes
Commit both migrations AND types together
Run npm run type-check before pushing code
Use the actual table names from src/types/database.ts

❌ DON'T:

Manually edit src/types/database.ts (always regenerate)
Assume table names without checking the types file
Skip type-checking before deploying
Make database changes without pulling migrations


CI/CD Integration
Add to your CI pipeline:
yaml- name: Check database types are in sync
  run: npm run db:types:check
This will fail the build if types are out of sync with the database.
