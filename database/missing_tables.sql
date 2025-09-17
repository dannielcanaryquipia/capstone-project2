-- Missing ENUM definitions needed for Kitchen One database
-- These must be created BEFORE the tables that reference them

-- 1. ORDER STATUS ENUM
CREATE TYPE order_status AS ENUM (
  'Pending',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Delivered',
  'Cancelled'
);

-- 2. PAYMENT STATUS ENUM
CREATE TYPE payment_status AS ENUM (
  'Pending',
  'Verified',
  'Paid',
  'Failed',
  'Refunded'
);

-- 3. DELIVERY STATUS ENUM
CREATE TYPE delivery_status AS ENUM (
  'Assigned',
  'Picked Up',
  'In Transit',
  'Delivered',
  'Failed'
);

-- Missing tables and modifications needed for complete Kitchen One functionality
-- Note: order_status and payment_status ENUMs already exist in your database

-- 1. DELIVERY STATUS ENUM (if not already created)
-- 2. RIDERS/DELIVERY STAFF TABLE
CREATE TABLE public.riders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  vehicle_number text,
  is_available boolean DEFAULT true,
  current_location jsonb, -- {lat: number, lng: number}
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT riders_pkey PRIMARY KEY (id),
  CONSTRAINT riders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- 3. DELIVERY ASSIGNMENTS TABLE
CREATE TABLE public.delivery_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  rider_id uuid,
  assigned_at timestamp with time zone DEFAULT now(),
  picked_up_at timestamp with time zone,
  delivered_at timestamp with time zone,
  status delivery_status DEFAULT 'Assigned',
  notes text,
  CONSTRAINT delivery_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT delivery_assignments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT delivery_assignments_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.riders(id)
);

-- 4. PAYMENT TRANSACTIONS TABLE
CREATE TABLE public.payment_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL, -- 'COD', 'COP', 'Online'
  status payment_status DEFAULT 'Pending',
  transaction_reference text,
  proof_of_payment_url text,
  verified_by uuid, -- admin who verified
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payment_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT payment_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT payment_transactions_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES auth.users(id)
);

-- 5. INVENTORY TRANSACTIONS TABLE
CREATE TABLE public.inventory_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  transaction_type text NOT NULL, -- 'IN', 'OUT', 'ADJUSTMENT'
  quantity integer NOT NULL,
  reason text,
  performed_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT inventory_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT inventory_transactions_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES auth.users(id)
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL, -- 'order_update', 'payment', 'delivery', 'system'
  is_read boolean DEFAULT false,
  related_order_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT notifications_related_order_id_fkey FOREIGN KEY (related_order_id) REFERENCES public.orders(id)
);

-- 7. ORDER NOTES/HISTORY TABLE
CREATE TABLE public.order_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  note text NOT NULL,
  added_by uuid NOT NULL,
  note_type text DEFAULT 'general', -- 'status_update', 'payment_note', 'delivery_note', 'customer_note'
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_notes_pkey PRIMARY KEY (id),
  CONSTRAINT order_notes_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT order_notes_added_by_fkey FOREIGN KEY (added_by) REFERENCES auth.users(id)
);

-- 8. MODIFICATIONS TO EXISTING TABLES

-- Add missing columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS estimated_delivery_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS actual_delivery_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS customer_notes text,
ADD COLUMN IF NOT EXISTS admin_notes text;

-- Add missing columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS preparation_time_minutes integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS allergens text[],
ADD COLUMN IF NOT EXISTS nutritional_info jsonb;

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login timestamp with time zone,
ADD COLUMN IF NOT EXISTS preferences jsonb;

-- CORRECTIONS FOR EXISTING SCHEMA
-- Fix ARRAY types to proper PostgreSQL syntax

-- Fix products table array columns
ALTER TABLE public.products 
ALTER COLUMN gallery_image_urls TYPE text[] USING gallery_image_urls::text[],
ALTER COLUMN allergens TYPE text[] USING allergens::text[];

-- Ensure proper enum usage in orders table
ALTER TABLE public.orders 
ALTER COLUMN status TYPE order_status USING status::order_status,
ALTER COLUMN payment_status TYPE payment_status USING payment_status::payment_status;

-- Ensure proper enum usage in delivery_assignments table
ALTER TABLE public.delivery_assignments 
ALTER COLUMN status TYPE delivery_status USING status::delivery_status;

-- Ensure proper enum usage in payment_transactions table
ALTER TABLE public.payment_transactions 
ALTER COLUMN status TYPE payment_status USING status::payment_status;

-- 9. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_rider_id ON public.delivery_assignments(rider_id);
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_status ON public.delivery_assignments(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_product_stock_quantity ON public.product_stock(quantity);

-- 10. ROW LEVEL SECURITY POLICIES (if needed)
-- Note: These would need to be customized based on your security requirements

-- Enable RLS on new tables
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY; 