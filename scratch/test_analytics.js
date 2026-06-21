const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('analytics').select('id').limit(1);
  if (error) console.error('Error:', error);
  else console.log('Analytics table exists, count/data:', data);
}
test();
