-- =====================================================
-- Remove test orders safely
-- =====================================================

-- Step 1: Check current orders before deletion
SELECT 'Orders before deletion:' as info;
SELECT 
    id,
    order_number,
    status,
    payment_method,
    total_amount,
    created_at
FROM public.orders 
ORDER BY created_at DESC;

-- Step 2: Check if there are any delivery assignments for test orders
SELECT 'Delivery assignments for test orders:' as info;
SELECT 
    da.id as assignment_id,
    da.order_id,
    da.rider_id,
    o.order_number,
    o.status
FROM public.delivery_assignments da
LEFT JOIN public.orders o ON da.order_id = o.id
WHERE o.order_number LIKE 'TEST-%';

-- Step 3: Check if there are any order items for test orders
SELECT 'Order items for test orders:' as info;
SELECT 
    oi.id as item_id,
    oi.order_id,
    oi.quantity,
    oi.unit_price,
    o.order_number
FROM public.order_items oi
LEFT JOIN public.orders o ON oi.order_id = o.id
WHERE o.order_number LIKE 'TEST-%';

-- Step 4: Delete delivery assignments for test orders (if any)
DELETE FROM public.delivery_assignments 
WHERE order_id IN (
    SELECT id FROM public.orders 
    WHERE order_number LIKE 'TEST-%'
);

-- Step 5: Delete order items for test orders
DELETE FROM public.order_items 
WHERE order_id IN (
    SELECT id FROM public.orders 
    WHERE order_number LIKE 'TEST-%'
);

-- Step 6: Delete test orders
DELETE FROM public.orders 
WHERE order_number LIKE 'TEST-%';

-- Step 7: Verify deletion - check remaining orders
SELECT 'Orders after deletion:' as info;
SELECT 
    id,
    order_number,
    status,
    payment_method,
    total_amount,
    created_at
FROM public.orders 
ORDER BY created_at DESC;

-- Step 8: Check delivery assignments after deletion
SELECT 'Remaining delivery assignments:' as info;
SELECT 
    da.id as assignment_id,
    da.order_id,
    da.rider_id,
    da.status as assignment_status,
    da.assigned_at,
    o.order_number,
    o.status as order_status
FROM public.delivery_assignments da
LEFT JOIN public.orders o ON da.order_id = o.id
ORDER BY da.assigned_at DESC;

-- Step 9: Check available orders for riders after cleanup
SELECT 'Available orders for riders after cleanup:' as info;
SELECT 
    id,
    order_number,
    status,
    payment_status,
    payment_verified,
    payment_method,
    total_amount,
    created_at
FROM public.orders 
WHERE status IN ('ready_for_pickup', 'preparing')
AND (payment_verified = true OR (payment_method = 'cod' AND payment_status = 'pending'))
ORDER BY created_at DESC;
