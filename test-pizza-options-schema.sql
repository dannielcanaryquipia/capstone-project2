-- Test script to verify pizza_options and crusts tables are properly set up
-- Run this after applying the migration to verify everything is working

-- 1. Check if all tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pizza_options', 'crusts', 'toppings', 'pizza_topping_options')
ORDER BY table_name;

-- 2. Check pizza_options table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pizza_options'
ORDER BY ordinal_position;

-- 3. Check foreign key relationships
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('pizza_options', 'pizza_topping_options')
ORDER BY tc.table_name, kcu.column_name;

-- 4. Test the relationship by querying pizza options with crust details
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

-- 5. Check if sample data was inserted
SELECT 'crusts' as table_name, count(*) as record_count FROM public.crusts
UNION ALL
SELECT 'toppings' as table_name, count(*) as record_count FROM public.toppings
UNION ALL
SELECT 'pizza_options' as table_name, count(*) as record_count FROM public.pizza_options
UNION ALL
SELECT 'pizza_topping_options' as table_name, count(*) as record_count FROM public.pizza_topping_options;

-- 6. Test the views
SELECT * FROM public.pizza_options_with_crusts LIMIT 3;
SELECT * FROM public.pizza_options_with_toppings LIMIT 3;
