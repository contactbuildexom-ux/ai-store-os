-- Tenant RLS for the storefront schema in this repository.
-- The checked-in catalog tables are store_categories/store_products. The
-- original schema also has products/orders and some deployments may have a
-- separate categories table.

-- Preserve the legacy owner_id column while introducing user_id as the
-- canonical Supabase Auth ownership key.
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

UPDATE public.stores SET user_id = owner_id
WHERE user_id IS NULL AND owner_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores (user_id);

CREATE OR REPLACE FUNCTION public.sync_store_owner_ids()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL AND NEW.owner_id IS NOT NULL AND NEW.user_id <> NEW.owner_id THEN
    RAISE EXCEPTION 'user_id and owner_id must identify the same store owner';
  END IF;
  NEW.user_id := COALESCE(NEW.user_id, NEW.owner_id);
  NEW.owner_id := COALESCE(NEW.owner_id, NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_store_owner_ids ON public.stores;
CREATE TRIGGER sync_store_owner_ids
BEFORE INSERT OR UPDATE OF user_id, owner_id ON public.stores
FOR EACH ROW EXECUTE FUNCTION public.sync_store_owner_ids();

-- Stores: public storefront lookup; authenticated users may create/update only
-- their own store. Column grants keep credentials and owner metadata private.
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stores_public_read ON public.stores;
CREATE POLICY stores_public_read ON public.stores
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS stores_owner_insert ON public.stores;
CREATE POLICY stores_owner_insert ON public.stores
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS stores_owner_update ON public.stores;
CREATE POLICY stores_owner_update ON public.stores
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
REVOKE ALL ON public.stores FROM anon, authenticated;
GRANT SELECT (id, name, slug, plan, whatsapp_number, created_at) ON public.stores TO anon, authenticated;
GRANT SELECT (id, user_id) ON public.stores TO authenticated;
GRANT INSERT (name, slug, whatsapp_number, owner_id, user_id) ON public.stores TO authenticated;
GRANT UPDATE (name, whatsapp_number) ON public.stores TO authenticated;

-- Reusable ownership expression is written into each policy so authorization
-- remains visible in pg_policies and is enforced for every operation.
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_products_public_read ON public.store_products;
CREATE POLICY store_products_public_read ON public.store_products
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS store_products_owner_insert ON public.store_products;
CREATE POLICY store_products_owner_insert ON public.store_products FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_products.store_id AND s.user_id = auth.uid()));
DROP POLICY IF EXISTS store_products_owner_update ON public.store_products;
CREATE POLICY store_products_owner_update ON public.store_products FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_products.store_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_products.store_id AND s.user_id = auth.uid()));
DROP POLICY IF EXISTS store_products_owner_delete ON public.store_products;
CREATE POLICY store_products_owner_delete ON public.store_products FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_products.store_id AND s.user_id = auth.uid()));
REVOKE ALL ON public.store_products FROM anon, authenticated;
GRANT SELECT (id, store_id, category_id, name, description, price, image_url, created_at) ON public.store_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_products TO authenticated;

ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_categories_public_read ON public.store_categories;
CREATE POLICY store_categories_public_read ON public.store_categories
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS store_categories_owner_insert ON public.store_categories;
CREATE POLICY store_categories_owner_insert ON public.store_categories FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_categories.store_id AND s.user_id = auth.uid()));
DROP POLICY IF EXISTS store_categories_owner_update ON public.store_categories;
CREATE POLICY store_categories_owner_update ON public.store_categories FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_categories.store_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_categories.store_id AND s.user_id = auth.uid()));
DROP POLICY IF EXISTS store_categories_owner_delete ON public.store_categories;
CREATE POLICY store_categories_owner_delete ON public.store_categories FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_categories.store_id AND s.user_id = auth.uid()));
REVOKE ALL ON public.store_categories FROM anon, authenticated;
GRANT SELECT (id, store_id, name, created_at) ON public.store_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_categories TO authenticated;

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_settings_public_read ON public.store_settings;
CREATE POLICY store_settings_public_read ON public.store_settings
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS store_settings_owner_insert ON public.store_settings;
CREATE POLICY store_settings_owner_insert ON public.store_settings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_settings.store_id AND s.user_id = auth.uid()));
DROP POLICY IF EXISTS store_settings_owner_update ON public.store_settings;
CREATE POLICY store_settings_owner_update ON public.store_settings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_settings.store_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_settings.store_id AND s.user_id = auth.uid()));
DROP POLICY IF EXISTS store_settings_owner_delete ON public.store_settings;
CREATE POLICY store_settings_owner_delete ON public.store_settings FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_settings.store_id AND s.user_id = auth.uid()));
REVOKE ALL ON public.store_settings FROM anon, authenticated;
GRANT SELECT (store_id, theme_color, banner_text, font_style, logo_url, footer_text, custom_domain, created_at, updated_at) ON public.store_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_settings TO authenticated;

-- Legacy products table: public grants intentionally omit wholesale cost and
-- minimum acceptable price fields.
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS products_public_read ON public.products;
CREATE POLICY products_public_read ON public.products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS products_owner_insert ON public.products;
CREATE POLICY products_owner_insert ON public.products FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = products.store_id AND s.user_id = auth.uid()));
DROP POLICY IF EXISTS products_owner_update ON public.products;
CREATE POLICY products_owner_update ON public.products FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = products.store_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = products.store_id AND s.user_id = auth.uid()));
DROP POLICY IF EXISTS products_owner_delete ON public.products;
CREATE POLICY products_owner_delete ON public.products FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = products.store_id AND s.user_id = auth.uid()));
REVOKE ALL ON public.products FROM anon, authenticated;
GRANT SELECT (id, store_id, name, description, price, image_url, source, category, created_at) ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- Apply matching policy to an optional legacy categories table only when it
-- exists and has a store_id column (not present in the checked-in migrations).
DO $$
BEGIN
  IF to_regclass('public.categories') IS NOT NULL AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'store_id'
  ) THEN
    EXECUTE 'ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS categories_public_read ON public.categories';
    EXECUTE 'CREATE POLICY categories_public_read ON public.categories FOR SELECT TO anon, authenticated USING (true)';
    EXECUTE 'DROP POLICY IF EXISTS categories_owner_insert ON public.categories';
    EXECUTE 'CREATE POLICY categories_owner_insert ON public.categories FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = categories.store_id AND s.user_id = auth.uid()))';
    EXECUTE 'DROP POLICY IF EXISTS categories_owner_update ON public.categories';
    EXECUTE 'CREATE POLICY categories_owner_update ON public.categories FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = categories.store_id AND s.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = categories.store_id AND s.user_id = auth.uid()))';
    EXECUTE 'DROP POLICY IF EXISTS categories_owner_delete ON public.categories';
    EXECUTE 'CREATE POLICY categories_owner_delete ON public.categories FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = categories.store_id AND s.user_id = auth.uid()))';
    EXECUTE 'REVOKE ALL ON public.categories FROM anon, authenticated';
    EXECUTE 'GRANT SELECT ON public.categories TO anon, authenticated';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated';
  END IF;
END;
$$;

-- Orders: customers may submit, but cannot read; merchants may read/update
-- only orders belonging to their stores.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS orders_public_insert ON public.orders;
CREATE POLICY orders_public_insert ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS orders_owner_read ON public.orders;
CREATE POLICY orders_owner_read ON public.orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = orders.store_id AND s.user_id = auth.uid()));
DROP POLICY IF EXISTS orders_owner_update ON public.orders;
CREATE POLICY orders_owner_update ON public.orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = orders.store_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = orders.store_id AND s.user_id = auth.uid()));
REVOKE ALL ON public.orders FROM anon, authenticated;
GRANT INSERT (store_id, customer_name, customer_phone, shipping_address, city, total_amount, delivery_fee, items) ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;

-- The current store-builder also writes store_orders, so protect that table in
-- the same way as legacy orders.
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_orders_public_insert ON public.store_orders;
CREATE POLICY store_orders_public_insert ON public.store_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS store_orders_owner_read ON public.store_orders;
CREATE POLICY store_orders_owner_read ON public.store_orders FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_orders.store_id AND s.user_id = auth.uid()));
DROP POLICY IF EXISTS store_orders_owner_update ON public.store_orders;
CREATE POLICY store_orders_owner_update ON public.store_orders FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_orders.store_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_orders.store_id AND s.user_id = auth.uid()));
REVOKE ALL ON public.store_orders FROM anon, authenticated;
GRANT INSERT (store_id, customer_name, customer_phone, customer_address, items, total_amount) ON public.store_orders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.store_orders TO authenticated;

-- Fail the migration rather than silently leaving a core table without RLS.
DO $$
DECLARE
  required_table TEXT;
  policy_row RECORD;
BEGIN
  FOREACH required_table IN ARRAY ARRAY[
    'stores', 'store_products', 'store_categories', 'store_settings',
    'products', 'orders', 'store_orders'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
        AND c.relname = required_table
        AND c.relrowsecurity
    ) THEN
      RAISE EXCEPTION 'RLS verification failed: public.% does not have row-level security enabled', required_table;
    END IF;
  END LOOP;

  FOR policy_row IN
    SELECT * FROM (VALUES
      ('stores', 'stores_public_read'),
      ('stores', 'stores_owner_insert'),
      ('stores', 'stores_owner_update'),
      ('store_products', 'store_products_public_read'),
      ('store_products', 'store_products_owner_insert'),
      ('store_products', 'store_products_owner_update'),
      ('store_products', 'store_products_owner_delete'),
      ('store_categories', 'store_categories_public_read'),
      ('store_categories', 'store_categories_owner_insert'),
      ('store_categories', 'store_categories_owner_update'),
      ('store_categories', 'store_categories_owner_delete'),
      ('store_settings', 'store_settings_public_read'),
      ('store_settings', 'store_settings_owner_insert'),
      ('store_settings', 'store_settings_owner_update'),
      ('store_settings', 'store_settings_owner_delete'),
      ('products', 'products_public_read'),
      ('products', 'products_owner_insert'),
      ('products', 'products_owner_update'),
      ('products', 'products_owner_delete'),
      ('orders', 'orders_public_insert'),
      ('orders', 'orders_owner_read'),
      ('orders', 'orders_owner_update'),
      ('store_orders', 'store_orders_public_insert'),
      ('store_orders', 'store_orders_owner_read'),
      ('store_orders', 'store_orders_owner_update')
    ) AS required(table_name, policy_name)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = policy_row.table_name
        AND policyname = policy_row.policy_name
    ) THEN
      RAISE EXCEPTION 'RLS verification failed: missing policy %.%', policy_row.table_name, policy_row.policy_name;
    END IF;
  END LOOP;
END;
$$;