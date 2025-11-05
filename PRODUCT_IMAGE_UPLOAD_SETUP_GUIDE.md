# Product Image Upload & Dynamic Categories Setup Guide

This guide explains how to set up product image uploads to Supabase Storage and implement dynamic category management in the admin product creation page.

## Overview

The updated product creation system allows admins to:
- Upload product images directly from device (camera or gallery)
- Store images in Supabase Storage bucket `product-images`
- Select from existing categories OR create new categories on the fly
- Automatically add new categories to the database when creating products

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
   - Open the file `database/setup_product_images_bucket.sql`
   - Copy the entire content
   - Paste it into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

### Option B: Manual Setup via Dashboard

1. **Create Storage Bucket**
   - Go to "Storage" in the left sidebar
   - Click "New bucket"
   - Name: `product-images`
   - **Important**: Make sure "Public bucket" is **ENABLED** (toggle ON)
   - Click "Create bucket"

2. **Set Up Storage Policies**
   - Click on the `product-images` bucket
   - Go to "Policies" tab
   - Click "New Policy"
   
   **Policy 1: Public Read Access**
   - Policy name: `Public Access Product Images`
   - Allowed operation: `SELECT`
   - Policy definition:
     ```sql
     bucket_id = 'product-images'
     ```
   
   **Policy 2: Authenticated Upload (Admin Only)**
   - Policy name: `Authenticated Upload Product Images`
   - Allowed operation: `INSERT`
   - Policy definition:
     ```sql
     bucket_id = 'product-images' 
     AND auth.role() = 'authenticated'
     AND public.is_admin()
     ```
   
   **Policy 3: Authenticated Update (Admin Only)**
   - Policy name: `Authenticated Update Product Images`
   - Allowed operation: `UPDATE`
   - Policy definition:
     ```sql
     bucket_id = 'product-images' 
     AND auth.role() = 'authenticated'
     AND public.is_admin()
     ```
   
   **Policy 4: Authenticated Delete (Admin Only)**
   - Policy name: `Authenticated Delete Product Images`
   - Allowed operation: `DELETE`
   - Policy definition:
     ```sql
     bucket_id = 'product-images' 
     AND auth.role() = 'authenticated'
     AND public.is_admin()
     ```
   
   **Policy 5: Admin Full Access**
   - Policy name: `Admin Manage Product Images`
   - Allowed operation: `ALL`
   - Policy definition:
     ```sql
     bucket_id = 'product-images' AND public.is_admin()
     ```

## Step 2: Verify Setup

Run these queries in SQL Editor to verify:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Check if policies exist
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%Product Image%';
```

You should see:
- 1 bucket named `product-images` with `public = true`
- 5 policies for the product-images bucket

## Step 3: Understand How It Works

### Product Image Upload Flow

1. **User selects/takes photo** → `ImagePicker` gets image URI
2. **Image compression** → `ImageManipulator` converts to JPEG and compresses (max 1200x1200px, quality 85%)
3. **Upload to Supabase** → File uploaded to `product-images/products/{productId or temp}/{timestamp}.jpg`
4. **Get public URL** → Supabase returns public URL
5. **Save URL** → URL saved to product's `image_url` field
6. **Display product** → Product screens show image from `image_url`

### Dynamic Category Management Flow

1. **Admin opens product creation form** → Categories are fetched from backend
2. **Select existing category** → Choose from list of existing categories
3. **OR create new category** → Enter new category name
4. **On save** → If new category, `findOrCreateCategory()` is called
   - Checks if category exists (case-insensitive)
   - If exists, uses existing category ID
   - If not, creates new category and returns its ID
5. **Product created** → Product is saved with category ID

### Category Auto-Creation

The `ProductService.findOrCreateCategory()` method:
- Searches for existing category by name (case-insensitive)
- If found, returns existing category
- If not found, creates new category automatically
- Returns category ID for use in product creation

## Step 4: Test Product Creation

1. **Run your app**
2. **Go to Admin Dashboard** → Products → Create New Product
3. **Upload Product Image**:
   - Tap on "Tap to upload image"
   - Choose "Camera" or "Gallery"
   - Select/capture an image
   - Wait for upload (you'll see a loading indicator)
   - Verify - The image should appear in the preview
4. **Select or Create Category**:
   - **Option 1**: Tap existing category buttons to select
   - **Option 2**: Tap "New" button → Choose "Create New Category"
   - Enter category name
   - Category will be automatically created when product is saved
5. **Fill other fields** (name, description, price, etc.)
6. **Tap "Create Product"**
7. **Verify** - Product should be created with image and category

### Troubleshooting

**Issue: "Failed to upload image"**
- Check Supabase dashboard → Storage → buckets → `product-images` exists and is public
- Verify policies are set up correctly
- Check console logs for detailed error messages
- Ensure `is_admin()` function exists: `SELECT * FROM pg_proc WHERE proname = 'is_admin'`

**Issue: "Category not found" error**
- Check if categories table exists: `SELECT * FROM categories LIMIT 1;`
- Verify user has admin role: `SELECT role FROM profiles WHERE id = auth.uid();`
- Check console logs for detailed error messages

**Issue: Image still broken after upload**
- Verify the bucket is public: `SELECT * FROM storage.buckets WHERE id = 'product-images'`
- Check the URL in database: `SELECT image_url FROM products WHERE id = '<product-id>'`
- Test URL directly in browser - should load the image
- Verify policies allow SELECT operations

**Issue: Permission denied for upload**
- Check if user is authenticated
- Verify user has admin role
- Check storage policies allow INSERT for authenticated admins
- Verify `is_admin()` function exists and works correctly

## Storage Bucket Configuration Summary

### Bucket Visibility: **PUBLIC** ✅

The `product-images` bucket should be **PUBLIC** because:
- ✅ Customers need to view product images
- ✅ Images are accessed via public URLs
- ✅ No sensitive data - just product images
- ✅ Better performance (no authentication overhead for viewing)

**Security is maintained through:**
- ✅ RLS policies that restrict who can upload/delete (admin only)
- ✅ Admin-only full access policies
- ✅ Upload/delete operations require authentication + admin role

### Bucket Structure

```
product-images/
  └── products/
      └── {productId or temp}/
          └── {timestamp}.jpg
```

## Code Changes Made

1. ✅ Added `findOrCreateCategory()` method to `ProductService`
2. ✅ Added `uploadProductImage()` method to `ImageUploadService`
3. ✅ Updated product creation form to support:
   - Image upload from camera/gallery
   - Image preview with remove option
   - Dynamic category selection
   - Create new category option
   - Automatic category creation on save
4. ✅ Created SQL setup script for product-images bucket
5. ✅ Added proper error handling and loading states
6. ✅ Added validation for both category selection modes

## Features

### Image Upload
- ✅ Camera or gallery selection
- ✅ Image compression (max 1200x1200px, quality 85%)
- ✅ Format conversion to JPEG
- ✅ Upload progress indicator
- ✅ Image preview with remove option
- ✅ Automatic upload to Supabase Storage

### Category Management
- ✅ View all existing categories
- ✅ Select existing category
- ✅ Create new category on the fly
- ✅ Automatic category creation (if doesn't exist)
- ✅ Case-insensitive category matching
- ✅ Real-time category list refresh

## Next Steps

1. **Run the SQL setup script** in Supabase dashboard
2. **Test product creation** with image upload
3. **Test category creation** when creating new products
4. **Verify images display correctly** in product listings
5. **Check existing products** - they can still use image URLs manually

## Additional Notes

- **Image format**: All images are automatically converted to JPEG for universal compatibility
- **Image size**: Product images are compressed to max 1200x1200px (quality 85%) to save storage
- **Storage limits**: Supabase free tier includes 1GB storage - monitor usage in dashboard
- **CDN**: Supabase Storage includes CDN, so images load fast globally
- **Category names**: Categories are matched case-insensitively to prevent duplicates
- **Backward compatibility**: Existing products with manual image URLs still work

## Support

If you encounter issues:
1. Check Supabase dashboard → Storage → buckets
2. Verify policies in Storage → Policies
3. Check browser/console logs for detailed error messages
4. Review the SQL setup script output for any errors
5. Verify admin role and authentication status

## Related Files

- `app/(admin)/products/new.tsx` - Product creation form
- `services/product.service.ts` - Product and category services
- `services/image-upload.service.ts` - Image upload service
- `database/setup_product_images_bucket.sql` - SQL setup script
- `hooks/useProductCategories.ts` - Category fetching hook

