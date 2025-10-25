-- =====================================================
-- SAFE FIX for enum case consistency
-- This script checks for column existence before updating
-- =====================================================

-- Step 1: Check current table structure
SELECT 'Current orders table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 2: Check if status column exists, if not, add it
DO $$
BEGIN
    -- Check if status column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'status' 
        AND table_schema = 'public'
    ) THEN
        -- Add status column if it doesn't exist
        ALTER TABLE public.orders ADD COLUMN status text DEFAULT 'pending';
        RAISE NOTICE 'Added status column to orders table';
    ELSE
        RAISE NOTICE 'Status column already exists in orders table';
    END IF;
END $$;

-- Step 3: Check if payment_status column exists, if not, add it
DO $$
BEGIN
    -- Check if payment_status column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'payment_status' 
        AND table_schema = 'public'
    ) THEN
        -- Add payment_status column if it doesn't exist
        ALTER TABLE public.orders ADD COLUMN payment_status text DEFAULT 'pending';
        RAISE NOTICE 'Added payment_status column to orders table';
    ELSE
        RAISE NOTICE 'Payment_status column already exists in orders table';
    END IF;
END $$;

-- Step 4: Drop and recreate enums with correct lowercase values
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

-- Step 5: Update existing data to use lowercase values (only if columns exist)
-- Update orders table status column
UPDATE public.orders 
SET status = CASE 
  WHEN status::text = 'Pending' THEN 'pending'
  WHEN status::text = 'Confirmed' THEN 'confirmed'  
  WHEN status::text = 'Preparing' THEN 'preparing'
  WHEN status::text = 'Ready for Pickup' THEN 'ready_for_pickup'
  WHEN status::text = 'Out for Delivery' THEN 'out_for_delivery'
  WHEN status::text = 'Delivered' THEN 'delivered'
  WHEN status::text = 'Cancelled' THEN 'cancelled'
  ELSE status
END
WHERE status IS NOT NULL;

-- Update orders table payment_status column
UPDATE public.orders 
SET payment_status = CASE 
  WHEN payment_status::text = 'Pending' THEN 'pending'
  WHEN payment_status::text = 'Verified' THEN 'verified'
  WHEN payment_status::text = 'Failed' THEN 'failed'
  WHEN payment_status::text = 'Refunded' THEN 'refunded'
  ELSE payment_status
END
WHERE payment_status IS NOT NULL;

-- Update payment_transactions table status column (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'status' 
        AND table_schema = 'public'
    ) THEN
        UPDATE public.payment_transactions 
        SET status = CASE 
          WHEN status::text = 'Pending' THEN 'pending'
          WHEN status::text = 'Verified' THEN 'verified'
          WHEN status::text = 'Failed' THEN 'failed'
          WHEN status::text = 'Refunded' THEN 'refunded'
          ELSE status
        END
        WHERE status IS NOT NULL;
        RAISE NOTICE 'Updated payment_transactions status column';
    ELSE
        RAISE NOTICE 'payment_transactions status column does not exist, skipping';
    END IF;
END $$;

-- Step 6: Convert columns to use the new enum types
-- First, drop the default values to avoid casting issues
ALTER TABLE public.orders 
ALTER COLUMN status DROP DEFAULT,
ALTER COLUMN payment_status DROP DEFAULT;

-- Convert status column to order_status enum
ALTER TABLE public.orders 
ALTER COLUMN status TYPE order_status 
USING status::order_status;

-- Convert payment_status column to payment_status enum
ALTER TABLE public.orders 
ALTER COLUMN payment_status TYPE payment_status 
USING payment_status::payment_status;

-- Convert payment_transactions status column (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'status' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.payment_transactions 
        ALTER COLUMN status TYPE payment_status 
        USING status::payment_status;
        RAISE NOTICE 'Converted payment_transactions status column to enum';
    END IF;
END $$;

-- Step 7: Set default values
ALTER TABLE public.orders 
ALTER COLUMN status SET DEFAULT 'pending'::order_status,
ALTER COLUMN payment_status SET DEFAULT 'pending'::payment_status;

-- Set default for payment_transactions if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payment_transactions' 
        AND column_name = 'status' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.payment_transactions 
        ALTER COLUMN status SET DEFAULT 'pending'::payment_status;
    END IF;
END $$;

-- Step 8: Verify the changes
SELECT 'Updated orders table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Updated enum values:' as info;
SELECT unnest(enum_range(NULL::order_status)) as order_status_values;
SELECT unnest(enum_range(NULL::payment_status)) as payment_status_values;

-- Step 9: Check sample data
SELECT 'Sample orders data:' as info;
SELECT id, status, payment_status, created_at 
FROM public.orders 
ORDER BY created_at DESC 
LIMIT 5;
