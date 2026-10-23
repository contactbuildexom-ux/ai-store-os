import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkStoreLimits } from "@/lib/planLimits";
import { canAccessStore } from "@/lib/merchant-api-auth";
import { storeRepo } from "@/lib/store-repository";
import { hasApprovedSubscriptionPayment } from "@/lib/subscription-plans";

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getSupabase() {
  const supabase = createAdminClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabase || !url || url.includes("placeholder-project") || url.includes("your-project")) return null;
  return supabase;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = textValue(searchParams.get("store_id"));

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }
    if (!(await canAccessStore(storeId))) return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });

    const supabase = getSupabase();
    let storePlan = 'basic';
    if (supabase) {
      const { data: st, error } = await supabase
        .from('stores')
        .select('plan, payment_status')
        .eq('id', storeId)
        .maybeSingle();
      if (error) throw error;
      if (!st) return NextResponse.json({ error: 'Store not found.' }, { status: 404 });
      const requestedPlan = String(st.plan || 'basic').toLowerCase();
      storePlan = ['free', 'basic'].includes(requestedPlan) || hasApprovedSubscriptionPayment(st.payment_status)
        ? requestedPlan
        : 'basic';
    } else {
      const st = await storeRepo.getStore(storeId);
      if (st) {
        const requestedPlan = String(st.plan || 'basic').toLowerCase();
        storePlan = ['free', 'basic'].includes(requestedPlan) || hasApprovedSubscriptionPayment(st.payment_status)
          ? requestedPlan
          : 'basic';
      }
    }

    const isBasic = ['basic', 'free'].includes(storePlan.toLowerCase());
    if (isBasic) {
      return NextResponse.json({ success: true, categories: [] });
    }

    let categories: any[] = [];
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("store_categories")
          .select("*")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false });
        if (!error && data) categories = data;
      } catch {
        // Fallback
      }
    }

    if (categories.length === 0) {
      try {
        const repoProducts = await storeRepo.getProducts(storeId);
        const uniqueCats = [...new Set(repoProducts.map((p) => p.category).filter(Boolean))];
        categories = uniqueCats.map((name, idx) => ({ id: `cat_${idx + 1}`, name, store_id: storeId }));
      } catch {
        // Fallback
      }
    }

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load categories.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    }
    const body = await req.json();
    const storeId = textValue(body?.store_id);
    const name = textValue(body?.name);

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }
    if (!(await canAccessStore(storeId))) return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });
    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const limitCheck = await checkStoreLimits(storeId, "category");
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message }, { status: 403 });
    }

    const { data: category, error } = await supabase
      .from("store_categories")
      .insert([{ store_id: storeId, name }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, category, message: "Category created successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save category.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    }

    const body = await req.json();
    const id = textValue(body?.id);
    const storeId = textValue(body?.store_id);
    const name = textValue(body?.name);

    if (!id || !storeId) {
      return NextResponse.json({ error: "Category ID and Store ID are required." }, { status: 400 });
    }
    if (!(await canAccessStore(storeId))) return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });
    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const { data: category, error } = await supabase
      .from("store_categories")
      .update({ name })
      .eq("id", id)
      .eq("store_id", storeId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, category, message: "Category updated successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update category.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const id = textValue(searchParams.get("id"));
    const storeId = textValue(searchParams.get("store_id"));

    if (!id || !storeId) {
      return NextResponse.json({ error: "Category ID and Store ID are required." }, { status: 400 });
    }
    if (!(await canAccessStore(storeId))) return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });

    const { error } = await supabase
      .from("store_categories")
      .delete()
      .eq("id", id)
      .eq("store_id", storeId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete category.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}