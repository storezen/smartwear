/**
 * Product categorization into 7 final store categories.
 *
 * Uses title as the primary signal, with tags, type, and handle as
 * supporting context for edge cases found in filtered_products.csv.
 *
 * Priority order (first match wins):
 *   1. Watch Bands & Straps
 *   2. Phone Cases
 *   3. Camera Protectors
 *   4. Smart Watches
 *   5. Ladies Watches (before analog — more specific)
 *   6. Analog Watches
 *   7. Accessories (default)
 */

const FINAL_CATEGORIES = [
  'Smart Watches',
  'Analog Watches',
  'Ladies Watches',
  'Watch Bands & Straps',
  'Phone Cases',
  'Camera Protectors',
  'Accessories',
];

/** Normalize all inputs into one searchable lowercase blob. */
function buildSearchContext(title, tags, type, handle) {
  return [title, tags, type, handle]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Watch sold bundled with a strap/chain — not a standalone band product. */
function comesWithStrap(text) {
  return (
    /\bwith\b[^.]{0,80}\b(strap|straps|band|bands|chain|chains|loop|bracelet)\b/i.test(text) ||
    /\bincluded?\s+(strap|straps|band|bands|chain|chains|loop|bracelet)\b/i.test(text) ||
    /\b(strap|straps|band|bands|chain|chains|loop|bracelet)\s+(included|in box|free)\b/i.test(text) ||
    /\+\s*(strap|straps|band|chain)\b/i.test(text)
  );
}

/** Recognizable luxury / fashion watch model names without the word "watch". */
function isWatchModelName(text) {
  return /\b(submariner|nautilus|seamaster|carrera|calibre|gmt\s*master|date[- ]?just|yacht\s*master|royal\s*oak|speedmaster|daytona|jubil[eé]e?|iced\s*out|icedout|geneve|chornostyle|audemars|piguet|seamaster|patke|yatch\s*master|pepsi|jubil)\b/i.test(
    text
  );
}

/** Luxury / fashion watch brands — chain/strap in title means bracelet style, not a band product. */
function isLuxuryWatchBrand(text) {
  return /\b(tissot|rolex|rlx|rolx|rolexwatch|patek|philippe|tag\s*heuer|taghuer|omega|cartier|seiko|casio|citizen|ctzn|hublot|hblt|versace|versacee|richard\s*mille|success\s*way|bestwin|tomi|skmei|temeis|universe\s*point|pp\s*master|audemars|rado|curren|ap\b)\b/i.test(
    text
  );
}

/** Band/strap product meant for Apple Watch — not a full watch. */
function isAppleWatchBandOnly(text) {
  return (
    /\b(for|voor|compatible with|geschikt voor)\b[^.]{0,60}\b(apple watch|iwatch)\b/i.test(text) ||
    /\b(apple watch|iwatch)\s*(band|strap|loop|bracelet|banden|lus|correa)\b/i.test(text) ||
    /\b(trail loop|solo loop|alpine loop|sport band|ocean band|milanese loop|milan\b.*\b(strap|loop|band))\b/i.test(text) ||
    /\b(strap|straps|band|bands|loop|bracelet|chain)\s*$/i.test(text.trim())
  );
}

/** Full watch product that happens to mention strap/band/chain in the title. */
function isFullWatchWithBandWord(title) {
  const t = title.toLowerCase();

  if (/\b(chain watch|strap watch|band watch|loop watch|bracelet watch)\b/i.test(t)) {
    return true;
  }

  if (/\b(strap|band|chain|loop|bracelet)\s+watch\b/i.test(t)) {
    return true;
  }

  if (/\bwatch(es)?\s*$/i.test(t.trim()) && !isAppleWatchBandOnly(t)) {
    return true;
  }

  if (/\bwatch\b/i.test(t) && !isAppleWatchBandOnly(t)) {
    return true;
  }

  return false;
}

/** Priority 1 — standalone bands/straps only. */
function isWatchBandOrStrap(title, searchStr) {
  const t = title.toLowerCase();

  if (
    !/\b(strap|straps|band|bands|chain|chains|loop|loops|bracelet|bracelets|gespband|banden|correa|lus)\b/i.test(
      t
    )
  ) {
    return false;
  }

  if (comesWithStrap(t)) {
    return false;
  }

  if (isFullWatchWithBandWord(title)) {
    return false;
  }

  if (isSmartWatchSignal(title, searchStr)) {
    return false;
  }

  // "Tissot PRX Silver Chain" is a watch, not a replacement strap.
  if (isLuxuryWatchBrand(searchStr) && !isAppleWatchBandOnly(t)) {
    return false;
  }

  return isAppleWatchBandOnly(t) || /\b(strap|straps|band|bands|loop|bracelet|chain)\b/i.test(t);
}

/** Apple Watch case/screen protector — accessory, not a smart watch. */
function isAppleWatchAccessory(searchStr) {
  return (
    /\b(apple watch|iwatch)\b/i.test(searchStr) &&
    /\b(case|cover|protector|glass|screen|tempered|film|arcylic|acrylic)\b/i.test(searchStr) &&
    !/\b(smartwatch|smart watch)\b/i.test(searchStr)
  );
}

/** Priority 2 — iPhone / phone cases (not Apple Watch cases). */
function isPhoneCase(title, type, tags, searchStr) {
  const t = title.toLowerCase();

  if (isAppleWatchAccessory(searchStr)) {
    return false;
  }

  if (/\bcase\b/i.test(t) && /\b(iphone|phone|samsung|galaxy|pixel|oneplus|redmi|xiaomi|magsafe)\b/i.test(searchStr)) {
    return true;
  }

  const phoneCaseTypes =
    /\b(silicon case|silicone case|acrylic glass|arcylic glass|carbon case|leather case|woven case|puffer case|valvet case|velvet case|ag glass|pop up case|polo case|euro case|mega safe case|camera stand case|digital ag)/i;
  if (phoneCaseTypes.test(type)) {
    return true;
  }

  if (
    /\bcase\b/i.test(searchStr) &&
    /\b(premium case|silicon case|silicone case|acrylic clear case|magsafe|iphone)\b/i.test(tags)
  ) {
    return true;
  }

  if (/\b(pack of two silicon cases?|iphone\s*\d+\s*series)\b/i.test(searchStr) && /\bcase/i.test(searchStr)) {
    return true;
  }

  return false;
}

/** Priority 3 — camera lens protectors. */
function isCameraProtector(searchStr) {
  return /\b(camera lens|lens protector|camera protector)\b/i.test(searchStr);
}

/**
 * Smart "ultra" — excludes "ultra-thin" cases and Apple Watch ultra bands.
 */
function hasSmartUltra(searchStr) {
  if (/\bultra[- ]?thin\b/i.test(searchStr)) {
    return false;
  }

  if (/\b(for|voor)\b[^.]{0,40}\b(apple watch|iwatch)\s*ultra/i.test(searchStr)) {
    return false;
  }

  return /\b(ultra\s*(smart|max|pro|plus|\d|editon|edition)|smart\s*ultra|\d+\s*in\s*1\s*ultra|hk\d+\s*ultra|g\d+\s*ultra|i\d+\s*ultra|h\d+\s*ultra|galaxy\s*watch\s*\d*\s*ultra|series\s*8\s*ultra|ultra\s*smartwatch|ultra\s*smart\s*watch)\b/i.test(
    searchStr
  );
}

/**
 * Smart "series" — excludes iPhone "13 series" / "16 series" case listings.
 */
function hasSmartSeries(title, searchStr) {
  if (/\b(iphone|phone|silicon case|acrylic case|glass case)\b/i.test(searchStr) && /\bseries\b/i.test(searchStr)) {
    return false;
  }

  return (
    /\b(series\s*(9|10|11)|series\s*11|apple\s*(logo\s*)?(watch\s*)?series|ws[- ]?z9\s*series|watch\s*series|series\s*\d+\s*(stainless|rlx|citizen|edition|smart|luna))\b/i.test(
      searchStr
    ) || /\bseries\s*11\b/i.test(title)
  );
}

/** Multi-pack bands for Apple Watch — not a smart watch despite "Series" in title. */
function isAppleWatchBandPack(title, searchStr) {
  return (
    /\b(bands?|straps?|loops?)\b/i.test(title) &&
    /\b(compatible|for|pack|pcs|pc)\b/i.test(searchStr) &&
    /\b(apple watch|iwatch)\b/i.test(searchStr)
  );
}

/** Priority 4 — smart watch signals. */
function isSmartWatchSignal(title, searchStr) {
  if (isAppleWatchAccessory(searchStr)) {
    return false;
  }

  if (isAppleWatchBandPack(title, searchStr)) {
    return false;
  }

  if (/\b(smartwatch|smart watch)\b/i.test(searchStr)) {
    return true;
  }

  if (hasSmartSeries(title, searchStr)) {
    return true;
  }

  if (hasSmartUltra(searchStr)) {
    return true;
  }

  if (/\b(galaxy\s*watch|samsung\s*(galaxy\s*)?watch|js\s*watch)\b/i.test(searchStr)) {
    return true;
  }

  if (/\bwatch\s*(9|10)\s*max\b/i.test(searchStr)) {
    return true;
  }

  if (/\b(hk\d+|h\d+\s*pro\s*max|hw[- ]?\d+|dt[- ]?\d+|t800|kd99|gt\d+|tf\d+|ws[- ]?z9)\b/i.test(searchStr)) {
    return true;
  }

  if (/\bamoled\b/i.test(searchStr) && /\b(watch|smart)/i.test(searchStr)) {
    return true;
  }

  if (/\b(bluetooth calling|always[- ]on display)\b/i.test(searchStr) && /\bwatch/i.test(searchStr)) {
    return true;
  }

  if (/\bsmart watches?\b/i.test(searchStr)) {
    return true;
  }

  if (/\bsmart watch\b/i.test(searchStr)) {
    return true;
  }

  if (comesWithStrap(title) && /\bwatch/i.test(title)) {
    return true;
  }

  return false;
}

/** Product is watch-like (not earphones, chargers, etc.). */
function isWatchLike(searchStr) {
  return (
    /\bwatch(es)?\b/i.test(searchStr) ||
    /\brolex\s*watch\b/i.test(searchStr) ||
    /\bsgw\d+\b/i.test(searchStr) ||
    /\b(wrist|chronograph|dial|dail|powermatic|\d+\s*mm)\b/i.test(searchStr) ||
    /\bhub\s*watch\b/i.test(searchStr) ||
    isLuxuryWatchBrand(searchStr) ||
    isWatchModelName(searchStr)
  );
}

/** Priority 5 — analog / luxury / quartz watches. */
function isAnalogWatch(title, searchStr) {
  if (!isWatchLike(searchStr)) {
    return false;
  }

  if (isSmartWatchSignal(title, searchStr)) {
    return false;
  }

  if (/\banalog\b/i.test(searchStr)) {
    return true;
  }

  if (/\b(quartz|automatic|chronograph|mechanical|skeleton|skelton|powermatic|datejust|submariner)\b/i.test(searchStr)) {
    return true;
  }

  if (isLuxuryWatchBrand(searchStr)) {
    return true;
  }

  if (isWatchModelName(searchStr)) {
    return true;
  }

  const extraBrands =
    /\b(edifice|universal point|role?y|senna|formula\s*1|mclaren|armless|seizi|tag\s*senna|prx|1853|seamaster)\b/i;
  if (extraBrands.test(searchStr)) {
    return true;
  }

  if (/\bsgw\d+\b/i.test(searchStr)) {
    return true;
  }

  if (/\bwatch\s+(vr|rlx|rolx|hblt)\b/i.test(title)) {
    return true;
  }

  // Generic wrist watches: title has "watch" but not Apple Watch accessory/band context.
  if (
    /\bwatch(es)?\b/i.test(title) &&
    !/\b(apple watch|iwatch)\b/i.test(title) &&
    !isAppleWatchAccessory(searchStr) &&
    !isAppleWatchBandOnly(title.toLowerCase())
  ) {
    return true;
  }

  return false;
}

/** Priority 6 — ladies watches. */
function isLadiesWatch(searchStr) {
  if (!/\b(ladies|women|woman|womens|girl|girls)\b/i.test(searchStr)) {
    return false;
  }

  return (
    /\bwatch(es)?\b/i.test(searchStr) ||
    /\b(rolex|master copy|snake|automatic|ramadan combo)\b/i.test(searchStr)
  );
}

/**
 * Main categorization entry point.
 *
 * @param {string} title  - Product title (primary signal)
 * @param {string} [tags] - Comma-separated tags
 * @param {string} [type] - Product type field from CSV
 * @param {string} [handle] - Product handle / slug
 * @returns {string} One of the 7 final categories
 */
function getProductCategory(title = '', tags = '', type = '', handle = '') {
  const safeTitle = title || handle || '';
  const searchStr = buildSearchContext(safeTitle, tags, type, handle);

  // Packaging-only listings (not watches sold with a box).
  if (
    /\b(box only|watches box only|packing only|premium packing|diamond box)\b/i.test(searchStr) ||
    /\b(original box)\s+only\b/i.test(searchStr)
  ) {
    return 'Accessories';
  }

  // Priority 1: Watch Bands & Straps
  if (isWatchBandOrStrap(safeTitle, searchStr)) {
    return 'Watch Bands & Straps';
  }

  // Priority 2: Phone Cases
  if (isPhoneCase(safeTitle, type, tags, searchStr)) {
    return 'Phone Cases';
  }

  // Priority 3: Camera Protectors
  if (isCameraProtector(searchStr)) {
    return 'Camera Protectors';
  }

  // Priority 4: Smart Watches
  if (isSmartWatchSignal(safeTitle, searchStr)) {
    return 'Smart Watches';
  }

  // Priority 5: Ladies Watches (checked before analog — more specific match)
  if (isLadiesWatch(searchStr)) {
    return 'Ladies Watches';
  }

  // Priority 6: Analog Watches
  if (isAnalogWatch(safeTitle, searchStr)) {
    return 'Analog Watches';
  }

  // Priority 7: Accessories (chargers, airpods, Apple Watch cases, etc.)
  return 'Accessories';
}

module.exports = {
  FINAL_CATEGORIES,
  getProductCategory,
};