export type StoreNiche =
  | 'wedding'
  | 'perfume'
  | 'clothing'
  | 'skincare'
  | 'jewelry'
  | 'tech'
  | 'food'
  | 'footwear'
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
  wedding: {
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    badge: '✨ Luxury Bridal • Royal Couture',
    defaultTagline: 'Exquisite bridal accessories, royal wedding favor boxes, and handcrafted traditional keepsakes.',
    altText: 'Luxury Bridal and Wedding Collection',
  },
  perfume: {
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    badge: '✨ Signature Scents • Pure Oud & Attar',
    defaultTagline: 'Captivating artisanal fragrances and pure concentrated attars crafted for unforgettable impressions.',
    altText: 'Signature Luxury Fragrance Collection',
  },
  clothing: {
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    badge: '✨ Designer Pret • Modern Fashion',
    defaultTagline: 'Modern silhouettes, luxury festive fabrics, and timeless handcrafted essentials tailored for you.',
    altText: 'Designer Pret and Modern Fashion Collection',
  },
  skincare: {
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    badge: '✨ Pure Botanicals • Radiant Glow',
    defaultTagline: 'Clinically balanced, botanical-infused skin nutrition for natural radiant glow every single day.',
    altText: 'Pure Botanical Skincare and Beauty',
  },
  jewelry: {
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    badge: '✨ Handcrafted Luxury • Pure 22k Gold',
    defaultTagline: 'Handcrafted luxury jewelry and 18K gold-plated keepsakes designed to shine on every occasion.',
    altText: 'Handcrafted Luxury Gold and Silver Jewelry',
  },
  tech: {
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    badge: '✨ Smart Innovation • Next-Gen Gear',
    defaultTagline: 'Cutting-edge smart wearables, precision acoustics, and premium workstation essentials.',
    altText: 'Next-Gen Smart Tech and Wireless Acoustics',
  },
  food: {
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    badge: '✨ Artisan Brews • Gourmet Fresh',
    defaultTagline: 'Freshly roasted single-origin specialty coffees, hand-poured beans, and gourmet artisan treats.',
    altText: 'Specialty Artisan Brews and Gourmet Treats',
  },
  footwear: {
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80',
    badge: '✨ Performance Kicks • Modern Streetwear',
    defaultTagline: 'Step into style and comfort with our latest collection. Handcrafted for endurance and everyday lifestyle.',
    altText: 'Performance Footwear and Sneakers',
  },
  general: {
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
    badge: '✨ Official Store • Verified Quality',
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

  if (/\b(wedding|bridal|shaadi|shadi|dulhan|groom|bride|marriage|mehndi|nikkah|barat|walima|valima|choker|dupatta|favor|shagun)\b/i.test(combined)) {
    return 'wedding';
  }
  if (/\b(perfume|fragrance|attar|scent|oud|cologne|eau de|itr|khus|amber)\b/i.test(combined)) {
    return 'perfume';
  }
  if (/\b(skin|skincare|serum|lotion|cream|beauty|sunscreen|spf|toner|cleanser|moisturizer|acne|glow|dermal|botanica)\b/i.test(combined)) {
    return 'skincare';
  }
  if (/\b(jewel|jewelry|jewellery|ring|rings|necklace|earring|earrings|jhumka|gold|silver|zircon|diamond|pendant|bracelet|bangle)\b/i.test(combined)) {
    return 'jewelry';
  }
  if (/\b(tech|gadget|electronics|headphone|headphones|earbuds|smartwatch|watch|bluetooth|keyboard|mouse|laptop|charger|audio|magsafe)\b/i.test(combined)) {
    return 'tech';
  }
  if (/\b(coffee|tea|cafe|bean|beans|roast|espresso|bakery|cake|sweet|sweets|food|chocolate|truffle|beverage|snack)\b/i.test(combined)) {
    return 'food';
  }
  if (/\b(shoe|shoes|footwear|sneaker|sneakers|kicks|jogger|joggers|boots|sandals|heels|loafers|slides)\b/i.test(combined)) {
    return 'footwear';
  }
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
