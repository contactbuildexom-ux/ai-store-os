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
  id?: string;
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
  nature: {
    categories: ['Indoor Plants', 'Air-Purifying Succulents', 'Organic Botanicals & Herbs', 'Artisan Planters'],
    images: [
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Monstera Deliciosa Natural Potted Plant', price: 2800, desc: 'Lush tropical Swiss Cheese plant in an artisanal terracotta drainage pot for home and office.' },
      { name: 'Sansevieria Snake Plant Air-Purifier', price: 1950, desc: 'Hardy low-light indoor air-purifying plant with architectural variegated upright leaves.' },
      { name: 'Fiddle Leaf Fig Premium Tree (4 Ft)', price: 4900, desc: 'Dramatic broad-leaf indoor statement plant in modern eco-friendly woven planter basket.' },
      { name: 'Rare Jade Succulent & Aloe Harmony Bowl', price: 2200, desc: 'Curated desktop arrangement of hardy drought-tolerant succulents in minimalist ceramic dish.' },
      { name: 'Organic Cold-Pressed Neem Herbal Spray', price: 1250, desc: '100% natural organic botanical pest defense and leaf shine tonic for vibrant green foliage.' },
      { name: 'Artisan Glazed Ceramic Drainage Pot', price: 1600, desc: 'Hand-thrown textured ceramic planter with matching saucer for healthy indoor root growth.' }
    ]
  },
  handbags: {
    categories: ['Velvet Clutches', 'Structured Shoulder Bags', 'Everyday Totes', 'Designer Evening Bags'],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1575032617751-6ddec2089882?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Velvet Midnight Noir Luxury Clutch', price: 3800, desc: 'Rich velvet exterior with gold-tone hardware, clasp closure, and detachable cross-body chain.' },
      { name: 'Embossed Crocodile Leather Shoulder Bag', price: 4950, desc: 'Structured silhouette crafted in vegan croc-embossed leather with dual interior compartments.' },
      { name: 'Artisan Embroidered Zardozi Party Pouch', price: 4200, desc: 'Handcrafted raw silk and velvet evening pouch with intricate gold metallic wire embroidery.' },
      { name: 'Minimalist Commuter Leather Tote', price: 5400, desc: 'Spacious daily tote featuring padded laptop sleeve, reinforced handles, and magnetic snap closure.' },
      { name: 'Vintage Top-Handle Mini Satchel', price: 3600, desc: 'Timeless retro-inspired mini satchel with structured flap and adjustable shoulder strap.' },
      { name: 'Quilted Velvet Evening Crossbody', price: 3200, desc: 'Chevron quilted soft velvet with polished chain strap, perfect for weddings and dinner soirees.' }
    ]
  },
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
  gaming: {
    categories: ['Mechanical Keyboards', 'Gaming Mice & Pads', 'Wireless Headsets', 'RGB Desk Accessories'],
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'RGB Hot-Swappable Mechanical Gaming Keyboard', price: 9500, desc: 'Tactile switches, dynamic per-key RGB backlighting, aircraft aluminum frame, and detachable USB-C braided cable.' },
      { name: 'Ultra-Lightweight 16,000 DPI Optical Gaming Mouse', price: 4800, desc: 'Honeycomb ergonomic shell weighing only 62g, PTFE zero-friction skates, and ultra-flexible paracord wire.' },
      { name: 'Pro 7.1 Surround Wireless Gaming Headset', price: 8200, desc: '50mm neodymium audio drivers, 2.4GHz ultra-low latency wireless, and broadcast-quality noise-canceling mic.' },
      { name: 'Extended Anti-Fray RGB Edge Gaming Desk Mat', price: 2900, desc: 'Micro-textured smooth cloth surface with 14 customizable RGB lighting modes and non-slip rubber base (900x400mm).' },
      { name: 'Dual-Vibration Wireless Pro Gaming Controller', price: 6200, desc: 'Precision hall-effect triggers, responsive D-pad, multi-platform Bluetooth connectivity for PC and console.' },
      { name: 'Cardioid Condenser Boom USB Streaming Mic', price: 5900, desc: 'Studio cardioid polar pattern, quick tap-to-mute sensor, built-in pop filter, and adjustable boom arm.' }
    ]
  },
  footwear: {
    categories: ['Running Shoes', 'Streetwear Sneakers', 'Casual Leather Trainers', 'Athletic Performance'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Air Cushion Performance Running Shoes', price: 12000, desc: 'Ultra-lightweight responsive performance running shoes with breathable mesh and all-day comfort.' },
      { name: 'Retro Streetwear Chunky Sneakers', price: 8900, desc: 'Iconic 90s aesthetic lifestyle sneakers with shock-absorbing multi-layer sole.' },
      { name: 'Classic Low-Top Leather Casual Trainers', price: 7500, desc: 'Handcrafted genuine leather low-top sneakers with cushioned OrthoLite insoles.' },
      { name: 'Slip-On Breathable Knit Walking Shoes', price: 5400, desc: 'Seamless engineered stretch knit slip-on with flexible traction outsole.' },
      { name: 'High-Top Ankle Support Court Sneakers', price: 11500, desc: 'Padded ankle collar with premium leather panelling and reinforced court grip.' },
      { name: 'Ultra-Comfort Recovery Foam Slides', price: 3200, desc: 'High-density EVA foam contoured footbed slides for post-workout recovery and relaxation.' }
    ]
  },
  wedding: {
    categories: ['Bridal Couture', 'Wedding Favors & Gift Boxes', 'Traditional Jewelry & Sets', 'Festive Accessories'],
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1545232979-fbf68fe9ec41?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Royal Velvet Embroidered Bridal Pouch & Clutch', price: 3200, desc: 'Handcrafted zardozi embroidered velvet bridal clutch with detachable gold chain.' },
      { name: 'Artisan Wedding Favor & Sweets Gift Box (Set of 12)', price: 4500, desc: 'Laser-cut gold foiled favor boxes adorned with silk ribbons for wedding guests.' },
      { name: 'Traditional Kundan Bridal Choker & Earrings Set', price: 6800, desc: 'Gold-plated 22k finish kundan bridal necklace with matching jhumkas and maang tikka.' },
      { name: 'Luxury Organza & Tilla Embroidered Formal Dupatta', price: 4200, desc: 'Pure tissue organza dupatta with scalloped borders and intricate tilla embellishments.' },
      { name: 'Handcrafted Scented Wedding Soy Candle Souvenirs', price: 2800, desc: 'Pack of 6 personalized fragrant soy wax jars with floral notes and customized tags.' },
      { name: 'Velvet Shagun & Cash Envelopes (Pack of 10)', price: 1800, desc: 'Premium velvet textured monetary gift envelopes with traditional embossed motif.' }
    ]
  }
};

/**
 * Detect niche from user prompt
 */
function detectNiche(prompt: string): string {
  const p = prompt.toLowerCase();
  if (/\b(gaming|gamer|games|game|rgb|battlestation|console|streamer|gpu|pc build|setup|joystick|gamepad|keyboard|mouse|headset)\b/i.test(p) && !/\b(nature|plant|dress|kurta|lawn)\b/i.test(p)) return 'gaming';
  if (/\b(nature|grass|plant|plants|flora|green|greens|garden|gardening|indoor plant|herbal|succulent|botanical|lawn)\b/i.test(p)) return 'nature';
  if (/\b(handbag|handbags|hanbags|bag|bags|purse|purses|clutch|clutches|tote|crossbody|backpack|wallet|wallets)\b/i.test(p)) return 'handbags';
  if (/\b(jewel|jewelry|jewellery|ring|rings|necklace|necklaces|earring|earrings|gold|silver|bracelet|bangles|jhumka|jhumkay|chain|choker)\b/i.test(p)) return 'jewelry';
  if (/\b(shoe|shoes|footwear|sneaker|sneakers|jogger|joggers|boot|boots|jootay|joota|chappal|heels|sandals)\b/i.test(p)) return 'footwear';
  if (/\b(perfume|perfumes|fragrance|fragrances|scent|scents|oud|attar|itr|khushbu|khushboo|cologne)\b/i.test(p)) return 'perfume';
  if (/\b(skin|skincare|cosmetic|cosmetics|beauty|serum|serums|cream|lotion|makeup|glow|face wash|sunscreen)\b/i.test(p)) return 'skincare';
  if (/\b(tech|phone|phones|mobile|gadget|gadgets|smartwatch|watch|watches|electronic|electronics|laptop|earbuds|charger)\b/i.test(p)) return 'tech';
  if (/\b(coffee|tea|chai|food|cake|cakes|sweet|sweets|mithai|chocolate|chocolates|bakery|beans|cafe|roast)\b/i.test(p)) return 'food';
  if (/\b(wedding|bridal|shaadi|shadi|dulhan|groom|bride|marriage|mehndi|nikkah|barat|walima|valima|favor|shagun)\b/i.test(p)) return 'wedding';
  if (/\b(cloth|clothes|clothing|dress|dresses|fashion|wear|hoodie|hoodies|kurta|kurtas|suit|suits|apparel|kapray|shirt|shirts|pret|lawn|chiffon)\b/i.test(p)) return 'clothing';
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
    gaming: ['Nexus Battlestation Gear', 'Apex Gaming Atelier', 'Cyber Pulse Gaming', 'Vanguard Esports Gear'],
    nature: ['Verdant Flora & Botanica', 'Pure Earth Botanicals', 'Emerald Greens & Co.', 'Bloom Haven Organics'],
    handbags: ['Velvet Noir Handbags', 'Aura Leather Atelier', 'Luxe Clutch & Co.', 'Heritage Handbags Studio'],
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
    gaming: 'High-performance RGB battlestation gear, hot-swappable mechanical keyboards, and precision esports peripherals with cash on delivery.',
    nature: 'Nurture your home and workplace with fresh organic indoor plants, natural herbs, and sustainable botanical living.',
    handbags: 'Curated artisanal velvet clutches, structured leather shoulder bags, and luxury evening purses handcrafted for elegance.',
    footwear: 'Step into style and comfort with our latest collection. Handcrafted for endurance and everyday lifestyle.',
    perfume: 'Captivating artisanal fragrances and pure concentrated attars crafted for unforgettable impressions.',
    clothing: 'Modern silhouettes, luxury festive fabrics, and timeless handcrafted essentials tailored for you.',
    skincare: 'Clinically balanced, botanical-infused skin nutrition for natural radiant glow every day.',
    jewelry: 'Handcrafted luxury jewelry and 18K gold-plated keepsakes designed to shine on every occasion.',
    tech: 'Cutting-edge smart wearables, precision acoustics, and premium workstation essentials.',
    food: 'Freshly roasted single-origin specialty coffees, hand-poured beans, and gourmet artisan treats.',
    wedding: 'Exquisite bridal accessories, royal wedding favor boxes, and handcrafted traditional keepsakes for your special moments.'
  };

  const tagline = taglines[niche] || 'Exquisite quality products handcrafted with passion and delivered swiftly to your doorstep.';
  const header_title = `Welcome to ${finalName}`;
  const description = `${finalName} brings you curated premium ${niche} collections. Designed with precision, tested for excellence, and packaged for perfection.`;

  // Generate minimum 30 products spread across categories (matching user request for minimum 30 products)
  const categories = nicheData.categories;
  const targetProductCount = 32;
  const badges = ['Bestseller', 'New Arrival', 'Limited Edition', 'Top Pick', 'Trending', 'Customer Favorite'];

  const products: GeneratedProduct[] = [];
  for (let i = 0; i < targetProductCount; i++) {
    const baseItem = nicheData.items[i % nicheData.items.length];
    const cat = categories[i % categories.length];
    const img1 = nicheData.images[i % nicheData.images.length];
    const img2 = nicheData.images[(i + 1) % nicheData.images.length];
    const img3 = nicheData.images[(i + 2) % nicheData.images.length];
    const multiImages = `${img1},${img2},${img3}`;
    const cycle = Math.floor(i / nicheData.items.length);
    const editionSuffix = cycle === 1 ? ' · Signature Edition' : cycle === 2 ? ' · Luxe Edition' : cycle === 3 ? ' · Elite Series' : cycle === 4 ? ' · Reserve' : '';
    const priceAdjustment = cycle * 350;
    const finalPrice = baseItem.price + priceAdjustment;

    products.push({
      id: `prod_${i + 1}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${baseItem.name}${editionSuffix}`,
      description: baseItem.desc,
      price: finalPrice,
      category: cat,
      image_url: multiImages,
      wholesale_cost: Math.round(finalPrice * 0.55),
      min_accept_price: Math.round(finalPrice * 0.85),
      stock_status: i % 5 === 2 ? 'low_stock' : 'in_stock',
      badge: badges[i % badges.length]
    });
  }

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
