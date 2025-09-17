// Re-export everything from the supabase-client
export * from './supabase-client';

// For backward compatibility
export { supabase } from './supabase-client';

// Re-export common types for easier imports
export type {
  Database,
  Tables,
  TableName,
  TableType,
  TableRow,
  TableInsert,
  TableUpdate,
} from './supabase-client';
