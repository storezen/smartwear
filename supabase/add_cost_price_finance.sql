-- Add cost_price to products (nullable — optional per-product)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC;

-- Add financial tracking fields to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cogs NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gross_profit NUMERIC;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS net_profit NUMERIC;

-- Index for financial queries
CREATE INDEX IF NOT EXISTS idx_orders_cogs ON public.orders (cogs);
CREATE INDEX IF NOT EXISTS idx_products_cost_price ON public.products (cost_price);
