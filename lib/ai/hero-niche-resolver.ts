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
  | 'general';

export interface StoreHeroInfo {
  niche: StoreNiche;
  heroImage: string;
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
    badge: string;
    defaultTagline: string;
    altText: string;
  }
> = {
  nature: {
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=85',
    badge: 'Pure Organic • Botanical Living',
    defaultTagline: 'Lush indoor plants, organic botanicals, and handcrafted natural essentials for healthy living.',
    altText: 'Organic Botanical Nature and Plants Collection',
  },
  handbags: {
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
    badge: 'Luxury Velvet • Designer Handbags',
    defaultTagline: 'Handcrafted luxury velvet clutches, structured leather totes, and elegant evening purses.',
    altText: 'Designer Handbags, Purses, and Velvet Clutches',
  },
  jewelry: {
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=85',
    badge: 'Handcrafted Luxury • Fine Jewelry',
    defaultTagline: 'Handcrafted luxury jewelry and 18K gold-plated keepsakes designed to shine on every occasion.',
    altText: 'Handcrafted Luxury Gold and Silver Jewelry',
  },
  perfume: {
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85',
    badge: 'Signature Scents • Artisanal Fragrances',
    defaultTagline: 'Captivating artisanal fragrances and pure concentrated attars crafted for unforgettable impressions.',
    altText: 'Signature Luxury Fragrance Collection',
  },
  footwear: {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
    badge: 'Performance Footwear • Modern Collection',
    defaultTagline: 'Step into style and comfort with our latest collection. Handcrafted for endurance and everyday lifestyle.',
    altText: 'Performance Footwear and Sneakers',
  },
  clothing: {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
    badge: 'Designer Pret • Modern Apparel',
    defaultTagline: 'Modern silhouettes, luxury festive fabrics, and timeless handcrafted essentials tailored for you.',
    altText: 'Designer Pret and Modern Fashion Collection',
  },
  skincare: {
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=85',
    badge: 'Pure Botanicals • Radiant Skincare',
    defaultTagline: 'Clinically balanced, botanical-infused skin nutrition for natural radiant glow every single day.',
    altText: 'Pure Botanical Skincare and Beauty',
  },
  tech: {
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85',
    badge: 'Premium Electronics • Audio & Wearables',
    defaultTagline: 'Cutting-edge smart wearables, precision acoustics, and premium workstation essentials.',
    altText: 'Next-Gen Smart Tech and Wireless Acoustics',
  },
  food: {
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85',
    badge: 'Artisan Gourmet • Handcrafted Beans',
    defaultTagline: 'Freshly roasted single-origin specialty coffees, hand-poured beans, and gourmet artisan treats.',
    altText: 'Specialty Artisan Brews and Gourmet Treats',
  },
  wedding: {
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85',
    badge: 'Bridal Couture • Royal Wedding Keepsakes',
    defaultTagline: 'Exquisite bridal accessories, royal wedding favor boxes, and handcrafted traditional keepsakes.',
    altText: 'Luxury Bridal and Wedding Collection',
  },
  general: {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85',
    badge: 'Official Store • Verified Collection',
    defaultTagline: 'Handcrafted essentials and premium curated catalog delivered directly to your doorstep.',
    altText: 'Curated Premium Store Collection',
  },
};

/**
 * Detect store niche from name, tagline, description and products
 */
export function detectStoreNiche(
  store?: { name?: string | null; tagline?: string | null; description?: string | null },
  products?: Array<{ name?: string | null; category?: string | null; category_name?: string | null; description?: string | null }>
): StoreNiche {
  const combined = [
    store?.name || '',
    store?.tagline || '',
    store?.description || '',
    ...(products || []).map((p) => `${p.name || ''} ${(p as any).category || (p as any).category_name || ''} ${p.description || ''}`)
  ].join(' ').toLowerCase();

  // 1. Nature / Plants / Organic Greens (High Priority)
  if (/\b(nature|grass|plant|plants|flora|green|greens|garden|gardening|indoor plant|herbal|succulent|botanical|organic tea|nursery|lawn)\b/i.test(combined)) {
    return 'nature';
  }

  // 2. Handbags / Clutches / Purses / Leather Bags (High Priority)
  if (/\b(handbag|handbags|hanbags|bag|bags|purse|purses|clutch|clutches|tote|crossbody|backpack|wallet|wallets)\b/i.test(combined)) {
    return 'handbags';
  }

  // 3. Jewelry (Checked before wedding so jewelry is never confused with wedding bride & groom)
  if (/\b(jewel|jewelry|jewellery|ring|rings|necklace|necklaces|earring|earrings|jhumka|jhumkay|gold|silver|zircon|diamond|pendant|pendants|bracelet|bangle|bangles|choker|chokers)\b/i.test(combined)) {
    return 'jewelry';
  }

  // 4. Shoes / Footwear
  if (/\b(shoe|shoes|footwear|sneaker|sneakers|kicks|jogger|joggers|boots|sandals|heels|loafers|slides|chappal)\b/i.test(combined)) {
    return 'footwear';
  }

  // 5. Perfume & Fragrances
  if (/\b(perfume|perfumes|fragrance|fragrances|attar|scent|scents|oud|cologne|eau de|itr|khus|amber)\b/i.test(combined)) {
    return 'perfume';
  }

  // 6. Skincare & Cosmetics
  if (/\b(skin|skincare|serum|serums|lotion|cream|creams|beauty|sunscreen|spf|toner|cleanser|moisturizer|acne|glow|dermal)\b/i.test(combined)) {
    return 'skincare';
  }

  // 7. Tech & Electronics
  if (/\b(tech|gadget|gadgets|electronics|headphone|headphones|earbuds|smartwatch|watch|bluetooth|keyboard|mouse|laptop|charger|audio|magsafe)\b/i.test(combined)) {
    return 'tech';
  }

  // 8. Food, Coffee & Bakery
  if (/\b(coffee|tea|cafe|bean|beans|roast|espresso|bakery|cake|cakes|sweet|sweets|food|chocolate|truffle|beverage|snack)\b/i.test(combined)) {
    return 'food';
  }

  // 9. Wedding Couture & Bridal Services (Strict wedding events)
  if (/\b(wedding|bridal|shaadi|shadi|dulhan|groom|bride|marriage|mehndi|nikkah|barat|walima|valima|favor box|shagun)\b/i.test(combined)) {
    return 'wedding';
  }

  // 10. Clothing & Fashion
  if (/\b(cloth|clothes|clothing|dress|dresses|apparel|fashion|pret|kurta|kurtas|suit|suits|hoodie|hoodies|t-shirt|shirt|shirts|trouser|jeans|wear|outfit|chiffon|silk|lawn)\b/i.test(combined)) {
    return 'clothing';
  }

  return 'clothing'; // default fallback for boutique e-commerce
}

/**
 * Resolves complete hero presentation details tailored to the store's concept
 */
export function resolveStoreHero(
  store: { name?: string | null; tagline?: string | null; description?: string | null },
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
    headlineMain = 'Official';
    headlineHighlight = 'Store';
  }

  const subtext = (store.tagline || store.description || asset.defaultTagline).trim();

  return {
    niche,
    heroImage: finalHeroImage,
    badge: asset.badge,
    headlineMain,
    headlineHighlight,
    subtext,
    altText: `${storeName || 'Store'} - ${asset.altText}`,
  };
}
