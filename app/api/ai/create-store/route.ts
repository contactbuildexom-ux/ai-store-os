import { NextResponse } from 'next/server';
import { generateStoreFromPrompt } from '@/lib/ai/ai-generator';
import { storeRepo } from '@/lib/store-repository';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      prompt, 
      name, 
      custom_store_name, 
      plan = 'free', 
      selected_theme, 
      whatsapp_number, 
      owner_email,
      password 
    } = body;

    if (!prompt && !name && !custom_store_name) {
      return NextResponse.json({ 
        error: 'Please provide a store description or prompt to generate the store.' 
      }, { status: 400 });
    }

    // 1. Generate full store intelligence via AI Generator
    const generated = await generateStoreFromPrompt({
      prompt: prompt || `Online store for ${name || 'lifestyle products'}`,
      plan: (plan === 'pro' || plan === 'advanced') ? plan : 'free',
      selectedTheme: selected_theme,
      customStoreName: name || custom_store_name,
      whatsappNumber: whatsapp_number,
      ownerEmail: owner_email
    });

    // 2. Persist to repository (Supabase + memory fallback)
    const store = await storeRepo.saveStore(generated);

    return NextResponse.json({ 
      success: true, 
      message: 'Store created successfully by AI!',
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        subdomain: `${store.slug}.buildexom.store`,
        tagline: store.tagline,
        plan: store.plan,
        theme: store.selected_theme,
        primary_color: store.primary_color,
        whatsapp_number: store.whatsapp_number,
        owner_email: store.owner_email,
        total_products: generated.products.length
      },
      live_url: `/stores/${store.slug}`,
      admin_url: `/store-admin/${store.slug}`,
      default_credentials: {
        email: store.owner_email,
        password: password || '123456'
      }
    }, { status: 201 });

  } catch (err: any) {
    console.error('AI Store Creation Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to create AI store' }, { status: 500 });
  }
}