import { NextResponse } from "next/server";
import { getPublicStorefront, StorefrontDataError } from "@/lib/storefront-data";
import { generateBexiReply } from "@/lib/ai/bexi-chat-engine";
import { storeRepo } from "@/lib/store-repository";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const messageValue = typeof body === "object" && body !== null && "message" in body
      ? (body as any).message
      : null;
    if (typeof messageValue !== "string" || !messageValue.trim()) {
      return NextResponse.json({ error: "A message is required." }, { status: 400 });
    }
    const message = messageValue.trim();
    if (message.length > 500) {
      return NextResponse.json({ error: "Message must be 500 characters or fewer." }, { status: 400 });
    }

    let storeName = 'our store';
    let whatsappNumber = '923001234567';
    let productsList: any[] = [];
    let tagline = '';
    let description = '';

    const storefront = await getPublicStorefront(slug).catch(() => null);
    if (storefront) {
      storeName = storefront.store.name;
      whatsappNumber = storefront.store.whatsapp_number;
      tagline = storefront.store.tagline || '';
      description = storefront.store.description || '';
      productsList = storefront.products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        category: p.category,
        image_url: p.image_url,
      }));
    } else {
      // Fallback to local storeRepo
      const repoStore = await storeRepo.getStore(slug);
      if (repoStore) {
        storeName = repoStore.name;
        whatsappNumber = repoStore.whatsapp_number || '923001234567';
        tagline = repoStore.tagline || '';
        description = repoStore.description || '';
        const repoProducts = await storeRepo.getProducts(repoStore.id);
        productsList = repoProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description,
          category: p.category,
          image_url: p.image_url,
        }));
      }
    }

    const result = generateBexiReply({
      message,
      store: {
        name: storeName,
        slug,
        whatsapp_number: whatsappNumber,
        tagline,
        description,
      },
      products: productsList,
    });

    return NextResponse.json(
      {
        success: true,
        reply: result.reply,
        store_name: storeName,
        language: result.languageDetected,
        ...(result.matchesCount !== undefined ? { matches_count: result.matchesCount } : {}),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error: unknown) {
    if (error instanceof StorefrontDataError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/stores/[slug]/chat failed:", error);
    return NextResponse.json({ error: "Unable to process your message right now." }, { status: 500 });
  }
}
