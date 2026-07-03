DROP TABLE IF EXISTS public.orders;

CREATE TABLE public.orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  promo_code TEXT,
  discount NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'Cash on Delivery',
  notes TEXT,
  status TEXT DEFAULT 'Pending',
  history JSONB,
  "postexId" TEXT,
  tiktok_capi_fired BOOLEAN DEFAULT FALSE,
  campaign TEXT DEFAULT 'Direct / Organic',
  ttclid TEXT
);
