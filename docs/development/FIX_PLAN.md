# Database Schema Fix Plan

## Mismatch Analysis

| Table | Wrong Property | Correct Property | Files Affected | Count | Context |
|-------|---------------|------------------|----------------|-------|---------|
| configurations | order | display_order | DynamicClientConfigBar.tsx, ConfigurationDialog.tsx | 3 | UI display ordering |
| configurations | isActive | is_active | Already fixed | - | - |
| categories | order | display_order | ItemLibrary.tsx, ScenarioBuilder.tsx, FeeSummary.tsx, pdfHelpers.ts | 4 | UI display ordering |
| simulators | sortOrder | sort_order | SimulatorDialog.tsx, SimulatorManager.tsx, SimulatorInfoPage.tsx, simulatorApi.ts | 4 | Sorting logic |
| simulators | isActive | is_active | SimulatorDialog.tsx, SimpleTiptapEditor.tsx | 2 | Status field |
| General | createdAt | created_at | Multiple files | 15 | Timestamp fields |
| General | updatedAt | updated_at | Multiple files | 3 | Timestamp fields |
| General | userId | user_id | adminService.ts, analytics.ts | 3 | User references |

## Special Cases to Resolve

### 1. Order Field Ambiguity
**configurations table** has BOTH:
- `display_order` (number | null) - for UI display
- `sort_order` (number | null) - for sorting logic

**Decision needed**: When code uses `.order`, which database column should it be?
- **Recommendation**: Use `display_order` for UI display ordering (most common use case)
- **Context**: Looking at the code, it's used for sorting configurations in the UI

### 2. Categories Order Fields
**categories table** has:
- `display_order` (number | null) - for UI display
- `order_index` (number) - for internal ordering

**Decision needed**: When code uses `.order`, which should it be?
- **Recommendation**: Use `display_order` for UI display ordering
- **Context**: Used for sorting categories in the UI

## Fix Strategy

### Phase 1: Type Definitions
1. Update `src/types/domain.ts`:
   - Change `order` to `display_order` in Category interface
   - Change `order` to `display_order` in ConfigurationDefinition interface
   - Change `order` to `display_order` in ConfigurationField interface
   - Change `createdAt` to `created_at` in all interfaces
   - Change `updatedAt` to `updated_at` in all interfaces

2. Update `src/types/simulator.ts`:
   - Change `sortOrder` to `sort_order` in Simulator interface
   - Change `createdAt` to `created_at`
   - Change `updatedAt` to `updated_at`

### Phase 2: Code References
1. **configurations.order → display_order**:
   - DynamicClientConfigBar.tsx (2 occurrences)
   - ConfigurationDialog.tsx (3 occurrences)

2. **categories.order → display_order**:
   - ItemLibrary.tsx (1 occurrence)
   - ScenarioBuilder.tsx (2 occurrences)
   - FeeSummary.tsx (1 occurrence)
   - pdfHelpers.ts (1 occurrence)
   - pdfHelpers_fixed.ts (1 occurrence)

3. **simulators.sortOrder → sort_order**:
   - SimulatorDialog.tsx (2 occurrences)
   - SimulatorManager.tsx (2 occurrences)
   - SimulatorInfoPage.tsx (1 occurrence)
   - simulatorApi.ts (2 occurrences)

4. **General timestamp fixes**:
   - All `.createdAt` → `.created_at`
   - All `.updatedAt` → `.updated_at`

### Phase 3: Verification
1. Run `npm run type-check` after each table fix
2. Test critical workflows
3. Update database verification script
4. Create documentation

## Risk Assessment
- **Low Risk**: These are property name changes, not logic changes
- **Testing**: Need to verify UI sorting still works correctly
- **Rollback**: Easy to revert if issues arise

## Approval Required
Please review this plan and approve before I proceed with the fixes. The main decision needed is:

**For configurations and categories tables: Should `.order` map to `display_order` or `sort_order`?**

Based on the code context, I recommend `display_order` for UI display ordering.
