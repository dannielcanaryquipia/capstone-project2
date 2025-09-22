-- Fix Database Schema Issues for Expo Go Data Fetching
-- Run this script in your Supabase SQL Editor

-- 1. Create products table if it doesn't exist (copy from menu_items)
CREATE TABLE IF NOT EXISTS products (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    base_price numeric(10, 2) NOT NULL,
    price numeric(10, 2) NOT NULL DEFAULT 0,
    category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    image_url text,
    is_available boolean DEFAULT true,
    is_recommended boolean DEFAULT false,
    preparation_time_minutes integer DEFAULT 30,
    calories integer,
    allergens text[],
    ingredients text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Copy data from menu_items to products if products is empty
INSERT INTO products (id, name, description, base_price, price, category_id, image_url, is_available, is_recommended, preparation_time_minutes, created_at, updated_at)
SELECT 
    id, 
    name, 
    description, 
    price as base_price, 
    price, 
    category_id, 
    image_url, 
    is_available, 
    is_featured as is_recommended, 
    preparation_time as preparation_time_minutes, 
    created_at, 
    updated_at
FROM menu_items
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1)
ON CONFLICT (id) DO NOTHING;

-- 3. Update products price column to match base_price
UPDATE products SET price = base_price WHERE price = 0 OR price IS NULL;

-- 4. Create product_stock table
CREATE TABLE IF NOT EXISTS product_stock (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity integer DEFAULT 100,
    low_stock_threshold integer DEFAULT 10,
    last_updated timestamptz DEFAULT now()
);

-- 5. Create initial stock entries for all products
INSERT INTO product_stock (product_id, quantity)
SELECT id, 100 FROM products
ON CONFLICT (product_id) DO NOTHING;

-- 6. Fix orders table - add missing columns
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number text,
ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_instructions text,
ADD COLUMN IF NOT EXISTS assigned_delivery_id uuid,
ADD COLUMN IF NOT EXISTS delivery_person_name text,
ADD COLUMN IF NOT EXISTS delivery_person_phone text,
ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
ADD COLUMN IF NOT EXISTS prepared_at timestamptz,
ADD COLUMN IF NOT EXISTS picked_up_at timestamptz,
ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS rating numeric(3,2),
ADD COLUMN IF NOT EXISTS review text,
ADD COLUMN IF NOT EXISTS notes text;

-- 7. Generate order numbers for existing orders
UPDATE orders 
SET order_number = 'ORD-' || LPAD(EXTRACT(EPOCH FROM created_at)::text, 10, '0')
WHERE order_number IS NULL;

-- 8. Calculate subtotal for existing orders
UPDATE orders 
SET subtotal = total_amount - COALESCE(delivery_fee, 0) - COALESCE(tax_amount, 0) + COALESCE(discount_amount, 0)
WHERE subtotal IS NULL OR subtotal = 0;

-- 9. Fix order_items table - add missing columns
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS product_name text,
ADD COLUMN IF NOT EXISTS product_image text,
ADD COLUMN IF NOT EXISTS pizza_size text,
ADD COLUMN IF NOT EXISTS pizza_crust text,
ADD COLUMN IF NOT EXISTS toppings text[],
ADD COLUMN IF NOT EXISTS total_price numeric;

-- 10. Update order_items with calculated total_price
UPDATE order_items 
SET total_price = unit_price * quantity
WHERE total_price IS NULL;

-- 11. Fix foreign key references in orders table
-- Update the foreign key to reference profiles instead of delivery_profiles
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_delivery_staff_id_fkey;

ALTER TABLE orders 
ADD CONSTRAINT orders_delivery_staff_id_fkey 
FOREIGN KEY (delivery_staff_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 12. Create proper indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_is_recommended ON products(is_recommended);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 13. Update RLS policies for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read available products
CREATE POLICY "Everyone can view available products" ON products
    FOR SELECT USING (is_available = true);

-- Allow admins to view all products
CREATE POLICY "Admins can view all products" ON products
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow admins to manage products
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 14. Update RLS policies for product_stock table
ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read stock info
CREATE POLICY "Everyone can view stock" ON product_stock
    FOR SELECT USING (true);

-- Allow admins to manage stock
CREATE POLICY "Admins can manage stock" ON product_stock
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 15. Create a function to test database connectivity
CREATE OR REPLACE FUNCTION test_database_connection()
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'success', true,
        'timestamp', now(),
        'tables', json_build_object(
            'profiles', (SELECT count(*) FROM profiles),
            'products', (SELECT count(*) FROM products),
            'orders', (SELECT count(*) FROM orders),
            'categories', (SELECT count(*) FROM categories)
        )
    ) INTO result;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'timestamp', now()
        );
END;
$$ LANGUAGE plpgsql;

-- 16. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION test_database_connection() TO anon, authenticated;

-- 17. Test the connection
SELECT test_database_connection();

-- 18. Verify data integrity
SELECT 
    'profiles' as table_name, count(*) as record_count
FROM profiles
UNION ALL
SELECT 
    'products' as table_name, count(*) as record_count
FROM products
UNION ALL
SELECT 
    'orders' as table_name, count(*) as record_count
FROM orders
UNION ALL
SELECT 
    'categories' as table_name, count(*) as record_count
FROM categories
UNION ALL
SELECT 
    'order_items' as table_name, count(*) as record_count
FROM order_items;
