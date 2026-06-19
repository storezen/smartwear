const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const inputFile = path.join(__dirname, '../filtered_products.csv');
const outputFile = path.join(__dirname, '../products_with_category.csv');

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Could not find ${inputFile}`);
  process.exit(1);
}

const csvData = fs.readFileSync(inputFile, 'utf-8');

function getProductCategory(title, tags = '') {
  const searchStr = `${title} ${tags}`.toLowerCase();
  const lowerTitle = title.toLowerCase();

  // 1. Camera Protectors
  if (searchStr.includes('camera lens') || searchStr.includes('lens protector')) {
    return 'Camera Protectors';
  }

  // 2. Phone Cases
  if (lowerTitle.includes('case') && (lowerTitle.includes('phone') || lowerTitle.includes('iphone') || lowerTitle.includes('samsung'))) {
    return 'Phone Cases';
  }

  // 3. Watch Bands & Straps
  const isStrap = /\b(strap|band|loop|chain)\b/i.test(lowerTitle);
  const comesWithStrap = /\b(with|and|\+)\b.*\b(strap|band|loop|chain)\b/i.test(lowerTitle);
  if (isStrap && !comesWithStrap) {
    return 'Watch Bands & Straps';
  }

  // 4. Accessories
  if (/\b(airpod|airpods|earbud|earbuds|pod|pods|charger|cable|adapter|wisme)\b/i.test(searchStr)) {
    return 'Accessories';
  }
  if (/\b(case|cover|protector)\b/i.test(lowerTitle) && !/\b(with|and|\+)\b/i.test(lowerTitle)) {
    return 'Accessories';
  }

  // 5. Ladies Watches
  if (/\b(ladies|women|womens|girl|girls)\b/i.test(searchStr)) {
    return 'Ladies Watches';
  }

  // 6. Analog Watches
  if (/\b(analog|automatic|quartz|chronograph|mechanic|mechanical|rolex|rlx|rolx|patek|citizen|ctzn|seiko|casio|edifice|hublot|hblt|versace|vr\d+)\b/i.test(searchStr)) {
    return 'Analog Watches';
  }

  // 7. Smart Watches (Default)
  return 'Smart Watches';
}

Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    const data = results.data;
    const stats = {
      'Smart Watches': 0,
      'Analog Watches': 0,
      'Ladies Watches': 0,
      'Watch Bands & Straps': 0,
      'Phone Cases': 0,
      'Camera Protectors': 0,
      'Accessories': 0
    };

    const categorizedData = data.map((row) => {
      const title = row['Title'] || '';
      const tags = row['Tags'] || '';
      
      const category = getProductCategory(title, tags);
      row['category'] = category;
      stats[category]++;
      
      return row;
    });

    const outputCsv = Papa.unparse(categorizedData);
    fs.writeFileSync(outputFile, outputCsv, 'utf-8');

    console.log(`\nSuccessfully categorized ${categorizedData.length} products!\n`);
    console.log('--- Category Breakdown ---');
    for (const [cat, count] of Object.entries(stats)) {
      console.log(`${cat.padEnd(25)} : ${count}`);
    }
    console.log(`\nSaved to: ${outputFile}\n`);
  },
  error: (err) => {
    console.error('Error parsing CSV:', err);
  }
});
