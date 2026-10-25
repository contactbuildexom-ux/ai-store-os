import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type PricingPlanInput = {
  plan_key: "basic" | "pro" | "business" | null;
  name: string;
  price: number;
  billing_cycle: string;
  features: string[];
  is_active: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePlan(value: unknown, partial = false): Partial<PricingPlanInput> | null {
  if (!isRecord(value)) return null;
  const plan: Partial<PricingPlanInput> = {};
  if ("plan_key" in value) {
    if (value.plan_key !== null && value.plan_key !== "basic" && value.plan_key !== "pro" && value.plan_key !== "business") return null;
    plan.plan_key = value.plan_key;
  } else if (!partial) {
    plan.plan_key = null;
  }
  if ("name" in value) {
    if (typeof value.name !== "string" || !value.name.trim() || value.name.trim().length > 80) return null;
    plan.name = value.name.trim();
  } else if (!partial) return null;
  if ("price" in value) {
    if (typeof value.price !== "number" || !Number.isFinite(value.price) || value.price < 0 || value.price > 99999999.99) return null;
    plan.price = value.price;
  } else if (!partial) return null;
  if ("billing_cycle" in value) {
    if (typeof value.billing_cycle !== "string" || !value.billing_cycle.trim() || value.billing_cycle.trim().length > 40) return null;
    plan.billing_cycle = value.billing_cycle.trim();
  } else if (!partial) return null;
  if ("features" in value) {
    if (!Array.isArray(value.features) || value.features.length > 100 || !value.features.every((feature) => typeof feature === "string" && feature.trim().length > 0 && feature.length <= 300)) return null;
    plan.features = value.features.map((feature) => feature.trim());
  } else if (!partial) return null;
  if ("is_active" in value) {
    if (typeof value.is_active !== "boolean") return null;
    plan.is_active = value.is_active;
  } else if (!partial) plan.is_active = true;
  return plan;
}

function validId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Pricing database is not configured." }, { status: 503 });
  try {
    const { data, error } = await supabase.from("pricing_plans").select("id, plan_key, name, price, billing_cycle, features, is_active, created_at").order("created_at", { ascending: true });
    if (error) {
      console.error("GET /api/admin/pricing Supabase query failed for pricing_plans:", error);
      return NextResponse.json({ error: "Unable to load pricing plans." }, { status: 500 });
    }
    return NextResponse.json({ plans: data });
  } catch (error) {
    console.error("GET /api/admin/pricing Supabase query threw for pricing_plans:", error);
    return NextResponse.json({ error: "Unable to load pricing plans." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Pricing database is not configured." }, { status: 503 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const plan = parsePlan(body);
  if (!plan) return NextResponse.json({ error: "Enter a valid name, non-negative price, billing cycle, feature list, and active status." }, { status: 400 });
  try {
    const { data, error } = await supabase.from("pricing_plans").insert(plan).select("id, plan_key, name, price, billing_cycle, features, is_active, created_at").single();
    if (error) {
      console.error("POST /api/admin/pricing Supabase insert failed:", error);
      return NextResponse.json({ error: "Unable to create pricing plan." }, { status: 500 });
    }
    return NextResponse.json({ plan: data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/pricing Supabase insert threw:", error);
    return NextResponse.json({ error: "Unable to create pricing plan." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Pricing database is not configured." }, { status: 503 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  if (!isRecord(body) || !validId(body.id)) return NextResponse.json({ error: "A valid plan ID is required." }, { status: 400 });
  const plan = parsePlan(body, true);
  if (!plan || Object.keys(plan).length === 0) return NextResponse.json({ error: "Provide at least one valid plan field to update." }, { status: 400 });
  const { data, error } = await supabase.from("pricing_plans").update(plan).eq("id", body.id).select("id, plan_key, name, price, billing_cycle, features, is_active, created_at").maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to update pricing plan." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Pricing plan not found." }, { status: 404 });
  return NextResponse.json({ plan: data });
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Pricing database is not configured." }, { status: 503 });
  const id = new URL(request.url).searchParams.get("id");
  if (!validId(id)) return NextResponse.json({ error: "A valid plan ID is required." }, { status: 400 });
  const { data, error } = await supabase.from("pricing_plans").delete().eq("id", id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to delete pricing plan." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Pricing plan not found." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
