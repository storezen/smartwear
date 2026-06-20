import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';

const envContent = readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
const supabaseUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const supabaseKeyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

if (!supabaseUrlMatch || !supabaseKeyMatch) {
  console.log("No Supabase env found locally.");
  process.exit(1);
}

const supabase = createClient(supabaseUrlMatch[1].trim().replace(/['"]/g, ''), supabaseKeyMatch[1].trim().replace(/['"]/g, ''));

async function checkTables() {
  const tables = ['products', 'orders', 'marketing', 'settings', 'analytics'];
  console.log("Checking Supabase tables...");
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.log(`❌ Table '${table}': ERROR - ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': EXISTS`);
    }
  }
}

checkTables();
