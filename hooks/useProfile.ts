import { useState, useEffect } from 'react';
import { Database } from '../types/database.types';
import { authService, UpdateProfileData } from '../services/auth.service';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Helper function to convert Profile to UpdateProfileData
const toUpdateProfileData = (profile: Partial<Profile>): UpdateProfileData => ({
  fullName: profile.full_name,
  phoneNumber: profile.phone_number,
  avatarUrl: profile.avatar_url
});

export const useProfile = (userId: string) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const fetchProfile = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const data = await authService.getProfile(userId);
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const updateData = toUpdateProfileData(updates);
      const updatedProfile = await authService.updateProfile(userId, updateData);
      setProfile(updatedProfile);
      setError(null);
      return updatedProfile;
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile on mount and when user changes
  useEffect(() => {
    fetchProfile();
  }, [userId, user?.id]);

  return {
    profile,
    isLoading,
    error,
    refresh: fetchProfile,
    updateProfile,
  };
};

// Hook to get the current user's profile
export const useCurrentUserProfile = () => {
  const { user } = useAuthContext();
  return useProfile(user?.id || '');
};
