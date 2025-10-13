# Database Column Naming Convention

## Rule: Always Use Snake_Case

The database uses **snake_case** for ALL column names. This is the standard PostgreSQL convention.

## Common Mistakes to Avoid

| ❌ Wrong (camelCase) | ✅ Correct (snake_case) | Table |
|---------------------|------------------------|-------|
| isActive            | is_active              | All tables |
| sortOrder           | sort_order              | simulators |
| displayOrder        | display_order           | configurations, categories, services |
| createdAt           | created_at              | All tables |
| updatedAt           | updated_at              | All tables |
| userId              | user_id                 | All tables |
| simulatorId         | simulator_id            | All tables |

## Special Cases

### Order Fields
Some tables have multiple order-related columns:

**configurations table:**
- `display_order` (number | null) - for UI display ordering
- `sort_order` (number | null) - for sorting logic

**categories table:**
- `display_order` (number | null) - for UI display ordering  
- `order_index` (number) - for internal ordering

**Decision**: Use `display_order` for UI display ordering (most common use case).

## How to Check Column Names

### 1. Always refer to `src/types/database.ts`
This file contains the exact column names from the database schema.

```bash
# Find all columns for a specific table
grep -A 50 "your_table: {" src/types/database.ts
```

### 2. Use IDE autocomplete
When working with database types, use the autocomplete to see available properties.

### 3. Check existing code
Look for similar patterns in the codebase before creating new ones.

## When Adding New Features

### Before using a column:
1. Check `src/types/database.ts` for the exact column name
2. Use IDE autocomplete with database types
3. Never assume camelCase works

### Example:
```typescript
// ❌ Wrong - assuming camelCase
const isActive = item.isActive;

// ✅ Correct - using actual database column
const isActive = item.is_active;
```

## Type Definitions

All type definitions in `src/types/domain.ts` and `src/types/simulator.ts` now use snake_case to match the database schema.

## Verification

The database verification script (`src/lib/db-verification.ts`) has been updated to check for the correct column names.

## Migration History

This document was created after fixing the following mismatches:

1. **configurations.order** → **configurations.display_order**
2. **categories.order** → **categories.display_order**  
3. **simulators.sortOrder** → **simulators.sort_order**
4. **General timestamps** → **created_at**, **updated_at**
5. **Type definitions** → Updated to use snake_case

## Prevention

To prevent future issues:

1. **Always check `src/types/database.ts` first**
2. **Use TypeScript strict mode** to catch mismatches
3. **Run `npm run type-check`** before committing
4. **Follow the naming convention** consistently
5. **Update this document** when adding new columns

## Quick Reference

### Most Common Tables:
- **configurations**: `id`, `simulator_id`, `name`, `is_active`, `display_order`, `sort_order`, `fields`
- **categories**: `id`, `simulator_id`, `name`, `is_active`, `display_order`
- **services**: `id`, `simulator_id`, `name`, `is_active`, `display_order`
- **simulators**: `id`, `name`, `is_active`, `sort_order`, `created_at`, `updated_at`
- **user_profiles**: `id`, `email`, `role`, `is_active`, `created_at`, `updated_at`

### Always Use Snake_Case! 🐍
