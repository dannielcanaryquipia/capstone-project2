-- Product Images Storage Bucket Setup
-- Run this in your Supabase SQL Editor to set up product image storage

-- STEP 1: Create the product-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- STEP 2: Create storage policies for product-images bucket
-- Policy: Allow public read access to product images (for displaying product pictures)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Product Images') THEN
        CREATE POLICY "Public Access Product Images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'product-images');
    END IF;
END $$;

-- Policy: Allow authenticated users to upload product images (admin access)
-- Only admins should be able to upload product images
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload Product Images') THEN
        CREATE POLICY "Authenticated Upload Product Images"
        ON storage.objects FOR INSERT
        WITH CHECK (
            bucket_id = 'product-images' 
            AND auth.role() = 'authenticated'
            AND public.is_admin()
        );
    END IF;
END $$;

-- Policy: Allow authenticated users (admins) to update product images
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Update Product Images') THEN
        CREATE POLICY "Authenticated Update Product Images"
        ON storage.objects FOR UPDATE
        USING (
            bucket_id = 'product-images' 
            AND auth.role() = 'authenticated'
            AND public.is_admin()
        );
    END IF;
END $$;

-- Policy: Allow authenticated users (admins) to delete product images
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Delete Product Images') THEN
        CREATE POLICY "Authenticated Delete Product Images"
        ON storage.objects FOR DELETE
        USING (
            bucket_id = 'product-images' 
            AND auth.role() = 'authenticated'
            AND public.is_admin()
        );
    END IF;
END $$;

-- Policy: Allow admins full access to manage product images
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin Manage Product Images') THEN
        CREATE POLICY "Admin Manage Product Images"
        ON storage.objects FOR ALL
        USING (bucket_id = 'product-images' AND public.is_admin());
    END IF;
END $$;

-- Verification queries (optional - run these to check if setup was successful)
-- SELECT * FROM storage.buckets WHERE id = 'product-images';
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%Product Image%';

