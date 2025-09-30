import { useEffect, useState } from 'react';
import { authService, UpdateProfileData } from '../services/auth.service';
import { Database } from '../types/database.types';
import { useAuth as useAuthContext } from './useAuth';

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
  const { user, setState } = useAuthContext();

  const fetchProfile = async () => {
    // If no user id yet, ensure we don't get stuck in loading state
    if (!userId) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return;
    }

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
    
    console.log('useProfile updateProfile called with:', updates);
    setIsLoading(true);
    try {
      const updateData = toUpdateProfileData(updates);
      console.log('Converted updateData:', updateData);
      const updatedProfile = await authService.updateProfile(userId, updateData);
      setProfile(updatedProfile);
      // Propagate to global auth store so other screens (e.g., Home) update immediately
      setState({ profile: updatedProfile });
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
