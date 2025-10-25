-- Add missing order_number column to orders table
-- This migration fixes the "column orders.order_number does not exist" error

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
