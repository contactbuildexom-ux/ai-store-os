import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function checkStoreLimits(storeId: string, type: 'product' | 'category' | 'whatsapp_order', categoryId?: string) {
  const supabase = createAdminClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabase || !url || url.includes("placeholder-project") || url.includes("your-project")) {
    return { allowed: true };
  }
  // 1. Store ka plan fetch karein
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('plan')
    .eq('id', storeId)
    .single();

  if (storeError || !store) return { allowed: true };

  const plan = (store.plan || 'basic') === 'free' ? 'basic' : (store.plan || 'basic'); // 'basic', 'pro', 'business'

  // 2. WhatsApp Integration Limit Check (Included on all plans as per specification)
  if (type === 'whatsapp_order') {
    return { allowed: true };
  }

  // 3. Category Limits Check (Basic/Free plan has categories locked)
  if (type === 'category') {
    if (plan === 'basic') {
      return { 
        allowed: false, 
        message: 'Categories are locked on the Free Starter plan. Upgrade to Pro Merchant or Advance VIP to add categories.' 
      };
    }
    const { count } = await supabase
      .from('store_categories')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId);

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
