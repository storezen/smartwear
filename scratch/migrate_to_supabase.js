const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase keys in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Starting migration to Supabase...");
  
  const dbPath = './database.json';
  if (!fs.existsSync(dbPath)) {
    console.error("database.json not found!");
    return;
  }
  
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const products = dbData.products || [];
  
  console.log(`Found ${products.length} products in database.json`);
  
  // Test connection
  const { data: testData, error: testError } = await supabase.from('products').select('id').limit(1);
  
  if (testError) {
    console.error("❌ Error connecting to Supabase or 'products' table is missing:");
    console.error(testError);
    return;
  }
  
  console.log("✅ Successfully connected to Supabase 'products' table.");
  
  // Get existing products count
  const { count: existingCount, error: countError } = await supabase.from('products').select('id', { count: 'exact', head: true });
  
  if (countError) {
    console.error("Failed to get count:", countError);
    return;
  }
  
  console.log(`Currently ${existingCount} products in Supabase.`);
  
  if (existingCount >= products.length) {
     console.log("Supabase already has the products. No migration needed.");
     return;
  }

  console.log("Migrating products in batches of 100...");
  
  let successCount = 0;
  for (let i = 0; i < products.length; i += 100) {
    const batch = products.slice(i, i + 100).map(p => {
       // ensure rating is a number, not a string
       return {
         ...p,
         rating: Number(p.rating) || 4.5,
         price: Number(p.price) || 0,
         compare_price: p.compare_price ? Number(p.compare_price) : null,
         stock: Number(p.stock) || 0,
         reviews_count: Number(p.reviews_count) || 0,
       }
    });
    const { error: insertError } = await supabase.from('products').upsert(batch, { onConflict: 'slug' });
    
    if (insertError) {
      console.error(`Error inserting batch ${i}:`, insertError);
    } else {
      successCount += batch.length;
      console.log(`Successfully migrated ${successCount}/${products.length} products`);
    }
  }
  
  console.log("Migration complete!");
}

migrate();
