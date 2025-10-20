-- Add proof_of_delivery_url to orders if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'orders'
      AND column_name  = 'proof_of_delivery_url'
  ) THEN
    ALTER TABLE public.orders
      ADD COLUMN proof_of_delivery_url text;
  END IF;
END $$;

-- Database Migration for AI Recommendations and Payment Verification
-- Run this in your Supabase SQL Editor

-- 1. Add payment verification fields to payment_transactions table
ALTER TABLE payment_transactions 
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS qr_code_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Add payment method and verification fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod',
ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_verified_by UUID REFERENCES profiles(id);

-- 3. Create get_featured_products function
CREATE OR REPLACE FUNCTION get_featured_products(limit_count INTEGER DEFAULT 4)
RETURNS TABLE (
  id UUID, 
  name TEXT, 
  description TEXT, 
  category_id UUID, 
  base_price NUMERIC, 
  image_url TEXT, 
  gallery_image_urls TEXT[], 
  is_available BOOLEAN, 
  is_recommended BOOLEAN, 
  created_at TIMESTAMPTZ, 
  updated_at TIMESTAMPTZ, 
  preparation_time_minutes INTEGER, 
  is_featured BOOLEAN, 
  order_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, 
    p.name, 
    p.description, 
    p.category_id, 
    p.base_price, 
    p.image_url, 
    p.gallery_image_urls, 
    p.is_available, 
    p.is_recommended, 
    p.created_at, 
    p.updated_at, 
    p.preparation_time_minutes, 
    p.is_featured, 
    COALESCE(product_orders.order_count, 0) as order_count
  FROM products p
  LEFT JOIN (
    SELECT 
      oi.product_id, 
      COUNT(*) as order_count
    FROM order_items oi
    INNER JOIN orders o ON oi.order_id = o.id
    WHERE o.status IN ('delivered', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'confirmed')
    GROUP BY oi.product_id
  ) product_orders ON p.id = product_orders.product_id
  WHERE p.is_available = true
  ORDER BY COALESCE(product_orders.order_count, 0) DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_featured_products TO authenticated;
GRANT EXECUTE ON FUNCTION get_featured_products TO anon;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- 6. Add comments for documentation
COMMENT ON FUNCTION get_featured_products IS 'Returns featured products based on order history and availability';
COMMENT ON COLUMN payment_transactions.qr_code_url IS 'URL to the generated QR code for payment';
COMMENT ON COLUMN payment_transactions.qr_code_data IS 'QR code data string';
COMMENT ON COLUMN payment_transactions.qr_code_expires_at IS 'When the QR code expires';
COMMENT ON COLUMN orders.payment_method IS 'Payment method used (cod, gcash, etc.)';
COMMENT ON COLUMN orders.payment_verified IS 'Whether payment has been verified by admin';
COMMENT ON COLUMN orders.payment_verified_at IS 'When payment was verified';
COMMENT ON COLUMN orders.payment_verified_by IS 'Admin who verified the payment';
