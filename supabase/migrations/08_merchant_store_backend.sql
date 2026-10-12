-- Merchant registration, AI-generated storefronts, and merchant dashboard data.
-- This migration is additive and safe to rerun; it does not replace the tenant
-- RLS setup in 05_platform_rls_policies.sql.

CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  whatsapp_number TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_email TEXT,
  password_hash TEXT,
  plan TEXT NOT NULL DEFAULT 'basic',
  selected_plan TEXT NOT NULL DEFAULT 'basic',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS public.stores
  ADD COLUMN IF NOT EXISTS owner_email TEXT,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS selected_plan TEXT NOT NULL DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE IF EXISTS public.stores
  ALTER COLUMN whatsapp_number DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON public.stores (owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores (user_id);

-- Case-insensitive uniqueness. If older data contains duplicates, skip the
-- affected index without aborting this migration; clean duplicates and rerun.
DO $$
BEGIN
  IF to_regclass('public.stores') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_stores_slug_unique')
    AND NOT EXISTS (
      SELECT 1 FROM public.stores
      WHERE slug IS NOT NULL
      GROUP BY lower(btrim(slug))
      HAVING count(*) > 1
    ) THEN
    CREATE UNIQUE INDEX idx_stores_slug_unique
      ON public.stores (lower(btrim(slug))) WHERE slug IS NOT NULL;
  END IF;

  IF to_regclass('public.stores') IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_stores_owner_email_unique')
    AND NOT EXISTS (
      SELECT 1 FROM public.stores
      WHERE owner_email IS NOT NULL AND btrim(owner_email) <> ''
      GROUP BY lower(btrim(owner_email))
      HAVING count(*) > 1
    ) THEN
    CREATE UNIQUE INDEX idx_stores_owner_email_unique
      ON public.stores (lower(btrim(owner_email)))
      WHERE owner_email IS NOT NULL AND btrim(owner_email) <> '';
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.store_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_categories
  ADD COLUMN IF NOT EXISTS store_id UUID,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_store_categories_store_id
  ON public.store_categories (store_id);

CREATE TABLE IF NOT EXISTS public.store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.store_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_products
  ADD COLUMN IF NOT EXISTS store_id UUID,
  ADD COLUMN IF NOT EXISTS category_id UUID,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_store_products_store_id
  ON public.store_products (store_id);
CREATE INDEX IF NOT EXISTS idx_store_products_category_id
  ON public.store_products (category_id);

-- Legacy catalog table remains readable by public storefront checkout.
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  wholesale_cost NUMERIC(10, 2) DEFAULT 0,
  min_accept_price NUMERIC(10, 2) DEFAULT 0,
  image_url TEXT,
  source TEXT DEFAULT 'manual',
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS store_id UUID,
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wholesale_cost NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_accept_price NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products (store_id);

CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL UNIQUE REFERENCES public.stores(id) ON DELETE CASCADE,
  theme_color TEXT NOT NULL DEFAULT '#1d7555',
  selected_theme TEXT NOT NULL DEFAULT 'emerald',
  banner_text TEXT NOT NULL DEFAULT 'Welcome to our store!',
  footer_text TEXT NOT NULL DEFAULT '',
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  font_style TEXT DEFAULT 'inter',
  logo_url TEXT DEFAULT '',
  custom_domain TEXT,
  jazzcash_number TEXT DEFAULT '',
  easypaisa_number TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS store_id UUID,
  ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#1d7555',
  ADD COLUMN IF NOT EXISTS selected_theme TEXT DEFAULT 'emerald',
  ADD COLUMN IF NOT EXISTS banner_text TEXT DEFAULT 'Welcome to our store!',
  ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS font_style TEXT DEFAULT 'inter',
  ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS custom_domain TEXT,
  ADD COLUMN IF NOT EXISTS jazzcash_number TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS easypaisa_number TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_store_settings_store_id_unique')
    AND NOT EXISTS (
      SELECT 1 FROM public.store_settings
      WHERE store_id IS NOT NULL
      GROUP BY store_id
      HAVING count(*) > 1
    ) THEN
    CREATE UNIQUE INDEX idx_store_settings_store_id_unique
      ON public.store_settings (store_id);
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.delivery_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  city_rate NUMERIC(10, 2) DEFAULT 200,
  other_city_rate NUMERIC(10, 2) DEFAULT 350,
  store_city TEXT DEFAULT 'Lahore',
  delivery_fee NUMERIC(10, 2) DEFAULT 200,
  free_delivery_above NUMERIC(10, 2),
  estimated_days TEXT DEFAULT '2-3 business days'
);

ALTER TABLE public.delivery_settings
  ADD COLUMN IF NOT EXISTS store_id UUID,
  ADD COLUMN IF NOT EXISTS city_rate NUMERIC(10, 2) DEFAULT 200,
  ADD COLUMN IF NOT EXISTS other_city_rate NUMERIC(10, 2) DEFAULT 350,
  ADD COLUMN IF NOT EXISTS store_city TEXT DEFAULT 'Lahore',
  ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) DEFAULT 200,
  ADD COLUMN IF NOT EXISTS free_delivery_above NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS estimated_days TEXT DEFAULT '2-3 business days';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_delivery_settings_store_id_unique')
    AND NOT EXISTS (
      SELECT 1 FROM public.delivery_settings
      WHERE store_id IS NOT NULL
      GROUP BY store_id
      HAVING count(*) > 1
    ) THEN
    CREATE UNIQUE INDEX idx_delivery_settings_store_id_unique
      ON public.delivery_settings (store_id);
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.store_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_orders
  ADD COLUMN IF NOT EXISTS store_id UUID,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS customer_address TEXT,
  ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_store_orders_store_id ON public.store_orders (store_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_created_at ON public.store_orders (created_at DESC);

-- Existing orders is the canonical table for public storefront checkout and
-- platform reporting. Create/extend it for projects that skipped old setup.
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  risk_score INTEGER DEFAULT 10,
  risk_reason TEXT DEFAULT 'Safe order',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS store_id UUID,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS risk_reason TEXT DEFAULT 'Safe order',
  ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders (store_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- Store payment-account settings and payment requests currently share this
-- table in the application, so it carries columns for both record shapes.
CREATE TABLE IF NOT EXISTS public.store_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  provider_name TEXT,
  account_title TEXT DEFAULT '',
  account_number TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  payment_method TEXT,
  transaction_id TEXT,
  amount NUMERIC(10, 2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_payments
  ADD COLUMN IF NOT EXISTS store_id UUID,
  ADD COLUMN IF NOT EXISTS provider_name TEXT,
  ADD COLUMN IF NOT EXISTS account_title TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS account_number TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.store_payments ALTER COLUMN provider_name DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_store_payments_store_id ON public.store_payments (store_id);
CREATE INDEX IF NOT EXISTS idx_store_payments_status ON public.store_payments (status);

-- Product uploads need this storage bucket; safe to apply repeatedly.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', TRUE, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
