-- Safe foreign key constraints for admin functionality
-- This script only adds the constraints needed for the admin pages to work

-- Add foreign key constraint for orders.user_id to profiles.id
-- This creates a direct relationship between orders and profiles
ALTER TABLE public.orders 
ADD CONSTRAINT orders_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON public.products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_is_recommended ON public.products(is_recommended);

-- Note: Skipping pizza_topping_options foreign key constraint due to data integrity issues
-- You can run the fix_pizza_topping_options.sql script first if you need that constraint 