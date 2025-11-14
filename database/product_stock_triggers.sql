-- Product stock automation for Kitchen One App
-- Applies trigger-based stock decrements and availability sync.
-- Run this script in your Supabase SQL editor or include it in migrations.


-- Ensure low stock threshold column exists for UI warnings
ALTER TABLE IF EXISTS public.product_stock
ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 10;

-- 1. Function: decrement stock when an order item is created
CREATE OR REPLACE FUNCTION public.decrement_product_stock_after_order()
RETURNS TRIGGER AS $$
DECLARE
  updated_quantity integer;
BEGIN
  -- Reduce stock for the ordered product, clamp at 0
  UPDATE public.product_stock
  SET
    quantity = GREATEST(quantity - NEW.quantity, 0),
    last_updated_at = now()
  WHERE product_id = NEW.product_id
  RETURNING quantity INTO updated_quantity;

  -- If no stock row exists yet, create one at 0 so the product is unavailable
  IF NOT FOUND THEN
    INSERT INTO public.product_stock (product_id, quantity, last_updated_at)
    VALUES (NEW.product_id, 0, now())
    RETURNING quantity INTO updated_quantity;
  END IF;

  -- Automatically mark the product unavailable when stock reaches zero
  IF updated_quantity <= 0 THEN
    UPDATE public.products
    SET is_available = false,
        updated_at = now()
    WHERE id = NEW.product_id AND is_available = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function: keep product availability aligned with stock changes (restocks, manual edits)
CREATE OR REPLACE FUNCTION public.sync_product_availability_from_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET is_available = (NEW.quantity > 0),
      updated_at = now()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger: decrement stock after inserting order items
DROP TRIGGER IF EXISTS trg_decrement_product_stock_after_order ON public.order_items;
CREATE TRIGGER trg_decrement_product_stock_after_order
AFTER INSERT ON public.order_items
FOR EACH ROW
EXECUTE FUNCTION public.decrement_product_stock_after_order();

-- 4. Trigger: resync availability whenever stock rows are inserted or updated
DROP TRIGGER IF EXISTS trg_sync_product_availability_from_stock ON public.product_stock;
CREATE TRIGGER trg_sync_product_availability_from_stock
AFTER INSERT OR UPDATE ON public.product_stock
FOR EACH ROW
EXECUTE FUNCTION public.sync_product_availability_from_stock();

