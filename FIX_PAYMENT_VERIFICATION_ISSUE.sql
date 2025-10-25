-- =====================================================
-- Fix payment verification issue for COD orders
-- =====================================================

-- Step 1: Check current payment verification status
SELECT 'Current payment verification status:' as info;
SELECT
    order_number,
    payment_method,
    payment_status,
    payment_verified,
    status
FROM public.orders 
ORDER BY created_at DESC;

-- Step 2: Fix COD orders that were incorrectly marked as verified
-- COD orders should have payment_verified = false until rider verifies
UPDATE public.orders 
SET 
    payment_verified = false,
    payment_status = 'pending'
WHERE payment_method = 'cod' 
AND payment_verified = true
AND status IN ('ready_for_pickup', 'out_for_delivery');

-- Step 3: Fix GCash orders that should be verified
-- GCash orders should be verified by admin before being ready for pickup
UPDATE public.orders 
SET 
    payment_verified = true,
    payment_status = 'verified'
WHERE payment_method = 'gcash' 
AND payment_verified = false
AND status IN ('ready_for_pickup', 'out_for_delivery');

-- Step 4: Verify the fixes
SELECT 'After fixes - Payment verification status:' as info;
SELECT 
    order_number,
    payment_method,
    payment_status,
    payment_verified,
    status
FROM public.orders 
ORDER BY created_at DESC;

-- Step 5: Check available orders for riders (should show correct counts)
SELECT 'Available orders for riders after fix:' as info;
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
