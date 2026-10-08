import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkStoreLimits } from "@/lib/planLimits";

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseAmount(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function getSupabase() {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Store database is not configured.");
  return supabase;
}

async function readOrdersFrom(table: "store_orders" | "orders", storeId: string) {
  return getSupabase()
    .from(table)
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });
}

function isMissingTable(error: { message: string } | null, table: string) {
  if (!error) return false;
  const message = error.message.toLowerCase();
  return message.includes(table) && (
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find the table") ||
    message.includes("relation")
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = textValue(searchParams.get("store_id"));

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }

    const [storeOrders, legacyOrders] = await Promise.all([
      readOrdersFrom("store_orders", storeId),
      readOrdersFrom("orders", storeId),
    ]);
    const storeOrdersUnavailable = isMissingTable(storeOrders.error, "store_orders");
    const legacyOrdersUnavailable = isMissingTable(legacyOrders.error, "orders");

    if (storeOrders.error && !storeOrdersUnavailable) throw storeOrders.error;
    if (legacyOrders.error && !legacyOrdersUnavailable) throw legacyOrders.error;
    if (storeOrdersUnavailable && legacyOrdersUnavailable) throw storeOrders.error;

    const ordersById = new Map<string, Record<string, unknown>>();
    for (const order of [...(storeOrders.data ?? []), ...(legacyOrders.data ?? [])]) {
      ordersById.set(String(order.id), order as Record<string, unknown>);
    }
    const orders = [...ordersById.values()].sort((a, b) =>
      new Date(String(b.created_at ?? 0)).getTime() - new Date(String(a.created_at ?? 0)).getTime()
    );

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load orders.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const storeId = textValue(body?.store_id);
    const customerName = textValue(body?.customer_name);
    const customerPhone = textValue(body?.customer_phone);
    const totalAmount = parseAmount(body?.total_amount);
    const items = body?.items;
    const isWhatsappOrder = Boolean(body?.is_whatsapp_order);

    if (!storeId || !customerName || !customerPhone || !items || totalAmount === null) {
      return NextResponse.json({ error: "Store, customer, items, and total amount are required." }, { status: 400 });
    }

    if (isWhatsappOrder) {
      const whatsappLimitCheck = await checkStoreLimits(storeId, "whatsapp_order");
      if (!whatsappLimitCheck.allowed) {
        return NextResponse.json({ error: whatsappLimitCheck.message }, { status: 403 });
      }
    }

    const { data: order, error } = await supabase
      .from("store_orders")
      .insert([{ store_id: storeId, customer_name: customerName, customer_phone: customerPhone, items, total_amount: totalAmount, status: "pending" }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      order,
      message: isWhatsappOrder ? "WhatsApp order placed successfully." : "Standard order placed successfully.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}