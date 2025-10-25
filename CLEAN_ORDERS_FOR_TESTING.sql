-- =====================================================
-- CLEAN ORDERS DATA FOR FRESH TESTING
-- This will delete all order-related data to start fresh
-- Run this in your Supabase Dashboard SQL Editor
-- =====================================================

-- Step 1: Show current data counts before deletion
SELECT 'BEFORE DELETION - Current Data Counts:' as info;
SELECT 'Orders:' as table_name, COUNT(*) as count FROM public.orders
UNION ALL
SELECT 'Order Items:', COUNT(*) FROM public.order_items
UNION ALL
SELECT 'Order Status History:', COUNT(*) FROM public.order_status_history
UNION ALL
SELECT 'Delivery Assignments:', COUNT(*) FROM public.delivery_assignments
UNION ALL
SELECT 'Order Notes:', COUNT(*) FROM public.order_notes
UNION ALL
SELECT 'Payment Transactions:', COUNT(*) FROM public.payment_transactions
UNION ALL
SELECT 'Image Metadata:', COUNT(*) FROM public.image_metadata;

-- Step 2: Delete in correct order (respecting foreign key constraints)
-- Delete from child tables first, then parent tables

-- Delete order-related data in dependency order
DELETE FROM public.order_item_toppings;
DELETE FROM public.order_items;
DELETE FROM public.order_status_history;
DELETE FROM public.delivery_assignments;
DELETE FROM public.order_notes;
DELETE FROM public.payment_transactions;
DELETE FROM public.image_metadata;
DELETE FROM public.orders;

-- Step 3: Show data counts after deletion
SELECT 'AFTER DELETION - Remaining Data Counts:' as info;
SELECT 'Orders:' as table_name, COUNT(*) as count FROM public.orders
UNION ALL
SELECT 'Order Items:', COUNT(*) FROM public.order_items
UNION ALL
SELECT 'Order Status History:', COUNT(*) FROM public.order_status_history
UNION ALL
SELECT 'Delivery Assignments:', COUNT(*) FROM public.delivery_assignments
UNION ALL
SELECT 'Order Notes:', COUNT(*) FROM public.order_notes
UNION ALL
SELECT 'Payment Transactions:', COUNT(*) FROM public.payment_transactions
UNION ALL
SELECT 'Image Metadata:', COUNT(*) FROM public.image_metadata;

-- Step 4: Verify the orders table structure is intact
SELECT 'Orders table structure verification:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('id', 'order_number', 'status', 'created_at')
ORDER BY column_name;

-- Step 5: Verify enum values are still correct
SELECT 'Available order_status enum values:' as info;
SELECT unnest(enum_range(NULL::order_status)) as enum_values;

-- Step 6: Ready for testing message
SELECT '✅ ORDERS TABLE CLEANED - Ready for fresh testing!' as status;
SELECT 'You can now test the complete order flow:' as info;
SELECT '1. Customer: Create new orders' as step;
SELECT '2. Admin: Manage orders (status changes)' as step;
SELECT '3. Rider: Pick up and deliver orders' as step;
