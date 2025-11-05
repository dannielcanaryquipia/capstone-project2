# Avatar Image Upload Setup Guide

This guide explains how to set up profile avatar image uploads to Supabase Storage, which will also help fix the broken image issues with proof of payment and proof of delivery images.

## Overview

The avatar upload system allows users to:
- Upload profile pictures from their device
- Store images in Supabase Storage
- Display avatars across all devices
- Remove avatars when needed

## Prerequisites

### Required Dependencies

All required dependencies are already installed in your `package.json`:
- ✅ `expo-image-picker` - For selecting/taking photos
- ✅ `expo-image-manipulator` - For image compression and format conversion
- ✅ `expo-file-system` - For file handling
- ✅ `@supabase/supabase-js` - For Supabase integration

**No additional packages need to be installed!**

## Step 1: Set Up Supabase Storage Bucket

### Option A: Quick Setup (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to your project: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Setup Script**
   - Open the file `database/setup_avatars_bucket.sql`
   - Copy the entire content
   - Paste it into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

### Option B: Manual Setup via Dashboard

1. **Create Storage Bucket**
   - Go to "Storage" in the left sidebar
   - Click "New bucket"
   - Name: `avatars`
   - **Important**: Make sure "Public bucket" is **ENABLED** (toggle ON)
   - Click "Create bucket"

2. **Set Up Storage Policies**
   - Click on the `avatars` bucket
   - Go to "Policies" tab
   - Click "New Policy"
   
   **Policy 1: Public Read Access**
   - Policy name: `Public Access Avatars`
   - Allowed operation: `SELECT`
   - Policy definition:
     ```sql
     bucket_id = 'avatars'
     ```
   
   **Policy 2: Authenticated Upload**
   - Policy name: `Authenticated Upload Avatars`
   - Allowed operation: `INSERT`
   - Policy definition:
     ```sql
     bucket_id = 'avatars' 
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
     ```
   
   **Policy 3: Authenticated Update**
   - Policy name: `Authenticated Update Avatars`
   - Allowed operation: `UPDATE`
   - Policy definition:
     ```sql
     bucket_id = 'avatars' 
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
     ```
   
   **Policy 4: Authenticated Delete**
   - Policy name: `Authenticated Delete Avatars`
   - Allowed operation: `DELETE`
   - Policy definition:
     ```sql
     bucket_id = 'avatars' 
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
     ```
   
   **Policy 5: Admin Full Access**
   - Policy name: `Admin Manage Avatars`
   - Allowed operation: `ALL`
   - Policy definition:
     ```sql
     bucket_id = 'avatars' AND public.is_admin()
     ```

## Step 2: Verify Setup

Run these queries in SQL Editor to verify:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'avatars';

-- Check if policies exist
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%Avatar%';
```

You should see:
- 1 bucket named `avatars` with `public = true`
- 5 policies for the avatars bucket

## Step 3: Understand How It Works

### Avatar Upload Flow

1. **User selects/takes photo** → `ImagePicker` gets image URI
2. **Image compression** → `ImageManipulator` converts to JPEG and compresses (max 512x512px, quality 85%)
3. **Upload to Supabase** → File uploaded to `avatars/users/{userId}/{timestamp}.jpg`
4. **Get public URL** → Supabase returns public URL
5. **Update profile** → URL saved to `profiles.avatar_url` field
6. **Display avatar** → Profile screens show image from `avatar_url`

### Why Images Were Broken Before

The broken image issue (unsupported format) was likely caused by:
1. **Bucket not public** - Images couldn't be accessed publicly
2. **Missing policies** - Users couldn't upload or access images
3. **Local storage only** - Avatars were stored locally (AsyncStorage) instead of Supabase, so they didn't work across devices
4. **URL path issues** - Incorrect URL generation or missing bucket configuration

### Current Solution

✅ **Public buckets** - All image buckets (`avatars`, `payments`, `deliveries`, `thumbnails`) are now public  
✅ **Proper policies** - Correct RLS policies allow authenticated users to upload their own files  
✅ **Supabase URLs** - All images stored in Supabase Storage with proper public URLs  
✅ **Profile sync** - Avatar URLs stored in database, works across all devices  
✅ **Format conversion** - All images converted to JPEG for universal compatibility  

## Step 4: Fix Existing Broken Images

If you have existing broken images (proof of payment/delivery):

### Option 1: Re-upload (Recommended)
- Users should re-upload their proof images
- The new uploads will work correctly with the proper bucket setup

### Option 2: Fix Bucket Policies
Make sure your existing buckets have proper policies:

1. **Check bucket public status:**
   ```sql
   SELECT id, name, public FROM storage.buckets 
   WHERE id IN ('payments', 'deliveries', 'thumbnails');
   ```
   
   All should have `public = true`

2. **If not public, update them:**
   ```sql
   UPDATE storage.buckets 
   SET public = true 
   WHERE id IN ('payments', 'deliveries', 'thumbnails');
   ```

## Step 5: Test Avatar Upload

1. **Run your app**
2. **Go to Profile screen**
3. **Tap on the avatar placeholder**
4. **Choose "Take Photo" or "Choose from Library"**
5. **Select/capture an image**
6. **Wait for upload** (you'll see a loading indicator)
7. **Verify** - The avatar should appear immediately

### Troubleshooting

**Issue: "Failed to upload avatar"**
- Check Supabase dashboard → Storage → buckets → `avatars` exists and is public
- Verify policies are set up correctly
- Check console logs for detailed error messages

**Issue: Image still broken after upload**
- Verify the bucket is public: `SELECT * FROM storage.buckets WHERE id = 'avatars'`
- Check the URL in database: `SELECT avatar_url FROM profiles WHERE id = '<user-id>'`
- Test URL directly in browser - should load the image
- Verify policies allow SELECT operations

**Issue: Permission denied**
- Check if user is authenticated
- Verify storage policies allow INSERT for authenticated users
- Check if `is_admin()` function exists: `SELECT * FROM pg_proc WHERE proname = 'is_admin'`

## Storage Bucket Configuration Summary

### Bucket Visibility: **PUBLIC** ✅

All image buckets should be **PUBLIC** because:
- ✅ Users need to view profile pictures, proof images, and thumbnails
- ✅ Images are accessed via public URLs
- ✅ No sensitive data - just images
- ✅ Better performance (no authentication overhead for viewing)

**Security is maintained through:**
- ✅ RLS policies that restrict who can upload/delete
- ✅ Path-based access control (users can only upload to their own folder)
- ✅ Admin-only full access policies

### Bucket Structure

```
avatars/
  └── users/
      └── {userId}/
          └── {timestamp}.jpg

payments/
  └── orders/
      └── {orderId}/
          └── payments/
              └── {timestamp}.jpg

deliveries/
  └── orders/
      └── {orderId}/
          └── deliveries/
              └── {timestamp}.jpg

thumbnails/
  └── orders/
      └── {orderId}/
          └── {type}/
              └── thumbnails/
                  └── {timestamp}.jpg
```

## Code Changes Made

1. ✅ Added `uploadAvatar()` method to `ImageUploadService`
2. ✅ Added `deleteAvatar()` method to `ImageUploadService`
3. ✅ Updated `useAvatar` hook to upload to Supabase instead of local storage
4. ✅ Updated all profile screens to use `profile.avatar_url` from database
5. ✅ Created SQL setup script for avatars bucket
6. ✅ Added proper error handling and loading states

## Next Steps

1. **Run the SQL setup script** in Supabase dashboard
2. **Test avatar upload** in your app
3. **Verify images display correctly** across devices
4. **Check existing proof images** - if still broken, users may need to re-upload

## Additional Notes

- **Image format**: All images are automatically converted to JPEG for universal compatibility
- **Image size**: Avatars are compressed to max 512x512px (quality 85%) to save storage
- **Storage limits**: Supabase free tier includes 1GB storage - monitor usage in dashboard
- **CDN**: Supabase Storage includes CDN, so images load fast globally
- **Automatic cleanup**: Old avatars are deleted when new ones are uploaded (optional, can be configured)

## Support

If you encounter issues:
1. Check Supabase dashboard → Storage → buckets
2. Verify policies in Storage → Policies
3. Check browser console for detailed error messages
4. Review the SQL setup script output for any errors

