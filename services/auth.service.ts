import { supabase } from '../lib/supabase';

type SignUpCredentials = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
};

type SignInCredentials = {
  email: string;
  password: string;
};

type PasswordResetData = {
  email: string;
};

type UpdateProfileData = {
  fullName?: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
};

export const authService = {
  // Sign up with email and password
  async signUp(credentials: SignUpCredentials) {
    const { email, password, fullName, phoneNumber } = credentials;
    
    // 1. Create the auth user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error('No user returned after sign up');

    // 2. Create the user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone_number: phoneNumber || null,
        role: 'customer', // Default role
      });

    if (profileError) {
      // Rollback: Delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return authData;
  },

  // Sign in with email and password
  async signIn(credentials: SignInCredentials) {
    const { email, password } = credentials;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Request password reset
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/reset-password`,
    });
    if (error) throw error;
  },

  // Update user password
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  // Update user profile
  async updateProfile(userId: string, updates: UpdateProfileData) {
    // Convert UpdateProfileData to database field names
    const dbUpdates: any = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

    console.log('Updating profile for user:', userId, 'with data:', dbUpdates);

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      throw error;
    }
    
    console.log('Profile updated successfully:', data);
    return data;
  },

  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Sign in with OAuth (Google, Apple, etc.)
  async signInWithOAuth(provider: 'google' | 'apple' | 'facebook') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  },

  // Handle OAuth callback
  async handleOAuthCallback(url: string) {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    if (!data.session) throw new Error('No active session');
    
    return data.session;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },
};

export type { SignInCredentials, SignUpCredentials, UpdateProfileData };

