-- =====================================================
-- Fix rider order availability issues
-- =====================================================

-- Step 1: Check current order statuses
SELECT 'Current order statuses:' as info;
SELECT 
    status,
    COUNT(*) as count
FROM public.orders 
GROUP BY status
ORDER BY count DESC;

-- Step 2: Check payment verification status
SELECT 'Payment verification status:' as info;
SELECT 
    payment_verified,
    payment_status,
    COUNT(*) as count
FROM public.orders 
GROUP BY payment_verified, payment_status
ORDER BY count DESC;

-- Step 3: Update orders to have proper status progression
-- Move some orders to ready_for_pickup for testing
UPDATE public.orders 
SET status = 'ready_for_pickup'
WHERE status = 'preparing' 
AND payment_verified = true;

-- Step 4: Ensure payment verification is set for orders with verified payment status
UPDATE public.orders 
SET payment_verified = true
WHERE payment_status = 'verified' 
AND payment_verified = false;

-- Step 5: Check available orders for riders
SELECT 'Orders available for riders:' as info;
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
AND payment_verified = true
ORDER BY created_at DESC;

-- Step 6: Check delivery assignments
SELECT 'Current delivery assignments:' as info;
SELECT 
    da.id,
    da.order_id,
    da.rider_id,
    da.status,
    da.assigned_at,
    o.order_number,
    o.status as order_status
FROM public.delivery_assignments da
LEFT JOIN public.orders o ON da.order_id = o.id
ORDER BY da.assigned_at DESC;

-- Step 7: Fix the broken order flow
-- Reset the out_for_delivery order to ready_for_pickup and fix payment verification
UPDATE public.orders 
SET 
    status = 'ready_for_pickup',
    payment_verified = true,
    payment_status = 'verified'
WHERE status = 'out_for_delivery' 
AND payment_verified = false;

-- Step 8: Create test orders for rider testing
-- Insert a few test orders with different statuses
INSERT INTO public.orders (
    user_id,
    delivery_address_id,
    total_amount,
    payment_method,
    payment_status,
    payment_verified,
    order_number,
    status
) VALUES 
    (
        (SELECT id FROM public.profiles WHERE role = 'customer' LIMIT 1),
        (SELECT id FROM public.addresses LIMIT 1),
        150.00,
        'cod',
        'pending',
        false,
        'TEST-001',
        'ready_for_pickup'
    ),
    (
        (SELECT id FROM public.profiles WHERE role = 'customer' LIMIT 1),
        (SELECT id FROM public.addresses LIMIT 1),
        200.00,
        'gcash',
        'verified',
        true,
        'TEST-002',
        'ready_for_pickup'
    ),
    (
        (SELECT id FROM public.profiles WHERE role = 'customer' LIMIT 1),
        (SELECT id FROM public.addresses LIMIT 1),
        175.00,
        'cod',
        'pending',
        false,
        'TEST-003',
        'preparing'
    );

-- Step 9: Verify the fixes
SELECT 'After fixes - Order statuses:' as info;
SELECT 
    status,
    COUNT(*) as count
FROM public.orders 
GROUP BY status
ORDER BY count DESC;

SELECT 'After fixes - Available orders for riders:' as info;
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
