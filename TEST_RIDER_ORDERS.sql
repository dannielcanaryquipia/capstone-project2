-- =====================================================
-- Test rider orders data fetching
-- =====================================================

-- Step 1: Check if we have orders with the correct status
SELECT 'Orders with ready_for_pickup status:' as info;
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
WHERE status = 'ready_for_pickup'
ORDER BY created_at DESC;

-- Step 2: Check if we have orders with preparing status
SELECT 'Orders with preparing status:' as info;
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
WHERE status = 'preparing'
ORDER BY created_at DESC;

-- Step 3: Check order items for these orders
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
    SELECT id FROM public.orders 
    WHERE status IN ('ready_for_pickup', 'preparing')
)
ORDER BY oi.order_id, oi.created_at;

-- Step 4: Check delivery addresses for these orders
SELECT 'Delivery addresses for available orders:' as info;
SELECT 
    o.id as order_id,
    o.order_number,
    a.id as address_id,
    a.full_address,
    a.label
FROM public.orders o
LEFT JOIN public.addresses a ON o.delivery_address_id = a.id
WHERE o.status IN ('ready_for_pickup', 'preparing')
ORDER BY o.created_at DESC;

-- Step 5: Check customer information for these orders
SELECT 'Customer information for available orders:' as info;
SELECT 
    o.id as order_id,
    o.order_number,
    p.id as profile_id,
    p.full_name,
    p.phone_number
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
WHERE o.status IN ('ready_for_pickup', 'preparing')
ORDER BY o.created_at DESC;

-- Step 6: Check if there are any delivery assignments for these orders
SELECT 'Delivery assignments for available orders:' as info;
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
WHERE o.status IN ('ready_for_pickup', 'preparing')
ORDER BY da.assigned_at DESC;
