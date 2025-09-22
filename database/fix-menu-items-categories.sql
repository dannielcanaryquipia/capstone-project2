-- Fix menu_items and categories relationship
-- Run this script in your Supabase SQL Editor

-- 1. First, check if menu_items table has category_id column
-- If not, add it
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS category_id uuid;

-- 2. Create a foreign key constraint to categories table
-- This will only work if the categories table exists
ALTER TABLE menu_items 
ADD CONSTRAINT fk_menu_items_category_id 
FOREIGN KEY (category_id) 
REFERENCES categories(id) 
ON DELETE SET NULL;

-- 3. Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id 
ON menu_items(category_id);

-- 4. Update existing menu_items to have a default category
-- First, let's see what categories exist
-- You may need to create some categories first
INSERT INTO categories (id, name, description) 
VALUES 
  (gen_random_uuid(), 'Main Dishes', 'Main course items'),
  (gen_random_uuid(), 'Appetizers', 'Starter items'),
  (gen_random_uuid(), 'Desserts', 'Sweet treats'),
  (gen_random_uuid(), 'Beverages', 'Drinks and beverages')
ON CONFLICT (name) DO NOTHING;

-- 5. Update existing menu_items to have a default category
-- This assigns all existing items to the first category
UPDATE menu_items 
SET category_id = (
  SELECT id FROM categories 
  WHERE name = 'Main Dishes' 
  LIMIT 1
)
WHERE category_id IS NULL;

-- 6. Verify the relationship works
-- This should return menu items with their categories
SELECT 
  mi.id,
  mi.name,
  mi.price,
  c.name as category_name
FROM menu_items mi
LEFT JOIN categories c ON mi.category_id = c.id
LIMIT 5;
