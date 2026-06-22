-- Add postex_webhook_secret column to settings table
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS postex_webhook_secret TEXT;

-- Verify by selecting current settings
SELECT * FROM public.settings WHERE id = 1;
