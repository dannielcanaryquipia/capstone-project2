# 🚨 Tomorrow's Debug Plan: PGRST200 Error Fix

## **Problem Summary**
The app is crashing with this error when trying to fetch products:
```
ERROR Error fetching products: {"code": "PGRST200", "details": "Searched for a foreign key relationship between 'pizza_options' and 'crusts' in the schema 'public', but no matches were found.", "hint": "Perhaps you meant 'products' instead of 'crusts'.", "message": "Could not find a relationship between 'pizza_options' and 'crusts' in the schema cache"}
```

## **Root Cause**
The error occurs because there's a Supabase query trying to join `pizza_options` with `crusts` using `crust:crusts(name)`, but this foreign key relationship doesn't exist in your database schema.

## **What We've Already Done**
✅ **Fixed `services/debug-data.service.ts`**: Removed the problematic `crust:crusts(name)` relationship
✅ **Cleared all caches**: Metro, Expo, npm caches cleared
✅ **Updated packages**: Fixed Expo version mismatches
✅ **Verified main services**: `ProductService.getProducts()` is clean

## **Tomorrow's Action Plan**

### **Step 1: Verify Current State**
```bash
# Check if the error still occurs
npx expo start --clear
```

### **Step 2: If Error Persists - Deep Investigation**
1. **Check for hidden imports**:
   ```bash
   # Search for any remaining crust:crusts references
   grep -r "crust:crusts" . --include="*.ts" --include="*.tsx" --include="*.js"
   ```

2. **Check database schema**:
   - Verify if `pizza_options` table has a `crust_id` column
   - Check if foreign key relationship exists between `pizza_options.crust_id` and `crusts.id`

3. **Alternative approach** - Modify the query to not use the relationship:
   ```typescript
   // Instead of: crust:crusts(name)
   // Use separate queries or modify the data structure
   ```

### **Step 3: Database Schema Investigation**
Check your Supabase database:
1. Go to Supabase Dashboard → Table Editor
2. Check `pizza_options` table structure
3. Verify if `crust_id` column exists
4. Check foreign key constraints

### **Step 4: If Schema is Missing**
If the relationship doesn't exist, you have two options:

**Option A: Add the missing relationship**
```sql
-- Add crust_id column to pizza_options if missing
ALTER TABLE pizza_options ADD COLUMN crust_id UUID REFERENCES crusts(id);

-- Add foreign key constraint
ALTER TABLE pizza_options ADD CONSTRAINT fk_pizza_options_crust 
FOREIGN KEY (crust_id) REFERENCES crusts(id);
```

**Option B: Modify queries to not use the relationship**
- Remove all `crust:crusts(name)` references
- Fetch crusts separately using `useCrusts()` hook
- Combine data in the frontend

### **Step 5: Test the Fix**
1. Start the development server
2. Navigate to the home screen (where products are fetched)
3. Check if the error is resolved
4. Test the order pages

## **Files to Check Tomorrow**
- `services/product.service.ts` - Main product service
- `services/debug-data.service.ts` - Already fixed
- `hooks/useProducts.ts` - Product fetching hook
- `app/(customer)/(tabs)/index.tsx` - Home screen that uses useProducts
- Database schema in Supabase

## **Quick Commands for Tomorrow**
```bash
# Start with clean cache
npx expo start --clear

# If still having issues, try this
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear --reset-cache

# Search for problematic queries
grep -r "crust:crusts" . --include="*.ts" --include="*.tsx"
```

## **Expected Outcome**
After tomorrow's debugging session, the app should:
- ✅ Start without the PGRST200 error
- ✅ Load products successfully on the home screen
- ✅ Display order pages without crashing
- ✅ Have a clean, working product fetching system

## **Backup Plan**
If the relationship approach doesn't work, we can:
1. Remove all crust-related joins from product queries
2. Fetch crusts separately using the existing `useCrusts()` hook
3. Combine the data in the frontend components

---
**Status**: Ready for tomorrow's debugging session
**Priority**: High - This is blocking the entire app from working
**Estimated Time**: 30-60 minutes
