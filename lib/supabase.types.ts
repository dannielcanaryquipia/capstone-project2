import { RealtimeChannel, SupabaseClient as SupabaseClientBase } from '@supabase/supabase-js';
import { Database as DatabaseGenerated } from '../types/database.types';

// Re-export the generated database types
export type Database = DatabaseGenerated;

// Table and type helpers
export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;
export type TableRow<T extends TableName> = Tables[T]['Row'];
export type TableInsert<T extends TableName> = Omit<Tables[T]['Insert'], 'id' | 'created_at' | 'updated_at'>;
export type TableUpdate<T extends TableName> = Omit<Tables[T]['Update'], 'id' | 'created_at' | 'updated_at'>;

// View types
export type Views = Database['public']['Views'];
export type ViewName = keyof Views;
export type ViewRow<T extends ViewName> = Views[T]['Row'];

// Function types
export type Functions = Database['public']['Functions'];
export type FunctionName = keyof Functions;
export type FunctionArgs<T extends FunctionName> = Functions[T]['Args'];
export type FunctionReturnType<T extends FunctionName> = Functions[T]['Returns'];

// Realtime subscription types
export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export type RealtimePayload<T = any> = {
  commit_timestamp: string;
  eventType: RealtimeEvent;
  schema: string;
  table: string;
  new: T | null;
  old: T | null;
  errors: any[] | null;
};

export type RealtimeCallback<T> = (payload: RealtimePayload<T>) => void;

// Subscription options
export interface RealtimeSubscribeOptions<T extends TableName> {
  event?: RealtimeEvent;
  schema?: string;
  table: T;
  filter?: string;
  callback: RealtimeCallback<TableRow<T>>;
}

// Extend the Supabase client types with our custom methods
declare module '@supabase/supabase-js' {
  // Use the base interface from the library and extend it
  interface SupabaseClient {
    from<T extends TableName>(
      table: T,
      options?: { schema?: string }
    ): any; // Simplified to avoid complex type definitions
    
    from<T extends ViewName>(
      view: T,
      options?: { schema?: string }
    ): any; // Simplified to avoid complex type definitions

    // Realtime subscriptions
    on<T extends TableName>(
      event: 'postgres_changes',
      options: RealtimeSubscribeOptions<T>,
      callback: RealtimeCallback<TableRow<T>>
    ): RealtimeChannel;

    // RPC calls
    rpc<T = any, U = any>(
      fn: string,
      params?: U,
      options?: {
        head?: boolean;
        count?: 'exact' | 'planned' | 'estimated';
      }
    ): any; // Simplified to avoid complex type definitions
  }
}