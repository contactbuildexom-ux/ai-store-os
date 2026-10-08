import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkStoreLimits(storeId: string, type: 'product' | 'category', categoryId?: string) {
  // 1. Store ka plan fetch karein
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('plan')
    .eq('id', storeId)
    .single();

  if (storeError || !store) throw new Error('Store not found');

  const plan = store.plan; // 'basic', 'pro', 'business'

  if (type === 'category') {
    if (plan === 'basic') {
      return { allowed: false, message: 'Categories are not allowed on Basic plan.' };
    }
    const { count } = await supabase
      .from('store_categories')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId);

    if (plan === 'pro' && (count || 0) >= 5) {
      return { allowed: false, message: 'Pro plan allows maximum 5 categories.' };
    }
  }

  if (type === 'product') {
    // Total products check
    const { count: totalProducts } = await supabase
      .from('store_products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId);

    if (plan === 'basic' && (totalProducts || 0) >= 20) {
      return { allowed: false, message: 'Basic plan limit reached (Max 20 products).' };
    }
    if (plan === 'pro' && (totalProducts || 0) >= 75) {
      return { allowed: false, message: 'Pro plan limit reached (Max 75 products).' };
    }

    // Pro plan category-specific limit (Max 15 products per category)
    if (plan === 'pro' && categoryId) {
      const { count: catProducts } = await supabase
        .from('store_products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);

      if ((catProducts || 0) >= 15) {
        return { allowed: false, message: 'Pro plan allows max 15 products per category.' };
      }
    }
  }

  return { allowed: true };
}