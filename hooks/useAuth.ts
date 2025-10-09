import React from 'react';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth.service';
import { Database } from '../types/database.types';

// Global flag to prevent multiple auth listeners
let authListenerInitialized = false;

type Profile = Database['public']['Tables']['profiles']['Row'];

type AuthState = {
  session: import('@supabase/supabase-js').Session | null;
  profile: Profile | null;
  user: import('@supabase/supabase-js').User | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  isDelivery: boolean;
  setState: (s: Partial<AuthState>) => void;
  loadInitialSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshSession: () => Promise<import('@supabase/supabase-js').Session | null>;
};

const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  user: null,
  isLoading: true,
  error: null,
  isAdmin: false,
  isDelivery: false,
  setState: (s) => set(s),
  loadInitialSession: async () => {
    try {
      set({ isLoading: true });
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Error getting session:', error);
        set({ 
          session: null, 
          profile: null, 
          user: null,
          isAdmin: false,
          isDelivery: false,
          error: error.message 
        });
        return;
      }
      
      set({ 
        session: session ?? null, 
        user: session?.user ?? null,
        error: null 
      });
      
      if (session?.user) {
        try {
          const { data, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) {
            console.warn('Error fetching profile:', profileError);
            set({ 
              profile: null, 
              isAdmin: false, 
              isDelivery: false,
              error: profileError.message 
            });
          } else {
            const profile = (data as any) ?? null;
            set({ 
              profile, 
              isAdmin: profile?.role === 'admin',
              isDelivery: profile?.role === 'delivery' || profile?.role === 'delivery_staff'
            });
          }
        } catch (profileError) {
          console.warn('Error fetching profile:', profileError);
          set({ 
            profile: null,
            isAdmin: false,
            isDelivery: false
          });
        }
      } else {
        set({ 
          profile: null,
          isAdmin: false,
          isDelivery: false
        });
      }
    } catch (error) {
      console.warn('Error in loadInitialSession:', error);
      set({ 
        session: null, 
        profile: null, 
        user: null,
        isAdmin: false,
        isDelivery: false,
        error: 'Failed to load session' 
      });
    } finally {
      set({ isLoading: false });
    }
  },
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await authService.signIn({ email, password });
      await get().loadInitialSession();
    } catch (e: any) {
      const message = e?.message || 'Failed to sign in. Please check your credentials.';
      set({ error: message });
      Alert.alert('Error', message);
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
  signUp: async (email, password, fullName, phoneNumber) => {
    set({ isLoading: true, error: null });
    try {
      await authService.signUp({ email, password, fullName, phoneNumber });
      Alert.alert(
        'Verify Your Email',
        'A verification link has been sent to your email. Please verify your email before signing in.'
      );
    } catch (e: any) {
      const message = e?.message || 'Failed to create account. Please try again.';
      set({ error: message });
      Alert.alert('Error', message);
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
  signOut: async () => {
    set({ isLoading: true });
    try {
      await authService.signOut();
      set({ 
        session: null, 
        profile: null, 
        user: null,
        isAdmin: false,
        isDelivery: false
      });
    } catch (e: any) {
      const message = e?.message || 'Failed to sign out. Please try again.';
      set({ error: message });
      Alert.alert('Error', message);
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (data.session) {
        set({ 
          session: data.session, 
          user: data.user,
          isLoading: false 
        });
        
        if (data.user) {
          // Fetch profile for the refreshed session
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileData) {
            const profile = profileData as any;
            set({ 
              profile,
              isAdmin: profile?.role === 'admin',
              isDelivery: profile?.role === 'delivery'
            });
          }
        }
      }
      
      return data.session;
    } catch (error) {
      console.warn('Error refreshing session:', error);
      throw error;
    }
  },
  resetPassword: async (email) => {
    set({ isLoading: true });
    try {
      await authService.resetPassword(email);
      Alert.alert('Password Reset', 'If an account exists with this email, a password reset link has been sent.');
    } catch (e: any) {
      const message = e?.message || 'Failed to send password reset email.';
      set({ error: message });
      Alert.alert('Error', message);
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
  updatePassword: async (newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await authService.updatePassword(newPassword);
      Alert.alert('Success', 'Your password has been updated successfully.');
    } catch (e: any) {
      const message = e?.message || 'Failed to update password. Please try again.';
      set({ error: message });
      Alert.alert('Error', message);
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Subscribe to Supabase auth changes once on import (prevent multiple listeners)
if (!authListenerInitialized) {
  authListenerInitialized = true;
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state change:', event, session?.user?.id);
    
    // Update session immediately
    useAuthStore.getState().setState({ 
      session, 
      user: session?.user ?? null,
      isLoading: false 
    });
    
    if (session?.user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.warn('Failed to fetch profile on auth change:', error);
          useAuthStore.getState().setState({ 
            profile: null, 
            isAdmin: false,
            isDelivery: false,
            error: error.message 
          });
        } else {
          const profile = (data as any) ?? null;
          useAuthStore.getState().setState({ 
            profile,
            isAdmin: profile?.role === 'admin',
            isDelivery: profile?.role === 'delivery' || profile?.role === 'delivery_staff',
            error: null 
          });
        }
      } catch (error) {
        console.warn('Failed to fetch profile on auth change:', error);
        useAuthStore.getState().setState({ 
          profile: null,
          isAdmin: false,
          isDelivery: false
        });
      }
    } else {
      useAuthStore.getState().setState({ 
        profile: null, 
        isAdmin: false,
        isDelivery: false,
        error: null 
      });
    }
  });
}

// Initialize auth on app start
export const initializeAuth = () => {
  const state = useAuthStore.getState();
  if (state.isLoading && !state.session) {
    state.loadInitialSession();
  }
};

export const useAuth = () => {
  const state = useAuthStore();
  
  // Always ensure initial session is loaded on first use
  React.useEffect(() => {
    // Load initial session if we don't have one yet
    if (state.isLoading && !state.session) {
      state.loadInitialSession();
    }
  }, [state.isLoading, state.session, state.loadInitialSession]);
  
  return state;
};
