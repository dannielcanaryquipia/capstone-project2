-- Align database schema with actual database structure
-- This migration fixes the mismatches between the app and database

-- First, let's check what ENUMs actually exist and fix them
DO $$
BEGIN
    -- Drop existing ENUMs if they exist
    DROP TYPE IF EXISTS order_status CASCADE;
    DROP TYPE IF EXISTS payment_status CASCADE;
    DROP TYPE IF EXISTS payment_method CASCADE;
    DROP TYPE IF EXISTS user_role CASCADE;
    DROP TYPE IF EXISTS delivery_status CASCADE;
END $$;

-- Create ENUMs that match the application expectations
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed', 
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
    'cancelled'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'verified',
    'failed', 
    'refunded'
);

CREATE TYPE payment_method AS ENUM (
    'cod',
    'gcash',
    'card'
);

CREATE TYPE user_role AS ENUM (
    'customer',
    'admin',
    'delivery'
);

CREATE TYPE delivery_status AS ENUM (
    'assigned',
    'picked_up',
    'delivered',
    'cancelled'
);

-- Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price NUMERIC,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;

-- Update products to use price column (copy from base_price)
UPDATE products SET price = base_price WHERE price IS NULL;

-- Make price column NOT NULL after copying data
ALTER TABLE products ALTER COLUMN price SET NOT NULL;

-- Add missing columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS subtotal NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS prepared_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS picked_up_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Add missing columns to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS product_image TEXT,
ADD COLUMN IF NOT EXISTS pizza_size TEXT,
ADD COLUMN IF NOT EXISTS pizza_crust TEXT,
ADD COLUMN IF NOT EXISTS toppings TEXT[],
ADD COLUMN IF NOT EXISTS total_price NUMERIC;

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing data to match new ENUM values
-- Convert 'Pending' to 'pending' in orders table
UPDATE orders SET status = 'pending' WHERE status::text = 'Pending';
UPDATE orders SET payment_status = 'pending' WHERE payment_status::text = 'Pending';

-- Convert 'Pending' to 'pending' in payment_transactions table
UPDATE payment_transactions SET status = 'pending' WHERE status::text = 'Pending';

-- Convert 'Assigned' to 'assigned' in delivery_assignments table
UPDATE delivery_assignments SET status = 'assigned' WHERE status::text = 'Assigned';

-- Update profiles role to use ENUM
UPDATE profiles SET role = 'customer' WHERE role = 'customer';
UPDATE profiles SET role = 'admin' WHERE role = 'admin';
UPDATE profiles SET role = 'delivery' WHERE role = 'delivery_staff' OR role = 'delivery';

-- Generate order numbers for existing orders
UPDATE orders 
SET order_number = 'ORD-' || LPAD(EXTRACT(EPOCH FROM created_at)::text, 10, '0')
WHERE order_number IS NULL;

-- Calculate subtotal for existing orders
UPDATE orders 
SET subtotal = total_amount - COALESCE(delivery_fee, 0) - COALESCE(tax_amount, 0) + COALESCE(discount_amount, 0)
WHERE subtotal IS NULL OR subtotal = 0;

-- Update order_items with calculated total_price
UPDATE order_items 
SET total_price = unit_price * quantity
WHERE total_price IS NULL;

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_is_recommended ON products(is_recommended);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Enable RLS on all tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for products
CREATE POLICY "Everyone can view available products" ON products
    FOR SELECT USING (is_available = true);

CREATE POLICY "Admins can view all products" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for order_items
CREATE POLICY "Users can view their order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE id = order_items.order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for saved_products
CREATE POLICY "Users can view their saved products" ON saved_products
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their saved products" ON saved_products
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for addresses
CREATE POLICY "Users can view their own addresses" ON addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own addresses" ON addresses
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for order management
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ORD-' || LPAD(EXTRACT(EPOCH FROM NOW())::text, 10, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order number generation
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Create function to calculate order total
CREATE OR REPLACE FUNCTION calculate_order_total(order_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
    total NUMERIC := 0;
BEGIN
    SELECT COALESCE(SUM(unit_price * quantity), 0)
    INTO total
    FROM order_items
    WHERE order_id = order_uuid;
    
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Create function to update order total when items change
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders 
    SET total_amount = calculate_order_total(COALESCE(NEW.order_id, OLD.order_id)),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update order total
DROP TRIGGER IF EXISTS trigger_update_order_total ON order_items;
CREATE TRIGGER trigger_update_order_total
    AFTER INSERT OR UPDATE OR DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_total();
