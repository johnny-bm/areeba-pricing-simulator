# Developer Guidelines: Type/Schema Mapping

## 🎯 The Problem

Frontend uses **camelCase** (JavaScript convention), but database uses **snake_case** (SQL convention).

This causes data persistence failures when not handled correctly.

## ✅ The Solution

**Always map field names** when saving to database or reading from database.

## 📋 Quick Reference

### Services Table
```typescript
// ❌ WRONG - Direct mapping fails
const service = {
  categoryId: "cat-123",      // ❌ Database expects 'category'
  defaultPrice: 100,          // ❌ Database expects 'default_price'
  pricingType: "fixed"        // ❌ Database expects 'pricing_type'
};

// ✅ CORRECT - Map to database fields
const dbService = {
  category: service.categoryId,        // ✅ Mapped correctly
  default_price: service.defaultPrice, // ✅ Mapped correctly
  pricing_type: service.pricingType   // ✅ Mapped correctly
};
```

### Guest Scenarios Table
```typescript
// ❌ WRONG
const guestData = {
  firstName: "John",          // ❌ Database expects 'first_name'
  lastName: "Doe",            // ❌ Database expects 'last_name'
  companyName: "Acme Corp"    // ❌ Database expects 'company_name'
};

// ✅ CORRECT - Already handled in API
const dbGuestData = {
  first_name: guestData.firstName,    // ✅ Mapped correctly
  last_name: guestData.lastName,      // ✅ Mapped correctly
  company_name: guestData.companyName // ✅ Mapped correctly
};
```

## 🛠️ Best Practices

### 1. Always Map in API Layer
```typescript
// ✅ Good - Map in API function
async saveService(service: PricingItem) {
  const dbService = {
    category: service.categoryId,
    default_price: service.defaultPrice,
    pricing_type: service.pricingType,
    // ... other fields
  };
  
  await supabase.from('services').insert(dbService);
}
```

### 2. Use Validation Utilities
```typescript
import { validateServiceData } from '@/utils/typeValidation';

// ✅ Good - Validate before saving
async saveService(service: PricingItem) {
  validateServiceData(service); // Catches mismatches in development
  
  const dbService = mapToDatabase(service, FIELD_MAPPINGS.services);
  await supabase.from('services').insert(dbService);
}
```

### 3. Document Field Mappings
```typescript
// ✅ Good - Document mappings clearly
const SERVICE_FIELD_MAPPINGS = {
  categoryId: 'category',
  defaultPrice: 'default_price',
  pricingType: 'pricing_type'
} as const;
```

## 🚨 Common Mistakes

### Mistake 1: Forgetting to Map Fields
```typescript
// ❌ BAD - Direct insertion without mapping
await supabase.from('services').insert(service);
// Result: Fields not found in database
```

### Mistake 2: Inconsistent Mapping
```typescript
// ❌ BAD - Inconsistent field names
const service1 = { categoryId: "cat-1" };
const service2 = { category: "cat-2" }; // Different field name!
```

### Mistake 3: Missing Required Fields
```typescript
// ❌ BAD - Missing required database fields
const service = {
  name: "Service Name",
  // Missing: simulator_id, created_by, etc.
};
```

## 🔍 Debugging Tips

### 1. Check Console Logs
```typescript
// Add debug logging to see what's being sent
console.log('🔍 Saving service:', {
  original: service,
  mapped: dbService,
  tableName: 'services'
});
```

### 2. Validate Database Schema
```sql
-- Check what columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'services' 
ORDER BY ordinal_position;
```

### 3. Test with Simple Data
```typescript
// Start with minimal required fields
const testService = {
  id: 'test-1',
  name: 'Test Service',
  category: 'test-category',
  default_price: 100,
  simulator_id: 'sim-123'
};
```

## 📚 Field Mapping Reference

### Services Table
| Frontend Field | Database Column | Required |
|---|---|---|
| `categoryId` | `category` | ✅ |
| `defaultPrice` | `default_price` | ✅ |
| `pricingType` | `pricing_type` | ✅ |
| `is_active` | `is_active` | ❌ |

### Guest Scenarios Table
| Frontend Field | Database Column | Required |
|---|---|---|
| `firstName` | `first_name` | ✅ |
| `lastName` | `last_name` | ✅ |
| `companyName` | `company_name` | ✅ |
| `phoneNumber` | `phone_number` | ✅ |

### User Profiles Table
| Frontend Field | Database Column | Required |
|---|---|---|
| `firstName` | `first_name` | ✅ |
| `lastName` | `last_name` | ✅ |
| `is_active` | `is_active` | ❌ |

## 🎯 Action Items for New Features

1. **Check existing patterns** - Look at similar API functions
2. **Map fields correctly** - Use the reference tables above
3. **Add validation** - Use the validation utilities
4. **Test thoroughly** - Verify data persists after page refresh
5. **Document mappings** - Add to this guide if new patterns emerge

## 🚀 Quick Fix Checklist

When you encounter a "field not found" error:

1. ✅ **Check the database schema** - What columns actually exist?
2. ✅ **Check the field mapping** - Are camelCase fields mapped to snake_case?
3. ✅ **Check required fields** - Are all NOT NULL fields provided?
4. ✅ **Check data types** - Do the values match the expected types?
5. ✅ **Add debug logging** - See exactly what's being sent to the database

## 📞 Need Help?

- Check `docs/TYPE_SCHEMA_MISMATCHES.md` for comprehensive analysis
- Look at existing API functions for patterns
- Use the validation utilities in `src/utils/typeValidation.ts`
- Test with browser console open to see debug logs
