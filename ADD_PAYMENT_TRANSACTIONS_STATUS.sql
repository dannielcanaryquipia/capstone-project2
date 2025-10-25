-- =====================================================
-- Add missing status column to payment_transactions table
-- =====================================================

-- Step 1: Add status column to payment_transactions table
ALTER TABLE public.payment_transactions 
ADD COLUMN IF NOT EXISTS status payment_status DEFAULT 'pending'::payment_status;

-- Step 2: Update existing payment_transactions to have 'pending' status
UPDATE public.payment_transactions 
SET status = 'pending'::payment_status 
WHERE status IS NULL;

-- Step 3: Make status column NOT NULL
ALTER TABLE public.payment_transactions 
ALTER COLUMN status SET NOT NULL;

-- Step 4: Verify the changes
SELECT 'Updated payment_transactions table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'payment_transactions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 5: Check sample data
SELECT 'Sample payment_transactions data:' as info;
SELECT id, status, payment_method, created_at 
FROM public.payment_transactions 
ORDER BY created_at DESC 
LIMIT 5;
