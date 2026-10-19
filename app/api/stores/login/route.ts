import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { createMerchantSession, MERCHANT_SESSION_COOKIE } from "@/lib/merchant-session";
import { storeRepo } from "@/lib/store-repository";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey || url.includes("placeholder-project") || url.includes("your-project")) {
    return null;
  }
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (password.length > 128) {
      return NextResponse.json({ error: "Invalid store credentials." }, { status: 401 });
    }

    const supabase = getSupabase();
    let store: {
      id: string;
      name: string;
      slug: string;
      owner_email: string;
      password_hash?: string | null;
      plan: string;
      payment_status?: string | null;
    } | null = null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("stores")
          .select("id, name, slug, owner_email, password_hash, plan, payment_status")
          .eq("owner_email", email)
          .maybeSingle();
        if (!error && data) {
          store = data;
        }
      } catch (sbErr) {
        console.warn("Supabase store login query error, using local repository fallback:", sbErr);
      }
    }

    if (!store) {
      const localStore = await storeRepo.getStoreByEmail(email);
      if (localStore) {
        store = {
          id: localStore.id,
          name: localStore.name,
          slug: localStore.slug,
          owner_email: localStore.owner_email,
          password_hash: localStore.password_hash || null,
          plan: localStore.plan,
          payment_status: localStore.payment_status || "active",
        };
      }
    }

    if (!store) {
      return NextResponse.json({ error: "No store account found with this email. Please check your email or sign up." }, { status: 401 });
    }

    let isPasswordValid = false;
    if (store.password_hash) {
      try {
        isPasswordValid = await bcrypt.compare(password, store.password_hash);
      } catch {
        isPasswordValid = false;
      }
    } else {
      // If store was generated without a hash in development, allow the login
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Incorrect password. Please verify and try again." }, { status: 401 });
    }

    const response = NextResponse.json({
      message: "Store login successful!",
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        owner_email: store.owner_email,
        plan: store.plan,
        payment_status: store.payment_status || "active",
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
    } catch (cookieErr) {
      console.warn("Session cookie error:", cookieErr);
    }

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error.";
    console.error("Store login error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}