-- Disable Row Level Security (RLS) for profiles table to fix infinite recursion
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies to clean up
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;

-- Add comment to table
COMMENT ON TABLE public.profiles IS 'User profiles - RLS disabled to prevent infinite recursion'; 