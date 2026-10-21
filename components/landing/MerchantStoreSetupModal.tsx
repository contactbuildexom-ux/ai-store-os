'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Store, 
  MessageCircle, 
  Share2, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Lock, 
  Mail, 
  Palette, 
  Zap, 
  Crown, 
  HelpCircle,
  Loader2,
  Package,
} from 'lucide-react';
import { StoreQRCode } from '@/components/store-qr-code';
import EmailVerifyField from '@/components/auth/EmailVerifyField';
import { EMAIL_OTP_REQUIRED } from '@/lib/email-otp-config';

type GeneratedPreview = {
  store_name: string;
  theme_color: string;
  banner_text: string;
  categories: string[];
  products: Array<{ name: string; price: number; description: string; category_name: string }>;
};

type GeneratedStoreResponse = {
  slug: string;
  storefrontUrl: string;
  // Public address of the store. Subdomain URL (https://shoe-store.domain.com) when
  // NEXT_PUBLIC_ROOT_DOMAIN is configured, otherwise the same /store/<slug> path.
  storeUrl: string;
  dashboardUrl: string;
  storeName: string;
  preview: GeneratedPreview;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseGeneratedStoreResponse(value: unknown): GeneratedStoreResponse | null {
  if (!isRecord(value) || value.success !== true || typeof value.slug !== 'string' || !isRecord(value.store)) return null;
  const previewValue = value.preview;
  if (
    !isRecord(previewValue) ||
    typeof previewValue.store_name !== 'string' ||
    typeof previewValue.theme_color !== 'string' ||
    typeof previewValue.banner_text !== 'string' ||
    !Array.isArray(previewValue.categories) ||
    !previewValue.categories.every((category) => typeof category === 'string') ||
    !Array.isArray(previewValue.products) ||
    !/^#[0-9a-f]{6}$/i.test(previewValue.theme_color)
  ) {
    return null;
  }
  const products = previewValue.products.flatMap((product) => {
    if (
      !isRecord(product) ||
      typeof product.name !== 'string' ||
      typeof product.price !== 'number' ||
      !Number.isFinite(product.price) ||
      typeof product.description !== 'string' ||
      typeof product.category_name !== 'string'
    ) {
      return [];
    }
    return [{
      name: product.name,
      price: product.price,
      description: product.description,
      category_name: product.category_name,
    }];
  });
  if (products.length !== previewValue.products.length) return null;
  const storefrontUrl = typeof value.storefront_url === 'string' ? value.storefront_url : `/store/${encodeURIComponent(value.slug)}`;
  return {
    slug: value.slug,
    storefrontUrl,
    storeUrl: typeof value.store_url === 'string' ? value.store_url : storefrontUrl,
    dashboardUrl: typeof value.dashboard_url === 'string' ? value.dashboard_url : `/merchant/${encodeURIComponent(value.slug)}/dashboard`,
    storeName: typeof value.store.name === 'string' ? value.store.name : previewValue.store_name,
    preview: {
      store_name: previewValue.store_name,
      theme_color: previewValue.theme_color,
      banner_text: previewValue.banner_text,
      categories: previewValue.categories,
      products,
    },
  };
}

interface MerchantStoreSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialPlan?: 'basic' | 'pro' | 'advanced';
  initialStoreName?: string;
  initialTheme?: string;
}

const THEME_OPTIONS = [
  { id: 'ocean-blue', name: 'Ocean Navy & Electric Blue', color: '#1976d2', desc: 'App-style modern tech & retail' },
  { id: 'emerald', name: 'Emerald Minimal', color: '#1d7555', desc: 'Fresh & organic' },
  { id: 'royal-gold', name: 'Royal Gold & Dark', color: '#0f172a', desc: 'Luxury & prestigious' },
  { id: 'velvet-rose', name: 'Velvet Rose & Blush', color: '#831843', desc: 'Beauty & apparel' },
  { id: 'sunset-amber', name: 'Sunset Amber', color: '#ea580c', desc: 'Warm lifestyle & dining' },
  { id: 'aurora-violet', name: 'Aurora Violet', color: '#7c3aed', desc: 'Creative & boutique' },
  { id: 'mint-fresh', name: 'Mint Fresh', color: '#059669', desc: 'Wellness & healthcare' },
  { id: 'cyber-slate', name: 'Cyber Slate', color: '#1e1b4b', desc: 'Modern electronics' },
  { id: 'artisan-cream', name: 'Artisan Terracotta', color: '#78350f', desc: 'Handcrafted goods' },
  { id: 'midnight-minimal', name: 'Midnight Onyx', color: '#09090b', desc: 'Ultra-minimal aesthetic' },
];

export const STORE_IDEA_PRESETS = [
  {
    category: 'Trending E-Commerce Niches',
    options: [
      {
        id: 'gaming-tech',
        name: 'Gaming Gear & RGB',
        sampleName: 'Nexus Gaming Gear',
        theme: 'cyber-slate',
        prompt: 'A dedicated gaming peripherals brand featuring hot-swappable mechanical keyboards, ultra-lightweight gaming mice, RGB desk mats, and 7.1 surround headsets with cash on delivery.'
      },
      {
        id: 'nature',
        name: 'Indoor Plants & Botanicals',
        sampleName: 'Verdant Flora & Greens',
        theme: 'emerald',
        prompt: 'An organic botanical nursery and green living boutique offering natural indoor plants, air-purifying succulents, organic gardening essentials, fresh herbal teas, and natural planters.'
      },
      {
        id: 'handbags',
        name: 'Luxury Velvet Handbags',
        sampleName: 'Velvet Noir Handbags',
        theme: 'velvet-rose',
        prompt: 'A designer handbag and luxury leather accessories store featuring handcrafted velvet clutches, evening bridal party bags, structured leather shoulder totes, and wallets.'
      },
      {
        id: 'shoes',
        name: 'Athletic Sneakers & Shoes',
        sampleName: 'Aura Kicks Atelier',
        theme: 'ocean-blue',
        prompt: 'A modern performance footwear brand featuring cushioned running sneakers, streetwear lifestyle kicks, and everyday comfortable trainers with nationwide delivery and Cash on Delivery.'
      },
      {
        id: 'perfume',
        name: 'Luxury Perfumes & Oud',
        sampleName: 'Velvet Oud Fragrances',
        theme: 'royal-gold',
        prompt: 'A luxury fragrance atelier offering artisanal concentrated oud oils, French long-lasting EDP perfumes, and curated gift boxes with nationwide delivery.'
      },
      {
        id: 'jewelry',
        name: 'Gold Plated Jewelry',
        sampleName: 'Celestia Jewels',
        theme: 'royal-gold',
        prompt: 'Handcrafted luxury jewelry brand providing anti-tarnish 18K gold-plated coin necklaces, zirconia solitaire rings, baroque pearl chokers, and festive earrings.'
      },
      {
        id: 'women-fashion',
        name: 'Women\'s Designer Pret',
        sampleName: 'Zahra Festive Pret',
        theme: 'velvet-rose',
        prompt: 'A contemporary designer clothing boutique specializing in ready-to-wear printed lawn, luxury chiffon festive 3-piece suits, and embroidered organza dupattas.'
      },
      {
        id: 'men-fashion',
        name: 'Men\'s Couture & Kurtas',
        sampleName: 'Apex Heritage Menswear',
        theme: 'midnight-minimal',
        prompt: 'A premium menswear brand offering tailored cotton kurtas, bespoke waistcoats, formal shirts, and luxury accessories with cash on delivery nationwide.'
      },
      {
        id: 'skincare',
        name: 'Botanical Skincare & Serums',
        sampleName: 'Glow Botanica Organics',
        theme: 'mint-fresh',
        prompt: 'A clean skincare brand featuring hyaluronic acid glow serums, barrier repair ceramide creams, gentle green tea cleansers, and broad-spectrum mineral sunscreens.'
      },
      {
        id: 'wedding',
        name: 'Bridal Couture & Favors',
        sampleName: 'Royal Shadi Boutique',
        theme: 'royal-gold',
        prompt: 'An exquisite wedding boutique featuring handcrafted bridal clutches, laser-cut gold wedding favor boxes, luxury wedding keepsakes, and festive party accessories.'
      },
      {
        id: 'tech',
        name: 'Smart Tech & Wearables',
        sampleName: 'Pulse Wave Electronics',
        theme: 'ocean-blue',
        prompt: 'A cutting-edge tech store featuring active noise-cancelling wireless headphones, AMOLED smartwatches, magnetic wireless charging stations, and ergonomic desk accessories.'
      },
      {
        id: 'coffee',
        name: 'Artisan Coffee & Beans',
        sampleName: 'Artisan Roast & Co.',
        theme: 'sunset-amber',
        prompt: 'A specialty coffee roastery featuring single-origin Ethiopian and Colombian beans, dark roast espresso blends, cold brew kits, and precision hand grinders.'
      },
      {
        id: 'bakery',
        name: 'Gourmet Cakes & Bakery',
        sampleName: 'Sweet Praline Confections',
        theme: 'sunset-amber',
        prompt: 'An artisan bakery offering fresh sourdough, custom buttercream celebration cakes, Belgian chocolate truffles, and delicate French macarons.'
      },
      {
        id: 'fitness',
        name: 'Gym Activewear & Gear',
        sampleName: 'Velocity Athletic Gear',
        theme: 'ocean-blue',
        prompt: 'A high-performance activewear store offering moisture-wicking gym tees, seamless compression leggings, water-resistant duffel bags, and fitness accessories.'
      },
      {
        id: 'home',
        name: 'Home Decor & Candles',
        sampleName: 'Luxe Living Interiors',
        theme: 'artisan-cream',
        prompt: 'A modern interior boutique featuring artisanal scented soy wax candles, ceramic vases, linen cushion covers, and aesthetic room decor accents.'
      },
      {
        id: 'leather',
        name: 'Handcrafted Leather Goods',
        sampleName: 'Heritage Leather Co.',
        theme: 'midnight-minimal',
        prompt: 'A genuine handcrafted leather goods boutique specializing in vintage laptop messenger bags, full-grain leather bi-fold wallets, and brass-buckle belts.'
      },
      {
        id: 'organic',
        name: 'Organic Honey & Superfoods',
        sampleName: 'Natura Harvest Superfoods',
        theme: 'mint-fresh',
        prompt: 'An authentic organic wellness store offering raw wild Sidr honey, premium roasted dry fruits, organic green teas, and cold-pressed pure oils.'
      }
    ]
  },
  {
    category: 'Global Specialty Niches',
    options: [
      {
        id: 'baby-kids',
        name: 'Baby & Kids Apparel',
        sampleName: 'Little Sprout Nursery',
        theme: 'mint-fresh',
        prompt: 'An organic baby and toddler boutique offering soft organic cotton onesies, wooden Montessori toys, ergonomic nursery swaddles, and hypoallergenic baby care essentials.'
      },
      {
        id: 'watches-eyewear',
        name: 'Watches & Eyewear',
        sampleName: 'Aero Chrono Atelier',
        theme: 'midnight-minimal',
        prompt: 'A luxury timepieces and designer sunglasses brand featuring sapphire crystal chronograph watches, polarized acetate sunglasses, and Italian leather watch rolls.'
      },
      {
        id: 'pet-care',
        name: 'Pet Care & Accessories',
        sampleName: 'Paws & Whiskers Co.',
        theme: 'sunset-amber',
        prompt: 'A pet lifestyle store offering grain-free organic dog treats, orthopedic pet beds, durable braided leashes, and gentle grooming shampoos.'
      },
      {
        id: 'modest-fashion',
        name: 'Modest Wear & Abayas',
        sampleName: 'Noor Modest Couture',
        theme: 'royal-gold',
        prompt: 'An elegant modest wear brand featuring handcrafted chiffon abayas, premium mulberry silk hijabs, inner caps, and modest maxi dresses.'
      },
      {
        id: 'spices-tea',
        name: 'Spices & Artisanal Tea',
        sampleName: 'Silk Route Spice Merchants',
        theme: 'artisan-cream',
        prompt: 'A heritage spice and tea emporium offering hand-ground organic spice blends, authentic Kashmiri pink tea, saffron infusions, and gourmet herbal loose leaves.'
      },
      {
        id: 'candles-pottery',
        name: 'Ceramic Pottery & Crafts',
        sampleName: 'Clay & Flame Studio',
        theme: 'artisan-cream',
        prompt: 'An artisan studio offering wheel-thrown ceramic mugs, sculptural flower vases, and crackling wood-wick essential oil aromatherapy candles.'
      },
      {
        id: 'stationery',
        name: 'Stationery & Journals',
        sampleName: 'Paper & Quill Atelier',
        theme: 'royal-gold',
        prompt: 'A bespoke stationery store offering refillable leather-bound travel notebooks, brass fountain pens, archival ink sets, and aesthetic daily productivity planners.'
      }
    ]
  }
];

/* Shared light-theme classes */
const INPUT =
  'w-full rounded-xl border border-[#bfdcff] bg-[#f3f8ff] px-3.5 py-2.5 text-sm text-[#0b2545] placeholder:text-[#7c93b3] transition focus:border-[#1976d2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1976d2]/20';
const LABEL =
  'flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0b2545]';

export default function MerchantStoreSetupModal({
  isOpen,
  onClose,
  initialPrompt = '',
  initialPlan = 'pro',
  initialStoreName = '',
  initialTheme = 'royal-gold',
}: MerchantStoreSetupModalProps) {
  const router = useRouter();

  // Form states
  const [selectedIdeaId, setSelectedIdeaId] = useState('');
  const [storeName, setStoreName] = useState(initialStoreName);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [plan, setPlan] = useState<'basic' | 'pro' | 'business' | 'advanced'>(initialPlan);
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [customHexColor, setCustomHexColor] = useState<string>('#1976d2');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [ideaSearch, setIdeaSearch] = useState('');
  useEffect(() => {
    const matched = THEME_OPTIONS.find(t => t.id === selectedTheme);
    if (matched) setCustomHexColor(matched.color);
  }, [selectedTheme]);

  const filteredPresets = useMemo(() => {
    if (!ideaSearch.trim()) return STORE_IDEA_PRESETS;
    const q = ideaSearch.toLowerCase();
    return STORE_IDEA_PRESETS.map((grp) => ({
      ...grp,
      options: grp.options.filter(
        (opt) =>
          opt.name.toLowerCase().includes(q) ||
          opt.prompt.toLowerCase().includes(q) ||
          opt.sampleName.toLowerCase().includes(q)
      )
    })).filter((grp) => grp.options.length > 0);
  }, [ideaSearch]);

  const handleSelectIdea = (id: string) => {
    setSelectedIdeaId(id);
    if (!id) return;
    for (const group of STORE_IDEA_PRESETS) {
      const found = group.options.find(o => o.id === id);
      if (found) {
        if (!storeName || STORE_IDEA_PRESETS.some(g => g.options.some(opt => opt.sampleName === storeName))) {
          setStoreName(found.sampleName);
        }
        setSelectedTheme(found.theme);
        setPrompt(found.prompt);
        break;
      }
    }
  };

  // Social media links (All plans get footer social icons)
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTktok] = useState('');
  const [youtube, setYoutube] = useState('');
  const [twitter, setTwitter] = useState('');

  // UI / Submission state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepText, setStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<GeneratedStoreResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialStoreName) setStoreName(initialStoreName);
      if (initialPrompt) setPrompt(initialPrompt);
      if (initialTheme) setSelectedTheme(initialTheme);
      setCurrentStep(1);
    }
  }, [isOpen, initialStoreName, initialPrompt, initialTheme]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const effectiveName = storeName.trim() || 'My Online Store';
    const effectivePrompt = prompt.trim() || `A modern e-commerce storefront for ${effectiveName} offering premium items with nationwide delivery and Cash on Delivery.`;

    let effectiveEmail = email.trim().toLowerCase();
    if (!effectiveEmail || !effectiveEmail.includes('@')) {
      const cleanSlug = effectiveName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mystore';
      effectiveEmail = `merchant_${cleanSlug}_${Date.now().toString(36)}@buildexom.store`;
    }

    let effectivePassword = password;
    if (!effectivePassword || effectivePassword.length < 8) {
      effectivePassword = 'StoreAdminPass123!';
    }

    if (EMAIL_OTP_REQUIRED && !verificationToken) {
      setErrorMessage('Please verify your email address with the code we send you.');
      return;
    }

    setIsSubmitting(true);
    setStepText('1/4 Analyzing store concept & business niche...');

    const timer1 = setTimeout(() => setStepText('2/4 Curating catalog, products & pricing structure...'), 800);
    const timer2 = setTimeout(() => setStepText('3/4 Configuring brand theme, footer social channels & layout...'), 1600);
    const timer3 = setTimeout(() => setStepText('4/4 Linking automated WhatsApp checkout mechanism...'), 2400);

    try {
      const socialLinks: Record<string, string> = {};
      if (instagram.trim()) socialLinks.instagram = instagram.trim();
      if (facebook.trim()) socialLinks.facebook = facebook.trim();
      if (tiktok.trim()) socialLinks.tiktok = tiktok.trim();
      if (youtube.trim()) socialLinks.youtube = youtube.trim();
      if (twitter.trim()) socialLinks.x = twitter.trim();

      const selectedThemeObj = THEME_OPTIONS.find((t) => t.id === selectedTheme);
      const themeColor = selectedThemeObj?.color || '#1976d2';

      const response = await fetch('/api/ai/generate-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration: 'merchant',
          store_name: effectiveName,
          name: effectiveName,
          prompt: effectivePrompt,
          plan,
          theme: selectedTheme,
          selected_theme: selectedTheme,
          theme_color: customHexColor,
          whatsapp_number: whatsappNumber.trim() || '923001234567',
          owner_email: effectiveEmail,
          password: effectivePassword,
          owner_phone: contactPhone.trim() || undefined,
          verification_token: verificationToken || undefined,
          social_links: socialLinks,
        }),
      });

      let result: unknown;
      try {
        result = await response.json();
      } catch {
        throw new Error('The store generator returned an invalid response. Please try again.');
      }
      if (!response.ok) {
        throw new Error(isRecord(result) && typeof result.error === 'string' ? result.error : 'Failed to generate store. Please try again.');
      }
      const generatedStore = parseGeneratedStoreResponse(result);
      if (!generatedStore) throw new Error('The store generator returned incomplete preview data. Please try again.');
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setSuccessData(generatedStore);
      setIsSubmitting(false);

    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while creating your store.');
      setIsSubmitting(false);
    }
  };

  const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

  // Opens the store on its own subdomain (full page load). If no root domain is
  // configured, store_url is just /store/<slug>, so the normal router is used.
  const openStorefront = () => {
    if (!successData) return;
    const target = successData.storeUrl;
    onClose();
    if (isAbsoluteUrl(target)) {
      window.location.assign(target);
    } else {
      router.push(target);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-[#0b2545]/60 p-3 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative my-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#cfe2fa] bg-white text-[#0b2545] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-br from-[#0b2545] to-[#1976d2] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/15 text-white">
              <Store size={20} />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                Set up your online store
              </h2>
              <p className="text-xs text-blue-100/90">
                Tell us about your business and we will build it for you
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="grid size-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6 overflow-y-auto p-6">
          {successData ? (
            <div className="space-y-5 py-4 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-[#0b2545]">Store Successfully Created!</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-[#2c4a73]">
                  <span className="font-semibold text-emerald-600">{successData.storeName}</span> is live with automated WhatsApp checkout and integrated social media footer.
                </p>
                {isAbsoluteUrl(successData.storeUrl) && (
                  <p className="mx-auto mt-2 max-w-md break-all text-xs font-semibold text-[#1976d2]">
                    {successData.storeUrl.replace(/^https?:\/\//i, '')}
                  </p>
                )}
                {plan !== 'basic' && (
                  <p className="mx-auto mt-3 max-w-md rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Your {plan === 'advanced' ? 'Advanced' : 'Pro'} plan selection is pending payment approval; the store starts with Basic limits until it is approved.
                  </p>
                )}
              </div>

              <section className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-[#cfe2fa] bg-[#f3f8ff] text-left">
                <div className="px-5 py-5 text-white" style={{ backgroundColor: successData.preview.theme_color }}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">Store preview</p>
                  <h4 className="mt-2 text-xl font-bold">{successData.preview.store_name}</h4>
                  <p className="mt-1 text-xs text-white/85">{successData.preview.banner_text}</p>
                </div>
                <div className="space-y-4 p-4">
                  <div className="flex flex-wrap gap-2">
                    {successData.preview.categories.map((category) => (
                      <span key={category} className="rounded-full border border-[#bfdcff] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#1976d2]">{category}</span>
                    ))}
                  </div>
                  {successData.preview.products.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {successData.preview.products.slice(0, 6).map((product) => (
                        <article key={`${product.category_name}-${product.name}`} className="rounded-xl border border-[#cfe2fa] bg-white p-3">
                          <div className="flex items-start gap-2">
                            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e6f4ff] text-[#1976d2]"><Package size={15} /></span>
                            <div className="min-w-0 flex-1">
                              <h5 className="truncate text-xs font-semibold text-[#0b2545]">{product.name}</h5>
                              <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#5b7aa3]">{product.description}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="truncate text-[10px] text-[#5b7aa3]">{product.category_name}</span>
                            <span className="shrink-0 text-xs font-bold text-emerald-600">
                              {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(product.price)}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#cfe2fa] bg-white/80 p-4 text-center">
                      <Package size={22} className="mx-auto text-[#1976d2] mb-1.5" />
                      <p className="text-xs font-bold text-[#0b2545]">Ready for Products</p>
                      <p className="mt-0.5 text-[11px] text-[#5b7aa3]">Categories and store branding configured. Add your real products directly from your dashboard.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Generated Store QR Code with 'B' in Center (Matching Screenshot) */}
              <div className="mx-auto max-w-sm pt-2">
                <StoreQRCode
                  storeSlug={successData.slug}
                  storePath={successData.storeUrl}
                  title="Your store QR"
                  badge="Live Store"
                />
              </div>

              <div className="mx-auto grid max-w-md gap-3 pt-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={openStorefront}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500"
                >
                  <Store size={16} /> View Live Storefront
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(successData.dashboardUrl);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#1976d2] px-5 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-[#1565c0]"
                >
                  Merchant Dashboard <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
                  <span className="font-bold">Error:</span> {errorMessage}
                </div>
              )}

              {/* Wizard Steps Tracker */}
              <div className="flex items-center justify-between border-b border-[#cfe2fa] pb-3 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className={`grid size-6 place-items-center rounded-full text-[11px] ${currentStep === 1 ? 'bg-[#1976d2] text-white shadow-xs' : 'bg-emerald-100 text-emerald-800'}`}>
                    {currentStep > 1 ? '✓' : '1'}
                  </span>
                  <span className={currentStep === 1 ? 'text-[#0b2545] font-extrabold' : 'text-[#5b7aa3]'}>
                    Store Name & Color Palette
                  </span>
                </div>
                <div className="h-0.5 w-12 bg-slate-200" />
                <div className="flex items-center gap-2">
                  <span className={`grid size-6 place-items-center rounded-full text-[11px] ${currentStep === 2 ? 'bg-[#1976d2] text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
                    2
                  </span>
                  <span className={currentStep === 2 ? 'text-[#0b2545] font-extrabold' : 'text-[#5b7aa3]'}>
                    Plan & WhatsApp Details
                  </span>
                </div>
              </div>

              {/* STEP 1: STORE NAME & INTERACTIVE CURSOR COLOR PALETTE */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  {/* Store Name Input */}
                  <div>
                    <label className={LABEL}>
                      <Store size={14} className="text-[#1976d2]" /> Store Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your store name (e.g. Apex Lifestyle, Velvet Aura, Cafe Beans)"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                      className={`${INPUT} mt-1 text-sm font-semibold`}
                    />
                    <p className="mt-1 text-[11px] text-[#5b7aa3]">
                      This will be the official name of your online storefront.
                    </p>
                  </div>

                  {/* Interactive Cursor Color Palette Picker */}
                  <div className="rounded-2xl border border-[#cfe2fa] bg-[#f8fbff] p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-[#0b2545]">
                        <Palette size={15} className="text-[#1976d2]" /> Choose Store Theme & Color Palette:
                      </label>
                      
                      {/* Native OS/Browser Cursor Color Picker Badge */}
                      <label
                        htmlFor="cursor-color-input"
                        className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-[#bfdcff] bg-white px-3 py-1.5 text-xs font-bold text-[#0b2545] shadow-xs hover:border-[#1976d2] hover:bg-blue-50 transition active:scale-95"
                        title="Click with your cursor to pick any custom shade from color palette"
                      >
                        <span
                          className="size-4 rounded-full border border-white shadow-xs"
                          style={{ backgroundColor: customHexColor }}
                        />
                        <span className="font-mono text-[11px] uppercase tracking-wide">{customHexColor}</span>
                        <span className="text-[10px] text-[#1976d2] font-semibold">🎨 Cursor Picker</span>
                        <input
                          id="cursor-color-input"
                          type="color"
                          value={customHexColor}
                          onChange={(e) => {
                            const hex = e.target.value;
                            setCustomHexColor(hex);
                            const matched = THEME_OPTIONS.find(t => t.color.toLowerCase() === hex.toLowerCase());
                            setSelectedTheme(matched ? matched.id : 'custom');
                          }}
                          className="sr-only cursor-pointer"
                        />
                      </label>
                    </div>

                    <p className="text-[11px] text-[#5b7aa3]">
                      Click any theme palette below, or click the <strong>Cursor Picker</strong> to select your exact custom brand color with your cursor.
                    </p>

                    {/* Quick Selection Swatches Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {THEME_OPTIONS.map((theme) => {
                        const isSelected = selectedTheme === theme.id || customHexColor.toLowerCase() === theme.color.toLowerCase();
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => {
                              setSelectedTheme(theme.id);
                              setCustomHexColor(theme.color);
                            }}
                            className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-all active:scale-95 cursor-pointer ${
                              isSelected
                                ? 'border-[#1976d2] bg-white ring-2 ring-[#1976d2]/35 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className="relative grid size-6 shrink-0 place-items-center rounded-full shadow-xs border border-white"
                              style={{ backgroundColor: theme.color }}
                            >
                              {isSelected && <span className="size-2 rounded-full bg-white shadow-xs" />}
                            </span>
                            <div className="min-w-0 flex-1 truncate">
                              <p className="truncate text-[11px] font-bold text-slate-800 leading-tight">
                                {theme.name.split(' ')[0]}
                              </p>
                              <p className="text-[9px] text-slate-400 font-mono">
                                {theme.color}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Continue to Step 2 Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!storeName.trim()) {
                          setErrorMessage('Please enter your store name to proceed.');
                          return;
                        }
                        setErrorMessage('');
                        setCurrentStep(2);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2545] to-[#1976d2] py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 active:scale-95"
                    >
                      <span>Continue to Details & WhatsApp</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PLANS, WHATSAPP & CREDENTIALS */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  {/* Plan Selection (Free Starter pre-selected, others locked with unlock option) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className={LABEL}>
                        <Zap size={14} className="text-[#1976d2]" /> Subscription Plan
                      </label>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Free Starter Selected
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      {[
                        { id: 'basic', name: 'BASIC', badge: 'Free', desc: 'Up to 20 Products • WhatsApp Ordering • Store Categories • Basic Dashboard', icon: Store, locked: false },
                        { id: 'pro', name: 'PRO', badge: 'Advanced', desc: 'Up to 75 Products • Up to 5 Categories • Payment Integration • Basic Analytics', icon: MessageCircle, locked: true },
                        { id: 'business', name: 'BUSINESS', badge: 'Unlimited', desc: 'Unlimited Products & Categories • WhatsApp Ordering • AI Customer Chatbot • Advanced Analytics', icon: Crown, locked: true },
                      ].map((p) => {
                        const isSelected = plan === p.id;
                        const Icon = p.icon;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPlan(p.id as any)}
                            className={`relative rounded-2xl border p-3 text-left transition-all ${
                              isSelected
                                ? 'border-[#1976d2] bg-[#e6f4ff] ring-2 ring-[#1976d2]/25'
                                : 'border-[#cfe2fa] bg-white hover:border-[#1976d2]/60 hover:bg-[#f3f8ff]'
                            }`}
                          >
                            <div className="mb-1.5 flex items-center justify-between">
                              <Icon size={16} className={isSelected ? 'text-[#1976d2]' : 'text-[#5b7aa3]'} />
                              {isSelected ? (
                                <CheckCircle2 size={14} className="text-[#1976d2]" />
                              ) : p.locked ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">
                                  <Lock size={10} /> Locked
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs font-bold text-[#0b2545]">{p.name}</p>
                            <p className="mt-0.5 text-[10px] leading-snug text-[#5b7aa3]">{p.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

              {/* 3. WhatsApp Integration (Auto-Linked for Pro & Advance) */}
              <div className="space-y-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    <MessageCircle size={15} className="text-emerald-600" /> Dedicated WhatsApp Number
                  </label>
                  <span className="rounded-full border border-emerald-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    WhatsApp Ordering Included
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#2c4a73]">
                  When customers checkout on your storefront, their complete order details (Customer Name, Email, Phone, Address, Zip & Items) will be dispatched directly to this WhatsApp number.
                </p>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="e.g. 923001234567 or +92 300 1234567"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    required={plan !== 'basic'}
                    className="w-full rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-sm text-[#0b2545] placeholder:text-[#7c93b3] transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* 4. Social Media Links (Optional) */}
              <details className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 transition">
                <summary className="flex cursor-pointer items-center justify-between text-xs font-bold text-[#0b2545] select-none">
                  <span className="flex items-center gap-2">
                    <Share2 size={14} className="text-[#1976d2]" /> Social Media Profiles (Optional)
                  </span>
                  <span className="text-[11px] text-[#1976d2] group-open:hidden">+ Add links</span>
                  <span className="text-[11px] text-slate-400 hidden group-open:inline">Hide</span>
                </summary>
                <div className="grid gap-2.5 pt-3 sm:grid-cols-2">
                  <input
                    type="url"
                    placeholder="Instagram URL (https://instagram.com/...)"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className={INPUT}
                  />
                  <input
                    type="url"
                    placeholder="Facebook URL (https://facebook.com/...)"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className={INPUT}
                  />
                  <input
                    type="url"
                    placeholder="TikTok URL (https://tiktok.com/@...)"
                    value={tiktok}
                    onChange={(e) => setTktok(e.target.value)}
                    className={INPUT}
                  />
                  <input
                    type="url"
                    placeholder="YouTube or X URL (https://...)"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    className={INPUT}
                  />
                </div>
              </details>

              {/* 5. Merchant Login Details */}
              <div className="space-y-2.5 border-t border-[#cfe2fa] pt-4">
                <label className={LABEL}>
                  <Lock size={14} className="text-[#1976d2]" /> Merchant Account Credentials
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="email"
                    placeholder="Merchant Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={INPUT}
                  />
                  <input
                    type="password"
                    placeholder="Password (minimum 8 characters) *"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={128}
                    className={INPUT}
                  />
                </div>
                {EMAIL_OTP_REQUIRED && (
                  <>
                    <input
                      type="tel"
                      placeholder="Contact number (e.g. 923001234567) *"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                      className={INPUT}
                    />
                    <EmailVerifyField
                      email={email}
                      phone={contactPhone}
                      onVerified={setVerificationToken}
                    />
                  </>
                )}
              </div>

                  {/* Submit and Back Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95"
                    >
                      ← Back to Concept
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2545] to-[#1976d2] py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>{stepText || 'Building your store...'}</span>
                        </>
                      ) : (
                        <>
                          <Store size={17} />
                          <span>Create My Online Store</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-center text-[10px] text-[#5b7aa3]">
                    Instant storefront generation · Dedicated WhatsApp order routing · 100% Free Starter included
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}