-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/nubalbfizbaenzyevqco/sql/new)

-- 1. Enable Realtime on the analytics table
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics;

-- 2. Ensure replica identity is full (needed for UPDATE/DELETE — optional but safe)
ALTER TABLE public.analytics REPLICA IDENTITY FULL;

-- 3. Index on timestamp for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON public.analytics (timestamp DESC);

-- 4. RLS: allow anon/key insert (matching the API route behaviour)
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.analytics;
CREATE POLICY "Allow anonymous inserts"
  ON public.analytics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous reads" ON public.analytics;
CREATE POLICY "Allow anonymous reads"
  ON public.analytics
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anonymous deletes" ON public.analytics;
CREATE POLICY "Allow anonymous deletes"
  ON public.analytics
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 5. Enable RLS on the table (if not already)
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Verify: run \d+ public.analytics and check "Publications" includes supabase_realtime
