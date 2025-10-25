import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth.service';
import { Database } from '../types/database.types';
import { sessionPersistence } from '../utils/sessionPersistence';

type Profile = Database['public']['Tables']['profiles']['Row'];

type AuthState = {
  session: import('@supabase/supabase-js').Session | null;
  profile: Profile | null;
  user: import('@supabase/supabase-js').User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  isAdmin: boolean;
  isDelivery: boolean;
  lastSessionRefresh: number | null;
};

type AuthActions = {
  setState: (s: Partial<AuthState>) => void;
  initializeAuth: () => Promise<void>;
  loadInitialSession: () => Promise<void>;
  loadUserProfile: (userId: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshSession: () => Promise<import('@supabase/supabase-js').Session | null>;
  clearError: () => void;
};

type AuthStore = AuthState & AuthActions;

// Global flag to prevent multiple auth listeners
let authListenerInitialized = false;

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      session: null,
      profile: null,
      user: null,
      isLoading: true,
      isInitialized: false,
      error: null,
      isAdmin: false,
      isDelivery: false,
      lastSessionRefresh: null,

      // Actions
      setState: (newState) => set(newState),

      clearError: () => set({ error: null }),

      initializeAuth: async () => {
        const state = get();
        if (state.isInitialized) return;

        try {
          set({ isLoading: true, error: null });

          // Set up auth state change listener if not already done
          if (!authListenerInitialized) {
            authListenerInitialized = true;
            supabase.auth.onAuthStateChange(async (event, session) => {
              console.log('Auth state change:', event, session?.user?.id);
              
              // Update session immediately
              set({ 
                session, 
                user: session?.user ?? null,
                isLoading: false,
                lastSessionRefresh: Date.now()
              });
              
              // Save session to persistence
              await sessionPersistence.saveSession(session, state.profile);
              
              if (session?.user) {
                await get().loadUserProfile(session.user.id);
              } else {
                set({ 
                  profile: null,
                  isAdmin: false,
                  isDelivery: false,
                  error: null 
                });
                // Clear persisted session
                await sessionPersistence.clearSession();
              }
            });
          }

          // Try to restore session from storage first
          const storedSession = await sessionPersistence.loadSession();
          if (storedSession?.session) {
            console.log('Restoring session from storage');
            set({ 
              session: storedSession.session, 
              user: storedSession.session.user,
              profile: storedSession.profile,
              lastSessionRefresh: Date.now()
            });
            
            if (storedSession.profile) {
              set({ 
                isAdmin: storedSession.profile.role === 'admin',
                isDelivery: storedSession.profile.role === 'delivery' || storedSession.profile.role === 'delivery_staff'
              });
            }
          }

          // Always verify with Supabase to ensure session is still valid
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.warn('Error getting session:', error);
            set({ 
              session: null, 
              profile: null, 
              user: null,
              isAdmin: false,
              isDelivery: false,
              error: error.message,
              isInitialized: true
            });
            await sessionPersistence.clearSession();
            return;
          }
          
          if (session?.user) {
            set({ 
              session, 
              user: session.user,
              lastSessionRefresh: Date.now()
            });
            await get().loadUserProfile(session.user.id);
            // Save the verified session
            await sessionPersistence.saveSession(session, state.profile);
          } else {
            set({ 
              session: null, 
              profile: null, 
              user: null,
              isAdmin: false,
              isDelivery: false,
              error: null
            });
            await sessionPersistence.clearSession();
          }
        } catch (error) {
          console.warn('Error in initializeAuth:', error);
          set({ 
            session: null, 
            profile: null, 
            user: null,
            isAdmin: false,
            isDelivery: false,
            error: 'Failed to initialize authentication',
            isInitialized: true
          });
          await sessionPersistence.clearSession();
        } finally {
          set({ isLoading: false, isInitialized: true });
        }
      },

      loadUserProfile: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (error) {
            console.warn('Error fetching profile:', error);
            set({ 
              profile: null, 
              isAdmin: false, 
              isDelivery: false,
              error: error.message 
            });
          } else {
            const profile = (data as any) ?? null;
            set({ 
              profile, 
              isAdmin: profile?.role === 'admin',
              isDelivery: profile?.role === 'delivery' || profile?.role === 'delivery_staff',
              error: null 
            });
            
            // Save profile with current session
            const currentSession = get().session;
            if (currentSession) {
              await sessionPersistence.saveSession(currentSession, profile);
            }
          }
        } catch (error) {
          console.warn('Error fetching profile:', error);
          set({ 
            profile: null,
            isAdmin: false,
            isDelivery: false,
            error: 'Failed to load user profile'
          });
        }
      },

      loadInitialSession: async () => {
        // This method is kept for backward compatibility
        await get().initializeAuth();
      },

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          await authService.signIn({ email, password });
          // The auth state change listener will handle the rest
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
            isDelivery: false,
            error: null
          });
          // Clear persisted session
          await sessionPersistence.clearSession();
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
              lastSessionRefresh: Date.now(),
              isLoading: false 
            });
            
            if (data.user) {
              await get().loadUserProfile(data.user.id);
            }
            
            // Save refreshed session
            await sessionPersistence.saveSession(data.session, get().profile);
          }
          
          return data.session;
        } catch (error) {
          console.warn('Error refreshing session:', error);
          set({ error: 'Failed to refresh session' });
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
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data, not functions or temporary states
      partialize: (state) => ({
        session: state.session,
        profile: state.profile,
        user: state.user,
        isAdmin: state.isAdmin,
        isDelivery: state.isDelivery,
        lastSessionRefresh: state.lastSessionRefresh,
      } as Partial<AuthState>),
      // Custom merge function to handle session restoration
      merge: (persistedState, currentState) => {
        return {
          ...currentState,
          ...(persistedState as Partial<AuthState>),
          // Reset loading states on restore
          isLoading: false,
          isInitialized: false,
          error: null,
        };
      },
    }
  )
);

export const useAuth = () => {
  const state = useAuthStore();
  
  // Initialize auth on first use
  React.useEffect(() => {
    if (!state.isInitialized) {
      state.initializeAuth();
    }
  }, [state.isInitialized, state.initializeAuth]);
  
  return state;
};

// Export the store for direct access if needed
export { useAuthStore };
