// Central entry point for Supabase utilities
// For server components / routes with service-role key: import { createAdminClient } from "@/lib/supabase/admin";
// For browser / client components: import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
// For Next.js Server Components with cookie session: import { createClient as createServerClient } from "@/lib/supabase/server";

export * from "./client";
export * from "./calcDelivery";
export * from "./auth";
