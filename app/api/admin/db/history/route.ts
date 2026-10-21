import { NextResponse } from "next/server";
import { getBackupHistory } from "@/lib/backup-history";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    return NextResponse.json({ history: await getBackupHistory(supabase) }, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load backup history.";
    return NextResponse.json({ error: message }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
