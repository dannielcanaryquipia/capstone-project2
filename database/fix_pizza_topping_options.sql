-- Fix pizza_topping_options data integrity issues
-- This script should be run BEFORE adding the foreign key constraint

-- First, let's see what orphaned records exist
SELECT 
    pt.pizza_option_id,
    pt.topping_id,
    t.name as topping_name
FROM pizza_topping_options pt
LEFT JOIN toppings t ON pt.topping_id = t.id
WHERE pt.pizza_option_id NOT IN (SELECT id FROM pizza_options);

-- Delete orphaned records that reference non-existent pizza_options
DELETE FROM pizza_topping_options 
WHERE pizza_option_id NOT IN (SELECT id FROM pizza_options);

-- Now let's also check for orphaned records that reference non-existent toppings
SELECT 
    pt.pizza_option_id,
    pt.topping_id
FROM pizza_topping_options pt
WHERE pt.topping_id NOT IN (SELECT id FROM toppings);

-- Delete orphaned records that reference non-existent toppings
DELETE FROM pizza_topping_options 
WHERE topping_id NOT IN (SELECT id FROM toppings);

-- Now we can safely add the foreign key constraint
ALTER TABLE public.pizza_topping_options 
ADD CONSTRAINT pizza_topping_options_pizza_option_id_fkey 
FOREIGN KEY (pizza_option_id) REFERENCES public.pizza_options(id);

-- Also add the missing foreign key for topping_id if it doesn't exist
ALTER TABLE public.pizza_topping_options 
ADD CONSTRAINT pizza_topping_options_topping_id_fkey 
FOREIGN KEY (topping_id) REFERENCES public.toppings(id); 