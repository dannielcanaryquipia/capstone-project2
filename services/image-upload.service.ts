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
    THUMBNAILS: 'thumbnails'
  };

  private static readonly COMPRESSION_OPTIONS = {
    payment: { quality: 0.8, maxWidth: 1920, maxHeight: 1080 },
    delivery: { quality: 0.7, maxWidth: 1920, maxHeight: 1080 },
    thumbnail: { quality: 0.6, maxWidth: 300, maxHeight: 300 }
  };

  /**
   * Compress and optimize image before upload
   */
  private static async compressImage(
    uri: string, 
    options: ImageUploadOptions = {}
  ): Promise<{ uri: string; metadata: any }> {
    try {
      const {
        quality = 0.8,
        maxWidth = 1920,
        maxHeight = 1080,
        compress = true
      } = options;

      if (!compress) {
        return { uri, metadata: {} };
      }

      const result = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            resize: {
              width: maxWidth,
              height: maxHeight
            }
          }
        ],
        {
          compress: quality,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: false
        }
      );

      return {
        uri: result.uri,
        metadata: {
          width: result.width,
          height: result.height,
          size: 0 // ImageManipulator doesn't provide size, we'll estimate it
        }
      };
    } catch (error) {
      console.error('Image compression failed:', error);
      return { uri, metadata: {} };
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
   */
  private static async uploadToStorage(
    uri: string,
    bucket: string,
    path: string,
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    try {
      console.log('📤 Starting upload to storage', { bucket, path, contentType });
      
      // Convert URI to blob for web compatibility
      let fileData: any;
      
      if (Platform.OS === 'web') {
        console.log('🌐 Web platform detected, using fetch + blob');
        const response = await fetch(uri);
        fileData = await response.blob();
      } else {
        console.log('📱 React Native platform detected, using FormData');
        // For React Native, use FormData
        fileData = {
          uri,
          type: contentType,
          name: path.split('/').pop() || 'image.jpg'
        };
      }

      console.log('📦 File data prepared:', { 
        hasUri: !!fileData.uri, 
        type: fileData.type, 
        name: fileData.name 
      });

      const { error, data } = await supabase.storage
        .from(bucket)
        .upload(path, fileData, {
          contentType,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Storage upload error:', error);
        throw error;
      }

      console.log('✅ File uploaded successfully to storage');
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

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
