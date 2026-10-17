ALTER TABLE public.store_products
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS stock INTEGER CHECK (stock IS NULL OR stock >= 0);

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_products_store_sku_unique
  ON public.store_products (store_id, lower(btrim(sku)))
  WHERE sku IS NOT NULL AND btrim(sku) <> '';
