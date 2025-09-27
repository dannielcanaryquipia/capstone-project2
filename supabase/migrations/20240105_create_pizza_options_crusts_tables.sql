-- Create pizza_options and crusts tables with proper foreign key relationships
-- This migration fixes the PGRST200 error by establishing the missing relationship

-- 1. Create crusts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.crusts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Create pizza_options table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pizza_options (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size text NOT NULL,
    price numeric(10, 2) NOT NULL,
    crust_id uuid NOT NULL REFERENCES public.crusts(id) ON DELETE RESTRICT,
    is_available boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(product_id, size, crust_id)
);

-- 3. Create toppings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.toppings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text,
    price numeric(10, 2) DEFAULT 0,
    is_available boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Create pizza_topping_options junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pizza_topping_options (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    pizza_option_id uuid NOT NULL REFERENCES public.pizza_options(id) ON DELETE CASCADE,
    topping_id uuid NOT NULL REFERENCES public.toppings(id) ON DELETE CASCADE,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(pizza_option_id, topping_id)
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pizza_options_product_id ON public.pizza_options(product_id);
CREATE INDEX IF NOT EXISTS idx_pizza_options_crust_id ON public.pizza_options(crust_id);
CREATE INDEX IF NOT EXISTS idx_pizza_options_size ON public.pizza_options(size);
CREATE INDEX IF NOT EXISTS idx_pizza_topping_options_pizza_option_id ON public.pizza_topping_options(pizza_option_id);
CREATE INDEX IF NOT EXISTS idx_pizza_topping_options_topping_id ON public.pizza_topping_options(topping_id);

-- 6. Enable Row Level Security
ALTER TABLE public.crusts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pizza_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toppings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pizza_topping_options ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
-- Allow everyone to read crusts
CREATE POLICY "Crusts are viewable by everyone" ON public.crusts
    FOR SELECT USING (true);

-- Allow everyone to read toppings
CREATE POLICY "Toppings are viewable by everyone" ON public.toppings
    FOR SELECT USING (true);

-- Allow everyone to read pizza options
CREATE POLICY "Pizza options are viewable by everyone" ON public.pizza_options
    FOR SELECT USING (true);

-- Allow everyone to read pizza topping options
CREATE POLICY "Pizza topping options are viewable by everyone" ON public.pizza_topping_options
    FOR SELECT USING (true);

-- Allow admins to manage all tables
CREATE POLICY "Admins can manage crusts" ON public.crusts
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage toppings" ON public.toppings
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage pizza options" ON public.pizza_options
    FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage pizza topping options" ON public.pizza_topping_options
    FOR ALL USING (public.is_admin());

-- 8. Insert sample crusts if they don't exist
INSERT INTO public.crusts (id, name, description) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Thin Crust', 'Crispy and light thin crust'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Regular Crust', 'Classic medium thickness crust'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Thick Crust', 'Thick and doughy crust'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Stuffed Crust', 'Crust filled with cheese')
ON CONFLICT (name) DO NOTHING;

-- 9. Insert sample toppings if they don't exist
INSERT INTO public.toppings (id, name, description, price) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', 'Pepperoni', 'Classic pepperoni slices', 0),
    ('650e8400-e29b-41d4-a716-446655440002', 'Mushrooms', 'Fresh sliced mushrooms', 0),
    ('650e8400-e29b-41d4-a716-446655440003', 'Onions', 'Diced white onions', 0),
    ('650e8400-e29b-41d4-a716-446655440004', 'Green Peppers', 'Sliced green bell peppers', 0),
    ('650e8400-e29b-41d4-a716-446655440005', 'Olives', 'Black olives', 0),
    ('650e8400-e29b-41d4-a716-446655440006', 'Extra Cheese', 'Additional mozzarella cheese', 2.00),
    ('650e8400-e29b-41d4-a716-446655440007', 'Sausage', 'Italian sausage crumbles', 0),
    ('650e8400-e29b-41d4-a716-446655440008', 'Bacon', 'Crispy bacon bits', 0)
ON CONFLICT (name) DO NOTHING;

-- 10. Create sample pizza options for existing products (if any exist)
-- This will create pizza options for products that are in the 'Pizza' category
DO $$
DECLARE
    pizza_product record;
    crust_record record;
    size_option text;
    base_price numeric;
    option_price numeric;
BEGIN
    -- Loop through products in the Pizza category
    FOR pizza_product IN 
        SELECT p.id, p.name, p.base_price, c.id as category_id
        FROM public.products p
        JOIN public.categories c ON p.category_id = c.id
        WHERE LOWER(c.name) LIKE '%pizza%'
    LOOP
        -- Loop through each crust
        FOR crust_record IN SELECT id, name FROM public.crusts LOOP
            -- Create options for different sizes
            FOR size_option IN SELECT unnest(ARRAY['Small', 'Medium', 'Large']) LOOP
                -- Calculate price based on size
                base_price := pizza_product.base_price;
                CASE size_option
                    WHEN 'Small' THEN option_price := base_price * 0.8;
                    WHEN 'Medium' THEN option_price := base_price;
                    WHEN 'Large' THEN option_price := base_price * 1.3;
                END CASE;
                
                -- Insert pizza option
                INSERT INTO public.pizza_options (product_id, size, price, crust_id)
                VALUES (pizza_product.id, size_option, option_price, crust_record.id)
                ON CONFLICT (product_id, size, crust_id) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- 11. Add triggers for updated_at columns
CREATE TRIGGER update_crusts_updated_at
    BEFORE UPDATE ON public.crusts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pizza_options_updated_at
    BEFORE UPDATE ON public.pizza_options
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_toppings_updated_at
    BEFORE UPDATE ON public.toppings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. Create a view for pizza options with crust details
CREATE OR REPLACE VIEW public.pizza_options_with_crusts AS
SELECT 
    po.*,
    c.name as crust_name,
    c.description as crust_description,
    p.name as product_name
FROM public.pizza_options po
JOIN public.crusts c ON po.crust_id = c.id
JOIN public.products p ON po.product_id = p.id;

-- 13. Create a view for pizza options with toppings
CREATE OR REPLACE VIEW public.pizza_options_with_toppings AS
SELECT 
    po.*,
    c.name as crust_name,
    p.name as product_name,
    COALESCE(
        json_agg(
            json_build_object(
                'id', t.id,
                'name', t.name,
                'description', t.description,
                'price', t.price,
                'is_default', pto.is_default
            ) ORDER BY t.name
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'::json
    ) as toppings
FROM public.pizza_options po
JOIN public.crusts c ON po.crust_id = c.id
JOIN public.products p ON po.product_id = p.id
LEFT JOIN public.pizza_topping_options pto ON po.id = pto.pizza_option_id
LEFT JOIN public.toppings t ON pto.topping_id = t.id
GROUP BY po.id, c.name, p.name;
