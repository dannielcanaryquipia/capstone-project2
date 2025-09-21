-- Fix schema mismatches between database and TypeScript types
-- This migration addresses enum mismatches and missing columns

-- 1. Fix enum types to match TypeScript definitions
-- Drop existing enums if they exist and recreate with correct values
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

DROP TYPE IF EXISTS payment_status CASCADE;
CREATE TYPE payment_status AS ENUM (
    'pending',
    'verified',
    'failed',
    'refunded'
);

DROP TYPE IF EXISTS delivery_status CASCADE;
CREATE TYPE delivery_status AS ENUM (
    'assigned',
    'picked_up',
    'in_transit',
    'delivered',
    'failed'
);

-- 2. Fix array column types
ALTER TABLE public.products 
ALTER COLUMN gallery_image_urls TYPE text[] USING gallery_image_urls::text[],
ALTER COLUMN allergens TYPE text[] USING allergens::text[];

-- 3. Add missing columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_number text,
ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_instructions text,
ADD COLUMN IF NOT EXISTS assigned_delivery_id uuid,
ADD COLUMN IF NOT EXISTS delivery_person_name text,
ADD COLUMN IF NOT EXISTS delivery_person_phone text,
ADD COLUMN IF NOT EXISTS confirmed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS prepared_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS picked_up_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancellation_reason text,
ADD COLUMN IF NOT EXISTS rating numeric(3,2),
ADD COLUMN IF NOT EXISTS review text,
ADD COLUMN IF NOT EXISTS notes text;

-- 4. Add missing columns to order_items table
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS product_name text,
ADD COLUMN IF NOT EXISTS product_image text,
ADD COLUMN IF NOT EXISTS total_price numeric,
ADD COLUMN IF NOT EXISTS special_instructions text,
ADD COLUMN IF NOT EXISTS pizza_size text,
ADD COLUMN IF NOT EXISTS pizza_crust text,
ADD COLUMN IF NOT EXISTS toppings text[];

-- 5. Add missing columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price numeric, -- Add price column for compatibility
ADD COLUMN IF NOT EXISTS ingredients text[];

-- 6. Update products table to use price instead of base_price for compatibility
UPDATE public.products SET price = base_price WHERE price IS NULL;
ALTER TABLE public.products ALTER COLUMN price SET NOT NULL;

-- 7. Add missing columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- 8. Fix foreign key constraints
-- Add missing foreign key for assigned_delivery_id
ALTER TABLE public.orders 
ADD CONSTRAINT orders_assigned_delivery_id_fkey 
FOREIGN KEY (assigned_delivery_id) REFERENCES public.profiles(id);

-- 9. Update existing data to use correct enum values
-- Update order status values
UPDATE public.orders SET status = 'pending' WHERE status = 'Pending';
UPDATE public.orders SET status = 'preparing' WHERE status = 'Preparing';
UPDATE public.orders SET status = 'ready_for_pickup' WHERE status = 'Ready for Pickup';
UPDATE public.orders SET status = 'out_for_delivery' WHERE status = 'Out for Delivery';
UPDATE public.orders SET status = 'delivered' WHERE status = 'Delivered';
UPDATE public.orders SET status = 'cancelled' WHERE status = 'Cancelled';

-- Update payment status values
UPDATE public.orders SET payment_status = 'pending' WHERE payment_status = 'Pending';
UPDATE public.orders SET payment_status = 'verified' WHERE payment_status = 'Verified';
UPDATE public.orders SET payment_status = 'failed' WHERE payment_status = 'Failed';
UPDATE public.orders SET payment_status = 'refunded' WHERE payment_status = 'Refunded';

-- Update delivery status values
UPDATE public.delivery_assignments SET status = 'assigned' WHERE status = 'Assigned';
UPDATE public.delivery_assignments SET status = 'picked_up' WHERE status = 'Picked Up';
UPDATE public.delivery_assignments SET status = 'in_transit' WHERE status = 'In Transit';
UPDATE public.delivery_assignments SET status = 'delivered' WHERE status = 'Delivered';
UPDATE public.delivery_assignments SET status = 'failed' WHERE status = 'Failed';

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_is_recommended ON public.products(is_recommended);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_saved_products_user_id ON public.saved_products(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_products_product_id ON public.saved_products(product_id);

-- 11. Create a view for order items with product details (for easier querying)
CREATE OR REPLACE VIEW public.order_items_with_products AS
SELECT 
    oi.*,
    p.name as product_name,
    p.image_url as product_image,
    p.description as product_description,
    c.name as category_name
FROM public.order_items oi
LEFT JOIN public.products p ON oi.product_id = p.id
LEFT JOIN public.categories c ON p.category_id = c.id;

-- 12. Create a view for orders with user details (for admin queries)
CREATE OR REPLACE VIEW public.orders_with_users AS
SELECT 
    o.*,
    p.full_name as customer_name,
    p.phone_number as customer_phone,
    p.email as customer_email,
    a.full_address as delivery_address_text
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
LEFT JOIN public.addresses a ON o.delivery_address_id = a.id;

-- 13. Add RLS policies for security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;

-- Allow all users to read products
CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (true);

-- Allow users to read their own orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to read their own order items
CREATE POLICY "Users can view their own order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

-- Allow users to manage their own saved products
CREATE POLICY "Users can manage their own saved products" ON public.saved_products
    FOR ALL USING (auth.uid() = user_id);

-- 14. Create functions for common operations
-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
BEGIN
    RETURN 'KO-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update order totals
CREATE OR REPLACE FUNCTION update_order_totals(order_id uuid)
RETURNS void AS $$
DECLARE
    order_subtotal numeric;
    order_tax numeric;
    order_total numeric;
BEGIN
    -- Calculate subtotal from order items
    SELECT COALESCE(SUM(total_price), 0) INTO order_subtotal
    FROM public.order_items 
    WHERE order_id = order_id;
    
    -- Calculate tax (12% of subtotal)
    order_tax := order_subtotal * 0.12;
    
    -- Calculate total (subtotal + tax + delivery fee)
    SELECT (order_subtotal + order_tax + COALESCE(delivery_fee, 0)) INTO order_total
    FROM public.orders 
    WHERE id = order_id;
    
    -- Update the order
    UPDATE public.orders 
    SET 
        subtotal = order_subtotal,
        tax_amount = order_tax,
        total_amount = order_total,
        updated_at = now()
    WHERE id = order_id;
END;
$$ LANGUAGE plpgsql;

-- 15. Create triggers for automatic updates
-- Trigger to update order totals when order items change
CREATE OR REPLACE FUNCTION trigger_update_order_totals()
RETURNS trigger AS $$
BEGIN
    PERFORM update_order_totals(COALESCE(NEW.order_id, OLD.order_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_order_totals();

-- 16. Insert sample data for testing (optional)
-- Insert sample categories
INSERT INTO public.categories (id, name, description) VALUES
    (gen_random_uuid(), 'Pizza', 'Delicious pizzas with various toppings'),
    (gen_random_uuid(), 'Pasta', 'Fresh pasta dishes'),
    (gen_random_uuid(), 'Salads', 'Healthy and fresh salads'),
    (gen_random_uuid(), 'Beverages', 'Refreshing drinks')
ON CONFLICT (name) DO NOTHING;

-- Insert sample crusts
INSERT INTO public.crusts (id, name) VALUES
    (gen_random_uuid(), 'Thin Crust'),
    (gen_random_uuid(), 'Regular Crust'),
    (gen_random_uuid(), 'Thick Crust'),
    (gen_random_uuid(), 'Stuffed Crust')
ON CONFLICT (name) DO NOTHING;

-- Insert sample toppings
INSERT INTO public.toppings (id, name) VALUES
    (gen_random_uuid(), 'Pepperoni'),
    (gen_random_uuid(), 'Mushrooms'),
    (gen_random_uuid(), 'Onions'),
    (gen_random_uuid(), 'Green Peppers'),
    (gen_random_uuid(), 'Olives'),
    (gen_random_uuid(), 'Extra Cheese'),
    (gen_random_uuid(), 'Sausage'),
    (gen_random_uuid(), 'Bacon')
ON CONFLICT (name) DO NOTHING;
