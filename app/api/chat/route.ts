import { NextResponse } from "next/server";
import type {
  PlatformAssistantRequest,
  PlatformAssistantResponse,
} from "@/lib/storefront-types";

function platformReply(question: string): string {
  const normalized = question.toLowerCase();
  if (/^(hi|hello|hey|salam|assalam)\b/.test(normalized)) {
    return "Hi! I'm Bexi AI. Ask me about creating a store, plans, orders, or QR codes.";
  }
  if (/qr|code/.test(normalized)) {
    return "Each store has its own QR code in the merchant dashboard. Download it to print or share so customers can open your storefront.";
  }
  if (/free|price|plan|cost|pricing/.test(normalized)) {
    return "You can start with the free plan and upgrade as your store grows. See the Pricing section for the current plan features.";
  }
  if (/order|whatsapp|checkout/.test(normalized)) {
    return "Customers browse your storefront, add products to the cart, and place orders using the checkout options enabled for your store. WhatsApp ordering is available for supported plans.";
  }
  if (/coding|skill|design|setup/.test(normalized)) {
    return "You don't need coding skills. Create your store from the dashboard, add products, and customize its appearance using the available settings.";
  }
  if (/upgrade|business/.test(normalized)) {
    return "You can upgrade your plan from your store dashboard. The available features and limits are shown in the Pricing section.";
  }
  return "I can help with store setup, plans, product catalogs, orders, WhatsApp checkout, and QR codes. What would you like to know?";
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const messagesValue = typeof body === "object" && body !== null && "messages" in body
      ? body.messages
      : null;
    if (!Array.isArray(messagesValue) || messagesValue.length === 0 || messagesValue.length > 20) {
      return NextResponse.json({ error: "Provide between 1 and 20 chat messages." }, { status: 400 });
    }

    const messages: PlatformAssistantRequest["messages"] = [];
    for (const message of messagesValue) {
      if (
        typeof message !== "object"
        || message === null
        || !("role" in message)
        || !("content" in message)
        || (message.role !== "user" && message.role !== "assistant")
        || typeof message.content !== "string"
        || message.content.trim().length === 0
        || message.content.length > 500
      ) {
        return NextResponse.json({ error: "Each message must have a valid role and contain 1–500 characters." }, { status: 400 });
      }
      messages.push({ role: message.role, content: message.content.trim() });
    }

    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
    if (!latestUserMessage) {
      return NextResponse.json({ error: "A user message is required." }, { status: 400 });
    }

    const response: PlatformAssistantResponse = {
      success: true,
      reply: platformReply(latestUserMessage.content),
    };
    return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error: unknown) {
    console.error("POST /api/chat failed:", error);
    return NextResponse.json({ error: "Unable to process your message right now." }, { status: 500 });
  }
}
