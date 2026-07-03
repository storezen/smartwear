-- Add campaign attribution columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS campaign TEXT DEFAULT 'Direct / Organic';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS ttclid TEXT;
