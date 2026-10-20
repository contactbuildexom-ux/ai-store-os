DO $$
BEGIN
  IF to_regclass('public.merchants') IS NULL
     AND to_regclass('public.sellers') IS NOT NULL THEN
    ALTER TABLE public.sellers RENAME TO merchants;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  whatsapp_number TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS store_id UUID,
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Legacy schemas sometimes used merchants.id as a Supabase Auth user ID.
-- Merchant rows now have their own generated ID and link to stores via store_id.
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT constraint_row.conname
    FROM pg_constraint AS constraint_row
    JOIN pg_class AS referenced_table
      ON referenced_table.oid = constraint_row.confrelid
    JOIN pg_namespace AS referenced_schema
      ON referenced_schema.oid = referenced_table.relnamespace
    JOIN pg_attribute AS source_column
      ON source_column.attrelid = constraint_row.conrelid
     AND source_column.attnum = constraint_row.conkey[1]
    WHERE constraint_row.conrelid = 'public.merchants'::regclass
      AND constraint_row.contype = 'f'
      AND cardinality(constraint_row.conkey) = 1
      AND source_column.attname = 'id'
      AND referenced_table.relname = 'users'
      AND referenced_schema.nspname IN ('public', 'auth')
  LOOP
    EXECUTE format('ALTER TABLE public.merchants DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END;
$$;

UPDATE public.merchants
SET id = gen_random_uuid()
WHERE id IS NULL;

UPDATE public.merchants
SET name = COALESCE(name, ''),
    email = COALESCE(email, ''),
    whatsapp_number = COALESCE(whatsapp_number, ''),
    address = COALESCE(address, '');

ALTER TABLE public.merchants
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN name SET DEFAULT '',
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN email SET DEFAULT '',
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN whatsapp_number SET DEFAULT '',
  ALTER COLUMN whatsapp_number SET NOT NULL,
  ALTER COLUMN address SET DEFAULT '',
  ALTER COLUMN address SET NOT NULL;

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT constraint_row.conname
    FROM pg_constraint AS constraint_row
    JOIN pg_class AS referenced_table
      ON referenced_table.oid = constraint_row.confrelid
    JOIN pg_namespace AS referenced_schema
      ON referenced_schema.oid = referenced_table.relnamespace
    JOIN pg_attribute AS source_column
      ON source_column.attrelid = constraint_row.conrelid
     AND source_column.attnum = constraint_row.conkey[1]
    WHERE constraint_row.conrelid = 'public.merchants'::regclass
      AND constraint_row.contype = 'f'
      AND cardinality(constraint_row.conkey) = 1
      AND source_column.attname = 'store_id'
      AND referenced_table.relname = 'stores'
      AND referenced_schema.nspname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.merchants DROP CONSTRAINT %I', constraint_name);
  END LOOP;

  ALTER TABLE public.merchants
    ADD CONSTRAINT merchants_store_id_fkey
    FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE SET NULL;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_merchants_store_id_unique
  ON public.merchants (store_id);

CREATE INDEX IF NOT EXISTS idx_merchants_email
  ON public.merchants (lower(btrim(email)));

UPDATE public.merchants AS merchant
SET name = COALESCE(NULLIF(btrim(merchant.name), ''), store.name, ''),
    email = COALESCE(NULLIF(lower(btrim(merchant.email)), ''), lower(btrim(store.owner_email)), ''),
    whatsapp_number = COALESCE(NULLIF(merchant.whatsapp_number, ''), merchant.contact_phone, store.whatsapp_number, ''),
    contact_phone = COALESCE(merchant.contact_phone, store.whatsapp_number)
FROM public.stores AS store
WHERE merchant.store_id = store.id;

UPDATE public.merchants AS merchant
SET store_id = store.id,
    name = COALESCE(NULLIF(btrim(merchant.name), ''), store.name, ''),
    email = COALESCE(NULLIF(lower(btrim(merchant.email)), ''), lower(btrim(store.owner_email)), ''),
    whatsapp_number = COALESCE(NULLIF(merchant.whatsapp_number, ''), merchant.contact_phone, store.whatsapp_number, ''),
    contact_phone = COALESCE(merchant.contact_phone, store.whatsapp_number)
FROM public.stores AS store
WHERE merchant.store_id IS NULL
  AND merchant.email <> ''
  AND lower(btrim(merchant.email)) = lower(btrim(store.owner_email));

INSERT INTO public.merchants (store_id, name, email, whatsapp_number, address, contact_phone)
SELECT id, name, lower(btrim(owner_email)), COALESCE(whatsapp_number, ''), '', whatsapp_number
FROM public.stores
WHERE owner_email IS NOT NULL AND btrim(owner_email) <> ''
  AND NOT EXISTS (
    SELECT 1
    FROM public.merchants AS merchant
    WHERE merchant.store_id = stores.id
       OR lower(btrim(merchant.email)) = lower(btrim(stores.owner_email))
  )
ON CONFLICT DO NOTHING;

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.merchants FROM anon, authenticated;
GRANT ALL ON public.merchants TO service_role;
