-- Step-by-Step Image Upload Database Setup
-- Run these commands one by one in your Supabase SQL Editor

-- STEP 1: Create the image_metadata table
CREATE TABLE IF NOT EXISTS public.image_metadata (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('payment_proof', 'delivery_proof')),
  url text NOT NULL,
  thumbnail_url text,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  verified boolean DEFAULT false,
  verified_by uuid,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT image_metadata_pkey PRIMARY KEY (id),
  CONSTRAINT image_metadata_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT image_metadata_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id),
  CONSTRAINT image_metadata_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.profiles(id)
);

-- STEP 2: Create helper functions first (needed by policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'));
END;
$$;

-- STEP 3: Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('payments', 'payments', true),
  ('deliveries', 'deliveries', true),
  ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- STEP 4: Create storage policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Payments') THEN
        CREATE POLICY "Public Access Payments" ON storage.objects FOR SELECT USING (bucket_id = 'payments');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload Payments') THEN
        CREATE POLICY "Authenticated Upload Payments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payments' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin Manage Payments') THEN
        CREATE POLICY "Admin Manage Payments" ON storage.objects FOR ALL USING (bucket_id = 'payments' AND public.is_admin());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Deliveries') THEN
        CREATE POLICY "Public Access Deliveries" ON storage.objects FOR SELECT USING (bucket_id = 'deliveries');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload Deliveries') THEN
        CREATE POLICY "Authenticated Upload Deliveries" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'deliveries' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin Manage Deliveries') THEN
        CREATE POLICY "Admin Manage Deliveries" ON storage.objects FOR ALL USING (bucket_id = 'deliveries' AND public.is_admin());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Thumbnails') THEN
        CREATE POLICY "Public Access Thumbnails" ON storage.objects FOR SELECT USING (bucket_id = 'thumbnails');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload Thumbnails') THEN
        CREATE POLICY "Authenticated Upload Thumbnails" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin Manage Thumbnails') THEN
        CREATE POLICY "Admin Manage Thumbnails" ON storage.objects FOR ALL USING (bucket_id = 'thumbnails' AND public.is_admin());
    END IF;
END $$;

-- STEP 5: Enable RLS and create policies
ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own order images') THEN
        CREATE POLICY "Users can view their own order images" ON public.image_metadata FOR SELECT
        USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = image_metadata.order_id AND orders.user_id = auth.uid()));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all images') THEN
        CREATE POLICY "Admins can view all images" ON public.image_metadata FOR SELECT USING (public.is_admin());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload images for their orders') THEN
        CREATE POLICY "Users can upload images for their orders" ON public.image_metadata FOR INSERT
        WITH CHECK (uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM public.orders WHERE orders.id = image_metadata.order_id AND orders.user_id = auth.uid()));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can upload images for any order') THEN
        CREATE POLICY "Admins can upload images for any order" ON public.image_metadata FOR INSERT WITH CHECK (public.is_admin());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update image verification') THEN
        CREATE POLICY "Admins can update image verification" ON public.image_metadata FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete images') THEN
        CREATE POLICY "Admins can delete images" ON public.image_metadata FOR DELETE USING (public.is_admin());
    END IF;
END $$;

-- STEP 6: Create additional helper functions

CREATE OR REPLACE FUNCTION public.update_image_verification(
  p_image_id uuid,
  p_verified boolean,
  p_verified_by uuid,
  p_verified_at timestamp with time zone
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.image_metadata
  SET verified = p_verified, verified_by = p_verified_by, verified_at = p_verified_at, updated_at = now()
  WHERE id = p_image_id;
END;
$$;

-- STEP 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_image_metadata_order_id ON public.image_metadata(order_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_type ON public.image_metadata(type);
CREATE INDEX IF NOT EXISTS idx_image_metadata_verified ON public.image_metadata(verified);
CREATE INDEX IF NOT EXISTS idx_image_metadata_uploaded_at ON public.image_metadata(uploaded_at);

-- STEP 8: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.image_metadata TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_image_verification TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
