-- =====================================================
-- Test rider assigned orders workflow
-- =====================================================

-- Step 1: Check if there are any riders in the system
SELECT 'Available riders:' as info;
SELECT 
    r.id as rider_id,
    r.user_id,
    r.vehicle_number,
    r.is_available,
    p.full_name,
    p.phone_number
FROM public.riders r
LEFT JOIN public.profiles p ON r.user_id = p.id
ORDER BY r.created_at DESC;

-- Step 2: Check current orders and their statuses
SELECT 'Current orders and statuses:' as info;
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

-- Step 3: Check delivery assignments
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
    o.status as order_status,
    p.full_name as rider_name
FROM public.delivery_assignments da
LEFT JOIN public.orders o ON da.order_id = o.id
LEFT JOIN public.riders r ON da.rider_id = r.id
LEFT JOIN public.profiles p ON r.user_id = p.id
ORDER BY da.assigned_at DESC;

-- Step 4: Test the rider order query (simulate what the app does)
-- This should return assigned orders for a specific rider
SELECT 'Simulated rider assigned orders query:' as info;
SELECT 
    da.id as assignment_id,
    da.order_id,
    da.rider_id,
    da.status as assignment_status,
    da.assigned_at,
    da.picked_up_at,
    da.delivered_at,
    o.id as order_id,
    o.order_number,
    o.status as order_status,
    o.total_amount,
    o.payment_method,
    o.payment_status,
    o.payment_verified,
    a.full_address,
    a.label as address_label,
    p.full_name as customer_name,
    p.phone_number as customer_phone
FROM public.delivery_assignments da
LEFT JOIN public.orders o ON da.order_id = o.id
LEFT JOIN public.addresses a ON o.delivery_address_id = a.id
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE da.rider_id IS NOT NULL
AND o.status IN ('out_for_delivery', 'ready_for_pickup', 'preparing')
ORDER BY da.assigned_at DESC;

-- Step 5: Check if there are any orders that should be available for riders
SELECT 'Orders available for assignment:' as info;
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
AND (o.payment_verified = true OR (o.payment_method = 'cod' AND o.payment_status = 'pending'))
ORDER BY o.created_at DESC;

-- Step 6: Check order items for available orders
SELECT 'Order items for available orders:' as info;
SELECT 
    oi.id,
    oi.order_id,
    oi.product_id,
    oi.quantity,
    oi.unit_price,
    p.name as product_name,
    p.image_url as product_image
FROM public.order_items oi
LEFT JOIN public.products p ON oi.product_id = p.id
WHERE oi.order_id IN (
    SELECT o.id FROM public.orders o
    LEFT JOIN public.delivery_assignments da ON o.id = da.order_id
    WHERE o.status IN ('ready_for_pickup', 'preparing')
    AND (o.payment_verified = true OR (o.payment_method = 'cod' AND o.payment_status = 'pending'))
    AND (da.id IS NULL OR da.rider_id IS NULL)
)
ORDER BY oi.order_id, oi.created_at;
