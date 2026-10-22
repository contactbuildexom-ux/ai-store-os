export interface ThemeOption {
  id: string;
  name: string;
  color: string;
  desc: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'ocean-blue', name: 'Ocean Navy & Electric Blue', color: '#1976d2', desc: 'App-style modern tech & retail' },
  { id: 'emerald', name: 'Emerald Minimal', color: '#1d7555', desc: 'Fresh & organic botanicals' },
  { id: 'royal-gold', name: 'Royal Gold & Amber', color: '#d97706', desc: 'Luxury perfumery & jewelry' },
  { id: 'velvet-rose', name: 'Velvet Rose & Ruby', color: '#831843', desc: 'Beauty, bags & fashion apparel' },
  { id: 'sunset-amber', name: 'Sunset Amber & Brew', color: '#92400e', desc: 'Artisanal coffee, tea & dining' },
  { id: 'aurora-violet', name: 'Aurora Violet', color: '#7c3aed', desc: 'Creative, stationery & boutique' },
  { id: 'mint-fresh', name: 'Mint Fresh', color: '#059669', desc: 'Wellness, sports & healthcare' },
  { id: 'cyber-slate', name: 'Cyber Slate', color: '#312e81', desc: 'Modern electronics & gaming' },
  { id: 'artisan-cream', name: 'Artisan Terracotta', color: '#78350f', desc: 'Handcrafted goods & home decor' },
  { id: 'midnight-minimal', name: 'Midnight Onyx', color: '#09090b', desc: 'Ultra-minimal monochrome aesthetic' },
];

export const THEME_PALETTES: Record<string, string> = {
  'ocean-blue': '#1976d2',
  ocean: '#1976d2',
  emerald: '#1d7555',
  'royal-gold': '#d97706',
  'velvet-rose': '#831843',
  rose: '#831843',
  'sunset-amber': '#92400e',
  amber: '#ea580c',
  'aurora-violet': '#7c3aed',
  violet: '#7c3aed',
  'mint-fresh': '#059669',
  'cyber-slate': '#312e81',
  'artisan-cream': '#78350f',
  'midnight-minimal': '#09090b',
  midnight: '#0f172a',
  fashion: '#4f46e5',
  beauty: '#be185d',
  electronics: '#1e40af',
  'home-decor': '#b45309',
};

/**
 * Resolves a unique, vibrant, and professional niche-appropriate color
 * based on the store's name or slug when no custom color has been picked.
 */
export function getStoreNicheColor(name?: string | null, slug?: string | null): string {
  const combined = `${name || ''} ${slug || ''}`.toLowerCase();
  if (/watch|watches|chronograph|timepiece|horology|rolex|ghari/.test(combined)) return '#0f172a'; // Luxury obsidian / horology black & gold
  if (/eyewear|sunglass|sunglasses|glasses|shades/.test(combined)) return '#1e293b'; // Sleek titanium slate
  if (/brew|coffee|cafe|tea|roast|cup|mug|beans|chai/.test(combined)) return '#92400e'; // Warm roasted brew / coffee
  if (/shoe|sneaker|kicks|trainer|footwear|athletic|runner/.test(combined)) return '#0284c7'; // Athletic cobalt blue
  if (/bag|clutch|purse|leather|tote|backpack|wallet/.test(combined)) return '#831843'; // Luxury velvet ruby / rose
  if (/perfume|oud|attar|scent|fragrance|cologne|aura/.test(combined)) return '#d97706'; // Royal oud & gold
  if (/jewelry|jewel|ring|necklace|gold|silver|diamond|gem/.test(combined)) return '#b45309'; // Prestige amber gold
  if (/plant|nature|green|flora|botanic|herb|succulent|garden|grass/.test(combined)) return '#15803d'; // Deep botanical emerald
  if (/tech|cyber|gadget|phone|laptop|audio|gear|gaming|hub/.test(combined)) return '#312e81'; // Cyber indigo slate
  if (/fashion|apparel|cloth|boutique|wear|dress|style/.test(combined)) return '#6d28d9'; // Royal fashion violet
  if (/health|wellness|organic|care|skin|beauty|cosmetic/.test(combined)) return '#be185d'; // Velvet beauty rose
  if (/decor|home|furniture|craft|artisan|pottery|terracotta/.test(combined)) return '#78350f'; // Warm artisan terracotta
  
  // Deterministic hash to cycle through distinctive executive palettes
  const palettes = [
    '#92400e', '#0284c7', '#831843', '#d97706', '#15803d',
    '#312e81', '#6d28d9', '#be185d', '#78350f', '#0f766e',
  ];
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

/**
 * Mathematically darkens a hex color by a percentage for gorgeous contrast gradients.
 */
export function darkenColor(hex: string, percent: number): string {
  if (!hex || typeof hex !== 'string') return '#0f172a';
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return '#0f172a';
  let r = (num >> 16) - Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) - Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) - Math.round(255 * (percent / 100));
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
