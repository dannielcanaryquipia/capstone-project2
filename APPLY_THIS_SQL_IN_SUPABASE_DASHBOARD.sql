-- =====================================================
-- IMPORTANT: Run this SQL in your Supabase Dashboard
-- Go to: SQL Editor > New Query > Paste this code > Run
-- =====================================================

-- Fix both order_number column and order_status enum issues
-- This fixes the "column orders.order_number does not exist" error
-- and the "invalid input value for enum order_status" error

-- 1. Add the order_number column to the orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(50);

-- 2. Generate order numbers for existing orders that don't have one
UPDATE public.orders 
SET order_number = 'ORD-' || LPAD(EXTRACT(EPOCH FROM created_at)::text, 10, '0')
WHERE order_number IS NULL;

-- 3. Create a function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate order number if not provided
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := 'ORD-' || LPAD(EXTRACT(EPOCH FROM NOW())::text, 10, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to auto-generate order numbers for new orders
DROP TRIGGER IF EXISTS trigger_generate_order_number ON public.orders;
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- 5. Add index for better performance on order_number queries
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- 6. Update the order_number column to be NOT NULL after populating existing records
ALTER TABLE public.orders ALTER COLUMN order_number SET NOT NULL;

-- 7. Fix order_status enum to match code expectations (snake_case)
-- First, let's see what enum values currently exist
SELECT unnest(enum_range(NULL::order_status)) as current_values;

-- First, add a temporary text column to store the converted values
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status_temp TEXT;

-- Update the temporary column with snake_case values
UPDATE public.orders 
SET status_temp = CASE 
    WHEN status::text = 'Pending' THEN 'pending'
    WHEN status::text = 'Preparing' THEN 'preparing'
    WHEN status::text = 'Ready for Pickup' THEN 'ready_for_pickup'
    WHEN status::text = 'Out for Delivery' THEN 'out_for_delivery'
    WHEN status::text = 'Delivered' THEN 'delivered'
    WHEN status::text = 'Cancelled' THEN 'cancelled'
    ELSE status::text
END;

-- Drop and recreate the order_status enum with snake_case values
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

-- Update the orders table to use the new enum from the temporary column
ALTER TABLE public.orders 
ALTER COLUMN status TYPE order_status 
USING status_temp::order_status;

-- Drop the temporary column
ALTER TABLE public.orders DROP COLUMN status_temp;

-- 8. Verify the changes
SELECT 
    COUNT(*) as total_orders,
    COUNT(order_number) as orders_with_number,
    COUNT(*) - COUNT(order_number) as orders_without_number
FROM public.orders;

-- Verify the enum values are correct
SELECT unnest(enum_range(NULL::order_status)) as enum_values;
