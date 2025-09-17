import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';

// Define the Profile type for type safety
type Profile = Database['public']['Tables']['profiles']['Row'];

type SignUpData = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
};

type SignInData = {
  email: string;
  password: string;
};

export const useAuthActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleError = (err: any, defaultMessage: string) => {
    console.error('Auth error:', err);
    const message = err?.message || defaultMessage;
    setError(message);
    return message;
  };

  const signIn = async ({ email, password }: SignInData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Auth state change listener will handle navigation
      return { success: true };
    } catch (err: any) {
      const message = handleError(err, 'Invalid email or password');
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async ({ email, password, fullName, phoneNumber }: SignUpData) => {
    setIsLoading(true);
    setError(null);
    try {
      // Create the user in Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Create a profile record
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user?.id,
            email,
            full_name: fullName,
            phone_number: phoneNumber,
            role: 'customer', // Default role
          },
        ]);

      if (profileError) throw profileError;

      return { success: true, user: authData.user };
    } catch (err: any) {
      const message = handleError(err, 'Failed to create account. Please try again.');
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      const message = handleError(err, 'Failed to sign out. Please try again.');
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.EXPO_PUBLIC_APP_URL || 'kitchenoneapp://'}/reset-password`,
      });

      if (error) throw error;
      
      return { success: true };
    } catch (err: any) {
      const message = handleError(err, 'Failed to send password reset email');
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      const message = handleError(err, 'Failed to update password');
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'An error occurred while updating your profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    resetPassword,
    updateProfile,
    isLoading,
    error,
  };
};
