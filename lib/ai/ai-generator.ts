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
  category?: string;
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
  selected_plan?: string;
  payment_status?: string;
  payment_details?: Record<string, unknown>;
  hero_images?: string[];
  about_title?: string;
  about_text?: string;
  about_image?: string;
  niche?: string;
  is_verified?: boolean;
  verification_status?: 'pending' | 'verified' | 'rejected';
  whatsapp_number: string;
  owner_email: string;
  theme: StoreThemeConfig;
  categories: string[];
  products: GeneratedProduct[];
  password_hash?: string;
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
export const NICHE_IMAGES: Record<string, { images: string[]; categories: string[]; items: Array<{ name: string; price: number; desc: string }> }> = {
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
  },
  home: {
    categories: ['Scented Candles & Aromatherapy', 'Ceramic Tableware & Vases', 'Handwoven Throws & Linen', 'Artisan Lighting & Decor'],
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Artisan Amber Jar Scented Soy Candle', price: 2450, desc: 'Hand-poured 100% natural soy wax candle with botanical essential oils and cotton wick.' },
      { name: 'Handcrafted Fluted Terracotta Ceramic Vase', price: 3800, desc: 'Matte fluted stoneware ceramic decorative vase suitable for dried florals and pampas.' },
      { name: 'Pure Washed Belgian Linen Throw Blanket', price: 6200, desc: 'Ultra-soft breathable washed pure linen blanket with fringed edges for cozy living spaces.' },
      { name: 'Aromatherapy Amber Glass Reed Room Diffuser', price: 2900, desc: 'Long-lasting natural rattan reed diffuser infused with soothing cedarwood and bergamot.' },
      { name: 'Solid Natural Teak Wood Sculptural Catchall Tray', price: 3400, desc: 'Hand-carved organic edge hardwood catchall tray for console and coffee table decor.' },
      { name: 'Minimalist Textured Ceramic Mug & Saucer Set', price: 1850, desc: 'Hand-thrown speckled stoneware ceramic coffee mug with artisanal curved handle.' }
    ]
  },
  watches: {
    categories: ['Luxury Chronographs', 'Automatic Timepieces', 'Minimalist Leather Watches', 'Classic Dress Watches', 'Stainless Steel Sport Watches'],
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547996160-71dfabb1a7b1?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Sapphire Crystal Automatic Skeleton Watch', price: 18500, desc: 'Self-winding mechanical movement with visible open-heart balance wheel and sapphire crystal glass.' },
      { name: 'Midnight Black Minimalist Chronograph', price: 14200, desc: 'Triple-subdial chronograph timepiece with surgical-grade 316L stainless steel case and genuine leather strap.' },
      { name: 'Classic Rose Gold Roman Dress Watch', price: 11900, desc: 'Ultra-slim 7mm profile with sunburst dial, Roman numeral markers, and Italian calfskin strap.' },
      { name: 'Brushed Silver Stainless Diver 200M', price: 16400, desc: 'Rotating ceramic bezel, luminous hands and hour markers with screw-down crown.' },
      { name: 'Vintage Tonneau Heritage Leather Watch', price: 13800, desc: 'Curved tonneau case inspired by 1930s art deco horology with hand-stitched leather.' },
      { name: 'Full-Grain Leather 3-Slot Watch Travel Case', price: 4800, desc: 'Handcrafted luxury watch roll with velvet cushions and snap enclosure.' }
    ]
  },
  eyewear: {
    categories: ['Polarized Sunglasses', 'UV400 Aviators', 'Blue Light Blocking Frames', 'Wayfarer Sunglasses'],
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509695507497-903c140c43b0?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Matte Black Polarized Aviator Sunglasses', price: 4200, desc: 'Lightweight titanium frame with UV400 anti-glare polarized scratch-resistant lenses.' },
      { name: 'Acetate Anti-Blue Light Computer Glasses', price: 3600, desc: 'Ergonomic hand-polished Italian acetate optical frames that block 99% harmful digital blue light.' },
      { name: 'Vintage Tortoiseshell Wayfarer Sunnies', price: 4800, desc: 'Classic retro silhouette sunglasses with warm amber polarized gradient lenses.' },
      { name: 'Titanium Rimless Round Reading Glasses', price: 3200, desc: 'Ultra-flexible lightweight rimless reading spectacles with anti-reflective coating.' },
      { name: 'Oversized Gradient Square Sunglasses', price: 4500, desc: 'Chic bold square statement sunglasses offering complete UVA and UVB defense.' },
      { name: 'Hard Shell Leather Sunglasses Protective Case', price: 1800, desc: 'Structured velvet-lined case with microfiber cleaning cloth.' }
    ]
  },
  fitness: {
    categories: ['High-Waist Compression Leggings', 'Performance Workout Sets', 'Gym Water Bottles & Shakers', 'Fitness & Yoga Gear'],
    images: [
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Seamless High-Waist Sculpting Gym Leggings', price: 3400, desc: 'Squat-proof four-way stretch compression fabric with supportive ribbed tummy-control band.' },
      { name: 'Breathable Longline Athletic Sports Bra', price: 2400, desc: 'Medium-to-high support workout sports bra with moisture-wicking and removable padded cups.' },
      { name: 'Triple-Insulated Stainless Steel Sport Bottle (1L)', price: 2950, desc: 'Double-wall vacuum insulated water bottle keeping drinks icy cold for 24 hours.' },
      { name: 'Eco-Friendly High-Density Non-Slip Yoga Mat', price: 4200, desc: '6mm textured dual-layer TPE alignment exercise mat with carrying strap.' },
      { name: 'Non-Slip Fabric Resistance Booty Bands (Set of 3)', price: 1850, desc: 'Heavy-duty non-rolling fabric resistance bands in light, medium, and heavy tension.' },
      { name: 'Ultra-Lightweight 2-in-1 Quick-Dry Training Shorts', price: 2800, desc: 'Breathable athletic workout shorts with integrated compression liner and zipper phone pocket.' }
    ]
  },
  baby: {
    categories: ['Organic Cotton Rompers', 'Montessori Wooden Toys', 'Muslin Swaddle Blankets', 'Nursery Decor & Essentials'],
    images: [
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584839619566-4c89be3764da?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: '100% Organic Ribbed Cotton Baby Romper', price: 2200, desc: 'Ultra-soft GOTS certified organic ribbed cotton onesie with easy-snap two-way zippers.' },
      { name: 'Breathable 4-Layer Bamboo Muslin Swaddle Blanket', price: 2600, desc: 'Silky soft, pre-washed bamboo muslin blanket designed for sweet dreaming and nursing.' },
      { name: 'Montessori Natural Beechwood Teething Rattle Set', price: 1950, desc: 'Non-toxic splinter-free natural beechwood sensory rattle toy with smooth rounded edges.' },
      { name: 'Hand-Knitted Chunky Cotton Baby Crib Blanket', price: 3800, desc: 'Breathable hypoallergenic cable-knit blanket perfect for stroller and nursery comfort.' },
      { name: 'Food-Grade Silicone Suction Baby Bowl & Spoon Set', price: 1750, desc: 'Strong suction base silicone feeding set that is microwave, dishwasher, and freezer safe.' },
      { name: 'Soft Neutral Knotted Baby Beanie & Mitten Set', price: 1200, desc: 'Comfortable stretch cotton cap with adjustable knot and scratch-prevention newborn mittens.' }
    ]
  },
  stationery: {
    categories: ['Hardcover Vegan Leather Journals', 'Daily Productivity Planners', 'Calligraphy & Fountain Pens', 'Desk Organization Accessories'],
    images: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: '160 GSM Ultra-Thick Bullet Grid Journal', price: 2600, desc: 'Bleedproof 160gsm bamboo paper hardcover notebook with lay-flat binding and ribbon bookmarks.' },
      { name: 'Undated 6-Month Habit & Productivity Planner', price: 2900, desc: 'Structured daily, weekly, and monthly goal tracker designed for peak focus and mindfulness.' },
      { name: 'Matte Brass Weight-Balanced Fine Nib Fountain Pen', price: 3800, desc: 'Precision-weighted brass barrel with smooth iridium fine nib and refillable ink converter.' },
      { name: 'Pastel Aesthetic Dual-Tip Highlighters (Pack of 6)', price: 1250, desc: 'Quick-drying smudge-free water-based chisel and fine point aesthetic pastel markers.' },
      { name: 'Waterproof Dual-Sided Vegan Leather Desk Mat', price: 2400, desc: 'Large 80x40cm spill-resistant desk blotter mouse pad with smooth tracking surface.' },
      { name: 'Archival Micro-Pigment Precision Fineliner Set', price: 1650, desc: 'Fade-resistant waterproof black ink technical pens from 0.05mm to 0.8mm brush tip.' }
    ]
  },
  makeup: {
    categories: ['Hydrating Lip Tints & Gloss', 'Dewy Liquid Blush & Bronzers', 'Weightless Complexion Serums', 'Eyeshadow Palettes & Liners'],
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583241797746-d2efad56f8f5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Velvet Matte Long-Wear Lip Stain Cream', price: 1850, desc: 'Transfer-resistant featherweight formula enriched with vitamin E for non-drying velvety lips.' },
      { name: 'Dewy Liquid Blush & Highlighting Wand', price: 2200, desc: 'Blendable weightless cheek tint with buildable soft-focus glow and sponge applicator.' },
      { name: 'Skin-Matching Breathable Hydrating Foundation', price: 3400, desc: 'Medium buildable coverage foundation infused with hyaluronic acid for fresh second-skin finish.' },
      { name: 'Precision Waterproof Liquid Felt-Tip Eyeliner', price: 1450, desc: 'Ultra-pigmented smudge-proof carbon black liner with 0.1mm flexible felt applicator tip.' },
      { name: 'Warm Terracotta 9-Shade Eyeshadow Palette', price: 2950, desc: 'High-impact buttery mattes, satins, and metallic foils for effortless everyday and evening glam.' },
      { name: 'Nourishing Peptide Plumping Lip Gloss Oil', price: 1750, desc: 'Non-sticky ultra-glossy botanical treatment that visibly softens, hydrates, and volumizes lips.' }
    ]
  },
  haircare: {
    categories: ['Sulfate-Free Shampoos & Cleansers', 'Deep Moisture Hair Masks', 'Scalp & Growth Stimulating Oils', 'Heat Defense & Styling Serums'],
    images: [
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-5753068e1462?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585232351009-aa87416fca90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
    ],
    items: [
      { name: 'Cold-Pressed Rosemary & Biotin Scalp Oil', price: 2200, desc: 'Stimulating botanical scalp treatment with rosemary, peppermint, and biotin to promote hair density.' },
      { name: 'Raw Moroccan Argan & Keratin Deep Treatment Mask', price: 2900, desc: 'Intense hydration restorative mask that repairs damaged strands and restores glossy bounce.' },
      { name: 'Clarifying Sulfate-Free Apple Cider Vinegar Shampoo', price: 2450, desc: 'Gentle clarifying wash that clears build-up while maintaining essential natural scalp moisture.' },
      { name: 'Leave-In Anti-Frizz & 450°F Heat Defense Mist', price: 2100, desc: 'Weightless thermal protection spray shielding hair from styling tools while smoothing flyaways.' },
      { name: '100% Pure Mulberry Silk Sleep Scrunchies (Pack of 3)', price: 1600, desc: 'Frictionless grade-6A silk hair ties that prevent breakage, kinks, and split ends.' },
      { name: 'Gentle Ergonomic Bamboo Bristle Scalp Massager Brush', price: 1450, desc: 'Eco-friendly natural bamboo cushion brush for gentle detangling and follicle stimulation.' }
    ]
  }
};

/**
 * Detect niche from user prompt, explicit niche ID, and custom store name
 */
export function detectNiche(prompt: string, explicitNiche?: string, customStoreName?: string): string {
  // Combine all inputs into a single text pool for robust keyword matching
  const combined = [
    explicitNiche || '',
    customStoreName || '',
    prompt || ''
  ].join(' ').toLowerCase();

  // 1. Direct explicit niche ID matching
  if (explicitNiche) {
    const rawN = explicitNiche.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (rawN.includes('footwear') || rawN.includes('shoe') || rawN.includes('sneaker') || rawN.includes('loafer')) return 'footwear';
    if (rawN.includes('home') || rawN.includes('decor') || rawN.includes('candle') || rawN.includes('pottery') || rawN.includes('bedding') || rawN.includes('cushion') || rawN.includes('furniture')) return 'home';
    if (rawN.includes('perfume') || rawN.includes('oud') || rawN.includes('attar') || rawN.includes('fragrance') || rawN.includes('scent')) return 'perfume';
    if (rawN.includes('watch') || rawN.includes('timepiece') || rawN.includes('chronograph')) return 'watches';
    if (rawN.includes('eyewear') || rawN.includes('sunglass') || rawN.includes('optic') || rawN.includes('lens')) return 'eyewear';
    if (rawN.includes('hair')) return 'haircare';
    if (rawN.includes('makeup') || rawN.includes('cosmetic')) return 'makeup';
    if (rawN.includes('baby') || rawN.includes('kid')) return 'baby';
    if (rawN.includes('fitness') || rawN.includes('yoga') || rawN.includes('gym') || rawN.includes('sport')) return 'fitness';
    if (rawN.includes('stationery') || rawN.includes('journal') || rawN.includes('notebook') || rawN.includes('planner')) return 'stationery';
    if (rawN.includes('skin') || rawN.includes('beauty')) return 'skincare';
    if (rawN.includes('bag') || rawN.includes('clutch') || rawN.includes('leather')) return 'handbags';
    if (rawN.includes('jewel') || rawN.includes('silver') || rawN.includes('gold')) return 'jewelry';
    if (rawN.includes('gaming') || rawN.includes('gamer')) return 'gaming';
    if (rawN.includes('coffee') || rawN.includes('tea') || rawN.includes('food') || rawN.includes('bakery') || rawN.includes('chocolate')) return 'food';
    if (rawN.includes('plant') || rawN.includes('nature')) return 'nature';
    if (rawN.includes('wedding') || rawN.includes('bridal')) return 'wedding';
    if (rawN.includes('tech') || rawN.includes('audio') || rawN.includes('phone') || rawN.includes('gadget')) return 'tech';
    if (rawN.includes('cloth') || rawN.includes('pret') || rawN.includes('apparel') || rawN.includes('fashion') || rawN.includes('streetwear') || rawN.includes('hoodie')) return 'clothing';
  }

  // 2. High priority keyword checks in combined text
  // Footwear & Shoes
  if (/\b(shoe|shoes|footwear|sneaker|sneakers|jogger|joggers|kicks|boot|boots|trainer|trainers|loafer|loafers|oxford|oxfords|heels|sandals|jootay|joota|chappal)\b/i.test(combined)) {
    return 'footwear';
  }

  // Home Decor, Living & Furniture
  if (/\b(home|decor|living|furniture|interior|candle|candles|scented candle|vase|vases|ceramic|ceramics|pottery|bedding|linen|cushion|cushions|quilt|rug|rugs|sofa|tableware|kitchen|cookware|mugs|mug|diffuser)\b/i.test(combined)) {
    return 'home';
  }

  // Perfume, Fragrances & Oud
  if (/\b(perfume|perfumes|fragrance|fragrances|scent|scents|oud|attar|itr|khushbu|khushboo|cologne|parfum|edp|eau de parfum)\b/i.test(combined)) {
    return 'perfume';
  }

  // Watches, Luxury Horology & Timepieces
  if (/\b(watch|watches|wristwatch|wristwatches|timepiece|timepieces|chronograph|chronometer|horology|automatic watch|quartz watch|dial|bezel|rolex|patek|audemars|omega|tissot|casio|seiko|rado|tag heuer|hublot|ghari|ghariyan|ghadi)\b/i.test(combined)) {
    return 'watches';
  }

  // Eyewear, Sunglasses & Optical Frames
  if (/\b(sunglass|sunglasses|eyewear|glasses|shades|spectacles|goggles|aviator|wayfarer|optic|optics|optical|lens|lenses|frame|frames|sunnies|chashma|chashmay|chashme|dhup|dhoop)\b/i.test(combined)) {
    return 'eyewear';
  }

  // Handbags & Leather Goods
  if (/\b(handbag|handbags|bag|bags|purse|purses|clutch|clutches|tote|crossbody|backpack|wallet|wallets|satchel)\b/i.test(combined)) {
    return 'handbags';
  }

  // Jewelry & Ornaments
  if (/\b(jewel|jewelry|jewellery|ring|rings|necklace|necklaces|earring|earrings|gold|silver|bracelet|bracelets|bangles|jhumka|jhumkay|chain|choker|pendant|pendants|zirconia)\b/i.test(combined)) {
    return 'jewelry';
  }

  // Skincare & Dermacare
  if (/\b(skin|skincare|serum|serums|cream|lotion|derma|dermacare|glow|sunscreen|moisturizer|face wash|toner|hyaluronic|niacinamide)\b/i.test(combined)) {
    return 'skincare';
  }

  // Haircare & Scalp
  if (/\b(hair|haircare|shampoo|conditioner|hair oil|scalp|biotin|keratin|hair mask)\b/i.test(combined)) {
    return 'haircare';
  }

  // Makeup & Cosmetics
  if (/\b(makeup|make-up|cosmetic|cosmetics|lipstick|lipsticks|lip tint|lip gloss|foundation|eyeliner|blush|mascara)\b/i.test(combined)) {
    return 'makeup';
  }

  // Fitness & Activewear
  if (/\b(fitness|gym|workout|activewear|sport|sports|athletic|yoga|pilates|compression|exercise|leggings|crossfit)\b/i.test(combined)) {
    return 'fitness';
  }

  // Baby & Kids
  if (/\b(baby|babies|kid|kids|infant|toddler|toddlers|children|toy|toys|onesie|onesies|romper|swaddle|nursery|montessori)\b/i.test(combined)) {
    return 'baby';
  }

  // Stationery, Books & Planners
  if (/\b(stationery|notebook|notebooks|journal|journals|planner|planners|pen|pens|fountain pen|diary|calligraphy|paper)\b/i.test(combined)) {
    return 'stationery';
  }

  // Gaming
  if (/\b(gaming|gamer|games|game|rgb|battlestation|console|streamer|gpu|pc build|setup|joystick|gamepad|mechanical keyboard|gaming mouse)\b/i.test(combined) && !/\b(nature|plant|dress|kurta|lawn)\b/i.test(combined)) {
    return 'gaming';
  }

  // Tech, Mobile & Electronics
  if (/\b(tech|technology|phone|phones|mobile|gadget|gadgets|smartwatch|electronic|electronics|laptop|earbuds|charger|chargers|headphones|airpods)\b/i.test(combined)) {
    return 'tech';
  }

  // Food, Coffee & Gourmet
  if (/\b(coffee|tea|chai|food|cake|cakes|sweet|sweets|mithai|chocolate|chocolates|bakery|beans|cafe|roast|honey|spices|snack|snacks)\b/i.test(combined)) {
    return 'food';
  }

  // Wedding & Bridal
  if (/\b(wedding|bridal|shaadi|shadi|dulhan|groom|bride|marriage|mehndi|nikkah|barat|walima|valima|favor|favors|shagun)\b/i.test(combined)) {
    return 'wedding';
  }

  // Nature, Plants & Gardening
  if (/\b(nature|grass|plant|plants|flora|green|greens|garden|gardening|indoor plant|herbal|succulent|succulents|botanical|turf|greenery)\b/i.test(combined)) {
    return 'nature';
  }

  // Clothing & Apparel (broad catch)
  if (/\b(cloth|clothes|clothing|dress|dresses|fashion|wear|hoodie|hoodies|kurta|kurtas|suit|suits|apparel|kapray|shirt|shirts|pret|lawn|chiffon|abaya|abayas|hijab|hijabs|shawl|shawls|trousers|co-ord)\b/i.test(combined)) {
    return 'clothing';
  }

  return 'clothing';
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
  const p = prompt.trim();
  const cleanPrompt = p.replace(/^welcome\s+to\s+/i, '').trim();

  // If prompt is a brand name (e.g. "CasCharm", "Cas Charm", "Urban Velvet")
  if (/^[A-Za-z0-9\s&'-]{2,35}$/.test(cleanPrompt) && !/\b(store|shop|selling|delivery|pakistan|online|cash|products|accessories|boutique)\b/i.test(cleanPrompt)) {
    return cleanPrompt;
  }

  // Check if prompt specifically mentions a name (e.g. "called Noor", "name is CasCharm", "store CasCharm")
  const namedMatch = cleanPrompt.match(/(?:called|named|name is|title is|store name is|brand is|store name:|brand:)\s+["']?([A-Za-z0-9&'-]+(?:\s+[A-Za-z0-9&'-]+){0,3})["']?(?:\s+(?:with|for|in|offering|specializing|featuring|selling|providing|and|pk|pakistan|\.|\,|$)|$)/i);
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
    food: ['Artisan Brew Bar', 'Velvet Bean Roasters', 'Sweet Praline Co.', 'Roast & Sip Co.'],
    home: ['Haven Living Atelier', 'Artisan Nest Decor', 'Velvet Hearth Living', 'Aura Terra Home'],
    watches: ['Chrono Luxe Timepieces', 'Vanguard Horology Atelier', 'Aura Chronograph Co.', 'Apex Timepieces Studio'],
    eyewear: ['Vanguard Optics', 'Solstice Eyewear Co.', 'Aura Polarized Studio', 'Luxe Frames Atelier'],
    fitness: ['Apex Pulse Activewear', 'Aura Velocity Fitness', 'Stride Form Athletic', 'Iron & Zen Co.'],
    baby: ['Little Nest Organics', 'Bloom Baby Atelier', 'Tiny Sprout Co.', 'Aura Sweet Tots'],
    stationery: ['Paper & Quill Atelier', 'Artisan Notebook Co.', 'Velvet Script Stationery', 'Focus Page Studio'],
    makeup: ['Velvet Aura Cosmetics', 'Lumiere Beauty Studio', 'Aura Bloom Cosmetics', 'Chic Glow Atelier'],
    haircare: ['Botanica Strand Studio', 'Aura Crown Haircare', 'Luxe Scalp & Strand', 'Silk Follicle Atelier']
  };

  const pool = nicheNames[niche] || nicheNames.clothing;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Intelligent AI Store Generator from Prompt
 */
export async function generateStoreFromPrompt(options: {
  prompt: string;
  niche?: string;
  plan?: 'free' | 'pro' | 'advanced';
  selectedTheme?: string;
  customStoreName?: string;
  whatsappNumber?: string;
  ownerEmail?: string;
  socialLinks?: Partial<Record<'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x', string>>;
}): Promise<GeneratedStore> {
  const { prompt, niche: explicitNiche, plan = 'free', selectedTheme, customStoreName, whatsappNumber, ownerEmail, socialLinks = {} } = options;

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

  const niche = detectNiche(prompt, explicitNiche, customStoreName);
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

  const rawFinalName = (customStoreName && customStoreName.trim().length > 1) 
    ? customStoreName.trim() 
    : extractStoreName(prompt, niche);
  const finalName = rawFinalName.replace(/^welcome\s+to\s+/i, '').trim() || rawFinalName;

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
    wedding: 'Exquisite bridal accessories, royal wedding favor boxes, and handcrafted traditional keepsakes for your special moments.',
    home: 'Artisanal soy candles, handcrafted ceramic homeware, and cozy natural decor curated for peaceful living.',
    watches: 'Precision automatic timepieces, luxury chronographs, and timeless artisan wristwatches crafted for distinction.',
    eyewear: 'Polarized precision sunglasses, UV400 lenses, and blue-light optical frames built for modern elegance.',
    fitness: 'High-performance squat-proof activewear, insulated hydration gear, and recovery essentials for every athlete.',
    baby: 'Pure organic cotton essentials, non-toxic wooden Montessori toys, and soothing swaddles for your little ones.',
    stationery: 'Bleedproof 160gsm journals, structured daily planners, and executive pens engineered for peak creativity.',
    makeup: 'Clean buildable cosmetics, velvety lip stains, and weightless glowing pigments crafted for natural radiant beauty.',
    haircare: 'Botanical scalp therapies, sulfate-free cleansers, and intense argan masks for radiant, healthy bounce.'
  };

  const tagline = taglines[niche] || 'Exquisite quality products handcrafted with passion and delivered swiftly to your doorstep.';
  const header_title = `Welcome to ${finalName}`;
  const description = `${finalName} brings you curated premium ${niche} collections. Designed with precision, tested for excellence, and packaged for perfection.`;

  // User explicitly requested: AI must NOT generate products into the store catalog at creation.
  // The store is created with available product slots (e.g. 20 slots on Basic, 75 on Pro, 100 on Business),
  // and the merchant adds their authentic products personally from the Merchant Dashboard.
  const categories: string[] = nicheData.categories || [];
  const products: GeneratedProduct[] = [];



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
