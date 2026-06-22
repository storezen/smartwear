-- Add postex column (tracking number) if it doesn't exist
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS postex TEXT;

-- Add postex_charges column for storing PostEx fee/tax/upfront data
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS postex_charges JSONB;

-- Add postex_status column for raw PostEx status
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS postex_status TEXT;

-- Add postex_timeline column for PostEx status history
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS postex_timeline JSONB;

-- Copy existing data from postexId to postex if postexId exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='postexId') THEN
    UPDATE public.orders SET postex = "postexId" WHERE postex IS NULL AND "postexId" IS NOT NULL;
  END IF;
END $$;

SELECT id, postex, postex_status, postex_charges FROM public.orders WHERE postex IS NOT NULL LIMIT 10;
