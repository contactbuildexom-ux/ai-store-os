-- 03_ai_store_builder.sql: Schema extensions for AI Store Builder & MCP integration

-- 1. Ensure all columns in stores table
ALTER TABLE IF EXISTS public.stores 
    ADD COLUMN IF NOT EXISTS tagline TEXT,
    ADD COLUMN IF NOT EXISTS header_title TEXT,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS owner_email TEXT,
    ADD COLUMN IF NOT EXISTS password_hash TEXT,
    ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS selected_theme TEXT DEFAULT 'royal-gold',
    ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0f172a',
    ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#d97706',
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'active';

-- 2. Ensure all columns in products table
ALTER TABLE IF EXISTS public.products 
    ADD COLUMN IF NOT EXISTS wholesale_cost DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS min_accept_price DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'ai_generated',
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
    ADD COLUMN IF NOT EXISTS category_id UUID,
    ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'in_stock',
    ADD COLUMN IF NOT EXISTS badge TEXT;

-- 3. Compatibility View: create view store_products if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'store_products') THEN
        CREATE OR REPLACE VIEW public.store_products AS 
        SELECT 
            id,
            store_id,
            name,
            description,
            price,
            wholesale_cost,
            min_accept_price,
            image_url,
            category,
            category_id,
            source,
            created_at
        FROM public.products;
    END IF;
END $$;
