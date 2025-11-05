import { useState } from 'react';
import { ImageUploadService } from '../services/image-upload.service';
import { authService } from '../services/auth.service';
import { useAuth } from './useAuth';

export const useAvatar = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload avatar image to Supabase Storage and update profile
   */
  const saveAvatar = async (imageUri: string): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📤 Starting avatar upload...', { userId: user.id });

      // 1. Upload image to Supabase Storage
      const uploadResult = await ImageUploadService.uploadAvatar(
        user.id,
        imageUri
      );

      console.log('✅ Avatar uploaded to storage:', uploadResult.url);

      // 2. Update profile with the new avatar URL
      await authService.updateProfile(user.id, {
        avatarUrl: uploadResult.url
      });

      console.log('✅ Profile updated with new avatar URL');

      return true;
    } catch (err: any) {
      console.error('❌ Error saving avatar:', err);
      setError(err.message || 'Failed to upload avatar');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove avatar by setting avatar_url to null and optionally deleting from storage
   */
  const removeAvatar = async (): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get current profile to check for existing avatar
      const profile = await authService.getProfile(user.id);
      
      // If avatar exists, try to delete it from storage (non-blocking)
      if (profile.avatar_url) {
        try {
          await ImageUploadService.deleteAvatar(user.id, profile.avatar_url);
        } catch (deleteError) {
          console.warn('⚠️ Could not delete avatar from storage, continuing with profile update:', deleteError);
          // Continue anyway - we'll still remove the URL from profile
        }
      }

      // Update profile to remove avatar URL
      await authService.updateProfile(user.id, {
        avatarUrl: null
      });

      console.log('✅ Avatar removed from profile');

      return true;
    } catch (err: any) {
      console.error('❌ Error removing avatar:', err);
      setError(err.message || 'Failed to remove avatar');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    saveAvatar,
    removeAvatar,
  };
};
