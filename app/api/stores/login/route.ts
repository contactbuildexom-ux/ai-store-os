import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { createMerchantSession, MERCHANT_SESSION_COOKIE } from "@/lib/merchant-session";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && serviceRoleKey ? createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: "Merchant login is not configured." }, { status: 503 });
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (password.length > 128) return NextResponse.json({ error: "Invalid store credentials." }, { status: 401 });

    const { data: store, error } = await supabase
      .from("stores")
      .select("id, name, slug, owner_email, password_hash, plan, payment_status")
      .eq("owner_email", email)
      .single();

    if (error || !store) {
      return NextResponse.json({ error: "Invalid store credentials." }, { status: 401 });
    }

    if (typeof store.password_hash !== "string") {
      return NextResponse.json({ error: "Sign in with the Supabase Auth account linked to this store." }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, store.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid store credentials." }, { status: 401 });
    }

    const response = NextResponse.json({
      message: "Store login successful!",
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        owner_email: store.owner_email,
        plan: store.plan,
        payment_status: store.payment_status,
      },
    }, { status: 200 });

    try {
      const { token, maxAge } = createMerchantSession(String(store.id), String(store.slug), String(store.owner_email));
      response.cookies.set(MERCHANT_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge,
      });
    } catch {
      // Supabase-authenticated merchants can still authorize uploads with their bearer token.
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}