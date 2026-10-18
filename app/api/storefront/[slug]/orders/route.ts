import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RequestedItem = { product_id?: unknown; id?: unknown; quantity?: unknown };
type CatalogProduct = { id: string; name: string; price: number };

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Checkout is temporarily unavailable." }, { status: 503 });
    }

    const body = await request.json();
    const customerName = cleanText(body?.customer_name, 120);
    const customerEmail = cleanText(body?.customer_email, 120);
    const customerPhone = cleanText(body?.customer_phone, 40);
    const customerZip = cleanText(body?.zip_code ?? body?.postal_code, 30);
    const rawAddress = cleanText(body?.shipping_address, 500);
    const shippingAddress = customerZip ? `${rawAddress} (Postal Code: ${customerZip})` : rawAddress;
    const city = cleanText(body?.city, 120);
    const paymentMethod = body?.payment_method;
    const requestedItems = Array.isArray(body?.items) ? body.items as RequestedItem[] : [];

    if (!customerName || !customerPhone || !shippingAddress || !city || requestedItems.length === 0 || requestedItems.length > 100) {
      return NextResponse.json({ error: "Enter your name, phone, delivery address, city, and at least one cart item." }, { status: 400 });
    }
    const customerPhoneDigits = customerPhone.replace(/\D/g, "");
    if (customerPhoneDigits.length < 7 || customerPhoneDigits.length > 15) {
      return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
    }

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id, name, slug, plan, whatsapp_number, accepts_cod, accepts_advance, advance_percentage")
      .eq("slug", slug)
      .maybeSingle();

    if (storeError) throw storeError;
    if (!store) return NextResponse.json({ error: "Store not found." }, { status: 404 });

    const acceptsCod = store.accepts_cod ?? true;
    const acceptsAdvance = store.accepts_advance ?? false;
    const advancePercentage = Number(store.advance_percentage ?? 50);
    if (!acceptsCod && !acceptsAdvance) {
      return NextResponse.json({ error: "This store has not enabled a checkout payment method." }, { status: 409 });
    }
    if ((paymentMethod !== "cod" && paymentMethod !== "advance") ||
      (paymentMethod === "cod" && !acceptsCod) ||
      (paymentMethod === "advance" && !acceptsAdvance)) {
      return NextResponse.json({ error: "Choose a payment method enabled by this store." }, { status: 400 });
    }

    const merchantWhatsapp = cleanText(store.whatsapp_number, 40);
    const whatsappDigits = merchantWhatsapp.replace(/\D/g, "");
    const safeWhatsapp = (whatsappDigits.length >= 8 && whatsappDigits.length <= 15)
      ? merchantWhatsapp
      : "923001234567";

    const quantities = new Map<string, number>();
    for (const item of requestedItems) {
      const id = cleanText(item.product_id ?? item.id, 80);
      const quantity = Number(item.quantity);
      if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        return NextResponse.json({ error: "One or more cart items are invalid." }, { status: 400 });
      }
      const nextQuantity = (quantities.get(id) ?? 0) + quantity;
      if (nextQuantity > 99) return NextResponse.json({ error: "An item quantity cannot exceed 99." }, { status: 400 });
      quantities.set(id, nextQuantity);
    }

    const ids = [...quantities.keys()];
    const [builderProducts, legacyProducts] = await Promise.all([
      supabase.from("store_products").select("id, name, price").eq("store_id", store.id).in("id", ids),
      supabase.from("products").select("id, name, price").eq("store_id", store.id).in("id", ids),
    ]);

    const catalog = new Map<string, CatalogProduct>();
    for (const product of [...(builderProducts.data ?? []), ...(legacyProducts.data ?? [])]) {
      const price = Number(product.price);
      if (!Number.isFinite(price) || price < 0) continue;
      catalog.set(String(product.id), { id: String(product.id), name: String(product.name), price });
    }
    if (ids.some((id) => !catalog.has(id))) {
      return NextResponse.json({ error: "A product in your cart is no longer available. Please refresh and try again." }, { status: 400 });
    }

    const items = ids.map((id) => {
      const product = catalog.get(id)!;
      return { product_id: product.id, name: product.name, quantity: quantities.get(id)!, price: product.price };
    });
    const subtotal = roundMoney(items.reduce((sum, item) => sum + item.price * item.quantity, 0));

    const { data: delivery, error: deliveryError } = await supabase
      .from("delivery_settings")
      .select("*")
      .eq("store_id", store.id)
      .maybeSingle();
    if (deliveryError && !deliveryError.message.toLowerCase().includes("delivery_settings")) throw deliveryError;

    const sameCity = cleanText(delivery?.store_city, 120).toLowerCase() === city.toLowerCase();
    const configuredFee = Number(delivery?.delivery_fee ?? (sameCity ? delivery?.city_rate : delivery?.other_city_rate) ?? 0);
    const freeAbove = Number(delivery?.free_delivery_above ?? 0);
    const deliveryFee = freeAbove > 0 && subtotal >= freeAbove ? 0 : roundMoney(Number.isFinite(configuredFee) ? Math.max(0, configuredFee) : 0);
    const totalAmount = roundMoney(subtotal + deliveryFee);
    const advanceAmount = paymentMethod === "advance"
      ? roundMoney(totalAmount * advancePercentage / 100)
      : 0;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([{
        store_id: store.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        city,
        items,
        total_amount: totalAmount,
        delivery_fee: deliveryFee,
        payment_method: paymentMethod,
        advance_amount: advanceAmount,
        status: "pending",
      }])
      .select("id, status, total_amount, delivery_fee, created_at")
      .single();

    if (orderError) throw orderError;

    return NextResponse.json({
      success: true,
      order,
      plan: store.plan || 'basic',
      whatsapp_number: safeWhatsapp,
      items,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      advance_amount: advanceAmount,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to place your order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
