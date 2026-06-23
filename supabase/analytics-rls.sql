-- Supabase Analytics RLS Policies
-- Is SQL ko Supabase SQL Editor mein run karein

CREATE TABLE IF NOT EXISTS public.analytics (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_name TEXT NOT NULL,
  value NUMERIC DEFAULT 0
);

ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.analytics;
CREATE POLICY "Allow anonymous inserts" ON public.analytics
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous reads" ON public.analytics;
CREATE POLICY "Allow anonymous reads" ON public.analytics
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anonymous deletes" ON public.analytics;
CREATE POLICY "Allow anonymous deletes" ON public.analytics
  FOR DELETE TO anon, authenticated
  USING (true);
