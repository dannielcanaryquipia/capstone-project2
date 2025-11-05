import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

export interface ImageUploadOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  compress?: boolean;
  generateThumbnail?: boolean;
}

// Maximum file size: 25MB (25 * 1024 * 1024 bytes)
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

export interface ImageUploadResult {
  url: string;
  thumbnailUrl?: string;
  metadata: {
    size: number;
    width: number;
    height: number;
    format: string;
    uploadedAt: string;
  };
}

export interface ImageMetadata {
  id: string;
  orderId: string;
  type: 'payment_proof' | 'delivery_proof';
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  metadata: {
    size: number;
    width: number;
    height: number;
    format: string;
    originalName: string;
  };
  verified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export class ImageUploadService {
  private static readonly BUCKETS = {
    PAYMENTS: 'payments',
    DELIVERIES: 'deliveries',
    THUMBNAILS: 'thumbnails',
    AVATARS: 'avatars',
    PRODUCT_IMAGES: 'product-images'
  };

  private static readonly COMPRESSION_OPTIONS = {
    payment: { quality: 0.8, maxWidth: 1920, maxHeight: 1080 },
    delivery: { quality: 0.7, maxWidth: 1920, maxHeight: 1080 },
    thumbnail: { quality: 0.6, maxWidth: 300, maxHeight: 300 },
    avatar: { quality: 0.85, maxWidth: 512, maxHeight: 512 },
    product: { quality: 0.85, maxWidth: 1200, maxHeight: 1200 }
  };

  /**
   * Compress and optimize image before upload
   * Converts all image formats to JPEG for universal compatibility
   */
  private static async compressImage(
    uri: string, 
    options: ImageUploadOptions = {}
  ): Promise<{ uri: string; metadata: any }> {
    try {
      // Validate URI
      if (!uri || (!uri.startsWith('file://') && !uri.startsWith('http') && !uri.startsWith('content://'))) {
        throw new Error('Invalid image URI format');
      }

      const {
        quality = 0.8,
        maxWidth = 1920,
        maxHeight = 1080,
        compress = true
      } = options;

      if (!compress) {
        // Even without compression, convert format to JPEG for compatibility
        try {
          const result = await ImageManipulator.manipulateAsync(
            uri,
            [],
            {
              compress: 1.0, // No compression, but format conversion
              format: ImageManipulator.SaveFormat.JPEG,
              base64: false
            }
          );
          
          // Validate conversion succeeded
          if (!result.uri || result.width === 0 || result.height === 0) {
            throw new Error('Invalid image file - conversion failed');
          }
          
          return {
            uri: result.uri,
            metadata: {
              width: result.width,
              height: result.height,
              size: 0
            }
          };
        } catch (formatError: any) {
          console.error('❌ Format conversion failed:', formatError);
          throw new Error(`Failed to convert image format: ${formatError.message || 'Unknown error'}`);
        }
      }

      // Compress and convert format to JPEG WITHOUT resizing to preserve original aspect and dimensions
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG, // Always convert to JPEG for universal compatibility
          base64: false
        }
      );

      // Validate conversion succeeded
      if (!result.uri || result.width === 0 || result.height === 0) {
        throw new Error('Invalid image file - conversion produced invalid result');
      }

      return {
        uri: result.uri,
        metadata: {
          width: result.width,
          height: result.height,
          size: 0 // ImageManipulator doesn't provide size, we'll estimate it
        }
      };
    } catch (error: any) {
      console.error('❌ Image compression/conversion failed:', error);
      
      // Try format conversion only as fallback (no resize)
      try {
        console.log('⚠️ Attempting format conversion fallback...');
        const result = await ImageManipulator.manipulateAsync(
          uri,
          [],
          {
            compress: 1.0,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: false
          }
        );
        
        // Validate fallback conversion
        if (!result.uri || result.width === 0 || result.height === 0) {
          throw new Error('Fallback conversion produced invalid result');
        }
        
        console.log('✅ Format conversion fallback succeeded');
        return {
          uri: result.uri,
          metadata: {
            width: result.width,
            height: result.height,
            size: 0
          }
        };
      } catch (fallbackError: any) {
        console.error('❌ Format conversion fallback also failed:', fallbackError);
        // DON'T return original format - throw error instead
        throw new Error(`Failed to process image. Please ensure the image is valid and try again. Error: ${fallbackError.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * Generate thumbnail for image
   */
  private static async generateThumbnail(uri: string): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: 300,
              height: 300
            }
          }
        ],
        {
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false
        }
      );

      return result.uri;
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      throw error;
    }
  }

  /**
   * Upload image to Supabase Storage
   * Properly handles both web and React Native platforms
   * Validates file size (max 25MB) and ensures proper format
   */
  private static async uploadToStorage(
    uri: string,
    bucket: string,
    path: string,
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    try {
      console.log('📤 Starting upload to storage', { bucket, path, contentType, platform: Platform.OS });
      
      let fileData: Blob | File | ArrayBuffer | { uri: string; type: string; name: string };
      
      if (Platform.OS === 'web') {
        console.log('🌐 Web platform detected, fetching and converting to ArrayBuffer');
        try {
          const response = await fetch(uri);
          
          // Check if response is OK
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          
          // Use ArrayBuffer approach (recommended by Supabase)
          const arrayBuffer = await response.arrayBuffer();
          fileData = new Blob([arrayBuffer], { type: contentType });
          
          // Validate file size (max 25MB)
          if (fileData.size > MAX_FILE_SIZE) {
            throw new Error(`Image file is too large (${(fileData.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 25MB. Please compress or resize the image.`);
          }
          
          // Validate file is not empty
          if (fileData.size === 0) {
            throw new Error('Image file is empty or corrupted');
          }
          
          console.log('✅ Created Blob from ArrayBuffer:', { 
            size: fileData.size,
            sizeMB: (fileData.size / 1024 / 1024).toFixed(2),
            type: fileData.type 
          });
        } catch (fetchError: any) {
          console.error('❌ Error fetching image:', fetchError);
          throw new Error(`Failed to fetch image for upload: ${fetchError.message}`);
        }
      } else {
        // React Native platform
        // Use fetch to read the file URI and convert to ArrayBuffer
        // This is the most reliable way to get binary data in React Native
        console.log('📱 React Native platform detected, fetching file and converting to ArrayBuffer');
        
        try {
          // Get file info for size validation first
          const fileInfo = await FileSystem.getInfoAsync(uri);
          if (!fileInfo.exists) {
            throw new Error('Image file does not exist');
          }
          
          if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
            throw new Error(`Image file is too large (${(fileInfo.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 25MB. Please compress or resize the image.`);
          }
          
          console.log('📏 File info:', {
            exists: fileInfo.exists,
            size: fileInfo.size,
            sizeMB: fileInfo.size ? (fileInfo.size / 1024 / 1024).toFixed(2) : 'unknown'
          });
          
          // For React Native, we need to read as base64 first, then convert
          const base64String = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          if (!base64String || base64String.length === 0) {
            throw new Error('Failed to read image file - file is empty');
          }
          
          // Convert base64 to ArrayBuffer
          // Use a reliable base64 decode that works in React Native
          const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
          const lookup = new Uint8Array(256);
          for (let i = 0; i < base64Chars.length; i++) {
            lookup[base64Chars.charCodeAt(i)] = i;
          }
          
          // Remove any whitespace from base64 string
          const cleanBase64 = base64String.replace(/\s/g, '');
          
          // Calculate output size (accounting for padding)
          let paddingCount = 0;
          if (cleanBase64.endsWith('==')) paddingCount = 2;
          else if (cleanBase64.endsWith('=')) paddingCount = 1;
          
          // Base64: 4 chars = 3 bytes, minus padding
          const binaryLength = Math.floor((cleanBase64.length * 3) / 4) - paddingCount;
          
          if (binaryLength <= 0) {
            throw new Error('Invalid base64 string - calculated length is zero or negative');
          }
          
          const bytes = new Uint8Array(binaryLength);
          
          // Decode base64
          let byteIndex = 0;
          let buffer = 0;
          let bitsCollected = 0;
          
          for (let i = 0; i < cleanBase64.length; i++) {
            const char = cleanBase64[i];
            
            // Skip padding characters
            if (char === '=') {
              // Padding found, process any remaining bits
              if (bitsCollected >= 8) {
                bytes[byteIndex++] = (buffer >> (bitsCollected - 8)) & 0xFF;
                bitsCollected -= 8;
              }
              break; // Stop at padding
            }
            
            const value = lookup[char.charCodeAt(0)];
            if (value === undefined) {
              // Skip invalid characters (whitespace, newlines, etc.)
              continue;
            }
            
            buffer = (buffer << 6) | value;
            bitsCollected += 6;
            
            // Extract bytes when we have 8 or more bits
            while (bitsCollected >= 8 && byteIndex < binaryLength) {
              bytes[byteIndex++] = (buffer >> (bitsCollected - 8)) & 0xFF;
              bitsCollected -= 8;
              buffer = buffer & ((1 << bitsCollected) - 1); // Keep only remaining bits
            }
          }
          
          // Create a new ArrayBuffer with only the decoded data
          // slice() creates a view, but we want a new buffer with only our data
          if (byteIndex !== bytes.length) {
            // Create a new Uint8Array with exactly the decoded bytes
            const trimmedBytes = new Uint8Array(byteIndex);
            trimmedBytes.set(bytes.subarray(0, byteIndex));
            fileData = trimmedBytes.buffer;
          } else {
            fileData = bytes.buffer;
          }
          
          const fileSize = fileData.byteLength;
          
          if (fileSize > MAX_FILE_SIZE) {
            throw new Error(`Image file is too large (${(fileSize / 1024 / 1024).toFixed(2)}MB). Maximum size is 25MB.`);
          }
          
          if (fileSize === 0) {
            throw new Error('Failed to decode image - decoded data is empty');
          }
          
          console.log('✅ File converted to ArrayBuffer:', { 
            size: fileSize,
            sizeMB: (fileSize / 1024 / 1024).toFixed(2),
            contentType,
            decodedBytes: byteIndex
          });
          
        } catch (readError: any) {
          console.error('❌ Error reading/converting file:', readError);
          
          // Final fallback: Use URI format with explicit type
          // Supabase React Native client should handle {uri, type, name} format
          console.log('⚠️ Using URI format fallback - ensure Supabase client supports this');
          const fileName = path.split('/').pop() || 'image.jpg';
          fileData = {
            uri: uri.replace('file://', ''), // Some versions need without file://
            type: contentType,
            name: fileName
          } as any;
          
          console.warn('⚠️ Using URI format - verifying file will upload correctly');
        }
      }

      // Final validation before upload
      let fileSize = 0;
      if (fileData instanceof Blob || fileData instanceof File) {
        fileSize = fileData.size;
      } else if (fileData instanceof ArrayBuffer) {
        fileSize = fileData.byteLength;
      } else if ((fileData as any)?.byteLength !== undefined) {
        fileSize = (fileData as any).byteLength;
      }
      
      if (fileSize === 0) {
        throw new Error('Image file is empty or corrupted');
      }
      
      if (fileSize > MAX_FILE_SIZE) {
        throw new Error(`Image file is too large (${(fileSize / 1024 / 1024).toFixed(2)}MB). Maximum size is 25MB.`);
      }

      // Log file data details for debugging
      let fileSizeInfo = 'unknown';
      let fileDataType = 'unknown';
      
      if (fileData instanceof Blob || fileData instanceof File) {
        fileSizeInfo = `${(fileData.size / 1024 / 1024).toFixed(2)}MB`;
        fileDataType = fileData instanceof Blob ? 'Blob' : 'File';
      } else if (fileData instanceof ArrayBuffer) {
        fileSizeInfo = `${(fileData.byteLength / 1024 / 1024).toFixed(2)}MB`;
        fileDataType = 'ArrayBuffer';
      } else if ((fileData as any)?.byteLength !== undefined) {
        fileSizeInfo = `${((fileData as any).byteLength / 1024 / 1024).toFixed(2)}MB`;
        fileDataType = 'ArrayBuffer-like';
      } else if ((fileData as any)?.uri) {
        fileSizeInfo = 'URI format (size unknown)';
        fileDataType = 'URI Object';
      }
      
      console.log('📦 Uploading to Supabase Storage...', {
        fileSize: fileSizeInfo,
        contentType,
        fileDataType,
        hasUri: !!(fileData as any)?.uri,
        hasType: !!(fileData as any)?.type,
        isArrayBuffer: fileData instanceof ArrayBuffer
      });
      
      // Ensure contentType is set correctly in upload options
      const uploadOptions = {
        contentType: contentType,  // Explicitly set content-type - CRITICAL for proper file format
        cacheControl: '3600',
        upsert: false
      };
      
      console.log('📋 Upload options:', uploadOptions);
      
      const { error, data } = await supabase.storage
        .from(bucket)
        .upload(path, fileData as any, uploadOptions);

      if (error) {
        console.error('❌ Supabase Storage upload error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          statusCode: (error as any).statusCode,
          error: (error as any).error
        });
        throw error;
      }

      console.log('✅ File uploaded successfully to storage');
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      console.log('🔗 Generated public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('❌ Storage upload failed:', error);
      console.error('❌ Error details:', {
        message: (error as any).message,
        stack: (error as any).stack,
        name: (error as any).name
      });
      throw error;
    }
  }

  /**
   * Upload payment proof image
   */
  static async uploadPaymentProof(
    orderId: string,
    imageUri: string,
    uploadedBy: string,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      const timestamp = Date.now();
      const path = `orders/${orderId}/payments/${timestamp}.jpg`;
      
      // Compress image
      const { uri: compressedUri, metadata } = await this.compressImage(
        imageUri, 
        { ...this.COMPRESSION_OPTIONS.payment, ...options }
      );

      // Upload main image
      const url = await this.uploadToStorage(
        compressedUri,
        this.BUCKETS.PAYMENTS,
        path
      );

      // Generate and upload thumbnail
      let thumbnailUrl: string | undefined;
      if (options.generateThumbnail !== false) {
        try {
          const thumbnailUri = await this.generateThumbnail(compressedUri);
          const thumbnailPath = `orders/${orderId}/payments/thumbnails/${timestamp}.jpg`;
          thumbnailUrl = await this.uploadToStorage(
            thumbnailUri,
            this.BUCKETS.THUMBNAILS,
            thumbnailPath
          );
        } catch (error) {
          console.warn('Thumbnail generation failed, continuing without thumbnail:', error);
        }
      }

      // Store metadata in database
      await this.storeImageMetadata({
        orderId,
        type: 'payment_proof',
        url,
        thumbnailUrl,
        uploadedBy,
        metadata: {
          size: metadata.size || 0,
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: 'jpeg',
          originalName: `payment-proof-${timestamp}.jpg`
        }
      });

      return {
        url,
        thumbnailUrl,
        metadata: {
          size: metadata.size || 0,
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: 'jpeg',
          uploadedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Payment proof upload failed:', error);
      throw new Error('Failed to upload payment proof');
    }
  }

  /**
   * Upload profile avatar image
   */
  static async uploadAvatar(
    userId: string,
    imageUri: string,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      console.log('🔄 ImageUploadService.uploadAvatar called', { userId });
      const timestamp = Date.now();
      const path = `users/${userId}/${timestamp}.jpg`;
      console.log('📁 Generated path:', path);
      
      // Compress image
      console.log('🗜️ Starting image compression...');
      const { uri: compressedUri, metadata } = await this.compressImage(
        imageUri, 
        { ...this.COMPRESSION_OPTIONS.avatar, ...options }
      );
      console.log('✅ Image compressed successfully', { compressedUri: compressedUri.substring(0, 50) + '...', metadata });

      // Upload main image
      const url = await this.uploadToStorage(
        compressedUri,
        this.BUCKETS.AVATARS,
        path
      );

      console.log('✅ Avatar uploaded successfully:', url);

      return {
        url,
        metadata: {
          size: metadata.size || 0,
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: 'jpeg',
          uploadedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  /**
   * Delete avatar image
   */
  static async deleteAvatar(userId: string, avatarUrl: string): Promise<void> {
    try {
      // Extract path from URL
      // URL format: https://[project].supabase.co/storage/v1/object/public/avatars/users/[userId]/[timestamp].jpg
      const urlParts = avatarUrl.split('/');
      const bucketIndex = urlParts.findIndex(part => part === 'avatars');
      
      if (bucketIndex === -1) {
        console.warn('Could not extract path from avatar URL:', avatarUrl);
        return;
      }
      
      // Get the path after 'avatars/'
      const pathIndex = bucketIndex + 1;
      const path = urlParts.slice(pathIndex).join('/');
      
      console.log('🗑️ Deleting avatar from path:', path);
      
      const { error } = await supabase.storage
        .from(this.BUCKETS.AVATARS)
        .remove([path]);

      if (error) {
        console.error('Error deleting avatar:', error);
        // Don't throw - allow profile update to continue
      } else {
        console.log('✅ Avatar deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete avatar:', error);
      // Don't throw - allow profile update to continue
    }
  }

  /**
   * Upload product image
   */
  static async uploadProductImage(
    productId: string | null,
    imageUri: string,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      console.log('🔄 ImageUploadService.uploadProductImage called', { productId });
      const timestamp = Date.now();
      // Use productId if available, otherwise use 'temp' for new products
      const folderName = productId || 'temp';
      const path = `products/${folderName}/${timestamp}.jpg`;
      console.log('📁 Generated path:', path);
      
      // Compress image
      console.log('🗜️ Starting image compression...');
      const { uri: compressedUri, metadata } = await this.compressImage(
        imageUri, 
        { ...this.COMPRESSION_OPTIONS.product, ...options }
      );
      console.log('✅ Image compressed successfully', { compressedUri: compressedUri.substring(0, 50) + '...', metadata });

      // Upload main image
      const url = await this.uploadToStorage(
        compressedUri,
        this.BUCKETS.PRODUCT_IMAGES,
        path
      );

      console.log('✅ Product image uploaded successfully:', url);

      return {
        url,
        metadata: {
          size: metadata.size || 0,
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: 'jpeg',
          uploadedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Product image upload failed:', error);
      throw new Error('Failed to upload product image');
    }
  }

  /**
   * Upload delivery proof image
   */
  static async uploadDeliveryProof(
    orderId: string,
    imageUri: string,
    uploadedBy: string,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      console.log('🔄 ImageUploadService.uploadDeliveryProof called', { orderId, uploadedBy });
      const timestamp = Date.now();
      const path = `orders/${orderId}/deliveries/${timestamp}.jpg`;
      console.log('📁 Generated path:', path);
      
      // Compress image
      console.log('🗜️ Starting image compression...');
      const { uri: compressedUri, metadata } = await this.compressImage(
        imageUri, 
        { ...this.COMPRESSION_OPTIONS.delivery, ...options }
      );
      console.log('✅ Image compressed successfully', { compressedUri: compressedUri.substring(0, 50) + '...', metadata });

      // Upload main image
      const url = await this.uploadToStorage(
        compressedUri,
        this.BUCKETS.DELIVERIES,
        path
      );

      // Generate and upload thumbnail
      let thumbnailUrl: string | undefined;
      if (options.generateThumbnail !== false) {
        try {
          const thumbnailUri = await this.generateThumbnail(compressedUri);
          const thumbnailPath = `orders/${orderId}/deliveries/thumbnails/${timestamp}.jpg`;
          thumbnailUrl = await this.uploadToStorage(
            thumbnailUri,
            this.BUCKETS.THUMBNAILS,
            thumbnailPath
          );
        } catch (error) {
          console.warn('Thumbnail generation failed, continuing without thumbnail:', error);
        }
      }

      // Store metadata in database
      await this.storeImageMetadata({
        orderId,
        type: 'delivery_proof',
        url,
        thumbnailUrl,
        uploadedBy,
        metadata: {
          size: metadata.size || 0,
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: 'jpeg',
          originalName: `delivery-proof-${timestamp}.jpg`
        }
      });

      return {
        url,
        thumbnailUrl,
        metadata: {
          size: metadata.size || 0,
          width: metadata.width || 0,
          height: metadata.height || 0,
          format: 'jpeg',
          uploadedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Delivery proof upload failed:', error);
      throw new Error('Failed to upload delivery proof');
    }
  }

  /**
   * Store image metadata in database
   */
  private static async storeImageMetadata(data: Omit<ImageMetadata, 'id' | 'uploadedAt'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('image_metadata')
        .insert({
          order_id: data.orderId,
          type: data.type,
          url: data.url,
          thumbnail_url: data.thumbnailUrl,
          uploaded_by: data.uploadedBy,
          metadata: data.metadata,
          verified: false
        } as any);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store image metadata:', error);
      // Don't throw error here as the image was already uploaded
    }
  }

  /**
   * Get images for an order
   */
  static async getOrderImages(orderId: string): Promise<ImageMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('image_metadata')
        .select('*')
        .eq('order_id', orderId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      return (data || []) as ImageMetadata[];
    } catch (error) {
      console.error('Failed to fetch order images:', error);
      throw error;
    }
  }

  /**
   * Verify image (admin only)
   */
  static async verifyImage(
    imageId: string,
    verifiedBy: string,
    verified: boolean = true
  ): Promise<void> {
    try {
      // Use raw SQL to avoid type issues
      const { error } = await supabase.rpc('update_image_verification', {
        p_image_id: imageId,
        p_verified: verified,
        p_verified_by: verifiedBy,
        p_verified_at: verified ? new Date().toISOString() : null
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to verify image:', error);
      throw error;
    }
  }

  /**
   * Delete image and its metadata
   */
  static async deleteImage(imageId: string): Promise<void> {
    try {
      // Get image metadata first
      const { data: imageData, error: fetchError } = await supabase
        .from('image_metadata')
        .select('url, thumbnail_url, type')
        .eq('id', imageId)
        .single();

      if (fetchError) throw fetchError;

      const image = imageData as any;

      // Delete from storage
      const urlParts = image.url.split('/');
      const bucket = urlParts[urlParts.length - 3]; // Extract bucket name
      const path = urlParts.slice(-2).join('/'); // Extract file path

      await supabase.storage.from(bucket).remove([path]);

      // Delete thumbnail if exists
      if (image.thumbnail_url) {
        const thumbUrlParts = image.thumbnail_url.split('/');
        const thumbBucket = thumbUrlParts[thumbUrlParts.length - 3];
        const thumbPath = thumbUrlParts.slice(-2).join('/');
        await supabase.storage.from(thumbBucket).remove([thumbPath]);
      }

      // Delete metadata
      const { error: deleteError } = await supabase
        .from('image_metadata')
        .delete()
        .eq('id', imageId);

      if (deleteError) throw deleteError;
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  }

  /**
   * Get image statistics for admin dashboard
   */
  static async getImageStats(): Promise<{
    totalImages: number;
    pendingVerification: number;
    verifiedImages: number;
    totalSize: number;
    recentUploads: ImageMetadata[];
  }> {
    try {
      const { data, error } = await supabase
        .from('image_metadata')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const images = (data || []) as ImageMetadata[];
      const totalImages = images.length;
      const pendingVerification = images.filter(img => !img.verified).length;
      const verifiedImages = images.filter(img => img.verified).length;
      const totalSize = images.reduce((sum, img) => sum + (img.metadata?.size || 0), 0);
      const recentUploads = images.slice(0, 10);

      return {
        totalImages,
        pendingVerification,
        verifiedImages,
        totalSize,
        recentUploads
      };
    } catch (error) {
      console.error('Failed to fetch image stats:', error);
      throw error;
    }
  }
}
