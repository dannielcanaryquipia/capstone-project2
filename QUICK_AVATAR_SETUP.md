# Quick Avatar Upload Setup - Fix RLS Error

## ❌ The Error You're Seeing

```
ERROR ❌ Supabase Storage upload error: [StorageApiError: new row violates row-level security policy]
```

This means the `avatars` bucket doesn't exist or doesn't have the proper policies set up.

## ✅ Solution: Run This SQL Script

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Copy and Paste This SQL

Copy the entire content from `database/setup_avatars_bucket.sql` and paste it into the SQL Editor, then click **"Run"**.

**OR** copy this simplified version:

```sql
-- STEP 1: Create the avatars storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- STEP 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage Avatars" ON storage.objects;

-- STEP 3: Create storage policies for avatars bucket

-- Policy 1: Allow public read access (anyone can view avatars)
CREATE POLICY "Public Access Avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Allow authenticated users to upload avatars
CREATE POLICY "Authenticated Upload Avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Policy 3: Allow authenticated users to update their own avatars
-- Path format: users/{userId}/{timestamp}.jpg
CREATE POLICY "Authenticated Update Avatars"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 4: Allow authenticated users to delete their own avatars
CREATE POLICY "Authenticated Delete Avatars"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 5: Allow admins to manage all avatars
CREATE POLICY "Admin Manage Avatars"
ON storage.objects FOR ALL
USING (bucket_id = 'avatars' AND public.is_admin());
```

### Step 3: Verify Setup

After running the script, verify it worked:

```sql
-- Check if bucket exists and is public
SELECT id, name, public FROM storage.buckets WHERE id = 'avatars';

-- Check if policies exist
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%Avatar%';
```

You should see:
- ✅ 1 bucket: `avatars` with `public = true`
- ✅ 5 policies listed

### Step 4: Test Again

1. Go back to your app
2. Try uploading an avatar again
3. It should work now! ✅

## 🔍 Troubleshooting

### If you still get the error:

**1. Check if bucket exists:**
```sql
SELECT * FROM storage.buckets WHERE id = 'avatars';
```
If it returns nothing, the bucket wasn't created. Run the INSERT statement again.

**2. Check if bucket is public:**
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'avatars';
```
`public` should be `true`. If not:
```sql
UPDATE storage.buckets SET public = true WHERE id = 'avatars';
```

**3. Check if policies exist:**
```sql
SELECT policyname FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%Avatar%';
```
You should see 5 policies. If not, run the CREATE POLICY statements again.

**4. Check if user is authenticated:**
In your app console, make sure you're logged in. The error occurs when:
- User is not authenticated (`auth.role() = 'authenticated'` fails)
- Bucket doesn't exist
- Policies don't exist

**5. Check if `is_admin()` function exists:**
```sql
SELECT * FROM pg_proc WHERE proname = 'is_admin';
```
If this returns nothing, you need to create the function (from your other setup scripts).

## 📝 What Each Policy Does

1. **Public Access Avatars** - Anyone can view/download avatar images (needed for displaying profile pictures)

2. **Authenticated Upload Avatars** - Only logged-in users can upload images to the avatars bucket

3. **Authenticated Update Avatars** - Users can only update their own avatars (checking the folder path)

4. **Authenticated Delete Avatars** - Users can only delete their own avatars

5. **Admin Manage Avatars** - Admins can do everything with all avatars

## ✅ Success Indicators

After setup, you should be able to:
- ✅ Upload avatar images from the profile screen
- ✅ See the uploaded avatar immediately
- ✅ View avatars on other devices
- ✅ No more RLS policy errors

