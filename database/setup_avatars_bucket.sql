-- Avatar Storage Bucket Setup
-- Run this in your Supabase SQL Editor to set up avatar image storage

-- STEP 1: Create the avatars storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- STEP 2: Create storage policies for avatars bucket
-- Policy: Allow public read access to avatars (for displaying profile pictures)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Avatars') THEN
        CREATE POLICY "Public Access Avatars"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'avatars');
    END IF;
END $$;

-- Policy: Allow authenticated users to upload avatars
-- Note: Path validation is handled by the app (users can only upload to their own folder)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload Avatars') THEN
        CREATE POLICY "Authenticated Upload Avatars"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Policy: Allow authenticated users to update their own avatars
-- Path format: users/{userId}/{timestamp}.jpg
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Update Avatars') THEN
        CREATE POLICY "Authenticated Update Avatars"
        ON storage.objects FOR UPDATE
        USING (
            bucket_id = 'avatars' 
            AND auth.role() = 'authenticated'
            AND (storage.foldername(name))[2] = auth.uid()::text
        );
    END IF;
END $$;

-- Policy: Allow authenticated users to delete their own avatars
-- Path format: users/{userId}/{timestamp}.jpg
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Delete Avatars') THEN
        CREATE POLICY "Authenticated Delete Avatars"
        ON storage.objects FOR DELETE
        USING (
            bucket_id = 'avatars' 
            AND auth.role() = 'authenticated'
            AND (storage.foldername(name))[2] = auth.uid()::text
        );
    END IF;
END $$;

-- Policy: Allow admins to manage all avatars
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin Manage Avatars') THEN
        CREATE POLICY "Admin Manage Avatars"
        ON storage.objects FOR ALL
        USING (bucket_id = 'avatars' AND public.is_admin());
    END IF;
END $$;

-- Verification queries (optional - run these to check if setup was successful)
-- SELECT * FROM storage.buckets WHERE id = 'avatars';
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%Avatar%';

