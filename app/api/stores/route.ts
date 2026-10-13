import { NextResponse } from "next/server";
import { POST as registerStore } from "./register/route";

/** Backward-compatible JSON alias for merchant registration. */
export async function POST(request: Request) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }
  const body = input as Record<string, unknown>;
  return registerStore(new Request(request.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: body.name ?? body.store_name,
      slug: body.slug,
      owner_email: body.owner_email,
      password: body.password,
      whatsapp_number: body.whatsapp_number,
      plan: body.plan ?? body.plan_type,
      selected_theme: body.selected_theme ?? body.theme,
      tagline: body.tagline,
    }),
  }));
}
