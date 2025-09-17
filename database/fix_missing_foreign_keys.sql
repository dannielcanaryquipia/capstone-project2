-- =====================================================
-- FIX MISSING FOREIGN KEY RELATIONSHIPS
-- =====================================================

-- 1. Add foreign key from inventory_transactions to profiles
ALTER TABLE public.inventory_transactions 
ADD CONSTRAINT inventory_transactions_performed_by_profiles_fkey 
FOREIGN KEY (performed_by) REFERENCES public.profiles(id);

-- 2. Add foreign key from payment_transactions to profiles for verified_by
ALTER TABLE public.payment_transactions 
ADD CONSTRAINT payment_transactions_verified_by_fkey 
FOREIGN KEY (verified_by) REFERENCES public.profiles(id);

-- 3. Add foreign key from riders to profiles
ALTER TABLE public.riders 
ADD CONSTRAINT riders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- 4. Add foreign key from delivery_assignments to riders (fixing circular reference)
-- First, drop the existing constraint if it exists
ALTER TABLE public.delivery_assignments 
DROP CONSTRAINT IF EXISTS delivery_assignments_rider_id_fkey;

-- Then add the new foreign key constraint
ALTER TABLE public.delivery_assignments 
ADD CONSTRAINT delivery_assignments_rider_id_fkey 
FOREIGN KEY (rider_id) REFERENCES public.riders(id) 
ON DELETE SET NULL;

-- 5. Add indexes for better performance on the new foreign keys
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_performed_by ON public.inventory_transactions(performed_by);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_verified_by ON public.payment_transactions(verified_by);
CREATE INDEX IF NOT EXISTS idx_riders_user_id ON public.riders(user_id);
