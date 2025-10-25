-- =====================================================
-- Test complete rider workflow
-- =====================================================

-- Step 1: Check current orders and their statuses
SELECT 'Current orders and their statuses:' as info;
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
ORDER BY created_at DESC;

-- Step 2: Check delivery assignments
SELECT 'Current delivery assignments:' as info;
SELECT 
    da.id as assignment_id,
    da.order_id,
    da.rider_id,
    da.status as assignment_status,
    da.assigned_at,
    da.picked_up_at,
    da.delivered_at,
    o.order_number,
    o.status as order_status
FROM public.delivery_assignments da
LEFT JOIN public.orders o ON da.order_id = o.id
ORDER BY da.assigned_at DESC;

-- Step 3: Check available orders for riders (ready_for_pickup or preparing)
SELECT 'Available orders for riders:' as info;
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.payment_status,
    o.payment_verified,
    o.payment_method,
    o.total_amount,
    o.created_at,
    CASE 
        WHEN da.id IS NULL THEN 'Available'
        WHEN da.rider_id IS NULL THEN 'Available'
        ELSE 'Assigned'
    END as availability_status
FROM public.orders o
LEFT JOIN public.delivery_assignments da ON o.id = da.order_id
WHERE o.status IN ('ready_for_pickup', 'preparing')
ORDER BY o.created_at DESC;

-- Step 4: Check rider assignments by status
SELECT 'Rider assignments by status:' as info;
SELECT 
    da.status as assignment_status,
    COUNT(*) as count
FROM public.delivery_assignments da
GROUP BY da.status
ORDER BY count DESC;

-- Step 5: Check orders by status
SELECT 'Orders by status:' as info;
SELECT 
    status,
    COUNT(*) as count
FROM public.orders 
GROUP BY status
ORDER BY count DESC;

-- Step 6: Test the workflow - simulate accepting an order
-- First, let's see what orders are available
SELECT 'Orders available for assignment:' as info;
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.payment_status,
    o.payment_verified,
    o.payment_method,
    o.total_amount
FROM public.orders o
LEFT JOIN public.delivery_assignments da ON o.id = da.order_id
WHERE o.status IN ('ready_for_pickup', 'preparing')
AND (da.id IS NULL OR da.rider_id IS NULL)
ORDER BY o.created_at DESC
LIMIT 5;

-- Step 7: Check if there are any riders available
SELECT 'Available riders:' as info;
SELECT 
    r.id,
    r.user_id,
    r.vehicle_number,
    r.is_available,
    p.full_name,
    p.phone_number
FROM public.riders r
LEFT JOIN public.profiles p ON r.user_id = p.id
WHERE r.is_available = true
ORDER BY r.created_at DESC;
