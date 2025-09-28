# 🍕 Pizza Options Database Setup Guide

## **Problem Solved**
This guide fixes the PGRST200 error by creating the missing foreign key relationship between `pizza_options` and `crusts` tables.

## **What This Fixes**
- ✅ Creates `pizza_options` table with proper `crust_id` foreign key
- ✅ Creates `crusts` table with sample data
- ✅ Creates `toppings` and `pizza_topping_options` tables for future use
- ✅ Establishes proper foreign key relationships
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates helpful views for easier querying

## **Files Created**
1. `supabase/migrations/20240105_create_pizza_options_crusts_tables.sql` - Main migration
2. `apply-pizza-options-migration.sql` - Quick verification script
3. `test-pizza-options-schema.sql` - Test script to verify setup

## **How to Apply the Migration**

### **Option 1: Using Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20240105_create_pizza_options_crusts_tables.sql`
4. Paste and run the SQL script
5. Verify the tables were created successfully

### **Option 2: Using Supabase CLI**
```bash
# If you have Supabase CLI installed
supabase db push
```

### **Option 3: Manual Application**
1. Open `apply-pizza-options-migration.sql`
2. Run the verification queries first
3. If tables are missing, copy and run the migration SQL

## **Verification Steps**

### **Step 1: Check Tables Exist**
Run this query in Supabase SQL Editor:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pizza_options', 'crusts', 'toppings', 'pizza_topping_options');
```

### **Step 2: Verify Foreign Key Relationship**
```sql
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'pizza_options';
```

### **Step 3: Test the Relationship**
```sql
SELECT 
    po.id,
    po.size,
    po.price,
    c.name as crust_name,
    p.name as product_name
FROM public.pizza_options po
JOIN public.crusts c ON po.crust_id = c.id
JOIN public.products p ON po.product_id = p.id
LIMIT 5;
```

## **Expected Results**

### **Tables Created:**
- `crusts` - Contains crust types (Thin, Regular, Thick, Stuffed)
- `pizza_options` - Contains pizza size/crust/price combinations
- `toppings` - Contains available toppings
- `pizza_topping_options` - Junction table for pizza-topping relationships

### **Sample Data:**
- 4 crust types inserted
- 8 toppings inserted
- Pizza options created for existing pizza products (if any)

### **Views Created:**
- `pizza_options_with_crusts` - Pizza options with crust details
- `pizza_options_with_toppings` - Pizza options with all toppings

## **Testing Your App**

After applying the migration:

1. **Start your development server:**
   ```bash
   npx expo start --clear
   ```

2. **Test the home screen** - Should load products without PGRST200 error

3. **Test product detail pages** - Should display pizza options correctly

4. **Check the console** - No more foreign key relationship errors

## **Troubleshooting**

### **If Migration Fails:**
1. Check if tables already exist
2. Verify you have proper permissions
3. Check for conflicting constraints

### **If PGRST200 Error Persists:**
1. Clear all caches: `npx expo start --clear`
2. Check if your queries are using the correct relationship syntax
3. Verify the foreign key constraint was created properly

### **If No Pizza Options Show:**
1. Check if you have products in the 'Pizza' category
2. Verify the sample data was inserted
3. Check the pizza_options table for data

## **Next Steps**

1. **Apply the migration** using one of the methods above
2. **Test your app** to ensure the error is resolved
3. **Customize the data** - Add your own crusts, toppings, and pizza options
4. **Update your queries** - Use the new relationship syntax: `crust:crusts(name)`

## **Database Schema Overview**

```
products (id, name, base_price, ...)
    ↓
pizza_options (id, product_id, size, price, crust_id, ...)
    ↓
crusts (id, name, description, ...)

pizza_options (id, ...)
    ↓
pizza_topping_options (pizza_option_id, topping_id, ...)
    ↓
toppings (id, name, price, ...)
```

This setup allows you to:
- Create different pizza sizes with different crusts
- Set different prices for each size/crust combination
- Add toppings to specific pizza options
- Query pizza options with their crust and topping details

---

**Status**: Ready to apply
**Priority**: High - Fixes the PGRST200 error
**Estimated Time**: 5-10 minutes to apply and test
