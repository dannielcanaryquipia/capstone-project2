-- =====================================================
-- RESTORE ORDER STATUSES based on historical data
-- Run this in your Supabase Dashboard SQL Editor
-- =====================================================

-- Step 1: Check what data we have to work with
SELECT 'Order Status History Count:' as info, COUNT(*) as count FROM order_status_history;
SELECT 'Delivery Assignments Count:' as info, COUNT(*) as count FROM delivery_assignments;
SELECT 'Orders with actual_delivery_time:' as info, COUNT(*) as count FROM orders WHERE actual_delivery_time IS NOT NULL;
SELECT 'Orders with payment_verified:' as info, COUNT(*) as count FROM orders WHERE payment_verified = true;

-- Step 2: Restore statuses based on order_status_history (most reliable)
UPDATE public.orders 
SET status = (
    SELECT osh.status::order_status
    FROM order_status_history osh
    WHERE osh.order_id = orders.id
    ORDER BY osh.created_at DESC
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 FROM order_status_history osh 
    WHERE osh.order_id = orders.id
);

-- Step 3: For orders without history, determine status based on other indicators
-- Orders with actual_delivery_time should be 'delivered'
UPDATE public.orders 
SET status = 'delivered'::order_status
WHERE actual_delivery_time IS NOT NULL 
AND status = 'pending'::order_status;

-- Orders with delivery assignments that are picked up should be 'out_for_delivery'
UPDATE public.orders 
SET status = 'out_for_delivery'::order_status
WHERE id IN (
    SELECT da.order_id 
    FROM delivery_assignments da 
    WHERE da.picked_up_at IS NOT NULL 
    AND da.delivered_at IS NULL
)
AND status = 'pending'::order_status;

-- Orders with delivery assignments but not picked up should be 'ready_for_pickup'
UPDATE public.orders 
SET status = 'ready_for_pickup'::order_status
WHERE id IN (
    SELECT da.order_id 
    FROM delivery_assignments da 
    WHERE da.picked_up_at IS NULL 
    AND da.delivered_at IS NULL
)
AND status = 'pending'::order_status;

-- Orders with payment verified but no delivery assignment should be 'preparing'
UPDATE public.orders 
SET status = 'preparing'::order_status
WHERE payment_verified = true 
AND id NOT IN (SELECT order_id FROM delivery_assignments)
AND status = 'pending'::order_status;

-- Orders with payment verified should be 'confirmed' (if not already assigned)
UPDATE public.orders 
SET status = 'confirmed'::order_status
WHERE payment_verified = true 
AND status = 'pending'::order_status;

-- Step 4: Show the results
SELECT 'Status Distribution After Restoration:' as info;
SELECT status, COUNT(*) as count 
FROM public.orders 
GROUP BY status 
ORDER BY count DESC;

-- Step 5: Show some sample orders with their restored statuses
SELECT 
    id,
    order_number,
    status,
    created_at,
    actual_delivery_time,
    payment_verified,
    CASE 
        WHEN id IN (SELECT order_id FROM delivery_assignments) THEN 'Has Delivery Assignment'
        ELSE 'No Delivery Assignment'
    END as delivery_status
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 10;
