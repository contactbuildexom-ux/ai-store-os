-- Merchant checkout preferences and transfer account details.
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS accepts_cod BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS accepts_advance BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS advance_percentage INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS payment_details JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.stores
  DROP CONSTRAINT IF EXISTS stores_advance_percentage_range;

ALTER TABLE public.stores
  ADD CONSTRAINT stores_advance_percentage_range
  CHECK (advance_percentage BETWEEN 1 AND 100);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod',
  ADD COLUMN IF NOT EXISTS advance_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.store_orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod',
  ADD COLUMN IF NOT EXISTS advance_amount NUMERIC(10, 2) NOT NULL DEFAULT 0;