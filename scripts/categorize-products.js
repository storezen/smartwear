const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { getProductCategory, FINAL_CATEGORIES } = require('../lib/product-category');

const inputFile = path.join(__dirname, '../filtered_products.csv');
const outputFile = path.join(__dirname, '../products_final.csv');

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Could not find ${inputFile}`);
  process.exit(1);
}

const csvData = fs.readFileSync(inputFile, 'utf-8');

Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    const data = results.data;

    // Variant/image rows often have empty titles — categorize once per handle.
    const handleCategoryMap = new Map();

    for (const row of data) {
      const handle = row.Handle;
      if (!handle || handleCategoryMap.has(handle)) continue;

      const title = row.Title || '';
      const tags = row.Tags || '';
      const type = row.Type || row['Product Category'] || '';

      if (!title.trim() && !handle) continue;

      handleCategoryMap.set(
        handle,
        getProductCategory(title, tags, type, handle)
      );
    }

    const stats = Object.fromEntries(FINAL_CATEGORIES.map((cat) => [cat, 0]));

    const categorizedData = data.map((row) => {
      const handle = row.Handle || '';
      const title = row.Title || '';
      const tags = row.Tags || '';
      const type = row.Type || row['Product Category'] || '';

      const category =
        handleCategoryMap.get(handle) ||
        getProductCategory(title || handle, tags, type, handle);

      row.category = category;
      stats[category] = (stats[category] || 0) + 1;

      return row;
    });

    const outputCsv = Papa.unparse(categorizedData);
    fs.writeFileSync(outputFile, outputCsv, 'utf-8');

    const uniqueProducts = handleCategoryMap.size;

    console.log(`\nSuccessfully categorized ${categorizedData.length} rows (${uniqueProducts} unique products)!\n`);
    console.log('--- Category Breakdown (rows) ---');
    for (const cat of FINAL_CATEGORIES) {
      console.log(`${cat.padEnd(25)} : ${stats[cat] || 0}`);
    }

    const uniqueStats = Object.fromEntries(FINAL_CATEGORIES.map((cat) => [cat, 0]));
    for (const cat of handleCategoryMap.values()) {
      uniqueStats[cat] = (uniqueStats[cat] || 0) + 1;
    }

    console.log('\n--- Category Breakdown (unique products) ---');
    for (const cat of FINAL_CATEGORIES) {
      console.log(`${cat.padEnd(25)} : ${uniqueStats[cat] || 0}`);
    }

    console.log(`\nSaved to: ${outputFile}\n`);
  },
  error: (err) => {
    console.error('Error parsing CSV:', err);
    process.exit(1);
  },
});