-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create custom types if they don't exist
DO $$
BEGIN
    -- Order status type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM (
            'pending',
            'confirmed',
            'preparing',
            'ready_for_pickup',
            'out_for_delivery',
            'delivered',
            'cancelled'
        );
    END IF;

    -- Payment status type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
        CREATE TYPE payment_status AS ENUM (
            'pending',
            'verified',
            'failed',
            'refunded'
        );
    END IF;

    -- Payment method type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE payment_method AS ENUM (
            'cod',
            'gcash',
            'card'
        );
    END IF;

    -- User role type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'customer',
            'admin',
            'delivery'
        );
    END IF;
END $$;

-- Create tables

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    full_name text NOT NULL,
    phone_number text,
    avatar_url text,
    role user_role NOT NULL DEFAULT 'customer'::user_role,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Delivery staff profiles
CREATE TABLE IF NOT EXISTS public.delivery_profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_type text,
    vehicle_number text,
    current_location geography(POINT, 4326),
    is_available boolean DEFAULT true,
    total_deliveries integer DEFAULT 0,
    rating numeric(3, 2) DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    image_url text,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Menu items
CREATE TABLE IF NOT EXISTS public.menu_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric(10, 2) NOT NULL,
    image_url text,
    category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    is_available boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    preparation_time integer NOT NULL, -- in minutes
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- User addresses
CREATE TABLE IF NOT EXISTS public.addresses (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label text NOT NULL,
    recipient_name text NOT NULL,
    phone_number text NOT NULL,
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    province text NOT NULL,
    postal_code text NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status order_status NOT NULL DEFAULT 'pending'::order_status,
    total_amount numeric(10, 2) NOT NULL,
    delivery_fee numeric(10, 2) NOT NULL DEFAULT 0,
    tax_amount numeric(10, 2) NOT NULL DEFAULT 0,
    payment_status payment_status NOT NULL DEFAULT 'pending'::payment_status,
    payment_method payment_method NOT NULL,
    payment_reference text,
    delivery_address jsonb NOT NULL,
    special_instructions text,
    delivery_staff_id uuid REFERENCES public.delivery_profiles(id) ON DELETE SET NULL,
    estimated_delivery_time timestamptz,
    delivered_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price numeric(10, 2) NOT NULL,
    special_instructions text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- User cart (temporary storage)
CREATE TABLE IF NOT EXISTS public.carts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    items jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- User favorites
CREATE TABLE IF NOT EXISTS public.favorites (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, menu_item_id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(order_id, user_id)
);

-- Promo codes
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    code text NOT NULL UNIQUE,
    description text,
    discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value numeric(10, 2) NOT NULL,
    min_order_amount numeric(10, 2) DEFAULT 0,
    max_discount numeric(10, 2),
    start_date timestamptz NOT NULL,
    end_date timestamptz NOT NULL,
    max_uses integer,
    current_uses integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CHECK (end_date > start_date)
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    type text NOT NULL CHECK (type IN ('order_update', 'promotion', 'system', 'other')),
    related_id text,
    created_at timestamptz DEFAULT now(),
    read_at timestamptz
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is the owner of a resource
CREATE OR REPLACE FUNCTION public.is_owner(user_id_param uuid)
RETURNS boolean AS $$
  SELECT auth.uid() = user_id_param;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is a delivery staff
CREATE OR REPLACE FUNCTION public.is_delivery_staff()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'delivery'::user_role
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_admin());

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id OR public.is_admin() OR 
       (public.is_delivery_staff() AND delivery_staff_id = auth.uid()));

CREATE POLICY "Users can create orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins and delivery staff can update order status"
ON public.orders FOR UPDATE
USING (public.is_admin() OR public.is_delivery_staff() OR 
       (auth.uid() = user_id AND status = 'pending'::order_status));

-- RLS Policies for menu items
CREATE POLICY "Enable read access for all users"
ON public.menu_items FOR SELECT
USING (true);

CREATE POLICY "Enable all for admins"
ON public.menu_items FOR ALL
USING (public.is_admin());

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with updated_at
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %I', 
                      t.table_name, t.table_name);
        EXECUTE format('CREATE TRIGGER update_%s_updated_at
                      BEFORE UPDATE ON %I
                      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()',
                     t.table_name, t.table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Set up storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-items', 'menu-items', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for menu items
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-items');

CREATE POLICY "Admin Access"
ON storage.objects FOR ALL
USING (bucket_id = 'menu-items' AND public.is_admin());

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'customer'::user_role
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to create a profile when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
