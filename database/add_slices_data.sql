-- Add slice data to the slices table
-- This script adds the 3 slice types as requested

INSERT INTO public.slices (name, description, is_active, created_at, updated_at) VALUES
('8 Regular Cut', '8 regular triangular slices', true, now(), now()),
('16 Regular Cut', '16 regular triangular slices', true, now(), now()),
('32 Square Cut', '32 square slices', true, now(), now())
ON CONFLICT (name) DO NOTHING;

-- Verify the data was inserted
SELECT * FROM public.slices ORDER BY name;
