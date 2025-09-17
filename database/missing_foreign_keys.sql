-- Add missing foreign key constraints for better database relationships
-- This script adds constraints that might be missing from the original schema

-- Add foreign key constraint for orders.user_id to profiles.id
-- This creates a direct relationship between orders and profiles
ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- Add foreign key constraint for pizza_topping_options.pizza_option_id
-- This was missing from the original schema
ALTER TABLE public.pizza_topping_options 
ADD CONSTRAINT pizza_topping_options_pizza_option_id_fkey 
FOREIGN KEY (pizza_option_id) REFERENCES public.pizza_options(id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_is_recommended ON public.products(is_recommended);

-- Add RLS (Row Level Security) policies if needed
-- Enable RLS on tables that need it
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies for orders table
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create policies for addresses table
CREATE POLICY "Users can view their own addresses" ON public.addresses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" ON public.addresses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" ON public.addresses
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for products table (public read, admin write)
CREATE POLICY "Anyone can view available products" ON public.products
    FOR SELECT USING (is_available = true);

CREATE POLICY "Admins can manage all products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    ); 