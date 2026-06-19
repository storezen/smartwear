const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const inputFile = path.join(__dirname, '../filtered_products.csv');

if (!fs.existsSync(inputFile)) {
  console.error(`Error: Could not find ${inputFile}`);
  process.exit(1);
}

const csvData = fs.readFileSync(inputFile, 'utf-8');

function getProductCategory(title, tags = '') {
  const searchStr = `${title} ${tags}`.toLowerCase();
  const lowerTitle = title.toLowerCase();

  const isBand = /\b(strap|straps|band|bands|loop|chain)\b/i.test(lowerTitle);
  const isWatchWithBand = /\b(smartwatch|smart watch|watch|series)\b.*\b(with|w\/|\+|and)\b.{0,30}\b(strap|band|loop|chain)\b/i.test(lowerTitle);
  
  if (isBand && !isWatchWithBand) {
    return 'Watch Bands & Straps';
  }

  if (/\b(case|cover)\b/i.test(lowerTitle) && /\b(phone|iphone|samsung|galaxy)\b/i.test(lowerTitle)) {
    return 'Phone Cases';
  }

  if (/\b(camera lens|lens protector|camera protector)\b/i.test(searchStr)) {
    return 'Camera Protectors';
  }

  if (/\b(airpod|airpods|earbud|earbuds|pod|pods|charger|cable|adapter|wisme|powerbank)\b/i.test(searchStr)) {
    return 'Accessories';
  }
  if (/\b(case|cover|protector|glass|screen)\b/i.test(lowerTitle) && !/\b(watch|smartwatch)\b/i.test(lowerTitle)) {
    return 'Accessories';
  }

  if (/\b(ladies|women|womens|girl|girls)\b/i.test(searchStr) && /\b(watch|watches|smartwatch|analog)\b/i.test(searchStr)) {
    return 'Ladies Watches';
  }

  if (/\b(smartwatch|smart watch|smart|series|ultra|amoled|apple watch|hw\d+|t\d+|hk\d+|dt\d+|ws-\w+)\b/i.test(searchStr)) {
    return 'Smart Watches';
  }

  if (/\b(analog|automatic|quartz|chronograph|mechanic|mechanical|rolex|rlx|rolx|patek|citizen|ctzn|seiko|casio|edifice|hublot|hblt|versace|vr\d+)\b/i.test(searchStr)) {
    return 'Analog Watches';
  }

  if (/\b(watch|watches)\b/i.test(lowerTitle)) {
    return 'Smart Watches';
  }

  return 'Accessories';
}

Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    const data = results.data;
    
    const categories = {
      'Smart Watches': [],
      'Analog Watches': [],
      'Ladies Watches': [],
      'Watch Bands & Straps': [],
      'Phone Cases': [],
      'Camera Protectors': [],
      'Accessories': []
    };

    let possibleMistakes = [];

    data.forEach((row) => {
      const title = row['Title'] || row['Handle'] || '';
      const tags = row['Tags'] || '';
      
      const category = getProductCategory(title, tags);
      
      if (categories[category]) {
        categories[category].push(title);
      }
      
      // Look for potential mistakes:
      // Mistake 1: Smart watch fallback but has "cover" or "protector" 
      if (category === 'Smart Watches') {
        const lowerTitle = title.toLowerCase();
        if (/\b(cover|glass|protector|screen)\b/i.test(lowerTitle)) {
           possibleMistakes.push(`Title "${title}" categorized as Smart Watches but might be an Accessory.`);
        }
        if (!/\b(smart|watch|hw|t800|series|ultra|apple)\b/i.test(lowerTitle) && lowerTitle.trim() !== '') {
           possibleMistakes.push(`Title "${title}" fell back to Smart Watches but lacks common smartwatch keywords.`);
        }
      }
    });

    console.log("=== CATEGORY COUNTS ===");
    for (const [cat, items] of Object.entries(categories)) {
      console.log(`${cat.padEnd(25)} : ${items.length} products`);
    }

    console.log("\n=== SAMPLES (3 per category) ===");
    for (const [cat, items] of Object.entries(categories)) {
      console.log(`\n-- ${cat} --`);
      if (items.length === 0) {
        console.log("  (No products)");
      } else {
        items.slice(0, 3).forEach(i => console.log(`  - ${i}`));
      }
    }

    console.log("\n=== POSSIBLE MISTAKES ===");
    if (possibleMistakes.length === 0) {
      console.log("None detected by basic heuristics.");
    } else {
      possibleMistakes.slice(0, 10).forEach(m => console.log(`- ${m}`));
      if (possibleMistakes.length > 10) {
         console.log(`...and ${possibleMistakes.length - 10} more.`);
      }
    }
  }
});
