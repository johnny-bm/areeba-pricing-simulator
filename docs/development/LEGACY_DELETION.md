# Legacy Code Deletion Checklist

## 🎯 **Objective**
Safely remove legacy API code after successful migration to Clean Architecture.

## 📋 **Phase 1: Verify No Usage**

### **Search for Legacy API Usage**
- [ ] Search codebase for `from '@/utils/api'`
- [ ] Search for `import { * } from './api'`
- [ ] Search for `import { * } from '../api'`
- [ ] Search for `import { * } from '../../api'`
- [ ] Search for `import { * } from '../../../api'`
- [ ] Search for `import { * } from '../../../../api'`
- [ ] Search for `import { * } from '../../../../../api'`

### **Search for Legacy API Methods**
- [ ] Search for `getPricingItems`
- [ ] Search for `calculatePricing`
- [ ] Search for `getPricingItemById`
- [ ] Search for `savePricingScenario`
- [ ] Search for `getPricingCategories`
- [ ] Search for `updatePricingItem`
- [ ] Search for `deletePricingItem`

### **Search for Legacy API Files**
- [ ] Search for `utils/api.ts`
- [ ] Search for `utils/simulatorApi.ts`
- [ ] Search for `utils/legacyApi.ts`
- [ ] Search for any other legacy API wrappers

### **Verify No Breaking Changes**
- [ ] Run all tests: `npm test`
- [ ] Run integration tests: `npm run test:integration`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Test in development: `npm run dev`
- [ ] Test in staging environment
- [ ] Test in production environment

## 📋 **Phase 2: Mark as Deprecated**

### **Add Deprecation Warnings**
```typescript
// In utils/api.ts
/**
 * @deprecated This API is deprecated. Use the new Clean Architecture instead.
 * @see src/presentation/features/pricing/hooks/usePricingOperations.ts
 * @see src/presentation/adapters/PricingAdapter.ts
 * 
 * Migration guide:
 * - Replace getPricingItems() with usePricingOperations().getPricingItems()
 * - Replace calculatePricing() with usePricingOperations().calculatePricing()
 * - Replace getPricingItemById() with usePricingOperations().getPricingItemById()
 */
export const getPricingItems = () => {
  console.warn('⚠️ DEPRECATED: getPricingItems() is deprecated. Use usePricingOperations().getPricingItems() instead.');
  // ... existing implementation
};
```

### **Add Console Warnings**
- [ ] Add `console.warn()` to all exported functions
- [ ] Include migration instructions in warnings
- [ ] Add links to new implementation
- [ ] Include version information

### **Create Migration Guide**
- [ ] Document all legacy functions and their replacements
- [ ] Provide code examples for migration
- [ ] Create migration script if needed
- [ ] Update README with migration instructions

## 📋 **Phase 3: Delete Legacy Code**

### **Files to Delete**
- [ ] `src/utils/api.ts` (1,260 lines)
- [ ] `src/utils/simulatorApi.ts` (if exists)
- [ ] `src/utils/legacyApi.ts` (if exists)
- [ ] Any other legacy API wrappers

### **Update Imports**
- [ ] Remove all imports of deleted files
- [ ] Update any remaining references
- [ ] Fix broken imports
- [ ] Update barrel exports

### **Clean Up Dependencies**
- [ ] Remove unused dependencies
- [ ] Update package.json
- [ ] Run `npm audit` to check for vulnerabilities
- [ ] Update lock file

## 📋 **Phase 4: Verification**

### **Test Suite**
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All E2E tests passing
- [ ] No test failures related to deleted code

### **Build Verification**
- [ ] Production build successful: `npm run build`
- [ ] No build errors or warnings
- [ ] Bundle size reduced (expected ~30KB reduction)
- [ ] No unused code in bundle

### **Runtime Verification**
- [ ] Application starts without errors
- [ ] All features work correctly
- [ ] No console errors or warnings
- [ ] Performance is maintained or improved

## 📋 **Phase 5: Documentation Updates**

### **Update Architecture Documentation**
- [ ] Remove references to legacy API
- [ ] Update architecture diagrams
- [ ] Update component documentation
- [ ] Update API documentation

### **Update Developer Documentation**
- [ ] Update README.md
- [ ] Update CONTRIBUTING.md
- [ ] Update development setup guide
- [ ] Update deployment guide

### **Update Code Examples**
- [ ] Update all code examples
- [ ] Update tutorial content
- [ ] Update sample code
- [ ] Update documentation comments

## 📊 **Success Metrics**

### **Code Quality**
- [ ] No references to deleted files
- [ ] No broken imports
- [ ] No unused dependencies
- [ ] Clean codebase

### **Performance**
- [ ] Bundle size reduced by ~30KB
- [ ] No performance regression
- [ ] Faster build times
- [ ] Improved runtime performance

### **Maintainability**
- [ ] Cleaner codebase
- [ ] Easier to understand
- [ ] Better separation of concerns
- [ ] Improved developer experience

## 🚨 **Risk Mitigation**

### **Rollback Plan**
- [ ] Keep backup of legacy code in separate branch
- [ ] Document rollback procedure
- [ ] Test rollback in staging environment
- [ ] Have rollback ready for production

### **Monitoring**
- [ ] Monitor application after deletion
- [ ] Watch for any errors or issues
- [ ] Have monitoring alerts in place
- [ ] Be ready to rollback if needed

## 📝 **Deletion Log**

### **Files Deleted**
- [ ] `src/utils/api.ts` - 1,260 lines
- [ ] `src/utils/simulatorApi.ts` - X lines
- [ ] `src/utils/legacyApi.ts` - X lines

### **Total Lines Removed**
- [ ] Total: ~1,260+ lines
- [ ] Bundle size reduction: ~30KB
- [ ] Dependencies removed: X

### **Date of Deletion**
- [ ] Date: ___________
- [ ] Deleted by: ___________
- [ ] Reviewed by: ___________
- [ ] Approved by: ___________

## ✅ **Final Checklist**

- [ ] All legacy code removed
- [ ] All tests passing
- [ ] No broken imports
- [ ] Bundle size reduced
- [ ] Documentation updated
- [ ] Team notified
- [ ] Production deployment successful
- [ ] Monitoring in place

## 🎉 **Completion**

**Legacy code deletion completed successfully!**

**Benefits achieved:**
- ✅ Cleaner codebase
- ✅ Reduced bundle size
- ✅ Improved maintainability
- ✅ Better separation of concerns
- ✅ Enhanced developer experience

**Next steps:**
- Monitor application performance
- Update team documentation
- Celebrate the clean architecture! 🎉
