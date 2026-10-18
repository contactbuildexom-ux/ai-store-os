export interface StoreThemeConfig {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  bgHero: string;
  cardBg: string;
  badgeStyle: string;
  fontVibe: string;
}

export interface GeneratedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  wholesale_cost?: number;
  min_accept_price?: number;
  stock_status: 'in_stock' | 'low_stock' | 'pre_order';
  badge?: string;
}

export interface GeneratedStore {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  header_title: string;
  plan: 'free' | 'pro' | 'advanced';
  whatsapp_number: string;
  owner_email: string;
  theme: StoreThemeConfig;
  categories: string[];
  products: GeneratedProduct[];
  social_links?: Partial<Record<'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x', string>>;
  delivery: {
    store_city: string;
    city_rate: number;
    other_city_rate: number;
  };
}

export const THEME_PRESETS: Record<string, StoreThemeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Minimal',
    primaryColor: '#1d7555',
    secondaryColor: '#134e38',
    accentColor: '#10b981',
    textColor: '#1e293b',
    bgHero: 'bg-gradient-to-br from-[#134e38] to-[#1d7555]',
    cardBg: 'bg-white',
    badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    fontVibe: 'Inter, system-ui, sans-serif'
  },
  'royal-gold': {
    id: 'royal-gold',
    name: 'Royal Obsidian & Gold',
    primaryColor: '#0f172a',
    secondaryColor: '#d97706',
    accentColor: '#f59e0b',
    textColor: '#0f172a',
    bgHero: 'bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b]',
    cardBg: 'bg-[#18181b]',
    badgeStyle: 'bg-amber-100 text-amber-900 border-amber-300',
    fontVibe: 'Playfair Display, Georgia, serif'
  },
  'velvet-rose': {
    id: 'velvet-rose',
    name: 'Velvet Rose & Blush',
    primaryColor: '#831843',
    secondaryColor: '#9d174d',
    accentColor: '#ec4899',
    textColor: '#374151',
    bgHero: 'bg-gradient-to-br from-[#500724] to-[#9d174d]',
    cardBg: 'bg-white',
    badgeStyle: 'bg-rose-100 text-rose-800 border-rose-200',
    fontVibe: 'Cinzel, Georgia, serif'
  },
  'cyber-slate': {
    id: 'cyber-slate',
    name: 'Cyber Slate & Indigo',
    primaryColor: '#1e1b4b',
    secondaryColor: '#4338ca',
    accentColor: '#6366f1',
    textColor: '#0f172a',
    bgHero: 'bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81]',
    cardBg: 'bg-white',
    badgeStyle: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    fontVibe: 'Plus Jakarta Sans, sans-serif'
  },
  'artisan-cream': {
    id: 'artisan-cream',
    name: 'Artisan Terracotta & Warm',
    primaryColor: '#78350f',
    secondaryColor: '#92400e',
    accentColor: '#d97706',
    textColor: '#292524',
    bgHero: 'bg-gradient-to-br from-[#451a03] to-[#78350f]',
    cardBg: 'bg-[#fffbeb]',
    badgeStyle: 'bg-amber-100 text-amber-800 border-amber-200',
    fontVibe: 'Lora, serif'
  },
  'ocean-blue': {
    id: 'ocean-blue',
    name: 'Ocean Navy & Electric Blue',
    primaryColor: '#0b2545',
    secondaryColor: '#1976d2',
    accentColor: '#38bdf8',
    textColor: '#0f172a',
    bgHero: 'bg-gradient-to-br from-[#0b2545] via-[#134074] to-[#1976d2]',
    cardBg: 'bg-white',
    badgeStyle: 'bg-blue-100 text-blue-800 border-blue-200',
    fontVibe: 'Plus Jakarta Sans, sans-serif'
  },
  'sunset-amber': {
    id: 'sunset-amber',
    name: 'Sunset Amber & Terracotta',
    primaryColor: '#c2410c',
    secondaryColor: '#ea580c',
    accentColor: '#f97316',
    textColor: '#1c1917',
    bgHero: 'bg-gradient-to-br from-[#7c2d12] via-[#9a3412] to-[#ea580c]',
    cardBg: 'bg-white',
    badgeStyle: 'bg-orange-100 text-orange-800 border-orange-200',
    fontVibe: 'Inter, sans-serif'
  },
  'midnight-minimal': {
    id: 'midnight-minimal',
    name: 'Midnight Onyx & Minimal',
    primaryColor: '#09090b',
    secondaryColor: '#27272a',
    accentColor: '#71717a',
    textColor: '#09090b',
    bgHero: 'bg-gradient-to-br from-[#09090b] via-[#18181b] to-[#27272a]',
    cardBg: 'bg-white',
    badgeStyle: 'bg-zinc-100 text-zinc-900 border-zinc-300',
    fontVibe: 'Inter, sans-serif'
  },
  'aurora-violet': {
    id: 'aurora-violet',
    name: 'Aurora Violet & Lavender',
    primaryColor: '#4c1d95',
    secondaryColor: '#6d28d9',
    accentColor: '#8b5cf6',
    textColor: '#1e1b4b',
    bgHero: 'bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#7c3aed]',
    cardBg: 'bg-white',
    badgeStyle: 'bg-purple-100 text-purple-800 border-purple-200',
    fontVibe: 'Plus Jakarta Sans, sans-serif'
  },
  'mint-fresh': {
    id: 'mint-fresh',
    name: 'Mint Fresh & Jade',
    primaryColor: '#064e3b',
    secondaryColor: '#047857',
    accentColor: '#10b981',
    textColor: '#022c22',
    bgHero: 'bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#059669]',
    cardBg: 'bg-white',
    badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    fontVibe: 'Inter, sans-serif'
  }
};

// Curated high quality product images categorized by niche
const NICHE_IMAGES: Record<string, { images: string[]; categories: string[]; items: Array<{ name: string; price: number; desc: string }> }> = {
  perfume: {
    categories: ['Luxury Oud', 'Eau De Parfum', 'Attars & Oils', 'Gift Discovery Sets'],
    images: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Velvet Royal Amber Oud 100ml', price: 6500, desc: 'Rich blend of Cambodian oud, aged vanilla, and royal amber with exceptional 16-hour projection.' },
      { name: 'Midnight Saffron & Rose', price: 4800, desc: 'An exotic evening scent with Kashmiri saffron, Turkish rose petals, and spicy cinnamon notes.' },
      { name: 'Imperial White Musk', price: 3200, desc: 'Clean, powdery French white musk with subtle floral nuances, crafted for versatile everyday elegance.' },
      { name: 'Smoky Leather & Tobacco', price: 5400, desc: 'Sophisticated masculine profile featuring Cuban tobacco leaf, birch tar, and warm cedarwood.' },
      { name: 'Oud Al-Layl Concentrated Oil', price: 2900, desc: 'Alcohol-free pure concentrated perfume oil infused with deep agarwood and sandalwood accords.' },
      { name: 'Artisan Luxury Discovery Box', price: 3900, desc: 'Collector’s discovery set containing 5 x 10ml travel sprays of our bestselling signature blends.' }
    ]
  },
  clothing: {
    categories: ['Premium Pret', 'Luxury Lawn & Festive', 'Streetwear Oversized', 'Classic Essentials'],
    images: [
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Hand-Embroidered Velvet Kurta Set', price: 8900, desc: 'Intricately embroidered raw silk kurta paired with zari culottes and an organza dupatta.' },
      { name: 'Oversized Minimalist Heavyweight Hoodie', price: 4200, desc: '450 GSM French terry cotton fleece hoodie with double-stitched hood and drop shoulders.' },
      { name: 'Pastel Floral Chiffon Festive Ensemble', price: 7400, desc: 'Three-piece luxury printed ensemble with schiffli lace borders and pure chiffon dupatta.' },
      { name: 'Tailored Linen Co-ord Set', price: 4800, desc: 'Breathable European linen button-down paired with high-waist relaxed trousers.' },
      { name: 'Raw Edge Urban Cargo Trouser', price: 3600, desc: 'Durable stretch cotton twill with deep utilitarian pockets and adjustable ankle cinches.' },
      { name: 'Signature Embroidered Shawl', price: 6200, desc: 'Warm pashmina-blend shawl adorned with artisanal Kashmiri tilla embroidery motifs.' }
    ]
  },
  skincare: {
    categories: ['Face Serums', 'Hydrating Creams', 'Organic Cleansers', 'Sun Care & Protection'],
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-54313f8c85c0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556228722-d0b740523bb8?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: '2% Pure Hyaluronic Acid Dew Glow Serum', price: 2400, desc: 'Triple molecular weight hyaluronic acid combined with vitamin B5 for glass skin hydration.' },
      { name: 'Botanical Ceramide Barrier Repair Cream', price: 2950, desc: 'Rich lipid-replenishing soothing moisturizer formulated with centella asiatica and oat peptides.' },
      { name: 'Gentle Green Tea Cleansing Gel 150ml', price: 1800, desc: 'pH-balanced sulfate-free daily foam cleanser that removes impurities without stripping skin moisture.' },
      { name: 'Invisible Mineral Sunshield SPF 50+', price: 2600, desc: 'Ultra-lightweight non-greasy matte finish sunscreen with zero white cast and zinc protection.' },
      { name: 'Cold-Pressed Rosehip Glow Elixir', price: 2200, desc: '100% organic unrefined rosehip seed oil rich in pro-vitamin A to brighten and smooth texture.' },
      { name: 'Exfoliating 10% AHA + 2% BHA Peeling Mask', price: 2750, desc: 'Weekly brightening facial exfoliant targeting stubborn blackheads and uneven tone.' }
    ]
  },
  jewelry: {
    categories: ['Necklaces & Pendants', 'Rings & Bands', 'Earrings', 'Bracelets & Cuffs'],
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611591475152-477d6928e08d?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: '18K Gold Plated Celestial Coin Pendant', price: 3400, desc: 'Waterproof anti-tarnish stainless steel dipped in 18k radiant gold on an adjustable link chain.' },
      { name: 'Emerald Cut Solitaire Zirconia Ring', price: 2800, desc: 'Flawlessly faceted Austrian zircon center stone prong-set in rhodium-plated sterling silver.' },
      { name: 'Chunky Twisted Croissant Gold Hoops', price: 2200, desc: 'Lightweight hollow vintage French-inspired huggie earrings for everyday elevated styling.' },
      { name: 'Baroque Fresh Water Pearl Choker', price: 4100, desc: 'Individually hand-knotted genuine freshwater baroque pearls with a toggle clasp.' },
      { name: 'Double Layer Herringbone Chain Bracelet', price: 2600, desc: 'Sleek snake herringbone link with lobster clasp, designed for timeless wrist layering.' },
      { name: 'Royal Polki Heritage Statement Jhumkas', price: 4900, desc: 'Traditional artisan bridal craftsmanship accented with ruby glass stones and pearl drops.' }
    ]
  },
  tech: {
    categories: ['Audio & Headset', 'Smart Wearables', 'MagSafe Accessories', 'Workspace Gadgets'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572721546713-ff1ecf3d022b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Active Noise Cancelling Wireless Headphones', price: 8500, desc: 'Hi-Res audio certified with 40mm titanium drivers, hybrid ANC, and 50-hour ultra battery endurance.' },
      { name: 'Titanium Smartwatch Ultra with AMOLED Display', price: 7200, desc: 'Comprehensive health monitoring including heart rate, SpO2, sleep tracker, and Bluetooth calling.' },
      { name: '3-in-1 Foldable Fast Wireless Charging Dock', price: 4200, desc: 'Fast Qi-compatible 15W wireless stand for phone, smartwatch, and wireless earbuds simultaneously.' },
      { name: 'Minimalist Mechanical RGB Wireless Keyboard', price: 9500, desc: 'Hot-swappable tactile brown switches, PBT keycaps, and triple connectivity (BT/2.4G/Wired).' },
      { name: 'Ergonomic Vertical Precision Mouse', price: 3400, desc: 'Neutral wrist posture natural grip design with silent clicks and high-precision laser sensor.' },
      { name: 'Studio USB-C Condenser Boom Mic', price: 5800, desc: 'Cardioid polar pattern studio microphone with instant tap-to-mute and built-in pop filter.' }
    ]
  },
  food: {
    categories: ['Artisan Beans', 'Gourmet Treats', 'Brew Equipment', 'Subscription Packs'],
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Ethiopian Yirgacheffe Single Origin Beans 250g', price: 2400, desc: 'Light-medium roast showcasing tasting notes of bergamot, jasmine florals, and sweet citrus honey.' },
      { name: 'Velvet Dark Roast Espresso Blend 500g', price: 3100, desc: 'Bold full-bodied roast pairing rich dark chocolate, roasted almond, and caramel crema.' },
      { name: 'Handcrafted Double-Walled French Press 600ml', price: 3800, desc: 'Borosilicate glass brewer with four-level stainless mesh filtration for velvety coffee brews.' },
      { name: 'Artisan Hazelnut Praline Truffle Box (12 pcs)', price: 2200, desc: 'Fresh Belgian couverture chocolates filled with slow-roasted Piedmont hazelnut gianduja.' },
      { name: 'Precision Ceramic Burr Hand Coffee Grinder', price: 4500, desc: 'Aerospace aluminum body with 36 adjustable grind settings from Turkish fine to coarse cold brew.' },
      { name: 'Cold Brew Infusion Bottle & Filter Set', price: 2900, desc: 'Leakproof silicone-sealed travel brewer engineered for smooth 18-hour cold extractions.' }
    ]
  },
  footwear: {
    categories: ['Athletic Running', 'Streetwear Hoodies', 'Headwear & Caps', 'Smart Wearables'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Running Shoes', price: 12000, desc: 'Ultra-lightweight responsive performance running shoes with breathable mesh and all-day comfort.' },
      { name: 'Hoodie', price: 8200, desc: 'Premium heavyweight cotton fleece hoodie with minimalist tailored fit.' },
      { name: 'Cap', price: 2499, desc: 'Structured classic baseball cap with breathable eyelets and adjustable strap.' },
      { name: 'Smart Watch', price: 14000, desc: 'Next-gen AMOLED health & fitness tracker with high accuracy heart rate and workout sensors.' },
      { name: 'Leather Casual Sneakers', price: 9500, desc: 'Handcrafted genuine leather low-top sneakers with cushioned OrthoLite insoles.' },
      { name: 'Athletic Gym Duffel Bag', price: 4500, desc: 'Water-resistant gym duffel with separate shoe compartment and ergonomic strap.' }
    ]
  }
};

/**
 * Detect niche from user prompt
 */
function detectNiche(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('shoe') || p.includes('footwear') || p.includes('sneaker') || p.includes('jogger') || p.includes('boot')) return 'footwear';
  if (p.includes('perfume') || p.includes('fragrance') || p.includes('scent') || p.includes('oud') || p.includes('attar')) return 'perfume';
  if (p.includes('cloth') || p.includes('dress') || p.includes('fashion') || p.includes('wear') || p.includes('hoodie') || p.includes('kurta') || p.includes('suit') || p.includes('apparel')) return 'clothing';
  if (p.includes('skin') || p.includes('cosmetic') || p.includes('beauty') || p.includes('serum') || p.includes('cream') || p.includes('lotion') || p.includes('makeup')) return 'skincare';
  if (p.includes('jewel') || p.includes('ring') || p.includes('necklace') || p.includes('earring') || p.includes('gold') || p.includes('silver') || p.includes('bracelet')) return 'jewelry';
  if (p.includes('tech') || p.includes('phone') || p.includes('gadget') || p.includes('headphone') || p.includes('watch') || p.includes('electronic') || p.includes('laptop')) return 'tech';
  if (p.includes('coffee') || p.includes('tea') || p.includes('food') || p.includes('cake') || p.includes('sweet') || p.includes('chocolate') || p.includes('bakery')) return 'food';
  return 'clothing'; // default versatile fallback
}

/**
 * Clean slug from store name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
}

/**
 * Extract or generate a brandable store name
 */
function extractStoreName(prompt: string, niche: string): string {
  // Check if prompt specifically mentions a name (e.g., "called Noor", "name is Velvet Aura")
  const namedMatch = prompt.match(/(?:called|named|name is|title is)\s+["']?([A-Za-z0-9\s]{2,25})["']?/i);
  if (namedMatch && namedMatch[1]?.trim()) {
    return namedMatch[1].trim();
  }

  const nicheNames: Record<string, string[]> = {
    footwear: ['Stride & Pace Footwear', 'Aura Kicks Atelier', 'Apex Footwear Co.', 'Urban Velocity Shoes'],
    perfume: ['Velvet Aura Fragrances', 'Royal Scent Co.', 'Oud & Amber Atelier', 'Luxe Essence'],
    clothing: ['Noor Couture', 'Urban Aura Threads', 'Zahra Pret & Festive', 'Vogue Loom'],
    skincare: ['Glow Botanica', 'Pure Aura Skincare', 'Silk & Dew Beauty', 'Aura Dermacare'],
    jewelry: ['Celestia Jewels', 'Zircon & Gold Atelier', 'Royal Heritage Ornaments', 'Aura Trinkets'],
    tech: ['Nexus Wave Tech', 'Pulse Gadget Lab', 'Apex Horizon Gear', 'Nova Volt Gear'],
    food: ['Artisan Brew Bar', 'Velvet Bean Roasters', 'Sweet Praline Co.', 'Roast & Sip Co.']
  };

  const pool = nicheNames[niche] || nicheNames.clothing;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Intelligent AI Store Generator from Prompt
 */
export async function generateStoreFromPrompt(options: {
  prompt: string;
  plan?: 'free' | 'pro' | 'advanced';
  selectedTheme?: string;
  customStoreName?: string;
  whatsappNumber?: string;
  ownerEmail?: string;
  socialLinks?: Partial<Record<'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x', string>>;
}): Promise<GeneratedStore> {
  const { prompt, plan = 'free', selectedTheme, customStoreName, whatsappNumber, ownerEmail, socialLinks = {} } = options;

  const normalizedSocialLinks: GeneratedStore['social_links'] = {};
  for (const key of ['instagram', 'facebook', 'youtube', 'tiktok', 'x'] as const) {
    const candidate = socialLinks[key]?.trim();
    if (!candidate) continue;
    let url: URL;
    try {
      url = new URL(candidate);
    } catch {
      throw new Error(`social_links.${key} must be a valid HTTP or HTTPS URL.`);
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error(`social_links.${key} must be a valid HTTP or HTTPS URL.`);
    }
    normalizedSocialLinks[key] = url.toString();
  }

  const niche = detectNiche(prompt);
  const nicheData = NICHE_IMAGES[niche] || NICHE_IMAGES.clothing;

  // Determine theme
  let themeKey = selectedTheme;
  if (!themeKey || !THEME_PRESETS[themeKey]) {
    const p = prompt.toLowerCase();
    if (p.includes('ocean') || p.includes('navy') || p.includes('electric') || p.includes('sky')) {
      themeKey = 'ocean-blue';
    } else if (p.includes('gold') || p.includes('royal') || p.includes('luxury') || p.includes('black') || p.includes('dark')) {
      themeKey = 'royal-gold';
    } else if (p.includes('amber') || p.includes('sunset') || p.includes('orange')) {
      themeKey = 'sunset-amber';
    } else if (p.includes('purple') || p.includes('violet') || p.includes('lavender')) {
      themeKey = 'aurora-violet';
    } else if (p.includes('mint') || p.includes('fresh') || p.includes('nature')) {
      themeKey = 'mint-fresh';
    } else if (p.includes('minimal') || p.includes('monochrome') || p.includes('onyx')) {
      themeKey = 'midnight-minimal';
    } else if (p.includes('rose') || p.includes('pink') || p.includes('blush') || p.includes('girly')) {
      themeKey = 'velvet-rose';
    } else if (p.includes('tech') || p.includes('gadget') || p.includes('electronic') || p.includes('cyber') || p.includes('blue')) {
      themeKey = 'ocean-blue';
    } else if (p.includes('warm') || p.includes('artisan') || p.includes('brown') || p.includes('earthy')) {
      themeKey = 'artisan-cream';
    } else {
      themeKey = 'ocean-blue';
    }
  }

  const theme = THEME_PRESETS[themeKey] || THEME_PRESETS.emerald;

  const finalName = (customStoreName && customStoreName.trim().length > 1) 
    ? customStoreName.trim() 
    : extractStoreName(prompt, niche);

  const slug = generateSlug(finalName);

  // Generate tagline and hero based on niche & prompt
  const taglines: Record<string, string> = {
    footwear: 'Step into style and comfort with our latest collection. Handcrafted for endurance and everyday lifestyle.',
    perfume: 'Captivating artisanal fragrances and pure concentrated attars crafted for unforgettable impressions.',
    clothing: 'Modern silhouettes, luxury festive fabrics, and timeless handcrafted essentials tailored for you.',
    skincare: 'Clinically balanced, botanical-infused skin nutrition for natural radiant glow every day.',
    jewelry: 'Handcrafted luxury jewelry and 18K gold-plated keepsakes designed to shine on every occasion.',
    tech: 'Cutting-edge smart wearables, precision acoustics, and premium workstation essentials.',
    food: 'Freshly roasted single-origin specialty coffees, hand-poured beans, and gourmet artisan treats.'
  };

  const tagline = taglines[niche] || 'Exquisite quality products handcrafted with passion and delivered swiftly to your doorstep.';
  const header_title = `Welcome to ${finalName}`;
  const description = `${finalName} brings you curated premium ${niche} collections. Designed with precision, tested for excellence, and packaged for perfection.`;

  // Determine number of products to include according to plan
  // Free: 4 products, Pro: 6 products, Advanced: 6-8 products
  let productLimit = 4;
  if (plan === 'pro') productLimit = 6;
  if (plan === 'advanced') productLimit = 6;

  // Categories allowed by plan
  let categories = nicheData.categories.slice(0, plan === 'free' ? 3 : 5);

  // Products
  const products: GeneratedProduct[] = nicheData.items.slice(0, productLimit).map((item, idx) => {
    const imgUrl = nicheData.images[idx % nicheData.images.length];
    const cat = categories[idx % categories.length];
    const badges = ['Bestseller', 'New Arrival', 'Limited Edition', 'Top Pick'];

    return {
      id: `prod_${idx + 1}_${Math.random().toString(36).substring(2, 7)}`,
      name: item.name,
      description: item.desc,
      price: item.price,
      category: cat,
      image_url: imgUrl,
      wholesale_cost: Math.round(item.price * 0.55),
      min_accept_price: Math.round(item.price * 0.85),
      stock_status: idx === 1 ? 'low_stock' : 'in_stock',
      badge: badges[idx % badges.length]
    };
  });

  return {
    name: finalName,
    slug,
    tagline,
    description,
    header_title,
    plan,
    whatsapp_number: whatsappNumber || '923001234567',
    owner_email: ownerEmail || `admin@${slug}.com`,
    theme,
    categories,
    products,
    social_links: normalizedSocialLinks,
    delivery: {
      store_city: 'Lahore',
      city_rate: 200,
      other_city_rate: 350
    }
  };
}
