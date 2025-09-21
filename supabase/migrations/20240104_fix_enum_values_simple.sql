-- Simple fix for ENUM values to match application expectations
-- This migration only fixes the ENUM values without changing table structure

-- First, let's see what ENUMs currently exist and their values
-- We need to handle the case where the database might have different ENUM values

-- For orders table, we need to handle the status column
-- The error shows "invalid input value for enum order_status: 'pending'"
-- This means the database expects different values

-- Let's check if we can update existing data to match what the app expects
-- or if we need to create new ENUMs

-- Option 1: Update existing data to match database ENUMs
-- This is safer as it doesn't change the database structure

-- Update orders table to use database-compatible status values
UPDATE orders 
SET status = CASE 
  WHEN status::text = 'pending' THEN 'Pending'::order_status
  WHEN status::text = 'confirmed' THEN 'Confirmed'::order_status  
  WHEN status::text = 'preparing' THEN 'Preparing'::order_status
  WHEN status::text = 'ready_for_pickup' THEN 'Ready for Pickup'::order_status
  WHEN status::text = 'out_for_delivery' THEN 'Out for Delivery'::order_status
  WHEN status::text = 'delivered' THEN 'Delivered'::order_status
  WHEN status::text = 'cancelled' THEN 'Cancelled'::order_status
  ELSE status
END
WHERE status IS NOT NULL;

-- Update payment_status if needed
UPDATE orders 
SET payment_status = CASE 
  WHEN payment_status::text = 'pending' THEN 'Pending'::payment_status
  WHEN payment_status::text = 'verified' THEN 'Verified'::payment_status
  WHEN payment_status::text = 'failed' THEN 'Failed'::payment_status
  WHEN payment_status::text = 'refunded' THEN 'Refunded'::payment_status
  ELSE payment_status
END
WHERE payment_status IS NOT NULL;

-- Add missing columns that the app expects
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price NUMERIC;

-- Copy base_price to price if price is null
UPDATE products 
SET price = base_price 
WHERE price IS NULL AND base_price IS NOT NULL;

-- Make price column NOT NULL after copying data
ALTER TABLE products ALTER COLUMN price SET NOT NULL;

-- Add other missing columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- Generate order numbers for existing orders
UPDATE orders 
SET order_number = 'ORD-' || LPAD(EXTRACT(EPOCH FROM created_at)::text, 10, '0')
WHERE order_number IS NULL;

-- Calculate subtotal for existing orders
UPDATE orders 
SET subtotal = total_amount - COALESCE(delivery_fee, 0) - COALESCE(tax_amount, 0) + COALESCE(discount_amount, 0)
WHERE subtotal IS NULL OR subtotal = 0;

-- Add missing columns to order_items
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_image TEXT,
ADD COLUMN IF NOT EXISTS total_price NUMERIC;

-- Update order_items with calculated total_price
UPDATE order_items 
SET total_price = unit_price * quantity
WHERE total_price IS NULL;

-- Add missing columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
