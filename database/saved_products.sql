-- Create saved_products table for user favorites
CREATE TABLE IF NOT EXISTS saved_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only save a product once
  UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_products_user_id ON saved_products(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_products_product_id ON saved_products(product_id);
CREATE INDEX IF NOT EXISTS idx_saved_products_created_at ON saved_products(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only see their own saved products
CREATE POLICY "Users can view their own saved products" ON saved_products
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own saved products
CREATE POLICY "Users can save products" ON saved_products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own saved products
CREATE POLICY "Users can unsave products" ON saved_products
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_saved_products_updated_at 
  BEFORE UPDATE ON saved_products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE saved_products IS 'Stores user saved/favorited products for AI recommendations'; 