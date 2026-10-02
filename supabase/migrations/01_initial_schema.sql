-- 1. Stores Table
CREATE TABLE IF NOT EXISTS stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    whatsapp_number TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Products Table (With wholesale_cost, min_accept_price, and source)
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    wholesale_cost DECIMAL(10,2) DEFAULT 0.00,
    min_accept_price DECIMAL(10,2) DEFAULT 0.00,
    image_url TEXT,
    source TEXT DEFAULT 'manual', -- e.g., 'voice' or 'manual'
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Delivery Settings Table
CREATE TABLE IF NOT EXISTS delivery_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    city_rate DECIMAL(10,2) DEFAULT 200.00,
    other_city_rate DECIMAL(10,2) DEFAULT 350.00,
    store_city TEXT DEFAULT 'Lahore'
);

-- 4. Orders Table (With risk_score and risk_reason)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    risk_score INTEGER DEFAULT 10, -- 10 for safe, 80 for risky/fake
    risk_reason TEXT DEFAULT 'Safe order',
    items JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);