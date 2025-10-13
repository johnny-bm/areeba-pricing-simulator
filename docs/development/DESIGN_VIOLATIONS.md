# Design System Violations Report

Generated: 2024-12-19

## Executive Summary

| Category | Count | Priority | Status |
|----------|-------|----------|--------|
| Hardcoded Colors | 168 | P0 | 🔴 Critical |
| Arbitrary Values | 915 | P1 | 🟡 High |
| Inline Styles | 0 | P1 | ✅ Clean |
| Native HTML Elements | 0 | P2 | ✅ Clean |

## Total Violations: 1,083

---

## Detailed Breakdown

### P0 Critical Violations: Hardcoded Colors (168 total)

**Background Colors (56 violations):**
- `bg-[#f3f3f5]` - Light gray background (56 instances)
- `bg-[#eceef2]` - Muted gray background (multiple instances)
- `bg-[#030213]` - Dark background (2 instances)

**Text Colors (112 violations):**
- `text-[#717182]` - Muted text color (most common)
- `text-[#ca3500]` - Error/destructive text
- `text-[#d4183d]` - Red text color

**Primary Offender File:**
- `src/imports/AreebaPricingSimulator2025.tsx` - Contains 100% of violations

### P1 High Priority Violations: Arbitrary Values (915 total)

**Pixel Values (915 violations):**
- Height values: `h-[31.989px]`, `h-[35.994px]`, `h-[21.79px]`
- Width values: `w-[366.193px]`, `w-[38.281px]`, `w-[43.551px]`
- Font sizes: `text-[14px]`, `text-[16px]`, `text-[12px]`
- Positioning: `left-[42.27px]`, `top-[0.82px]`
- Border radius: `rounded-[8px]`

**Primary Offender File:**
- `src/imports/AreebaPricingSimulator2025.tsx` - Contains 100% of violations

### P2 Medium Priority: Accessibility Issues

**Current Status:** ✅ No violations found

### P3 Low Priority: Optimization Opportunities

**Import Path Inconsistencies:**
- Mixed usage of `@/components/ui/`, `./ui/`, `../ui/`, `../../../components/ui/`
- Recommendation: Standardize to `@/components/ui/`

---

## Recommended Fix Order

### Week 1: Remove Hardcoded Colors
**Files to fix:**
1. `src/imports/AreebaPricingSimulator2025.tsx` (168 violations)

**Action Plan:**
- Replace `bg-[#f3f3f5]` with `bg-muted`
- Replace `bg-[#eceef2]` with `bg-muted/50`
- Replace `bg-[#030213]` with `bg-background`
- Replace `text-[#717182]` with `text-muted-foreground`
- Replace `text-[#ca3500]` with `text-destructive`
- Replace `text-[#d4183d]` with `text-destructive`

### Week 2: Remove Arbitrary Values
**Files to fix:**
1. `src/imports/AreebaPricingSimulator2025.tsx` (915 violations)

**Action Plan:**
- Replace `h-[31.989px]` with `h-8`
- Replace `h-[35.994px]` with `h-9`
- Replace `h-[21.79px]` with `h-6`
- Replace `w-[366.193px]` with `w-full` or `max-w-sm`
- Replace `w-[38.281px]` with `w-10`
- Replace `w-[43.551px]` with `w-11`
- Replace `text-[14px]` with `text-sm`
- Replace `text-[16px]` with `text-base`
- Replace `text-[12px]` with `text-xs`
- Replace `rounded-[8px]` with `rounded-lg`

### Week 3: Standardize Import Paths
**Action Plan:**
- Find and replace all import paths to use `@/components/ui/`
- Update all relative imports to absolute imports
- Verify all components work after path changes

### Month 2: Component Migration
**Components to evaluate:**
- Review `src/imports/AreebaPricingSimulator2025.tsx` for potential shadcn component replacements
- Consider if this file should be refactored to use proper shadcn components

---

## Progress Tracking

- [ ] Phase 1: Documentation complete ✅
- [ ] Phase 2: P0 violations fixed (168 hardcoded colors)
- [ ] Phase 3: P1 violations fixed (915 arbitrary values)
- [ ] Phase 4: P2 violations fixed (import path standardization)
- [ ] Phase 5: 100% compliance

---

## Impact Assessment

### Current State
- **1,083 total violations** across the codebase
- **100% of violations** are in a single file: `src/imports/AreebaPricingSimulator2025.tsx`
- **Zero violations** in main application code (src/components/, src/features/, etc.)

### Risk Assessment
- **Low Risk**: All violations are contained in a single import file
- **High Impact**: This file appears to be generated/imported code that may not be actively maintained
- **Recommendation**: Consider if this file is necessary or can be replaced with proper shadcn components

### Quick Wins
1. **Immediate**: Fix the 168 hardcoded colors (1-2 hours)
2. **Short-term**: Fix the 915 arbitrary values (4-6 hours)
3. **Long-term**: Evaluate if the entire import file can be replaced

---

## Next Steps

1. **Immediate Action**: Start with hardcoded color fixes
2. **Team Review**: Discuss the purpose of `AreebaPricingSimulator2025.tsx`
3. **Migration Plan**: Determine if this file should be refactored or replaced
4. **Monitoring**: Set up linting rules to prevent future violations

---

*This report will be updated as violations are fixed.*
