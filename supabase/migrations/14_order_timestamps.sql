UPDATE public.orders
SET created_at = clock_timestamp()
WHERE created_at IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN created_at SET DEFAULT clock_timestamp(),
  ALTER COLUMN created_at SET NOT NULL;

UPDATE public.store_orders
SET created_at = clock_timestamp()
WHERE created_at IS NULL;

ALTER TABLE public.store_orders
  ALTER COLUMN created_at SET DEFAULT clock_timestamp(),
  ALTER COLUMN created_at SET NOT NULL;
