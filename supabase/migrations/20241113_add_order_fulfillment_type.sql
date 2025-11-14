-- Add fulfillment type support and pickup tracking fields
begin;

-- Create enum for order fulfillment types if it doesn't exist yet
do $$
begin
  if not exists (
    select 1 from pg_type
    where typname = 'order_fulfillment_type'
  ) then
    create type public.order_fulfillment_type as enum ('delivery', 'pickup');
  end if;
end
$$;

-- Extend orders table with fulfillment metadata
alter table public.orders
  add column if not exists fulfillment_type public.order_fulfillment_type not null default 'delivery',
  add column if not exists pickup_ready_at timestamp with time zone,
  add column if not exists picked_up_at timestamp with time zone,
  add column if not exists pickup_verified_at timestamp with time zone,
  add column if not exists pickup_verified_by uuid references public.profiles(id),
  add column if not exists pickup_location_snapshot text,
  add column if not exists pickup_notes text;

-- Allow delivery_address_id to be null for pickup scenarios
alter table public.orders
  alter column delivery_address_id drop not null;

-- Ensure delivery orders always retain an address
alter table public.orders
  drop constraint if exists orders_fulfillment_address_check;

alter table public.orders
  add constraint orders_fulfillment_address_check
    check (
      (fulfillment_type = 'delivery' and delivery_address_id is not null)
      or (fulfillment_type = 'pickup')
    );

commit;

