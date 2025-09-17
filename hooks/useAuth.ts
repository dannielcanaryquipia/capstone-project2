import { Alert } from 'react-native';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth.service';

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone_number: string | null;
  role: 'customer' | 'admin' | 'delivery' | null;
};

type AuthState = {
  session: import('@supabase/supabase-js').Session | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  setState: (s: Partial<AuthState>) => void;
  loadInitialSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phoneNumber?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};

const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  isLoading: true,
  error: null,
  setState: (s) => set(s),
  loadInitialSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session: session ?? null });
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        set({ profile: (data as any) ?? null });
      } else {
        set({ profile: null });
      }
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
      set({ session: null, profile: null });
    } catch (e: any) {
      const message = e?.message || 'Failed to sign out. Please try again.';
      set({ error: message });
      Alert.alert('Error', message);
      throw e;
    } finally {
      set({ isLoading: false });
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

// Subscribe to Supabase auth changes once on import
supabase.auth.onAuthStateChange(async (_event, session) => {
  useAuthStore.getState().setState({ session });
  if (session?.user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    useAuthStore.getState().setState({ profile: (data as any) ?? null });
  } else {
    useAuthStore.getState().setState({ profile: null });
  }
});

export const useAuth = () => {
  const state = useAuthStore();
  // Ensure initial session is loaded
  if (state.isLoading && state.session === null && state.profile === null) {
    state.loadInitialSession();
  }
  return state;
};
