-- Add is_blocked column to profiles table for user blocklist functionality
-- This allows blocking users instead of deleting them

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Add updated_at column if it doesn't exist (to fix schema cache issues)
-- This column is optional and can be managed by database triggers if needed
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Create index for better query performance when filtering blocked users
CREATE INDEX IF NOT EXISTS idx_profiles_is_blocked ON public.profiles(is_blocked);

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.is_blocked IS 'Indicates if the user is blocked from accessing the system. Blocked users should not be able to log in or use the application.';

