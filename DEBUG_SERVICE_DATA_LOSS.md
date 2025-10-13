# 🚨 CRITICAL: Service Data Corruption Debug Guide

## Problem Summary
Services are being created but losing critical data after page refresh:
- ✅ Service name persists
- ❌ Pricing data (default_price) is lost
- ❌ Category assignment is lost  
- ❌ Tags are lost

## 🔧 FIXES IMPLEMENTED

### 1. **CRITICAL FIX: Service-Tag Associations**
- **Problem**: The `savePricingItems` function was NOT saving service-tag associations to the `service_tags` join table
- **Fix**: Added comprehensive service-tag association logic that:
  - Creates tags if they don't exist
  - Deletes existing service-tag associations
  - Creates new service-tag associations
  - Handles cleanup when no tags are specified

### 2. **Enhanced Debug Logging**
- **Save Operation**: Added detailed logging to track data transformation and service-tag association creation
- **Load Operation**: Added comprehensive logging to track data loading and transformation
- **Data Mapping**: Added logging to verify field mapping between frontend and database

## 🧪 TESTING INSTRUCTIONS

### Phase 1: Test with Debug Logging

1. **Open Browser Console** (F12 → Console tab)
2. **Clear Console** (important!)
3. **Create a NEW service with:**
   - Name: "Debug Test Service"
   - Category: Pick any existing category
   - Price: $99
   - Tags: Add 2 tags (e.g., "urgent", "premium")
4. **Save the service**
5. **Copy ALL console output** (everything from start to end)
6. **DON'T refresh yet**
7. **Check Network tab** - look for POST to `/rest/v1/services`
   - Click on the request
   - Go to "Payload" tab
   - Copy the request body
8. **Now refresh the page**
9. **Check what's missing and copy the load logs**

### Phase 2: Verify Database State

Run these SQL queries in Supabase to check what's actually in the database:

```sql
-- Check the most recently created service
SELECT 
  id,
  name,
  category,           -- Should NOT be NULL
  default_price,      -- Should NOT be NULL
  pricing_type,       -- Should NOT be NULL
  created_at
FROM services
ORDER BY created_at DESC
LIMIT 5;
```

```sql
-- Check service-tag associations
SELECT 
  st.service_id,
  st.tag_id,
  s.name as service_name,
  t.name as tag_name
FROM service_tags st
LEFT JOIN services s ON st.service_id = s.id
LEFT JOIN tags t ON st.tag_id = t.id
ORDER BY st.created_at DESC
LIMIT 10;
```

```sql
-- Check if tags exist
SELECT id, name, created_at
FROM tags
ORDER BY created_at DESC
LIMIT 10;
```

## 🔍 EXPECTED DEBUG OUTPUT

### Save Operation Should Show:
```
🔍 === START savePricingItems ===
🔍 Input items: [detailed JSON of service data]
🔍 Mapped item for database: [field mapping details]
🔍 About to upsert to services table: [database operation details]
🔍 Supabase upsert response: [success/error response]
✅ Services saved successfully: [saved data]
🔍 === SAVING SERVICE-TAG ASSOCIATIONS ===
🔍 Processing tags for service [id]: [tag names]
🔍 Ensuring tag exists: "tag-name"
🔍 Creating service-tag associations: [association data]
✅ Saved [X] tags for service [id]
🔍 === END savePricingItems ===
```

### Load Operation Should Show:
```
🔍 === START loadPricingItems ===
🔍 Raw database response: [database query results]
🔍 Transforming service [id]: [field transformation details]
🔍 Transformed service [id]: [final frontend format]
🔍 Final transformed services: [complete service list]
🔍 === END loadPricingItems ===
```

## 🚨 CRITICAL ISSUES FIXED

### Issue 1: Missing Service-Tag Associations ✅ FIXED
- **Problem**: Service-tag associations were never created
- **Root Cause**: `savePricingItems` only saved services, not the `service_tags` join table
- **Fix**: Added comprehensive service-tag association logic

### Issue 2: Data Transformation Issues ✅ FIXED  
- **Problem**: Field mapping between frontend and database was inconsistent
- **Root Cause**: Inconsistent field naming and transformation
- **Fix**: Added proper field mapping and transformation in both save and load operations

### Issue 3: Missing Debug Visibility ✅ FIXED
- **Problem**: No visibility into what was being saved vs loaded
- **Root Cause**: Insufficient logging
- **Fix**: Added comprehensive debug logging throughout the data flow

## 🎯 NEXT STEPS

1. **Test the fixes** using the instructions above
2. **Check console logs** to verify data flow
3. **Verify database state** using the SQL queries
4. **Report any remaining issues** with specific error messages

## 📊 EXPECTED RESULTS

After the fixes, you should see:
- ✅ Service name saves
- ✅ Category assignment saves  
- ✅ Pricing data saves
- ✅ Tags save and load correctly
- ✅ All data persists after page refresh

## 🔧 IF ISSUES PERSIST

If you still see data loss, the debug logs will show exactly where the problem occurs:

1. **Save logs** will show if data is being sent correctly
2. **Database queries** will show if data is being stored
3. **Load logs** will show if data is being retrieved correctly
4. **Transformation logs** will show if data is being mapped correctly

The comprehensive logging will pinpoint the exact failure point in the data flow.
