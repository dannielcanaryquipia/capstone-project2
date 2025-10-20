-- Create image_metadata table for tracking uploaded images
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_image_metadata_order_id ON public.image_metadata(order_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_type ON public.image_metadata(type);
CREATE INDEX IF NOT EXISTS idx_image_metadata_uploaded_by ON public.image_metadata(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_image_metadata_verified ON public.image_metadata(verified);
CREATE INDEX IF NOT EXISTS idx_image_metadata_uploaded_at ON public.image_metadata(uploaded_at);

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('payments', 'payments', true),
  ('deliveries', 'deliveries', true),
  ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for payments bucket
CREATE POLICY "Public Access Payments"
ON storage.objects FOR SELECT
USING (bucket_id = 'payments');

CREATE POLICY "Authenticated Upload Payments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payments' AND auth.role() = 'authenticated');

CREATE POLICY "Admin Manage Payments"
ON storage.objects FOR ALL
USING (bucket_id = 'payments' AND public.is_admin());

-- Set up storage policies for deliveries bucket
CREATE POLICY "Public Access Deliveries"
ON storage.objects FOR SELECT
USING (bucket_id = 'deliveries');

CREATE POLICY "Authenticated Upload Deliveries"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'deliveries' AND auth.role() = 'authenticated');

CREATE POLICY "Admin Manage Deliveries"
ON storage.objects FOR ALL
USING (bucket_id = 'deliveries' AND public.is_admin());

-- Set up storage policies for thumbnails bucket
CREATE POLICY "Public Access Thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

CREATE POLICY "Authenticated Upload Thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'thumbnails' AND auth.role() = 'authenticated');

CREATE POLICY "Admin Manage Thumbnails"
ON storage.objects FOR ALL
USING (bucket_id = 'thumbnails' AND public.is_admin());

-- Add RLS policies for image_metadata table
ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;

-- Users can view images for their own orders
CREATE POLICY "Users can view their own order images"
ON public.image_metadata FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = image_metadata.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Delivery staff can view images for their assigned orders
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

-- Admins can view all images
CREATE POLICY "Admins can view all images"
ON public.image_metadata FOR SELECT
USING (public.is_admin());

-- Users can insert images for their own orders
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

-- Delivery staff can insert images for their assigned orders
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

-- Admins can insert images for any order
CREATE POLICY "Admins can upload images for any order"
ON public.image_metadata FOR INSERT
WITH CHECK (public.is_admin());

-- Only admins can update image verification status
CREATE POLICY "Admins can update image verification"
ON public.image_metadata FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only admins can delete images
CREATE POLICY "Admins can delete images"
ON public.image_metadata FOR DELETE
USING (public.is_admin());

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_image_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_image_metadata_updated_at ON public.image_metadata;
CREATE TRIGGER update_image_metadata_updated_at
  BEFORE UPDATE ON public.image_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_image_metadata_updated_at();

-- Create function to update image verification
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
