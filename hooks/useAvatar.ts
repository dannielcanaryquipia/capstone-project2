import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export const useAvatar = () => {
  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load local avatar on mount
  useEffect(() => {
    loadLocalAvatar();
  }, []);

  const loadLocalAvatar = async () => {
    try {
      const savedAvatar = await AsyncStorage.getItem('userAvatar');
      if (savedAvatar) {
        setLocalAvatar(savedAvatar);
      }
    } catch (error) {
      console.error('Error loading local avatar:', error);
    }
  };

  const saveAvatar = async (imageUri: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await AsyncStorage.setItem('userAvatar', imageUri);
      setLocalAvatar(imageUri);
      return true;
    } catch (error) {
      console.error('Error saving avatar:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeAvatar = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem('userAvatar');
      setLocalAvatar(null);
      return true;
    } catch (error) {
      console.error('Error removing avatar:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearAvatar = () => {
    setLocalAvatar(null);
  };

  return {
    localAvatar,
    isLoading,
    saveAvatar,
    removeAvatar,
    clearAvatar,
    loadLocalAvatar,
  };
};
