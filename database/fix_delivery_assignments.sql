-- Fix delivery assignments to work with profiles directly instead of riders table
-- This addresses the foreign key constraint error

-- 1. First, drop the existing foreign key constraint
ALTER TABLE public.delivery_assignments 
DROP CONSTRAINT IF EXISTS delivery_assignments_rider_id_fkey;

-- 2. Update the rider_id column to reference profiles instead of riders
-- We'll rename it to delivery_person_id for clarity
ALTER TABLE public.delivery_assignments 
RENAME COLUMN rider_id TO delivery_person_id;

-- 3. Add the new foreign key constraint to profiles table
ALTER TABLE public.delivery_assignments 
ADD CONSTRAINT delivery_assignments_delivery_person_id_fkey 
FOREIGN KEY (delivery_person_id) REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- 4. Update the index name for consistency
DROP INDEX IF EXISTS idx_delivery_assignments_rider_id;
CREATE INDEX IF NOT EXISTS idx_delivery_assignments_delivery_person_id 
ON public.delivery_assignments(delivery_person_id);

-- 5. Add a check constraint to ensure only delivery staff can be assigned
ALTER TABLE public.delivery_assignments 
ADD CONSTRAINT check_delivery_person_role 
CHECK (
  delivery_person_id IS NULL OR 
  delivery_person_id IN (
    SELECT id FROM public.profiles WHERE role = 'delivery'
  )
);

-- 6. Update any existing data to ensure consistency
-- This will set delivery_person_id to NULL for any invalid references
UPDATE public.delivery_assignments 
SET delivery_person_id = NULL 
WHERE delivery_person_id NOT IN (
  SELECT id FROM public.profiles WHERE role = 'delivery'
);

-- 7. Add a comment to document the change
COMMENT ON COLUMN public.delivery_assignments.delivery_person_id IS 'References profiles.id where role = delivery';
