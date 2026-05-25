const fs = require('fs');
const path = require('path');

const pagesToRefactor = [
  'about/page.tsx',
  'contact/page.tsx',
  'shipping/page.tsx',
  'returns/page.tsx',
  'warranty/page.tsx',
  'privacy/page.tsx',
  'terms/page.tsx',
  'categories/page.tsx',
];

const basePath = '/Users/mrmacbook/Desktop/smartware-store/src/app/(store)';

function refactorFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Colors
  content = content.replace(/bg-\[\#F6F8FA\]/g, 'bg-[#FAFAFA]');
  content = content.replace(/text-neutral-900/g, 'text-[#0A0A0A]');
  content = content.replace(/text-neutral-500/g, 'text-[#0A0A0A]/60');
  content = content.replace(/text-neutral-600/g, 'text-[#0A0A0A]/60');
  content = content.replace(/text-neutral-400/g, 'text-[#0A0A0A]/40');
  content = content.replace(/text-neutral-300/g, 'text-[#0A0A0A]/30');
  content = content.replace(/text-neutral-700/g, 'text-[#0A0A0A]');
  content = content.replace(/bg-neutral-50/g, 'bg-white');
  content = content.replace(/bg-neutral-100/g, 'bg-[#F0F0F0]');
  content = content.replace(/bg-neutral-900/g, 'bg-[#0A0A0A]');
  content = content.replace(/bg-neutral-950/g, 'bg-[#0A0A0A]');
  content = content.replace(/hover:bg-neutral-800/g, 'hover:scale-[1.02]');
  content = content.replace(/border-neutral-200\/60/g, 'border-[#E5E5E5]');
  content = content.replace(/border-neutral-200/g, 'border-[#E5E5E5]');
  
  // Emerald / Accents
  content = content.replace(/text-emerald-500/g, 'text-[#10B981]');
  content = content.replace(/bg-emerald-500/g, 'bg-[#10B981]');
  content = content.replace(/bg-blue-50/g, 'bg-[#F0F0F0]');
  content = content.replace(/border-blue-500\/30/g, 'border-[#0A0A0A]');
  content = content.replace(/text-blue-600/g, 'text-[#0A0A0A]');
  content = content.replace(/hover:text-blue-600/g, 'hover:text-[#0A0A0A]');
  content = content.replace(/hover:text-blue-700/g, 'hover:text-[#0A0A0A]');
  content = content.replace(/focus:border-blue-500/g, 'focus:border-[#0A0A0A]');
  content = content.replace(/focus:ring-blue-500\/10/g, 'focus:ring-[#0A0A0A]');

  // Radii
  content = content.replace(/rounded-\[32px\]/g, 'rounded-3xl');
  content = content.replace(/rounded-\[24px\]/g, 'rounded-3xl');
  content = content.replace(/rounded-\[16px\]/g, 'rounded-2xl');
  content = content.replace(/rounded-\[12px\]/g, 'rounded-xl');

  // Container
  content = content.replace(/max-w-7xl/g, 'max-w-[1600px]');
  
  // Fonts
  content = content.replace(/font-heading /g, '');

  fs.writeFileSync(filePath, content);
  console.log('Refactored:', filePath);
}

for (const page of pagesToRefactor) {
  refactorFile(path.join(basePath, page));
}
