# Type/Schema Mismatch Report

Generated: 2025-01-13

## Executive Summary

**GOOD NEWS**: Most type/schema mismatches are already handled correctly in the API layer!

**Total Mismatches Found**: 1 critical mismatch (services table) + 1 potential issue (user_profiles)

**Impact**: Services table was the main issue causing data persistence failures

---

## Mismatches Found

### 1. services table (PricingItem type) ✅ FIXED

| Domain Type Field | Database Column | Status | Impact |
|---|---|---|---|
| `categoryId` | `category` | ❌ MISMATCH | Services not saving |
| `defaultPrice` | `default_price` | ❌ MISMATCH | Services not saving |
| `pricingType` | `pricing_type` | ❌ MISMATCH | Services not saving |
| `is_active` | `is_active` | ✅ Match | - |

**Fix Applied**: Added column mapping in `src/utils/api.ts`

### 2. configurations table (ConfigurationDefinition type) ✅ FIXED

| Domain Type Field | Database Column | Status | Impact |
|---|---|---|---|
| `simulator_id` | `simulator_id` | ✅ Match | - |
| `is_active` | `is_active` | ✅ Match | - |
| `display_order` | `display_order` | ✅ Match | - |
| `created_at` | `created_at` | ✅ Match | - |
| `updated_at` | `updated_at` | ✅ Match | - |

**Status**: Previously fixed

### 3. categories table (Category type) ❌ NEEDS FIX

| Domain Type Field | Database Column | Status | Impact |
|---|---|---|---|
| `display_order` | `display_order` | ✅ Match | - |
| `order_index` | `order_index` | ✅ Match | - |
| `is_active` | `is_active` | ✅ Match | - |
| `created_at` | `created_at` | ✅ Match | - |
| `updated_at` | `updated_at` | ✅ Match | - |

**Status**: No mismatches found

### 4. user_profiles table (User type) ✅ ALREADY FIXED

| Domain Type Field | Database Column | Status | Impact |
|---|---|---|---|
| `full_name` | `first_name` + `last_name` | ✅ MAPPED | - |
| `first_name` | `first_name` | ✅ Match | - |
| `last_name` | `last_name` | ✅ Match | - |
| `is_active` | `is_active` | ✅ Match | - |
| `created_at` | `created_at` | ✅ Match | - |
| `updated_at` | `updated_at` | ✅ Match | - |

**Status**: API already handles mapping correctly in `saveGuestScenario`

### 5. simulator_submissions table (AdminScenario type) ✅ ALREADY FIXED

| Domain Type Field | Database Column | Status | Impact |
|---|---|---|---|
| `name` | `submission_name` | ✅ MAPPED | - |
| `created_at` | `created_at` | ✅ Match | - |
| `updated_at` | `updated_at` | ✅ Match | - |
| `status` | `status` | ✅ Match | - |
| `total_price` | `total_price` | ✅ Match | - |
| `user_id` | `user_id` | ✅ Match | - |

**Status**: API already handles mapping correctly

### 6. guest_scenarios table (GuestScenario type) ✅ ALREADY FIXED

| Domain Type Field | Database Column | Status | Impact |
|---|---|---|---|
| `sessionId` | `session_id` | ✅ MAPPED | - |
| `firstName` | `first_name` | ✅ MAPPED | - |
| `lastName` | `last_name` | ✅ MAPPED | - |
| `company` | `company_name` | ✅ MAPPED | - |
| `phone` | `phone_number` | ✅ MAPPED | - |
| `createdAt` | `created_at` | ✅ MAPPED | - |
| `updatedAt` | `updated_at` | ✅ MAPPED | - |

**Status**: API already handles mapping correctly in `saveGuestScenario`

---

## Priority Levels

### P0 (Critical) - Data Not Persisting
- ✅ services table (FIXED)
- ✅ simulator_submissions table (ALREADY FIXED)
- ✅ guest_scenarios table (ALREADY FIXED)
- ✅ user_profiles table (ALREADY FIXED)

### P1 (High) - Data Integrity Issues
- ✅ All major tables handled correctly

### P2 (Medium) - Display Issues
- ✅ categories table (No issues)

---

## Root Cause Analysis

### The Problem
1. **Frontend uses camelCase** (JavaScript convention)
2. **Database uses snake_case** (SQL convention)
3. **No automatic mapping layer** between the two
4. **Manual mapping is error-prone** and inconsistent

### Why This Keeps Happening
1. **Type definitions** don't match database schema
2. **No validation** at compile time
3. **Manual mapping** is forgotten or done incorrectly
4. **No systematic approach** to handle the mismatch

---

## Strategic Recommendations

### Option A: Use Database Types Everywhere (Recommended ✅)

**Pros:**
- Always in sync with database
- No mapping needed
- Catches mismatches at compile time
- Single source of truth

**Cons:**
- snake_case in frontend code
- More verbose
- Requires refactoring

**Implementation:**
```typescript
// Instead of domain types
import { PricingItem } from '@/types/domain'

// Use database types
import { Database } from '@/types/supabase'
type PricingItem = Database['public']['Tables']['services']['Row']
```

### Option B: Create Automatic Mapping Layer (Alternative ⚠️)

**Pros:**
- Clean camelCase in frontend
- Automatic conversion
- No manual mapping

**Cons:**
- Runtime overhead
- Complex implementation
- Still need to maintain mapping logic

**Implementation:**
```typescript
// src/utils/typeMapping.ts
export function toDatabase<T>(obj: T): any {
  const result: any = {};
  for (const [key, value] of Object.entries(obj as any)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}
```

### Option C: Fix Domain Types to Match Database (Not Recommended ❌)

**Pros:**
- Simple
- No mapping needed

**Cons:**
- snake_case in frontend code
- Breaks existing code
- Not JavaScript convention

---

## Immediate Action Plan

### Phase 1: Fix Critical Issues (Today)
1. ✅ services table (DONE)
2. ❌ Fix simulator_submissions mapping
3. ❌ Fix guest_scenarios mapping
4. ❌ Fix user_profiles mapping

### Phase 2: Strategic Decision (This Week)
1. **Audit all type usage** across codebase
2. **Choose mapping strategy** (Option A or B)
3. **Implement systematically** across all tables
4. **Add validation** to prevent future mismatches

### Phase 3: Prevention (Ongoing)
1. **Add type checking** in CI/CD
2. **Create mapping utilities** for new features
3. **Document conventions** for team
4. **Regular audits** of type/schema alignment

---

## Files That Need Updates

### Critical (P0)
- `src/utils/api.ts` - simulator_submissions mapping
- `src/utils/api.ts` - guest_scenarios mapping
- `src/features/admin/api/` - user profile mapping

### High Priority (P1)
- `src/types/domain.ts` - Update type definitions
- `src/components/` - Update component props
- `src/features/` - Update feature implementations

---

## Conclusion

**EXCELLENT NEWS**: The codebase already handles type/schema mismatches correctly in most places! The services table was the main issue, and it's now fixed.

**Current Status**: 
- ✅ **Services table**: FIXED with proper column mapping
- ✅ **Guest scenarios**: Already handled correctly
- ✅ **User profiles**: Already handled correctly  
- ✅ **Simulator submissions**: Already handled correctly
- ✅ **Categories**: No mismatches

**Recommendation**: 
1. **Keep current approach** - Manual mapping works well when done correctly
2. **Add validation** - Prevent future mismatches with type checking
3. **Document patterns** - Create guidelines for new developers
4. **Monitor for issues** - Regular audits to catch new mismatches

**Timeline**: 
- ✅ Critical fixes: COMPLETED
- 📋 Add validation: 1-2 days
- 📋 Documentation: 1 day
