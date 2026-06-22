-- Add postex_charges column to orders table for storing PostEx fee/tax/upfront data
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS postex_charges JSONB;

SELECT * FROM public.orders WHERE postex IS NOT NULL;
