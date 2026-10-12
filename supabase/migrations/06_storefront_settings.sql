-- Ensure storefront settings exist even on projects that did not apply the
-- original store-builder migration, and persist merchant checkout numbers.
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL UNIQUE REFERENCES public.stores(id) ON DELETE CASCADE,
  theme_color TEXT DEFAULT '#1d7555',
  banner_text TEXT DEFAULT 'Welcome to our store!',
  font_style TEXT DEFAULT 'inter',
  logo_url TEXT DEFAULT '',
  footer_text TEXT DEFAULT '',
  custom_domain TEXT,
  jazzcash_number TEXT DEFAULT '',
  easypaisa_number TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#1d7555',
  ADD COLUMN IF NOT EXISTS banner_text TEXT DEFAULT 'Welcome to our store!',
  ADD COLUMN IF NOT EXISTS font_style TEXT DEFAULT 'inter',
  ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS custom_domain TEXT,
  ADD COLUMN IF NOT EXISTS jazzcash_number TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS easypaisa_number TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now());

CREATE UNIQUE INDEX IF NOT EXISTS idx_store_settings_store_id
  ON public.store_settings (store_id);