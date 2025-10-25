-- =====================================================
-- Debug query to check rider order availability
-- =====================================================

-- Step 1: Check all orders and their status
SELECT 'All orders with their status:' as info;
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
ORDER BY created_at DESC 
LIMIT 10;

-- Step 2: Check orders that should be available for riders
SELECT 'Orders that should be available for riders:' as info;
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
ORDER BY created_at DESC;

-- Step 3: Check delivery assignments
SELECT 'Current delivery assignments:' as info;
SELECT 
    id,
    order_id,
    rider_id,
    status,
    assigned_at,
    picked_up_at,
    delivered_at
FROM public.delivery_assignments 
ORDER BY assigned_at DESC 
LIMIT 10;

-- Step 4: Check riders table
SELECT 'Available riders:' as info;
SELECT 
    id,
    user_id,
    is_available,
    vehicle_number,
    created_at
FROM public.riders 
ORDER BY created_at DESC;

-- Step 5: Check if there are any orders with ready_for_pickup status
SELECT 'Orders with ready_for_pickup status:' as info;
SELECT COUNT(*) as count
FROM public.orders 
WHERE status = 'ready_for_pickup';

-- Step 6: Check if there are any orders with preparing status
SELECT 'Orders with preparing status:' as info;
SELECT COUNT(*) as count
FROM public.orders 
WHERE status = 'preparing';

-- Step 7: Check payment verification status
SELECT 'Payment verification status:' as info;
SELECT 
    payment_verified,
    COUNT(*) as count
FROM public.orders 
GROUP BY payment_verified;
