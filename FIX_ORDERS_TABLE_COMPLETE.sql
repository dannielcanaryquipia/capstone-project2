-- =====================================================
-- COMPLETE FIX for orders table - handles missing status column
-- Run this in your Supabase Dashboard SQL Editor
-- =====================================================

-- Step 1: Add the missing status column back to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Step 2: Populate the status column from status_temp if it exists, otherwise set default
UPDATE public.orders 
SET status = COALESCE(status_temp, 'pending')
WHERE status IS NULL OR status = '';

-- Step 3: Create the order_status enum with correct values
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

-- Step 4: Convert the status column to use the enum
-- First, drop any existing default constraint
ALTER TABLE public.orders ALTER COLUMN status DROP DEFAULT;

-- Now convert the column type
ALTER TABLE public.orders 
ALTER COLUMN status TYPE order_status 
USING CASE status
    WHEN 'Pending' THEN 'pending'::order_status
    WHEN 'Preparing' THEN 'preparing'::order_status
    WHEN 'Ready for Pickup' THEN 'ready_for_pickup'::order_status
    WHEN 'Out for Delivery' THEN 'out_for_delivery'::order_status
    WHEN 'Delivered' THEN 'delivered'::order_status
    WHEN 'Cancelled' THEN 'cancelled'::order_status
    WHEN 'Confirmed' THEN 'confirmed'::order_status
    ELSE 'pending'::order_status
END;

-- Step 5: Set status column constraints
ALTER TABLE public.orders 
ALTER COLUMN status SET NOT NULL,
ALTER COLUMN status SET DEFAULT 'pending'::order_status;

-- Step 6: Clean up the temporary column
ALTER TABLE public.orders DROP COLUMN IF EXISTS status_temp;

-- Step 7: Verify everything is working
SELECT 
    'Orders table structure:' as info,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('status', 'order_number')
ORDER BY column_name;

-- Step 8: Check enum values
SELECT unnest(enum_range(NULL::order_status)) as enum_values;

-- Step 9: Check sample data
SELECT id, order_number, status, created_at 
FROM public.orders 
LIMIT 5;
