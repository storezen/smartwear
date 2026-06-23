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
  postex_status TEXT,
  postex_timeline JSONB,
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

-- 4. Settings Table (Single Row — Full Store Configuration)
CREATE TABLE public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,

  -- Store Identity
  store_name TEXT DEFAULT 'Smartwear Pakistan',
  store_tagline TEXT DEFAULT 'Premium Watches & Accessories',

  -- Contact Info
  whatsapp_number TEXT DEFAULT '923001234567',
  whatsapp_message TEXT DEFAULT 'Hi Smartwear! I need help with my order.',
  support_phone TEXT DEFAULT '+92 300 1234567',
  support_email TEXT DEFAULT 'concierge@smartwear.pk',
  legal_email TEXT DEFAULT 'legal@smartwear.pk',
  privacy_email TEXT DEFAULT 'privacy@smartwear.pk',
  store_address_line1 TEXT DEFAULT 'MM Alam Road',
  store_address_line2 TEXT DEFAULT 'Gulberg III',
  store_city TEXT DEFAULT 'Lahore, Pakistan',
  business_hours TEXT DEFAULT 'Mon-Sat: 10am - 8pm PKT',

  -- Social Media
  social_instagram TEXT DEFAULT 'https://instagram.com/smartwear.pk',
  social_facebook TEXT DEFAULT 'https://facebook.com/smartwear.pk',
  social_twitter TEXT DEFAULT 'https://twitter.com/smartwear_pk',
  social_youtube TEXT DEFAULT 'https://youtube.com/@smartwearpk',

  -- Shipping & Payments
  shipping_flat_rate TEXT DEFAULT '250',
  free_delivery_threshold NUMERIC DEFAULT 10000,
  shipping_standard_rate NUMERIC DEFAULT 200,
  shipping_express_rate NUMERIC DEFAULT 500,
  cod_available BOOLEAN DEFAULT TRUE,
  payment_methods TEXT DEFAULT '["COD","JazzCash","Easypaisa","Bank Transfer"]',

  -- Announcement Bar
  announcement_line1 TEXT DEFAULT 'Free Delivery on Orders Over Rs. 10,000',
  announcement_line2 TEXT DEFAULT 'Open Box Delivery Available',
  announcement_line3 TEXT DEFAULT '100% Cash on Delivery',

  -- Hero Banner
  hero_headline TEXT DEFAULT 'Premium Quality. No Premium Price.',
  hero_subtitle TEXT DEFAULT 'Premium smartwatches and accessories, delivered to your doorstep with open-box verification.',
  hero_badge_text TEXT DEFAULT 'New 2026',

  -- SEO
  seo_title TEXT DEFAULT 'Smartwear • Premium Watches & Accessories',
  seo_description TEXT DEFAULT 'Pakistan''s most trusted destination for premium smartwatches and accessories. Genuine products with nationwide delivery and open-box verification.',
  seo_keywords TEXT DEFAULT 'smart watches pakistan, analog watches, luxury watches, smartwear, watch store pakistan, premium watches',

  -- Security & Trust Badges (JSON arrays)
  security_badges TEXT DEFAULT '[{"label":"SSL Secure","icon":"Lock"},{"label":"100% COD","icon":"Banknote"},{"label":"Open Box Delivery","icon":"PackageOpen"},{"label":"Nationwide Delivery","icon":"Truck"}]',
  trust_badges TEXT DEFAULT '[{"label":"Fast Delivery","icon":"Truck"},{"label":"1 Year Warranty","icon":"ShieldCheck"},{"label":"7-Day Returns","icon":"RefreshCw"},{"label":"Cash on Delivery","icon":"Banknote"},{"label":"Secure Checkout","icon":"Lock"}]',

  -- Integrations (existing)
  postex_api_token TEXT,
  postex_webhook_secret TEXT,
  tiktok_pixel_id TEXT,
  tiktok_access_token TEXT
);

-- Insert Default Settings Row
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 6. AI Chat Tables
CREATE TABLE public.chat_sessions (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  has_delivered_order BOOLEAN DEFAULT FALSE,
  followup_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.chat_messages (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id, created_at ASC);

-- 5. Analytics Table (also stores chat analytics)
CREATE TABLE public.analytics (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_name TEXT NOT NULL,
  value NUMERIC DEFAULT 0
);

-- 7. Chat Feedback & Rate Limiting
CREATE TABLE public.chat_feedback (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating IN (1, -1)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.chat_rate_limits (
  session_id TEXT PRIMARY KEY,
  message_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);