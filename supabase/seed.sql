-- Seed initial Smartwear products
-- Run this AFTER schema.sql in Supabase SQL Editor

insert into products (name, slug, description, price, compare_price, images, category_slug, brand, stock, rating, reviews_count, specifications, is_featured, is_active) values

-- Smart Watches
('Apple Watch Ultra 2', 'apple-watch-ultra-2', 
 'The ultimate sports watch. Titanium case, precision dual-frequency GPS, 36-hour battery, and advanced health sensors. Built for adventure and performance.',
 224999, 239999, 
 ARRAY['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop'],
 'smart-watches', 'Apple', 18, 4.9, 87,
 '{"Case": "49mm Titanium", "Display": "Always-On Retina", "Battery": "Up to 36 hours", "Water Resistance": "100m", "GPS": "Dual-frequency"}'::jsonb,
 true, true),

('Samsung Galaxy Watch 6 Classic', 'galaxy-watch-6-classic',
 'Rotating bezel for intuitive navigation. Advanced health tracking, Wear OS, and premium stainless steel design.',
 84999, 94999,
 ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&h=800&fit=crop'],
 'smart-watches', 'Samsung', 31, 4.7, 64,
 '{"Display": "1.5\" Super AMOLED", "Battery": "Up to 40 hours", "Water Resistance": "5ATM + IP68", "OS": "Wear OS 4", "Material": "Stainless Steel"}'::jsonb,
 true, true),

('Google Pixel Watch 2', 'google-pixel-watch-2',
 'Beautiful round design with deep Google integration. ECG, sleep tracking, and seamless Fitbit health insights.',
 119999, 129999,
 ARRAY['https://images.unsplash.com/photo-1557438159-51eec7dbc7a1?w=800&h=800&fit=crop'],
 'smart-watches', 'Google', 24, 4.6, 41,
 '{"Display": "1.4\" AMOLED", "Battery": "Up to 24 hours", "Sensors": "ECG, SpO2, Temperature", "Material": "Aluminum"}'::jsonb,
 false, true),

-- Analog Watches
('Seiko Prospex Diver', 'seiko-prospex-diver',
 'Iconic diver’s watch. 200m water resistance, superb legibility, and the legendary Seiko automatic movement.',
 64999, 72999,
 ARRAY['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop'],
 'analog-watches', 'Seiko', 29, 4.8, 112,
 '{"Movement": "Automatic 4R36", "Water Resistance": "200m", "Case": "Stainless Steel 42mm", "Crystal": "Hardlex"}'::jsonb,
 true, true),

('Citizen Eco-Drive Chandler', 'citizen-eco-drive-chandler',
 'Light-powered. Never needs a battery change. Clean minimalist dial with premium leather strap.',
 38999, 44999,
 ARRAY['https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&h=800&fit=crop'],
 'analog-watches', 'Citizen', 37, 4.5, 58,
 '{"Movement": "Eco-Drive (Solar)", "Case": "Stainless Steel", "Strap": "Genuine Leather", "Features": "Date, Luminous Hands"}'::jsonb,
 false, true),

('Orient Bambino Version 7', 'orient-bambino-v7',
 'The perfect dress watch. Roman numerals, domed glass, and a refined 40.5mm case at an incredible value.',
 26999, null,
 ARRAY['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&h=800&fit=crop'],
 'analog-watches', 'Orient', 52, 4.7, 93,
 '{"Movement": "Automatic F6724", "Case": "40.5mm Stainless Steel", "Crystal": "Mineral Glass", "Power Reserve": "40 hours"}'::jsonb,
 true, true),

-- Accessories
('Milanese Loop Strap (Silver)', 'milanese-loop-silver',
 'Premium stainless steel mesh strap. Breathable and infinitely adjustable. Fits most 20-22mm watches.',
 8499, 10999,
 ARRAY['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop'],
 'accessories', 'Smartwear', 87, 4.8, 134,
 '{"Material": "Surgical Stainless Steel", "Width": "20mm", "Clasp": "Magnetic", "Finish": "Brushed Silver"}'::jsonb,
 false, true),

('NATO Canvas Strap — Midnight', 'nato-canvas-midnight',
 'Classic military-inspired NATO strap in premium cotton canvas. Extremely durable and comfortable.',
 4499, null,
 ARRAY['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop'],
 'accessories', 'Smartwear', 64, 4.6, 76,
 '{"Material": "Premium Cotton Canvas", "Width": "20mm", "Hardware": "Brushed Steel"}'::jsonb,
 false, true),

('Watch Travel Case — 2 Slot', 'watch-travel-case-2',
 'Compact, protective case for two watches. Soft microfiber lining and elegant leather exterior.',
 6999, 8499,
 ARRAY['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop'],
 'accessories', 'Smartwear', 41, 4.9, 29,
 '{"Capacity": "2 Watches", "Material": "Genuine Leather + Microfiber", "Dimensions": "18 × 10 × 6 cm"}'::jsonb,
 true, true);

-- Note: You can add more products anytime from the Admin panel later.