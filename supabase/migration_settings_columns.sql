-- Migration: Add all missing columns to the settings table
-- Copy and paste the entire file into Supabase SQL Editor and click Run

-- Store Identity
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS store_tagline TEXT DEFAULT 'Premium Watches & Accessories';

-- Contact Info
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '923001234567';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS whatsapp_message TEXT DEFAULT 'Hi Smartwear! I need help with my order.';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS support_phone TEXT DEFAULT '+92 300 1234567';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS support_email TEXT DEFAULT 'concierge@smartwear.pk';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS legal_email TEXT DEFAULT 'legal@smartwear.pk';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS privacy_email TEXT DEFAULT 'privacy@smartwear.pk';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS store_address_line1 TEXT DEFAULT 'MM Alam Road';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS store_address_line2 TEXT DEFAULT 'Gulberg III';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS store_city TEXT DEFAULT 'Lahore, Pakistan';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS business_hours TEXT DEFAULT 'Mon-Sat: 10am - 8pm PKT';

-- Social Media
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS social_instagram TEXT DEFAULT 'https://instagram.com/smartwear.pk';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS social_facebook TEXT DEFAULT 'https://facebook.com/smartwear.pk';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS social_twitter TEXT DEFAULT 'https://twitter.com/smartwear_pk';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS social_youtube TEXT DEFAULT 'https://youtube.com/@smartwearpk';

-- Shipping & Payments
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS free_delivery_threshold NUMERIC DEFAULT 10000;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS shipping_standard_rate NUMERIC DEFAULT 200;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS shipping_express_rate NUMERIC DEFAULT 500;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS cod_available BOOLEAN DEFAULT TRUE;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS payment_methods TEXT DEFAULT '["COD","JazzCash","Easypaisa","Bank Transfer"]';

-- Announcement Bar
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS announcement_line1 TEXT DEFAULT 'Free Delivery on Orders Over Rs. 10,000';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS announcement_line2 TEXT DEFAULT 'Open Box Delivery Available';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS announcement_line3 TEXT DEFAULT '100% Cash on Delivery';

-- Hero Banner
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_headline TEXT DEFAULT 'Premium Quality. No Premium Price.';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'Premium smartwatches and accessories, delivered to your doorstep with open-box verification.';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS hero_badge_text TEXT DEFAULT 'New 2026';

-- SEO
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS seo_title TEXT DEFAULT 'Smartwear • Premium Watches & Accessories';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT 'Pakistan''s most trusted destination for premium smartwatches and accessories. Genuine products with nationwide delivery and open-box verification.';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS seo_keywords TEXT DEFAULT 'smart watches pakistan, analog watches, luxury watches, smartwear, watch store pakistan, premium watches';

-- Security & Trust Badges
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS security_badges TEXT DEFAULT '[{"label":"SSL Secure","icon":"Lock"},{"label":"100% COD","icon":"Banknote"},{"label":"Open Box Delivery","icon":"PackageOpen"},{"label":"Nationwide Delivery","icon":"Truck"}]';
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS trust_badges TEXT DEFAULT '[{"label":"Fast Delivery","icon":"Truck"},{"label":"1 Year Warranty","icon":"ShieldCheck"},{"label":"7-Day Returns","icon":"RefreshCw"},{"label":"Cash on Delivery","icon":"Banknote"},{"label":"Secure Checkout","icon":"Lock"}]';

-- Ensure default row exists
INSERT INTO public.settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
