export type StoreNiche =
  | 'nature'
  | 'handbags'
  | 'jewelry'
  | 'perfume'
  | 'footwear'
  | 'skincare'
  | 'tech'
  | 'food'
  | 'clothing'
  | 'wedding'
  | 'gaming'
  | 'watches'
  | 'home'
  | 'eyewear'
  | 'fitness'
  | 'baby'
  | 'stationery'
  | 'makeup'
  | 'haircare'
  | 'general';

export interface StoreHeroInfo {
  niche: StoreNiche;
  heroImage: string;
  secondaryHeroImage: string;
  tertiaryHeroImage: string;
  badge: string;
  headlineMain: string;
  headlineHighlight: string;
  subtext: string;
  altText: string;
}

const NICHE_HERO_ASSETS: Record<
  StoreNiche,
  {
    image: string;
    secondaryImage: string;
    tertiaryImage: string;
    badge: string;
    defaultTagline: string;
    altText: string;
  }
> = {
  watches: {
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80',
    badge: 'Luxury Horology • Precision Timepieces',
    defaultTagline: 'Exquisite chronographs, automatic movements, and timeless luxury wristwatches crafted for distinction.',
    altText: 'Luxury Chronographs & Precision Timepieces Collection',
  },
  home: {
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    badge: 'Artisan Living • Cozy Homeware',
    defaultTagline: 'Artisanal soy candles, handcrafted ceramic tableware, and cozy natural decor curated for peaceful living.',
    altText: 'Artisanal Homeware and Cozy Modern Living Collection',
  },
  eyewear: {
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
    badge: 'Polarized Eyewear • Optical Frames',
    defaultTagline: 'Precision polarized sunglasses, UV400 lenses, and blue-light optical frames designed for modern style.',
    altText: 'Polarized Sunglasses and Optical Frames Collection',
  },
  fitness: {
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
    badge: 'Performance Activewear • Gym & Yoga',
    defaultTagline: 'Squat-proof compression sets, hydration gear, and ergonomic fitness essentials for every athlete.',
    altText: 'High Performance Fitness and Activewear Gear',
  },
  baby: {
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80',
    badge: 'Organic Baby Care • Montessori Toys',
    defaultTagline: 'Pure organic cotton rompers, non-toxic wooden Montessori toys, and soothing muslin swaddles for your little ones.',
    altText: 'Organic Baby Apparel and Educational Toys Collection',
  },
  stationery: {
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
    badge: 'Artisan Stationery • Planners & Journals',
    defaultTagline: 'Bleedproof 160gsm journals, structured daily planners, and executive pens engineered for peak creativity.',
    altText: 'Bespoke Journals, Planners & Fine Stationery Collection',
  },
  makeup: {
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    badge: 'Clean Cosmetics • Velvety Pigments',
    defaultTagline: 'Clean buildable cosmetics, velvety lip stains, and weightless glowing pigments crafted for natural radiant beauty.',
    altText: 'Luxury Cosmetics, Palettes and Lip Stains Collection',
  },
  haircare: {
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
    badge: 'Botanical Hair Therapy • Scalp Nutrition',
    defaultTagline: 'Botanical scalp therapies, sulfate-free cleansers, and intense argan masks for radiant, healthy bounce.',
    altText: 'Organic Hair Nutrition and Salon Treatments Collection',
  },
  gaming: {
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=800&q=80',
    badge: 'Pro Battlestation • RGB Gaming Gear',
    defaultTagline: 'Engineered for champions. Ultra-responsive mechanical keyboards, precision mice, and immersive audio gear.',
    altText: 'Pro RGB Gaming Gear & Battlestation Setup',
  },
  nature: {
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
    badge: 'Pure Organic • Botanical Living',
    defaultTagline: 'Lush indoor plants, organic botanicals, and handcrafted natural essentials for healthy living.',
    altText: 'Organic Botanical Nature and Plants Collection',
  },
  handbags: {
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    badge: 'Luxury Velvet • Designer Handbags',
    defaultTagline: 'Handcrafted luxury velvet clutches, structured leather totes, and elegant evening purses.',
    altText: 'Designer Handbags, Purses, and Velvet Clutches',
  },
  jewelry: {
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    badge: 'Handcrafted Luxury • Fine Jewelry',
    defaultTagline: 'Handcrafted luxury jewelry and 18K gold-plated keepsakes designed to shine on every occasion.',
    altText: 'Handcrafted Luxury Gold and Silver Jewelry',
  },
  perfume: {
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    badge: 'Signature Scents • Artisanal Fragrances',
    defaultTagline: 'Captivating artisanal fragrances and pure concentrated attars crafted for unforgettable impressions.',
    altText: 'Signature Luxury Fragrance Collection',
  },
  footwear: {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80',
    badge: 'Performance Footwear • Modern Collection',
    defaultTagline: 'Step into style and comfort with our latest collection. Handcrafted for endurance and everyday lifestyle.',
    altText: 'Performance Footwear and Sneakers',
  },
  clothing: {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    badge: 'Designer Pret • Modern Apparel',
    defaultTagline: 'Modern silhouettes, luxury festive fabrics, and timeless handcrafted essentials tailored for you.',
    altText: 'Designer Pret and Modern Fashion Collection',
  },
  skincare: {
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1608248597359-5f212879555c?auto=format&fit=crop&w=800&q=80',
    badge: 'Pure Botanicals • Radiant Skincare',
    defaultTagline: 'Clinically balanced, botanical-infused skin nutrition for natural radiant glow every single day.',
    altText: 'Pure Botanical Skincare and Beauty',
  },
  tech: {
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=800&q=80',
    badge: 'Premium Electronics • Audio & Wearables',
    defaultTagline: 'Cutting-edge smart wearables, precision acoustics, and premium workstation essentials.',
    altText: 'Next-Gen Smart Tech and Wireless Acoustics',
  },
  food: {
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80',
    badge: 'Artisan Gourmet • Handcrafted Beans',
    defaultTagline: 'Freshly roasted single-origin specialty coffees, hand-poured beans, and gourmet artisan treats.',
    altText: 'Specialty Artisan Brews and Gourmet Treats',
  },
  wedding: {
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80',
    badge: 'Bridal Couture • Royal Wedding Keepsakes',
    defaultTagline: 'Exquisite bridal accessories, royal wedding favor boxes, and handcrafted traditional keepsakes.',
    altText: 'Luxury Bridal and Wedding Collection',
  },
  general: {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85',
    secondaryImage: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
    tertiaryImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80',
    badge: 'Official Store • Verified Collection',
    defaultTagline: 'Handcrafted essentials and premium curated catalog delivered directly to your doorstep.',
    altText: 'Curated Premium Store Collection',
  },
};

/**
 * Detect store niche from name, tagline, description and products
 */
export function detectStoreNiche(
  store?: { name?: string | null; tagline?: string | null; description?: string | null; niche?: string | null; selected_niche?: string | null },
  products?: Array<{ name?: string | null; category?: string | null; category_name?: string | null; description?: string | null }>
): StoreNiche {
  // 1. Direct explicit niche matching
  const explicit = (store?.niche || store?.selected_niche || '').toLowerCase().trim();
  if (explicit) {
    if (explicit.includes('watch') || explicit.includes('timepiece') || explicit.includes('chronograph')) return 'watches';
    if (explicit.includes('home') || explicit.includes('decor') || explicit.includes('candle') || explicit.includes('furniture')) return 'home';
    if (explicit.includes('eyewear') || explicit.includes('sunglass') || explicit.includes('glasses') || explicit.includes('optic') || explicit.includes('lens')) return 'eyewear';
    if (explicit.includes('fitness') || explicit.includes('gym') || explicit.includes('yoga') || explicit.includes('workout')) return 'fitness';
    if (explicit.includes('baby') || explicit.includes('kid') || explicit.includes('toy')) return 'baby';
    if (explicit.includes('stationery') || explicit.includes('journal') || explicit.includes('planner') || explicit.includes('book')) return 'stationery';
    if (explicit.includes('makeup') || explicit.includes('cosmetic') || explicit.includes('lipstick')) return 'makeup';
    if (explicit.includes('hair') || explicit.includes('scalp')) return 'haircare';
    if (explicit.includes('footwear') || explicit.includes('shoe') || explicit.includes('sneaker') || explicit.includes('kicks')) return 'footwear';
    if (explicit.includes('bag') || explicit.includes('clutch') || explicit.includes('purse')) return 'handbags';
    if (explicit.includes('jewel') || explicit.includes('gold') || explicit.includes('silver')) return 'jewelry';
    if (explicit.includes('perfume') || explicit.includes('fragrance') || explicit.includes('oud') || explicit.includes('attar')) return 'perfume';
    if (explicit.includes('skin') || explicit.includes('serum') || explicit.includes('beauty')) return 'skincare';
    if (explicit.includes('gaming') || explicit.includes('esports')) return 'gaming';
    if (explicit.includes('food') || explicit.includes('coffee') || explicit.includes('tea') || explicit.includes('bakery')) return 'food';
    if (explicit.includes('wedding') || explicit.includes('bridal')) return 'wedding';
    if (explicit.includes('nature') || explicit.includes('plant')) return 'nature';
    if (explicit.includes('tech') || explicit.includes('gadget') || explicit.includes('electronics')) return 'tech';
    if (explicit.includes('cloth') || explicit.includes('fashion') || explicit.includes('apparel') || explicit.includes('pret')) return 'clothing';
  }

  const combined = [
    store?.name || '',
    store?.tagline || '',
    store?.description || '',
    ...(products || []).map((p) => `${p.name || ''} ${(p as any).category || (p as any).category_name || ''} ${p.description || ''}`)
  ].join(' ').toLowerCase();

  // 1. Watches, Luxury Horology & Timepieces (High priority before tech & eyewear)
  if (/\b(watch|watches|wristwatch|wristwatches|timepiece|timepieces|chronograph|chronometer|horology|automatic watch|quartz watch|dial|bezel|rolex|patek|audemars|omega|tissot|casio|seiko|rado|tag heuer|hublot|ghari|ghariyan|ghadi)\b/i.test(combined)) {
    return 'watches';
  }

  // 2. Home Decor, Candles & Living
  if (/\b(home|decor|living|furniture|interior|candle|candles|scented candle|vase|vases|ceramic|ceramics|pottery|bedding|linen|cushion|cushions|quilt|rug|rugs|sofa|tableware|kitchen|cookware|mugs|mug|diffuser)\b/i.test(combined)) {
    return 'home';
  }

  // 3. Eyewear & Sunglasses
  if (/\b(eyewear|sunglass|sunglasses|glasses|shades|spectacles|goggles|aviator|wayfarer|optic|optics|optical|lens|lenses|frame|frames|sunnies|optical frames|anti blue light)\b/i.test(combined)) {
    return 'eyewear';
  }

  // 4. Fitness, Gym & Activewear
  if (/\b(fitness|gym|workout|activewear|sport|sports|athletic|yoga|pilates|compression|exercise|leggings|crossfit)\b/i.test(combined)) {
    return 'fitness';
  }

  // 5. Baby & Kids
  if (/\b(baby|babies|kid|kids|infant|toddler|toddlers|children|toy|toys|onesie|onesies|romper|swaddle|nursery|montessori)\b/i.test(combined)) {
    return 'baby';
  }

  // 6. Stationery, Books & Planners
  if (/\b(stationery|notebook|notebooks|journal|journals|planner|planners|pen|pens|fountain pen|diary|calligraphy|paper)\b/i.test(combined)) {
    return 'stationery';
  }

  // 7. Makeup & Cosmetics
  if (/\b(makeup|make-up|cosmetic|cosmetics|lipstick|lipsticks|lip tint|lip gloss|foundation|eyeliner|blush|mascara)\b/i.test(combined)) {
    return 'makeup';
  }

  // 8. Haircare & Scalp
  if (/\b(hair|haircare|shampoo|conditioner|hair oil|scalp|biotin|keratin|hair mask)\b/i.test(combined)) {
    return 'haircare';
  }

  // 9. Gaming / RGB / Mechanical Keyboards / Setup
  if (/\b(gaming|gamer|games|game|rgb|battlestation|console|streamer|gpu|pc build|setup|joystick|gamepad|mechanical keyboard|gaming mouse)\b/i.test(combined) && !/\b(nature|plant|dress|kurta|lawn)\b/i.test(combined)) {
    return 'gaming';
  }

  // 10. Nature / Plants / Organic Greens
  if (/\b(nature|grass|plant|plants|flora|green|greens|garden|gardening|indoor plant|herbal|succulent|botanical|organic tea|nursery|lawn)\b/i.test(combined)) {
    return 'nature';
  }

  // 11. Handbags / Clutches / Purses / Leather Bags
  if (/\b(handbag|handbags|hanbags|bag|bags|purse|purses|clutch|clutches|tote|crossbody|backpack|wallet|wallets)\b/i.test(combined)) {
    return 'handbags';
  }

  // 12. Jewelry (Checked before wedding)
  if (/\b(jewel|jewelry|jewellery|ring|rings|necklace|necklaces|earring|earrings|jhumka|jhumkay|gold|silver|zircon|diamond|pendant|pendants|bracelet|bangle|bangles|choker|chokers)\b/i.test(combined)) {
    return 'jewelry';
  }

  // 13. Shoes / Footwear
  if (/\b(shoe|shoes|footwear|sneaker|sneakers|kicks|jogger|joggers|boots|sandals|heels|loafers|slides|chappal|jootay|joota)\b/i.test(combined)) {
    return 'footwear';
  }

  // 14. Perfume & Fragrances
  if (/\b(perfume|perfumes|fragrance|fragrances|attar|attars|scent|scents|oud|cologne|parfum|edp|eau de|itr|khus|amber|musk|khushboo|khushbu)\b/i.test(combined)) {
    return 'perfume';
  }

  // 15. Skincare & Cosmetics
  if (/\b(skin|skincare|serum|serums|lotion|cream|creams|beauty|sunscreen|spf|toner|cleanser|moisturizer|acne|glow|dermal)\b/i.test(combined)) {
    return 'skincare';
  }

  // 16. Tech & Electronics (Without watch, so watch is always caught by watches)
  if (/\b(tech|gadget|gadgets|electronics|headphone|headphones|earbuds|smartwatch|bluetooth|keyboard|mouse|laptop|charger|audio|magsafe|airpods|speaker|speakers)\b/i.test(combined)) {
    return 'tech';
  }

  // 17. Food, Coffee & Bakery
  if (/\b(coffee|tea|cafe|bean|beans|roast|espresso|bakery|cake|cakes|sweet|sweets|food|chocolate|truffle|beverage|snack|mithai|chai)\b/i.test(combined)) {
    return 'food';
  }

  // 18. Wedding Couture & Bridal Services
  if (/\b(wedding|bridal|shaadi|shadi|dulhan|groom|bride|marriage|mehndi|nikkah|barat|walima|valima|favor box|shagun)\b/i.test(combined)) {
    return 'wedding';
  }

  // 19. Clothing & Fashion
  if (/\b(cloth|clothes|clothing|dress|dresses|apparel|fashion|pret|kurta|kurtas|suit|suits|hoodie|hoodies|t-shirt|shirt|shirts|trouser|jeans|wear|outfit|chiffon|silk|lawn|kapray|kapra)\b/i.test(combined)) {
    return 'clothing';
  }

  return 'clothing'; // default fallback for boutique e-commerce
}

/**
 * Resolves complete hero presentation details tailored to the store's concept
 */
export function resolveStoreHero(
  store: { name?: string | null; tagline?: string | null; description?: string | null; niche?: string | null; selected_niche?: string | null },
  products: Array<{ name?: string | null; category?: string | null; category_name?: string | null; description?: string | null; image_url?: string | null }> = []
): StoreHeroInfo {
  const niche = detectStoreNiche(store, products);
  const asset = NICHE_HERO_ASSETS[niche] || NICHE_HERO_ASSETS.clothing;

  // Check if first product has a primary image that is valid
  let finalHeroImage = asset.image;
  const firstProdImg = products[0]?.image_url?.split(',')[0]?.trim();
  if (firstProdImg && /^https?:\/\//i.test(firstProdImg)) {
    // If store is not footwear, make sure we never show the fallback sneaker
    if (niche !== 'footwear' && firstProdImg.includes('1600185365483-26d7a4cc7519')) {
      finalHeroImage = asset.image;
    } else {
      finalHeroImage = firstProdImg;
    }
  }

  // Check if second product has a secondary image that is valid
  let secondaryHeroImage = asset.secondaryImage;
  const secondProdImg = products[1]?.image_url?.split(',')[0]?.trim();
  if (secondProdImg && /^https?:\/\//i.test(secondProdImg) && secondProdImg !== finalHeroImage) {
    if (niche !== 'footwear' && secondProdImg.includes('1600185365483-26d7a4cc7519')) {
      secondaryHeroImage = asset.secondaryImage;
    } else {
      secondaryHeroImage = secondProdImg;
    }
  }

  // Check if third product has a tertiary image that is valid
  let tertiaryHeroImage = asset.tertiaryImage;
  const thirdProdImg = products[2]?.image_url?.split(',')[0]?.trim();
  if (thirdProdImg && /^https?:\/\//i.test(thirdProdImg) && thirdProdImg !== finalHeroImage && thirdProdImg !== secondaryHeroImage) {
    if (niche !== 'footwear' && thirdProdImg.includes('1600185365483-26d7a4cc7519')) {
      tertiaryHeroImage = asset.tertiaryImage;
    } else {
      tertiaryHeroImage = thirdProdImg;
    }
  }

  // Format title into main + highlight
  const storeName = (store.name || '').trim();
  let headlineMain = storeName;
  let headlineHighlight = '';

  if (storeName) {
    const parts = storeName.split(/\s+/);
    if (parts.length > 1) {
      headlineHighlight = parts.pop()!;
      headlineMain = parts.join(' ');
    } else {
      headlineMain = storeName;
      headlineHighlight = '';
    }
  } else {
    headlineMain = 'Featured';
    headlineHighlight = 'Collection';
  }

  const subtext = (store.tagline || store.description || asset.defaultTagline).trim();

  return {
    niche,
    heroImage: finalHeroImage,
    secondaryHeroImage,
    tertiaryHeroImage,
    badge: asset.badge,
    headlineMain,
    headlineHighlight,
    subtext,
    altText: `${storeName || 'Store'} - ${asset.altText}`,
  };
}
