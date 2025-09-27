-- Fix pizza_options table to add crust_id foreign key relationship
-- This will resolve the PGRST200 error

-- Step 1: Add crust_id column to pizza_options table
ALTER TABLE public.pizza_options 
ADD COLUMN crust_id uuid;

-- Step 2: Add foreign key constraint
ALTER TABLE public.pizza_options 
ADD CONSTRAINT fk_pizza_options_crust_id 
FOREIGN KEY (crust_id) REFERENCES public.crusts(id);

-- Step 3: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_pizza_options_crust_id 
ON public.pizza_options(crust_id);

-- Step 4: Optional - Add some sample crusts if they don't exist //i dont add this option
INSERT INTO public.crusts (id, name) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Thin Crust'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Regular Crust'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Thick Crust'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Stuffed Crust')
ON CONFLICT (id) DO NOTHING;

-- Step 5: Optional - Update existing pizza_options with a default crust
-- This will set all existing pizza options to use 'Regular Crust'
UPDATE public.pizza_options 
SET crust_id = 'd7711703-5047-468d-9532-e7155a86eb17'
WHERE crust_id IS NULL;

-- Step 6: Make crust_id NOT NULL after setting default values
ALTER TABLE public.pizza_options 
ALTER COLUMN crust_id SET NOT NULL;

-- Step 7: Verify the relationship works
SELECT 
    po.id,
    po.size,
    po.price,
    c.name as crust_name,
    p.name as product_name
FROM public.pizza_options po
JOIN public.crusts c ON po.crust_id = c.id
JOIN public.products p ON po.product_id = p.id
LIMIT 5;
