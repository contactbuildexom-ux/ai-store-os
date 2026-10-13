import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function checkStoreLimits(storeId: string, type: 'product' | 'category' | 'whatsapp_order', categoryId?: string) {
  const supabase = createAdminClient();
  if (!supabase) throw new Error('Store database is not configured');
  // 1. Store ka plan fetch karein
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('plan')
    .eq('id', storeId)
    .single();

  if (storeError || !store) throw new Error('Store not found');

  const plan = (store.plan || 'basic') === 'free' ? 'basic' : (store.plan || 'basic'); // 'basic', 'pro', 'business'

  // 2. WhatsApp Integration Limit Check (Basic plan par restricted)
  if (type === 'whatsapp_order') {
    if (plan === 'basic') {
      return { 
        allowed: false, 
        message: 'WhatsApp integration is available on Pro and Business plans only. Basic plan uses standard checkout.' 
      };
    }
  }

  // 3. Category Limits Check
  if (type === 'category') {
    const { count } = await supabase
      .from('store_categories')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId);

    if (plan === 'basic' && (count || 0) >= 2) {
      return { allowed: false, message: 'Basic plan allows maximum 2 categories.' };
    }
    if (plan === 'pro' && (count || 0) >= 5) {
      return { allowed: false, message: 'Pro plan allows maximum 5 categories.' };
    }
  }

  // 4. Product Limits Check
  if (type === 'product') {
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