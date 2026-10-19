import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { GeneratedStore, GeneratedProduct, THEME_PRESETS } from './ai/ai-generator';
import { readLocalStoreCache, writeLocalStoreCache } from './local-store-cache';

export interface StoreRecord {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  header_title?: string;
  description?: string;
  plan: 'free' | 'basic' | 'pro' | 'advanced';
  selected_theme: string;
  primary_color: string;
  secondary_color?: string;
  whatsapp_number: string;
  owner_email: string;
  payment_status: string;
  created_at: string;
  theme?: any;
  social_links?: Partial<Record<'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x', string>>;
  logo_url?: string;
}

export interface ProductRecord {
  id: string;
  store_id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  wholesale_cost?: number;
  min_accept_price?: number;
  stock_status?: string;
  badge?: string;
  created_at: string;
}

// In-memory fallback repository for instant development without Supabase setup
const memoryStores = new Map<string, StoreRecord>();
const memoryProducts = new Map<string, ProductRecord[]>();

// Seed default initial store: Velvet Aura
const defaultVelvetAura: StoreRecord = {
  id: 'store_demo_velvet_aura',
  name: 'Velvet Aura Fragrances',
  slug: 'velvet-aura',
  tagline: 'Captivating artisanal fragrances & pure concentrated oud oils crafted for unforgettable impressions.',
  header_title: 'Welcome to Velvet Aura Fragrances',
  description: 'Velvet Aura brings you luxury oriental scents, French EDPs, and rare Cambodian agarwood blends.',
  plan: 'pro',
  selected_theme: 'royal-gold',
  primary_color: '#0f172a',
  secondary_color: '#d97706',
  whatsapp_number: '923001234567',
  owner_email: 'admin@velvet-aura.com',
  payment_status: 'active',
  created_at: new Date().toISOString(),
  theme: THEME_PRESETS['royal-gold']
};

const defaultVelvetProducts: ProductRecord[] = [
  {
    id: 'prod_va_1',
    store_id: 'store_demo_velvet_aura',
    name: 'Velvet Royal Amber Oud 100ml',
    description: 'Rich blend of Cambodian oud, aged vanilla, and royal amber with exceptional 16-hour projection.',
    price: 6500,
    category: 'Luxury Oud',
    image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    wholesale_cost: 3500,
    min_accept_price: 5500,
    stock_status: 'in_stock',
    badge: 'Bestseller',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_va_2',
    store_id: 'store_demo_velvet_aura',
    name: 'Midnight Saffron & Rose',
    description: 'An exotic evening scent with Kashmiri saffron, Turkish rose petals, and spicy cinnamon notes.',
    price: 4800,
    category: 'Eau De Parfum',
    image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    wholesale_cost: 2600,
    min_accept_price: 4000,
    stock_status: 'low_stock',
    badge: 'Trending',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_va_3',
    store_id: 'store_demo_velvet_aura',
    name: 'Imperial White Musk',
    description: 'Clean, powdery French white musk with subtle floral nuances, crafted for versatile everyday elegance.',
    price: 3200,
    category: 'Attars & Oils',
    image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    wholesale_cost: 1800,
    min_accept_price: 2800,
    stock_status: 'in_stock',
    badge: 'Popular',
    created_at: new Date().toISOString()
  },
  {
    id: 'prod_va_4',
    store_id: 'store_demo_velvet_aura',
    name: 'Artisan Discovery Box (5x10ml)',
    description: 'Collector’s discovery set containing 5 travel sprays of our bestselling signature fragrance blends.',
    price: 3900,
    category: 'Gift Discovery Sets',
    image_url: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
    wholesale_cost: 2100,
    min_accept_price: 3300,
    stock_status: 'in_stock',
    badge: 'Gift Idea',
    created_at: new Date().toISOString()
  }
];

memoryStores.set(defaultVelvetAura.slug, defaultVelvetAura);
memoryStores.set(defaultVelvetAura.id, defaultVelvetAura);
memoryProducts.set(defaultVelvetAura.slug, defaultVelvetProducts);
memoryProducts.set(defaultVelvetAura.id, defaultVelvetProducts);

class StoreRepository {
  private isHydrated = false;
  private pendingPersistTimer: NodeJS.Timeout | null = null;

  private async hydrateLocalCache() {
    if (this.isHydrated) return;
    this.isHydrated = true;
    const cache = await readLocalStoreCache();
    if (!cache || typeof cache !== 'object') return;
    const saved = cache as { stores?: unknown; products?: unknown };
    if (Array.isArray(saved.stores)) {
      for (const candidate of saved.stores) {
        if (!candidate || typeof candidate !== 'object') continue;
        const store = candidate as StoreRecord;
        if (typeof store.id !== 'string' || typeof store.slug !== 'string') continue;
        memoryStores.set(store.id, store);
        memoryStores.set(store.slug, store);
      }
    }
    if (saved.products && typeof saved.products === 'object' && !Array.isArray(saved.products)) {
      for (const [key, candidate] of Object.entries(saved.products)) {
        if (Array.isArray(candidate)) memoryProducts.set(key, candidate as ProductRecord[]);
      }
    }
  }

  private persistLocalCache() {
    if (this.pendingPersistTimer) clearTimeout(this.pendingPersistTimer);
    this.pendingPersistTimer = setTimeout(async () => {
      try {
        const stores = [...new Map([...memoryStores.values()].map((store) => [store.id, store])).values()];
        await writeLocalStoreCache({
          stores,
          products: Object.fromEntries(memoryProducts.entries()),
        });
      } catch (err) {
        console.warn("Local store cache write failed:", err);
      }
    }, 200);
  }

  private getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key && !url.includes('your-project')) {
      return createClient(url, key);
    }
    return null;
  }

  async saveStore(generated: GeneratedStore): Promise<StoreRecord> {
    const id = (generated as any).id || (generated as any).store_id || randomUUID();
    const storeRecord: StoreRecord = {
      id,
      name: generated.name,
      slug: generated.slug,
      tagline: generated.tagline,
      header_title: generated.header_title,
      description: generated.description,
      plan: generated.plan,
      selected_theme: generated.theme.id,
      primary_color: generated.theme.primaryColor,
      secondary_color: generated.theme.secondaryColor,
      whatsapp_number: generated.whatsapp_number,
      owner_email: generated.owner_email,
      payment_status: generated.plan === 'free' ? 'active' : 'pending',
      created_at: new Date().toISOString(),
      theme: generated.theme,
      social_links: generated.social_links ?? {},
    };

    // Save in memory cache
    memoryStores.set(storeRecord.slug, storeRecord);
    memoryStores.set(storeRecord.id, storeRecord);

    const prods: ProductRecord[] = generated.products.map(p => ({
      ...p,
      id: randomUUID(),
      store_id: id,
      created_at: new Date().toISOString()
    }));
    memoryProducts.set(storeRecord.slug, prods);
    memoryProducts.set(storeRecord.id, prods);

    // Also persist to Supabase if credentials are valid (batch upsert for high concurrency)
    const supabase = this.getSupabase();
    if (!supabase) {
      console.info('Using memory and local cache for store repository.');
    }
    if (supabase) {
      try {
        const { error: storeError } = await supabase.from('stores').upsert({
          id,
          name: storeRecord.name,
          slug: storeRecord.slug,
          whatsapp_number: storeRecord.whatsapp_number,
          plan: storeRecord.plan,
          owner_email: storeRecord.owner_email,
          primary_color: storeRecord.primary_color,
          header_title: storeRecord.header_title,
          payment_status: storeRecord.payment_status
        });
        if (storeError) throw storeError;

        if (prods.length > 0) {
          const productRows = prods.map(p => ({
            id: p.id,
            store_id: id,
            name: p.name,
            description: p.description,
            price: p.price,
            image_url: p.image_url,
            category: p.category,
            wholesale_cost: p.wholesale_cost || 0,
            min_accept_price: p.min_accept_price || 0
          }));
          const { error: productError } = await supabase.from('products').upsert(productRows);
          if (productError) throw productError;
        }
      } catch (e) {
        console.warn('Supabase remote sync warning (using memory storage):', e);
      }
    }

    this.persistLocalCache();

    return storeRecord;
  }

  async getStoreByEmail(email: string): Promise<StoreRecord | null> {
    if (!email) return null;
    await this.hydrateLocalCache();
    const target = email.trim().toLowerCase();
    for (const store of memoryStores.values()) {
      if (store.owner_email && store.owner_email.trim().toLowerCase() === target) {
        return store;
      }
    }
    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase.from('stores').select('*').eq('owner_email', target).limit(1).maybeSingle();
        if (data) return data as unknown as StoreRecord;
      } catch {
        // ignore
      }
    }
    return null;
  }

  async getStore(idOrSlug: string): Promise<StoreRecord | null> {
    if (!idOrSlug) return null;
    await this.hydrateLocalCache();
    // 1. Check memory cache direct
    const cached = memoryStores.get(idOrSlug);
    if (cached) return cached;

    // 1b. Check case-insensitively in memoryStores
    const target = idOrSlug.trim().toLowerCase();
    for (const [key, store] of memoryStores.entries()) {
      if (key.toLowerCase() === target || store.id.toLowerCase() === target || store.slug.toLowerCase() === target) {
        return store;
      }
    }

    // 2. Query Supabase
    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .or(`slug.eq.${idOrSlug},id.eq.${idOrSlug}`)
          .single();

        if (data && !error) {
          const rec: StoreRecord = {
            id: data.id,
            name: data.name || data.store_name,
            slug: data.slug || idOrSlug,
            tagline: data.tagline || data.header_title || 'Welcome to our store',
            header_title: data.header_title || data.name,
            plan: data.plan || data.plan_type || 'free',
            selected_theme: data.selected_theme || 'royal-gold',
            primary_color: data.primary_color || '#0f172a',
            whatsapp_number: data.whatsapp_number || '',
            owner_email: data.owner_email || '',
            payment_status: data.payment_status || 'active',
            created_at: data.created_at,
            social_links: data.social_links || {},
            theme: THEME_PRESETS[data.selected_theme] || THEME_PRESETS['royal-gold']
          };
          memoryStores.set(rec.slug, rec);
          memoryStores.set(rec.id, rec);
          return rec;
        }
      } catch (err) {
        console.warn('Supabase fetch store warning:', err);
      }
    }

    return null;
  }

  async getAllStores(): Promise<StoreRecord[]> {
    const list: StoreRecord[] = [];
    const seen = new Set<string>();

    for (const s of memoryStores.values()) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        list.push(s);
      }
    }

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const { data } = await supabase.from('stores').select('*');
        if (data && Array.isArray(data)) {
          for (const d of data) {
            if (!seen.has(d.id)) {
              seen.add(d.id);
              list.push({
                id: d.id,
                name: d.name || d.store_name,
                slug: d.slug,
                tagline: d.tagline || d.header_title || '',
                plan: d.plan || d.plan_type || 'free',
                selected_theme: d.selected_theme || 'emerald',
                primary_color: d.primary_color || '#1d7555',
                whatsapp_number: d.whatsapp_number,
                owner_email: d.owner_email,
                payment_status: d.payment_status || 'active',
                created_at: d.created_at
              });
            }
          }
        }
      } catch (e) {
        console.warn('Supabase fetch all stores warning:', e);
      }
    }

    return list;
  }

  async getProducts(storeIdOrSlug: string): Promise<ProductRecord[]> {
    if (!storeIdOrSlug) return [];
    await this.hydrateLocalCache();
    const store = await this.getStore(storeIdOrSlug);
    const targetId = store ? store.id : storeIdOrSlug;
    const targetSlug = store ? store.slug : storeIdOrSlug;

    // 1. Check memory cache across keys
    const cached = memoryProducts.get(targetId) || memoryProducts.get(targetSlug) || memoryProducts.get(storeIdOrSlug);
    if (cached && cached.length > 0) return cached;

    // 2. Query Supabase
    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const store = await this.getStore(storeIdOrSlug);
        const targetId = store ? store.id : storeIdOrSlug;

        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', targetId);

        if (data && Array.isArray(data) && data.length > 0) {
          const mapped: ProductRecord[] = data.map((d: any) => ({
            id: d.id,
            store_id: d.store_id,
            name: d.name,
            description: d.description || '',
            price: Number(d.price) || 0,
            category: d.category || 'General',
            image_url: d.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
            wholesale_cost: d.wholesale_cost,
            min_accept_price: d.min_accept_price,
            stock_status: 'in_stock',
            created_at: d.created_at || new Date().toISOString()
          }));
          memoryProducts.set(storeIdOrSlug, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch products warning:', err);
      }
    }

    return [];
  }

  async addProduct(storeIdOrSlug: string, prod: Partial<ProductRecord>): Promise<ProductRecord> {
    const store = await this.getStore(storeIdOrSlug);
    const storeId = store ? store.id : storeIdOrSlug;

    // Plan Limits Validation
    const existing = await this.getProducts(storeIdOrSlug);
    const plan = store?.plan || 'free';
    const maxAllowed = plan === 'free' || plan === 'basic' ? 40 : plan === 'pro' ? 80 : 9999;

    if (existing.length >= maxAllowed) {
      throw new Error(`Plan limit reached! ${plan.toUpperCase()} plan allows maximum ${maxAllowed} products. Please upgrade.`);
    }

    const newProd: ProductRecord = {
      id: prod.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      store_id: storeId,
      name: prod.name || 'Untitled Product',
      description: prod.description || '',
      price: Number(prod.price) || 999,
      category: prod.category || 'General',
      image_url: prod.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      wholesale_cost: prod.wholesale_cost || Math.round((Number(prod.price) || 999) * 0.6),
      min_accept_price: prod.min_accept_price || Math.round((Number(prod.price) || 999) * 0.8),
      stock_status: prod.stock_status || 'in_stock',
      badge: prod.badge || 'New',
      created_at: new Date().toISOString()
    };

    // Update memory
    const updatedList = [newProd, ...existing];
    memoryProducts.set(storeId, updatedList);
    if (store) memoryProducts.set(store.slug, updatedList);

    // Sync Supabase
    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('products').insert([newProd]);
      } catch (e) {
        console.warn('Supabase product insert warning:', e);
      }
    }

    return newProd;
  }

  async updateProduct(storeIdOrSlug: string, productId: string, updates: Partial<ProductRecord>): Promise<ProductRecord> {
    const store = await this.getStore(storeIdOrSlug);
    const storeId = store ? store.id : storeIdOrSlug;
    const list = await this.getProducts(storeIdOrSlug);

    const index = list.findIndex(p => p.id === productId);
    if (index === -1) throw new Error(`Product ${productId} not found.`);

    const updated = { ...list[index], ...updates };
    list[index] = updated;

    memoryProducts.set(storeId, list);
    if (store) memoryProducts.set(store.slug, list);

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('products').update(updates).eq('id', productId);
      } catch (e) {
        console.warn('Supabase product update warning:', e);
      }
    }

    return updated;
  }

  async deleteProduct(storeIdOrSlug: string, productId: string): Promise<boolean> {
    const store = await this.getStore(storeIdOrSlug);
    const storeId = store ? store.id : storeIdOrSlug;
    const list = await this.getProducts(storeIdOrSlug);

    const filtered = list.filter(p => p.id !== productId);
    memoryProducts.set(storeId, filtered);
    if (store) memoryProducts.set(store.slug, filtered);

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', productId);
      } catch (e) {
        console.warn('Supabase product delete warning:', e);
      }
    }

    return true;
  }

  async updateStoreTheme(storeSlug: string, data: { theme_preset?: string; primary_color?: string; tagline?: string }): Promise<StoreRecord> {
    const store = await this.getStore(storeSlug);
    if (!store) throw new Error(`Store ${storeSlug} not found`);

    if (data.theme_preset && THEME_PRESETS[data.theme_preset]) {
      store.selected_theme = data.theme_preset;
      store.theme = THEME_PRESETS[data.theme_preset];
      store.primary_color = store.theme.primaryColor;
      store.secondary_color = store.theme.secondaryColor;
    }
    if (data.primary_color) {
      store.primary_color = data.primary_color;
    }
    if (data.tagline) {
      store.tagline = data.tagline;
      store.header_title = data.tagline;
    }

    memoryStores.set(store.slug, store);
    memoryStores.set(store.id, store);

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        await supabase.from('stores').update({
          selected_theme: store.selected_theme,
          primary_color: store.primary_color,
          header_title: store.header_title
        }).eq('id', store.id);
      } catch (e) {
        console.warn('Supabase store update theme warning:', e);
      }
    }

    return store;
  }

  async updateStore(storeSlugOrId: string, updates: Partial<StoreRecord>): Promise<StoreRecord> {
    const store = await this.getStore(storeSlugOrId);
    if (!store) throw new Error(`Store ${storeSlugOrId} not found`);

    const updated = { ...store, ...updates };
    memoryStores.set(updated.slug, updated);
    memoryStores.set(updated.id, updated);

    const supabase = this.getSupabase();
    if (supabase) {
      try {
        const payload: Record<string, any> = {};
        if (updates.name) payload.name = updates.name;
        if (updates.plan) {
          payload.plan = updates.plan;
          payload.plan_type = updates.plan;
        }
        if (updates.whatsapp_number) payload.whatsapp_number = updates.whatsapp_number;
        if (updates.primary_color) payload.primary_color = updates.primary_color;
        if (updates.selected_theme) payload.selected_theme = updates.selected_theme;
        if (updates.tagline) {
          payload.tagline = updates.tagline;
          payload.header_title = updates.tagline;
        }
        if (Object.keys(payload).length > 0) {
          await supabase.from('stores').update(payload).eq('id', store.id);
        }
      } catch (e) {
        console.warn('Supabase updateStore warning:', e);
      }
    }

    return updated;
  }
}

export const storeRepo = new StoreRepository();
