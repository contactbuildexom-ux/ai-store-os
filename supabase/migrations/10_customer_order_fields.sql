-- Add customer_email and postal_code columns to orders tables
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT;

ALTER TABLE IF EXISTS public.store_orders
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT;
