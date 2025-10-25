-- Fix order_status enum values to match code expectations
-- This script ensures the enum has all the values the code expects

-- 1. First, let's see what enum values currently exist
SELECT unnest(enum_range(NULL::order_status)) as current_values;

-- 2. Drop and recreate the order_status enum with all required values
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

-- 3. Update the orders table to use the new enum
ALTER TABLE public.orders 
ALTER COLUMN status TYPE order_status 
USING status::text::order_status;

-- 4. Verify the enum values are correct
SELECT unnest(enum_range(NULL::order_status)) as enum_values;
