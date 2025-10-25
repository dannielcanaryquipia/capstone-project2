-- =====================================================
-- FINAL FIX for enum case consistency
-- Run this in your Supabase Dashboard SQL Editor
-- =====================================================

-- Step 1: Check current enum values
SELECT 'Current order_status enum values:' as info;
SELECT unnest(enum_range(NULL::order_status)) as order_status_values;

SELECT 'Current payment_status enum values:' as info;
SELECT unnest(enum_range(NULL::payment_status)) as payment_status_values;

-- Step 2: Drop and recreate enums with correct lowercase values FIRST
-- Drop order_status enum and recreate
DROP TYPE IF EXISTS order_status CASCADE;
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed', 
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
    'cancelled'
);

-- Drop payment_status enum and recreate
DROP TYPE IF EXISTS payment_status CASCADE;
CREATE TYPE payment_status AS ENUM (
    'pending',
    'verified',
    'failed', 
    'refunded'
);

-- Step 3: Update existing data to use lowercase values
-- Update orders table status column
UPDATE public.orders 
SET status = CASE 
  WHEN status::text = 'Pending' THEN 'pending'::order_status
  WHEN status::text = 'Confirmed' THEN 'confirmed'::order_status  
  WHEN status::text = 'Preparing' THEN 'preparing'::order_status
  WHEN status::text = 'Ready for Pickup' THEN 'ready_for_pickup'::order_status
  WHEN status::text = 'Out for Delivery' THEN 'out_for_delivery'::order_status
  WHEN status::text = 'Delivered' THEN 'delivered'::order_status
  WHEN status::text = 'Cancelled' THEN 'cancelled'::order_status
  ELSE status
END
WHERE status IS NOT NULL;

-- Update orders table payment_status column
UPDATE public.orders 
SET payment_status = CASE 
  WHEN payment_status::text = 'Pending' THEN 'pending'::payment_status
  WHEN payment_status::text = 'Verified' THEN 'verified'::payment_status
  WHEN payment_status::text = 'Failed' THEN 'failed'::payment_status
  WHEN payment_status::text = 'Refunded' THEN 'refunded'::payment_status
  ELSE payment_status
END
WHERE payment_status IS NOT NULL;

-- Update payment_transactions table status column
UPDATE public.payment_transactions 
SET status = CASE 
  WHEN status::text = 'Pending' THEN 'pending'::payment_status
  WHEN status::text = 'Verified' THEN 'verified'::payment_status
  WHEN status::text = 'Failed' THEN 'failed'::payment_status
  WHEN status::text = 'Refunded' THEN 'refunded'::payment_status
  ELSE status
END
WHERE status IS NOT NULL;

-- Step 4: Update the orders table to use the new enum types
ALTER TABLE public.orders 
ALTER COLUMN status TYPE order_status 
USING status::text::order_status;

ALTER TABLE public.orders 
ALTER COLUMN payment_status TYPE payment_status 
USING payment_status::text::payment_status;

-- Step 5: Update the payment_transactions table to use the new enum types
ALTER TABLE public.payment_transactions 
ALTER COLUMN status TYPE payment_status 
USING status::text::payment_status;

-- Step 6: Set default values
ALTER TABLE public.orders 
ALTER COLUMN status SET DEFAULT 'pending'::order_status,
ALTER COLUMN payment_status SET DEFAULT 'pending'::payment_status;

ALTER TABLE public.payment_transactions 
ALTER COLUMN status SET DEFAULT 'pending'::payment_status;

-- Step 7: Verify the changes
SELECT 'Updated order_status enum values:' as info;
SELECT unnest(enum_range(NULL::order_status)) as order_status_values;

SELECT 'Updated payment_status enum values:' as info;
SELECT unnest(enum_range(NULL::payment_status)) as payment_status_values;

-- Step 8: Check sample data
SELECT 'Sample orders data:' as info;
SELECT id, status, payment_status, created_at 
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'Sample payment_transactions data:' as info;
SELECT id, status, created_at 
FROM public.payment_transactions 
ORDER BY created_at DESC 
LIMIT 5;
