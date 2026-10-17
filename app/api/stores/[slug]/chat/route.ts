import { NextResponse } from "next/server";
import { getPublicStorefront, StorefrontDataError } from "@/lib/storefront-data";
import type {
  PublicStoreProduct,
  StoreAssistantResponse,
} from "@/lib/storefront-types";

function makeReply(
  message: string,
  storeName: string,
  whatsappNumber: string,
  products: PublicStoreProduct[]
): StoreAssistantResponse {
  const normalized = message.toLowerCase();
  const categories = [...new Set(products.map((product) => product.category))];
  const money = (price: number) => `Rs. ${price.toLocaleString()}`;
  const productList = (items: typeof products) => items
    .slice(0, 5)
    .map((product) => `• ${product.name} — ${money(product.price)}${product.category ? ` (${product.category})` : ""}`)
    .join("\n");

  let reply: string;
  let matchesCount: number | undefined;

  if (/^(hi|hello|hey|salam|assalam|good morning|good afternoon|good evening)\b/i.test(normalized)) {
    reply = `Hello! Welcome to ${storeName}. I can help you find products, check prices, and browse ${categories.length ? categories.join(", ") : "our catalog"}. What are you looking for?`;
  } else if (/delivery|shipping|deliver|charges|fee|cod|cash on delivery/i.test(normalized)) {
    reply = "For delivery charges and timing, please check the delivery details shown at checkout or contact the store directly.";
  } else if (/order|buy|purchase|checkout/i.test(normalized)) {
    reply = "Add the products you want to your cart and continue to checkout. You can also use the WhatsApp order button on a product.";
  } else if (/contact|phone|whatsapp|call/i.test(normalized)) {
    reply = whatsappNumber
      ? `You can contact ${storeName} on WhatsApp at +${whatsappNumber.replace(/[^\d]/g, "")}.`
      : `${storeName} has not published a WhatsApp contact number. Please use the store's checkout options.`;
  } else {
    const budgetMatch = normalized.match(/(?:under|below|less than|budget(?: of)?|rs\.?\s*)\s*(\d[\d,]*)/i)
      ?? normalized.match(/(\d[\d,]*)\s*(?:rupees|rs)\b/i);
    const budget = budgetMatch ? Number(budgetMatch[1].replace(/,/g, "")) : null;
    const terms = normalized
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((term) => term.length > 2 && !["show", "find", "have", "what", "with", "from", "under", "below", "less", "than", "product", "products", "please"].includes(term));
    const matchingProducts = products.filter((product) => {
      const matchesTerms = terms.length === 0 || terms.some((term) =>
        `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(term)
      );
      return matchesTerms && (budget === null || product.price <= budget);
    });

    if (matchingProducts.length) {
      reply = `Here are some products from ${storeName}:\n${productList(matchingProducts)}\n\nAsk me about a product or add it to your cart to order.`;
      matchesCount = matchingProducts.length;
    } else if (budget !== null) {
      reply = products.length
        ? `I couldn't find products under ${money(budget)}. The lowest listed price is ${money(Math.min(...products.map((product) => product.price)))}.`
        : `${storeName} has no products listed yet.`;
    } else if (products.length) {
      reply = `I couldn't find a matching item. ${products.length} products are listed${categories.length ? ` in ${categories.join(", ")}` : ""}.\n${productList(products)}\n\nTry a product name, category, or budget.`;
    } else {
      reply = `${storeName} has no products listed yet. Please check back later or contact the store.`;
    }
  }

  return {
    success: true,
    reply,
    store_name: storeName,
    ...(matchesCount === undefined ? {} : { matches_count: matchesCount }),
  };
}

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
      ? body.message
      : null;
    if (typeof messageValue !== "string" || !messageValue.trim()) {
      return NextResponse.json({ error: "A message is required." }, { status: 400 });
    }
    const message = messageValue.trim();
    if (message.length > 500) {
      return NextResponse.json({ error: "Message must be 500 characters or fewer." }, { status: 400 });
    }

    const storefront = await getPublicStorefront(slug);
    if (!storefront) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    return NextResponse.json(
      makeReply(message, storefront.store.name, storefront.store.whatsapp_number, storefront.products),
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
