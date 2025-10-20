import { useCallback, useState } from 'react';
import { ImageMetadata, ImageUploadResult, ImageUploadService } from '../services/image-upload.service';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPaymentProof = useCallback(async (
    orderId: string,
    imageUri: string,
    uploadedBy: string
  ): Promise<ImageUploadResult | null> => {
    try {
      setIsUploading(true);
      setError(null);
      
      const result = await ImageUploadService.uploadPaymentProof(
        orderId,
        imageUri,
        uploadedBy
      );
      
      return result;
    } catch (err: any) {
      console.error('Payment proof upload failed:', err);
      setError(err.message || 'Failed to upload payment proof');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadDeliveryProof = useCallback(async (
    orderId: string,
    imageUri: string,
    uploadedBy: string
  ): Promise<ImageUploadResult | null> => {
    try {
      setIsUploading(true);
      setError(null);
      
      const result = await ImageUploadService.uploadDeliveryProof(
        orderId,
        imageUri,
        uploadedBy
      );
      
      return result;
    } catch (err: any) {
      console.error('Delivery proof upload failed:', err);
      setError(err.message || 'Failed to upload delivery proof');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadPaymentProof,
    uploadDeliveryProof,
    isUploading,
    error,
    clearError,
  };
};

export const useImageManagement = () => {
  const [images, setImages] = useState<ImageMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrderImages = useCallback(async (orderId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await ImageUploadService.getOrderImages(orderId);
      setImages(result);
      
      return result;
    } catch (err: any) {
      console.error('Failed to load order images:', err);
      setError(err.message || 'Failed to load images');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyImage = useCallback(async (
    imageId: string,
    verifiedBy: string,
    verified: boolean = true
  ) => {
    try {
      setError(null);
      
      await ImageUploadService.verifyImage(imageId, verifiedBy, verified);
      
      // Update local state
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { 
              ...img, 
              verified, 
              verifiedBy, 
              verifiedAt: verified ? new Date().toISOString() : undefined 
            }
          : img
      ));
    } catch (err: any) {
      console.error('Failed to verify image:', err);
      setError(err.message || 'Failed to verify image');
      throw err;
    }
  }, []);

  const deleteImage = useCallback(async (imageId: string) => {
    try {
      setError(null);
      
      await ImageUploadService.deleteImage(imageId);
      
      // Update local state
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err: any) {
      console.error('Failed to delete image:', err);
      setError(err.message || 'Failed to delete image');
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    images,
    isLoading,
    error,
    loadOrderImages,
    verifyImage,
    deleteImage,
    clearError,
  };
};
