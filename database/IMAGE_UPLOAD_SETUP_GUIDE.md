# Image Upload System Database Setup Guide

## Quick Setup (Recommended)

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the entire content from `complete_image_upload_setup.sql`**
4. **Click "Run"**

## Step-by-Step Setup (If you prefer to run commands individually)

1. **Run each section from `step_by_step_setup.sql` in order**
2. **Wait for each step to complete before moving to the next**

## What This Setup Creates

### 1. **image_metadata Table**
- Stores all image upload information
- Links images to orders and users
- Tracks verification status
- Stores image metadata (size, dimensions, etc.)

### 2. **Storage Buckets**
- `payments` - For payment proof images
- `deliveries` - For delivery proof images  
- `thumbnails` - For compressed thumbnail images

### 3. **Security Policies**
- Users can only see images for their own orders
- Admins can see and manage all images
- Proper RLS (Row Level Security) protection

### 4. **Helper Functions**
- `is_admin()` - Check if current user is admin
- `update_image_verification()` - Update image verification status
- `get_image_stats()` - Get image statistics for dashboard
- `get_recent_image_uploads()` - Get recent uploads for admin review

### 5. **Performance Indexes**
- Optimized for common queries
- Fast image lookups by order, type, and verification status

## Verification

After running the setup, you can verify it worked by running:

```sql
-- Check if table exists
SELECT * FROM public.image_metadata LIMIT 1;

-- Check if buckets exist
SELECT * FROM storage.buckets WHERE id IN ('payments', 'deliveries', 'thumbnails');

-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'image_metadata';
```

## Troubleshooting

### If you get permission errors:
- Make sure you're logged in as a user with admin privileges
- Check that your user has the correct role in the profiles table

### If storage policies fail:
- Make sure the storage buckets were created successfully
- Check that your Supabase project has storage enabled

### If RLS policies fail:
- Make sure the `is_admin()` function was created successfully
- Verify that your profiles table has the correct role values

## Next Steps

1. **Test the image upload functionality** in your app
2. **Check the admin images screen** to see uploaded images
3. **Verify that images are properly stored** in the storage buckets
4. **Test the verification workflow** as an admin user

## Support

If you encounter any issues:
1. Check the Supabase logs for error messages
2. Verify all foreign key relationships are correct
3. Ensure your existing schema matches the expected structure
4. Test with a simple image upload first
