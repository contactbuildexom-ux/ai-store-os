CREATE TABLE IF NOT EXISTS store_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL,
    account_title TEXT DEFAULT '',
    account_number TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_store_payments_store_id
    ON store_payments (store_id);

CREATE INDEX IF NOT EXISTS idx_store_payments_active
    ON store_payments (is_active);
