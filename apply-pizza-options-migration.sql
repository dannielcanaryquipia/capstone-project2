-- Quick script to apply the pizza_options and crusts tables migration
-- Run this in your Supabase SQL Editor or via the Supabase CLI

-- First, let's check if the tables already exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('pizza_options', 'crusts', 'toppings', 'pizza_topping_options')
ORDER BY table_name, ordinal_position;

-- Check if foreign key relationships exist
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('pizza_options', 'pizza_topping_options');

-- If the above queries show missing tables or relationships, run the migration:
-- Copy and paste the contents of supabase/migrations/20240105_create_pizza_options_crusts_tables.sql
