import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import Constants from 'expo-constants';

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key. Please check your environment variables.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'KitchenOne',
    },
  },
});

// Re-export types for easier imports
export type { Database } from '../types/database.types';

export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;
export type TableType<T extends TableName> = Tables[T];
export type TableRow<T extends TableName> = Tables[T]['Row'];
export type TableInsert<T extends TableName> = Omit<Tables[T]['Insert'], 'id' | 'created_at' | 'updated_at'>;
export type TableUpdate<T extends TableName> = Omit<Tables[T]['Update'], 'id' | 'created_at' | 'updated_at'>;

// Helper function for realtime subscriptions
export function subscribeToTable<T extends TableName>(
  table: T,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: { new: TableRow<T>; old: TableRow<T>; eventType: string }) => void
): RealtimeChannel {
  const channel = supabase.channel('table-db-changes');
  
  // Use type assertion to handle the postgres_changes event
  (channel as any).on(
    'postgres_changes',
    {
      event: event === '*' ? '*' : event,
      schema: 'public',
      table: table as string,
    },
    (payload: any) => {
      callback({
        new: payload.new as TableRow<T>,
        old: payload.old as TableRow<T>,
        eventType: payload.eventType,
      });
    }
  ).subscribe();
  
  return channel;
}
