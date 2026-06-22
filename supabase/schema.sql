-- ==========================================
-- Supabase Schema for Smartwear Pakistan
-- ==========================================

-- 1. Products Table
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC NOT NULL,
  compare_price NUMERIC,
  images JSONB,
  category_slug TEXT,
  brand TEXT,
  stock INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  specifications JSONB,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  upsell_accessories JSONB
);

-- 2. Orders Table
CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'Pending',
  payment_method TEXT,
  promo_code TEXT,
  promo_discount NUMERIC DEFAULT 0,
  notes TEXT,
  history JSONB,
  postex TEXT,
  postex_charges JSONB
);

-- 3. Marketing (Promo Codes) Table
CREATE TABLE public.marketing (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  max_uses INTEGER,
  usage_count INTEGER DEFAULT 0,
  min_order_value NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 4. Settings Table (Single Row)
CREATE TABLE public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  store_name TEXT DEFAULT 'Smartwear Pakistan',
  store_phone TEXT,
  store_email TEXT,
  shipping_flat_rate TEXT DEFAULT '250',
  postex_api_token TEXT,
  postex_webhook_secret TEXT,
  tiktok_pixel_id TEXT,
  tiktok_access_token TEXT
);

-- Insert Default Settings Row
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 5. Analytics Table
CREATE TABLE public.analytics (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_name TEXT NOT NULL,
  value NUMERIC DEFAULT 0
);