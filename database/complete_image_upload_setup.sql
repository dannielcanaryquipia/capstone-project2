-- Complete Image Upload System Database Setup
-- Run this after your existing schema to add image upload functionality

-- 1. Create image_metadata table
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

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_image_metadata_order_id ON public.image_metadata(order_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_type ON public.image_metadata(type);
CREATE INDEX IF NOT EXISTS idx_image_metadata_uploaded_by ON public.image_metadata(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_image_metadata_verified ON public.image_metadata(verified);
CREATE INDEX IF NOT EXISTS idx_image_metadata_uploaded_at ON public.image_metadata(uploaded_at);

-- 3. Create helper functions first (needed by policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
END;
$$;

-- 4. Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('payments', 'payments', true),
  ('deliveries', 'deliveries', true),
  ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Set up storage policies for payments bucket
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Payments') THEN
        CREATE POLICY "Public Access Payments"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'payments');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload Payments') THEN
        CREATE POLICY "Authenticated Upload Payments"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'payments' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin Manage Payments') THEN
        CREATE POLICY "Admin Manage Payments"
        ON storage.objects FOR ALL
        USING (bucket_id = 'payments' AND public.is_admin());
    END IF;
END $$;

-- 5. Set up storage policies for deliveries bucket
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Deliveries') THEN
        CREATE POLICY "Public Access Deliveries"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'deliveries');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload Deliveries') THEN
        CREATE POLICY "Authenticated Upload Deliveries"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'deliveries' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin Manage Deliveries') THEN
        CREATE POLICY "Admin Manage Deliveries"
        ON storage.objects FOR ALL
        USING (bucket_id = 'deliveries' AND public.is_admin());
    END IF;
END $$;

-- 6. Set up storage policies for thumbnails bucket
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Thumbnails') THEN
        CREATE POLICY "Public Access Thumbnails"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'thumbnails');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Upload Thumbnails') THEN
        CREATE POLICY "Authenticated Upload Thumbnails"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin Manage Thumbnails') THEN
        CREATE POLICY "Admin Manage Thumbnails"
        ON storage.objects FOR ALL
        USING (bucket_id = 'thumbnails' AND public.is_admin());
    END IF;
END $$;

-- 7. Add RLS policies for image_metadata table
ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;

-- Users can view images for their own orders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own order images') THEN
        CREATE POLICY "Users can view their own order images"
        ON public.image_metadata FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = image_metadata.order_id 
            AND orders.user_id = auth.uid()
          )
        );
    END IF;
END $$;

-- Delivery staff can view images for their assigned orders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Delivery staff can view assigned order images') THEN
        CREATE POLICY "Delivery staff can view assigned order images"
        ON public.image_metadata FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.delivery_assignments da
            JOIN public.orders o ON o.id = da.order_id
            WHERE da.order_id = image_metadata.order_id 
            AND da.rider_id IN (
              SELECT id FROM public.riders WHERE user_id = auth.uid()
            )
          )
        );
    END IF;
END $$;

-- Admins can view all images
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all images') THEN
        CREATE POLICY "Admins can view all images"
        ON public.image_metadata FOR SELECT
        USING (public.is_admin());
    END IF;
END $$;

-- Users can insert images for their own orders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload images for their orders') THEN
        CREATE POLICY "Users can upload images for their orders"
        ON public.image_metadata FOR INSERT
        WITH CHECK (
          uploaded_by = auth.uid() AND
          EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = image_metadata.order_id 
            AND orders.user_id = auth.uid()
          )
        );
    END IF;
END $$;

-- Delivery staff can insert images for their assigned orders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Delivery staff can upload images for assigned orders') THEN
        CREATE POLICY "Delivery staff can upload images for assigned orders"
        ON public.image_metadata FOR INSERT
        WITH CHECK (
          uploaded_by = auth.uid() AND
          EXISTS (
            SELECT 1 FROM public.delivery_assignments da
            WHERE da.order_id = image_metadata.order_id 
            AND da.rider_id IN (
              SELECT id FROM public.riders WHERE user_id = auth.uid()
            )
          )
        );
    END IF;
END $$;

-- Admins can insert images for any order
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can upload images for any order') THEN
        CREATE POLICY "Admins can upload images for any order"
        ON public.image_metadata FOR INSERT
        WITH CHECK (public.is_admin());
    END IF;
END $$;

-- Only admins can update image verification status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update image verification') THEN
        CREATE POLICY "Admins can update image verification"
        ON public.image_metadata FOR UPDATE
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
    END IF;
END $$;

-- Only admins can delete images
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete images') THEN
        CREATE POLICY "Admins can delete images"
        ON public.image_metadata FOR DELETE
        USING (public.is_admin());
    END IF;
END $$;

-- 8. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_image_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_image_metadata_updated_at ON public.image_metadata;
CREATE TRIGGER update_image_metadata_updated_at
  BEFORE UPDATE ON public.image_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_image_metadata_updated_at();

-- 10. Create function to update image verification
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
  SET 
    verified = p_verified,
    verified_by = p_verified_by,
    verified_at = p_verified_at,
    updated_at = now()
  WHERE id = p_image_id;
END;
$$;

-- 11. Helper function already created above

-- 12. Create function to get image statistics for admin dashboard
CREATE OR REPLACE FUNCTION public.get_image_stats()
RETURNS TABLE (
  total_images bigint,
  pending_verification bigint,
  verified_images bigint,
  total_size numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_images,
    COUNT(*) FILTER (WHERE verified = false) as pending_verification,
    COUNT(*) FILTER (WHERE verified = true) as verified_images,
    COALESCE(SUM((metadata->>'size')::numeric), 0) as total_size
  FROM public.image_metadata;
END;
$$;

-- 13. Create function to get recent image uploads
CREATE OR REPLACE FUNCTION public.get_recent_image_uploads(limit_count integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  order_id uuid,
  type text,
  url text,
  thumbnail_url text,
  uploaded_by uuid,
  uploaded_at timestamp with time zone,
  verified boolean,
  metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    im.id,
    im.order_id,
    im.type,
    im.url,
    im.thumbnail_url,
    im.uploaded_by,
    im.uploaded_at,
    im.verified,
    im.metadata
  FROM public.image_metadata im
  ORDER BY im.uploaded_at DESC
  LIMIT limit_count;
END;
$$;

-- 14. Create view for admin image management
CREATE OR REPLACE VIEW public.admin_image_view AS
SELECT 
  im.id,
  im.order_id,
  im.type,
  im.url,
  im.thumbnail_url,
  im.uploaded_by,
  im.uploaded_at,
  im.verified,
  im.verified_by,
  im.verified_at,
  im.metadata,
  o.user_id as order_user_id,
  p.full_name as uploaded_by_name,
  p2.full_name as verified_by_name
FROM public.image_metadata im
LEFT JOIN public.orders o ON o.id = im.order_id
LEFT JOIN public.profiles p ON p.id = im.uploaded_by
LEFT JOIN public.profiles p2 ON p2.id = im.verified_by;

-- 15. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.image_metadata TO authenticated;
GRANT SELECT ON public.admin_image_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_image_verification TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_image_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_image_uploads TO authenticated;

-- 16. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_image_metadata_verified_at ON public.image_metadata(verified_at);
CREATE INDEX IF NOT EXISTS idx_image_metadata_type_verified ON public.image_metadata(type, verified);
CREATE INDEX IF NOT EXISTS idx_image_metadata_order_type ON public.image_metadata(order_id, type);

-- 17. Add comments for documentation
COMMENT ON TABLE public.image_metadata IS 'Stores metadata for uploaded images including payment proofs and delivery proofs';
COMMENT ON COLUMN public.image_metadata.type IS 'Type of image: payment_proof or delivery_proof';
COMMENT ON COLUMN public.image_metadata.metadata IS 'JSON object containing image dimensions, size, format, and original name';
COMMENT ON COLUMN public.image_metadata.verified IS 'Whether the image has been verified by an admin';
COMMENT ON FUNCTION public.update_image_verification IS 'Updates image verification status (admin only)';
COMMENT ON FUNCTION public.get_image_stats IS 'Returns image statistics for admin dashboard';
COMMENT ON FUNCTION public.get_recent_image_uploads IS 'Returns recent image uploads for admin review';
