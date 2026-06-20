import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  async function clear() {
    const { data, error } = await supabase.from('analytics').delete().neq('id', 'dummy');
    if (error) {
      console.error("Failed to clear Supabase:", error);
    } else {
      console.log("Successfully cleared Supabase analytics.");
    }
  }
  clear();
} else {
  console.log("No Supabase credentials found in .env.local.");
}
