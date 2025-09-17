import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isDelivery: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDelivery, setIsDelivery] = useState(false);

  useEffect(() => {
    // Check active sessions and set the session and user
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Supabase auth event: ${event}`);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check user role if logged in
      if (session?.user) {
        await checkUserRole(session.user.id);
      } else {
        setIsAdmin(false);
        setIsDelivery(false);
      }
      
      setIsLoading(false);
    });

    // Initial session fetch
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        setUser(session.user);
        await checkUserRole(session.user.id);
      }
      setIsLoading(false);
    };

    getInitialSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setIsAdmin(data?.role === 'admin');
      setIsDelivery(data?.role === 'delivery');
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      setIsDelivery(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setSession(data.session);
      setUser(data.user);
      if (data.user) {
        await checkUserRole(data.user.id);
      }
      return data.session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        isDelivery,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
